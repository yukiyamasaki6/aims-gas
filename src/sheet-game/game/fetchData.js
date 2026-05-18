/**
 * 試合集計システムから指定されたシートの試合結果を読み込み，点数オブジェクト配列として返す．
 *
 * @param {Object} meta - シート名，データセル範囲，形式セル範囲を含むメタ情報オブジェクト．
 * @returns {Array<Object>|null} 点数オブジェクト配列．データが存在しない場合はnull．
 */
function fetchGameData(meta) {
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName(meta.name);

  var sourceData = [];
  meta.dataRanges.forEach(function (rangeStr) {
    sourceData = sourceData.concat(sheet.getRange(rangeStr).getValues());
  });

  var hasData = false;
  for (var i = 0; i < sourceData.length; i++) {
    if (sourceData[i][0] != "") {
      hasData = true;
      break;
    }
  }

  if (!hasData) {
    return null;
  }

  var format = sheet.getRange(meta.formatRange).getValue();

  var today = new Date();
  var date =
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

  var scoreData = [];

  // 前半・後半の2行で1部員分のデータとして処理
  for (var j = 0; j < sourceData.length; j += 2) {
    if (sourceData[j][0] == "") {
      continue;
    }

    var name = sourceData[j][0];

    // 距離が50/30（SH形式）の場合
    if (
      sourceData[j][1] == "50m" &&
      sourceData[j + 1][1] == "30m" &&
      sourceData[j][8] != 0 &&
      sourceData[j + 1][8] != 0
    ) {
      var totalScore =
        sourceData[j][8] +
        "/" +
        sourceData[j + 1][8] +
        "/" +
        (sourceData[j][8] + sourceData[j + 1][8]);

      scoreData.push({
        日付: date,
        形式: format,
        氏名: name,
        距離: "SH(50/30/GT)",
        点数: totalScore,
      });
    } else {
      for (var k = 0; k < 2; k++) {
        if (sourceData[j + k][1] == "" || sourceData[j + k][8] == 0) {
          continue;
        }

        var distance = sourceData[j + k][1];

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
