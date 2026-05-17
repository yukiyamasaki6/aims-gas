function fetchGameData(meta) {
  // 保存元のスプレッドシート(試合集計システム)を取得
  var sourceSpreadsheet = SpreadsheetApp.openById(SS_IDS.GAME);

  // 保存元のシートを取得
  var sheet = sourceSpreadsheet.getSheetByName(meta.name);

  // 試合結果を取得
  var sourceData = [];
  meta.dataRanges.forEach(function (rangeStr) {
    sourceData = sourceData.concat(sheet.getRange(rangeStr).getValues());
  });

  // データが存在するか確認（すべての行の氏名が空ならデータなしと判定）
  var hasData = false;
  for (var i = 0; i < sourceData.length; i++) {
    if (sourceData[i][0] != "") {
      hasData = true;
      break;
    }
  }

  // データがないなら終了
  if (!hasData) {
    return null;
  }

  // 各シートの点取り形式を取得
  var format = sheet.getRange(meta.formatRange).getValue();

  // 日付を取得
  var today = new Date();
  var date =
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

  // 保存用配列を生成
  var scoreData = [];

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

      //データを追加（sheet-database形式）
      scoreData.push({
        日付: date,
        形式: format,
        氏名: name,
        距離: "SH(50/30/GT)",
        点数: totalScore,
      });
    } else {
      //距離別に成型
      for (var k = 0; k < 2; k++) {
        //距離が空、点数が0ならスキップ
        if (sourceData[j + k][1] == "" || sourceData[j + k][8] == 0) {
          continue;
        }

        //距離を取得
        var distance = sourceData[j + k][1];

        //データを追加
        scoreData.push({
          日付: date,
          形式: format,
          氏名: name,
          距離: distance,
          点数: sourceData[j + k][8],
        });
      }
    }
  }

  return scoreData;
}
