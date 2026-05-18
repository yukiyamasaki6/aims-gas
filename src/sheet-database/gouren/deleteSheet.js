/**
 * 期限切れとなった過去の合同練習シートを特定し一括で削除する．
 *
 * @param {string} id - 対象となるスプレッドシートのID．
 * @param {Object<string, Date>} sheetDate - {シートID: 日付}のマップ．
 */
function deleteGourenSheet(id, sheetDate) {
  var ss = SpreadsheetApp.openById(id);

  // 6ヶ月前の1日を削除基準日とする
  var now = new Date();
  var thresholdDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // 削除基準日よりも古いシートのみを削除
  ss.getSheets().forEach(function (sheet) {
    var sheetId = sheet.getSheetId().toString();
    var date = sheetDate[sheetId];

    if (date && date < thresholdDate) {
      ss.deleteSheet(sheet);
    }
  });
}
