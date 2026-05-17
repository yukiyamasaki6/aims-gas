function saveScoreData(name, newData) {
  // 保存先のシートを取得
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);

  // 列名を取得
  var colNames = readScoreHeader(name);

  // 保存用の二次元配列を生成
  var outputValues = newData.map(function (row) {
    return colNames.map(function (colName) {
      return row[colName] || "";
    });
  });

  // 範囲を指定して保存
  sheet
    .getRange(sheet.getLastRow() + 1, 1, outputValues.length, colNames.length)
    .setValues(outputValues);
}
