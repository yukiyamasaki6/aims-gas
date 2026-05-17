function saveButtonClicked() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var value = range.getValue();

  // 現在のシートが結果保存シートなら処理を行う
  if (sheet.getName() != "結果保存") {
    return;
  }

  // 保存ボタンが押されているなら処理を行う
  if (value != "保存") {
    return;
  }

  // 押されたボタンに対応した処理を行う
  const sendButtons = ["C5", "C7", "C9", "C11"];
  const index = sendButtons.indexOf(range.getA1Notation());
  if (index !== -1) {
    // 送信処理
    saveGameData(index);

    // 送信ボタンをクリア
    range.clearContent();
  }
}

function saveGameData(index) {
  // 保存元のスプレッドシート(試合集計システム)を取得
  var sourceSpreadsheet = SpreadsheetApp.openById(SS_IDS.GAME);

  try {
    // 保存元のシートを取得
    var teamSheet1 = sourceSpreadsheet.getSheetByName("団体戦1");
    var teamSheet2 = sourceSpreadsheet.getSheetByName("団体戦2");
    var individualSheet1 = sourceSpreadsheet.getSheetByName("個人戦1");
    var individualSheet2 = sourceSpreadsheet.getSheetByName("個人戦2");

    // 試合結果を取得
    var teamData1 = [];
    teamData1 = teamData1.concat(
      teamSheet1.getRange("C9:K48").getValues(),
      teamSheet1.getRange("P9:X48").getValues(),
    );
    var teamData2 = [];
    teamData2 = teamData2.concat(
      teamSheet2.getRange("C9:K48").getValues(),
      teamSheet2.getRange("P9:X48").getValues(),
    );
    var individualData1 = individualSheet1.getRange("D7:L102").getValues();
    var individualData2 = individualSheet2.getRange("D7:L102").getValues();
    var sourceDatas = [teamData1, teamData2, individualData1, individualData2];
    var sourceData = sourceDatas[index];

    // 各シートの合計点数(=データの存在)を取得
    var presences = [
      teamSheet1.getRange("N6").getValue(),
      teamSheet2.getRange("N6").getValue(),
      individualSheet1.getRange("P6").getValue(),
      individualSheet2.getRange("P6").getValue(),
    ];

    // データがないなら終了
    if (presences[index] == 0) {
      return;
    }

    // 各シートの点取り形式を取得
    var formats = [
      teamSheet1.getRange("K3").getValue(),
      teamSheet2.getRange("K3").getValue(),
      individualSheet1.getRange("I3").getValue(),
      individualSheet2.getRange("I3").getValue(),
    ];

    // 日付を取得
    var today = new Date();
    var date =
      today.getFullYear() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getDate();

    // 保存用配列を生成
    var saveData = [];

    // 人ごとに成形(人数分ループ)
    for (var j = 0; j < sourceData.length; j += 2) {
      //氏名が空ならスキップ
      if (sourceData[j][0] == "") {
        continue;
      }

      //氏名を取得
      var name = sourceData[j][0];

      //距離が50/30なら
      if (
        sourceData[j][1] == "50m" &&
        sourceData[j + 1][1] == "30m" &&
        sourceData[j][8] != 0 &&
        sourceData[j + 1][8] != 0
      ) {
        //点数を取得
        var totalScore =
          sourceData[j][8] +
          "/" +
          sourceData[j + 1][8] +
          "/" +
          (sourceData[j][8] + sourceData[j + 1][8]);

        //追加データ[日付,形式,氏名,距離,点数]を生成
        var addData = [
          [date, formats[index], name, "SH(50/30/GT)", totalScore],
        ];

        //追加データを返す配列に追加
        saveData = saveData.concat(addData);
      } else {
        //距離別に成型
        for (var k = 0; k < 2; k++) {
          //距離が空、点数が0ならスキップ
          if (sourceData[j + k][1] == "" || sourceData[j + k][8] == 0) {
            continue;
          }

          //距離を取得
          var distance = sourceData[j + k][1];

          //追加データ[日付,形式,氏名,距離,点数]を生成
          var addData = [
            [date, formats[index], name, distance, sourceData[j + k][8]],
          ];

          //追加データを返す配列に追加
          saveData = saveData.concat(addData);
        }
      }
    }

    // 保存先のスプレッドシート(点数集計システム)を取得
    var destinationSpreadsheet = SpreadsheetApp.openById(SS_IDS.DB);

    // 保存先のシート(試合)を取得
    var destinationSheet = destinationSpreadsheet.getSheetByName("試合");

    // 保存先の範囲を指定
    var destinationRange = destinationSheet.getRange(
      destinationSheet.getLastRow() + 1,
      1,
      saveData.length,
      5,
    );

    // 保存
    destinationRange.setValues(saveData);
  } catch (error) {
    // エラーが発生した場合は以降の処理を中断する
    var errorMessage = "データの保存に失敗しました。エラー: " + error.message;
    Logger.log(errorMessage);
    return;
  }

  try {
    // 保存元のスプレッドシート(試合集計システム)のIDを取得
    var sourceSpreadsheetId = sourceSpreadsheet.getId();

    // 保存元のシートのIDを取得
    var sheetIds = [
      teamSheet1.getSheetId(),
      teamSheet2.getSheetId(),
      individualSheet1.getSheetId(),
      individualSheet2.getSheetId(),
    ];

    // 保存先のPDFの名前を設定
    var fileNames = [
      date +
        " " +
        teamSheet1.getRange("M3").getValue() +
        "(" +
        formats[0] +
        " 団体戦)",
      date +
        " " +
        teamSheet2.getRange("M3").getValue() +
        "(" +
        formats[1] +
        " 団体戦)",
      date +
        " " +
        individualSheet1.getRange("M3").getValue() +
        "(" +
        formats[2] +
        " 個人戦)",
      date +
        " " +
        individualSheet2.getRange("M3").getValue() +
        "(" +
        formats[3] +
        " 個人戦)",
    ];

    // PDFのオプションを指定
    var pdfOption =
      "&exportFormat=pdf" +
      "&format=pdf" +
      "&size=A4" + //用紙サイズ (A4)
      "&portrait=true" + //用紙の向き true: 縦向き / false: 横向き
      "&fitw=true" + //ページ幅を用紙にフィットさせるか true: フィットさせる / false: 原寸大
      "&top_margin=0.50" + //上の余白
      "&bottom_margin=0.50" + //下の余白
      "&right_margin=0.50" + //右の余白
      "&left_margin=0.50" + //左の余白
      "&horizontal_alignment=CENTER" + //水平方向の位置
      "&vertical_alignment=TOP" + //垂直方向の位置
      "&printtitle=false" + //スプレッドシート名の表示有無
      "&sheetnames=false" + //シート名の表示有無
      "&gridlines=false" + //グリッドラインの表示有無
      "&fzr=false" + //固定行の表示有無
      "&fzc=false"; //固定列の表示有無;
    //var ranges = ['&range=A1%3AAA48','&range=A1%3AV54','&range=A55%3AV102'];

    // API使用のためのOAuth認証用トークン
    var token = ScriptApp.getOAuthToken();

    // headersにアクセストークンを格納する
    var option = {
      headers: {
        Authorization: "Bearer " + token,
      },
    };

    // URLの組み立て
    var url =
      "https://docs.google.com/spreadsheets/d/" +
      sourceSpreadsheetId +
      "/export?gid=" +
      sheetIds[index] +
      "&" +
      pdfOption;

    // PDFを作成する
    var blob = UrlFetchApp.fetch(url, option)
      .getBlob()
      .setName(fileNames[index] + ".pdf");

    // 保存するフォルダを指定
    var folder = DriveApp.getFolderById("1BEkSZAauLxdJyUrMsZzm1OZGINaYrD6P");

    // PDFを指定したフォルダに保存
    folder.createFile(blob);
  } catch (error) {
    // エラーが発生した場合は以降の処理を中断する
    var errorMessage = "PDFの保存に失敗しました。エラー: " + error.message;
    Logger.log(errorMessage);
    return;
  }

  // データをクリア
  if (index == 0) {
    teamSheet1.getRange("D6").clearContent();
    teamSheet1.getRange("Q6").clearContent();
    teamSheet1.getRange("M3").clearContent();
    teamSheet1.getRange("C9:C48").clearContent();
    teamSheet1.getRange("E9:J48").clearContent();
    teamSheet1.getRange("P9:P48").clearContent();
    teamSheet1.getRange("R9:W48").clearContent();
  } else if (index == 1) {
    teamSheet2.getRange("D6").clearContent();
    teamSheet2.getRange("Q6").clearContent();
    teamSheet2.getRange("M3").clearContent();
    teamSheet2.getRange("C9:C48").clearContent();
    teamSheet2.getRange("E9:J48").clearContent();
    teamSheet2.getRange("P9:P48").clearContent();
    teamSheet2.getRange("R9:W48").clearContent();
  } else if (index == 2) {
    individualSheet1.getRange("M3").clearContent();
    individualSheet1.getRange("D7:D102").clearContent();
    individualSheet1.getRange("F7:K102").clearContent();
    individualSheet1.getRange("N7:O102").clearContent();
  } else if (index == 3) {
    individualSheet2.getRange("M3").clearContent();
    individualSheet2.getRange("D7:D102").clearContent();
    individualSheet2.getRange("F7:K102").clearContent();
    individualSheet2.getRange("N7:O102").clearContent();
  }
}
