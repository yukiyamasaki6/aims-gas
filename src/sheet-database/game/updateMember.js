/**
 * 試合集計システムの名簿シートを最新の部員名簿に基づいて書き換え．
 *
 * @param {Object<string, Object>} memberMap - {氏名: 部員の属性情報オブジェクト}のマップ．
 */
function updateGameMember(memberMap) {
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName("名簿");

  var headerValues = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues();
  var header = headerValues[0].map((h) => h.toString().trim());

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, header.length).clearContent();
  }

  // 変更後の名簿データを2行目以降に挿入
  var outputValues = Object.values(memberMap).map((rowObj) => {
    return header.map((key) => rowObj[key] || "");
  });
  sheet
    .getRange(2, 1, outputValues.length, header.length)
    .setValues(outputValues);
}
