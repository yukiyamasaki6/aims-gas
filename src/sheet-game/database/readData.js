function readScoreHeader(name) {
  // 読み取り先のシートを取得
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);

  // 1行目のデータのみを取得
  var headerValues = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues();

  // 列名を取得
  var header = headerValues[0].map((h) => h.toString().trim());

  return header;
}
