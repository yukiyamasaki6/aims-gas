/**
 * データベースの指定されたシートの列名配列を取得する．
 *
 * @param {string} name - 取得対象のシート名．
 * @returns {Array<string>} - 列名配列．
 */
function readScoreHeader(name) {
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);

  var headerValues = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues();
  var header = headerValues[0].map((h) => h.toString().trim());

  return header;
}
