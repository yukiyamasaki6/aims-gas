/**
 * データベースの指定されたシートに対し，新しい点数データを追加する．
 *
 * @param {string} name - 対象となるシート名．
 * @param {Array<Object>} newData - 追加する点数オブジェクト配列．
 */
function saveScoreData(name, newData) {
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);

  var colNames = readScoreHeader(name);

  var outputValues = newData.map(function (rowObj) {
    return colNames.map(function (colName) {
      return rowObj[colName] || "";
    });
  });

  // 既存データの最終行の直後に新しいデータを追加
  sheet
    .getRange(sheet.getLastRow() + 1, 1, outputValues.length, colNames.length)
    .setValues(outputValues);
}
