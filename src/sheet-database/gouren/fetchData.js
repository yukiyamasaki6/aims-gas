function fetchGourenData(id) {
  // すべてのシートを取得
  var ss = SpreadsheetApp.openById(id);
  var sheets = ss.getSheets();

  // 処理中の日付を記録
  var referenceDate = new Date();

  // テンプレシートを除く各シートを集計
  var sheetMap = {};
  var sheetDate = {};
  for (var i = 1; i < sheets.length; i++) {
    var sheet = sheets[i];

    // シートIDを取得
    var sheetId = sheet.getSheetId().toString();

    // 日付(=シート名)を取得
    var sheetName = sheet.getSheetName().replace(" ", "");

    // 1. 基準日（前のシート確定日）の年を取得し、その前後1年の候補を作成
    var refYear = referenceDate.getFullYear();
    var candidates = [refYear - 1, refYear, refYear + 1].map((y) => {
      return Utilities.parseDate(y + "/" + sheetName, "JST", "yyyy/MM/dd");
    });

    // 2. 基準日に最も近い日付を特定
    var date = candidates.reduce(function (prev, curr) {
      return Math.abs(curr - referenceDate) < Math.abs(prev - referenceDate)
        ? curr
        : prev;
    });

    // 3. このシートの確定日を「次のシートの基準」として更新
    referenceDate = date;

    // シートの存在を記録
    sheetMap[sheetId] = [];
    sheetDate[sheetId] = date;

    // データの最終行を取得
    var lastRow = sheet.getLastRow();

    // データがなければ処理をスキップ
    if (lastRow <= 2) {
      continue;
    }

    // データを取得(2行目までは列名)
    var rows = sheet
      .getRange(3, 1, lastRow - 2, sheet.getMaxColumns())
      .getValues();

    // 人ごとに集計
    for (var j = 0; j < rows.length - 1; j += 2) {
      // 氏名を取得
      var name = rows[j][0];

      // 氏名が空なら処理をスキップ
      if (name == "") {
        continue;
      }

      // 点数を集計
      for (var k = 5; k < rows[0].length; k++) {
        // 距離と点数を取得
        var dist = rows[j][k];
        var score = rows[j + 1][k];

        // 距離か点数が空なら処理を終了
        if (dist == "" || score == "") {
          break;
        }

        // データを追加
        sheetMap[sheetId].push({
          シートID: sheetId,
          日付: date,
          形式: "合同練習",
          氏名: name,
          距離: dist,
          点数: score,
        });
      }
    }
  }

  // 結果を返す
  return [sheetMap, sheetDate];
}
