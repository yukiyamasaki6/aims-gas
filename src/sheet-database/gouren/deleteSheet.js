function deleteGourenSheet(id, sheetDate) {
  var ss = SpreadsheetApp.openById(id);

  // 削除基準日（6ヶ月前の1日）を算出
  var now = new Date();
  var thresholdDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // 期限より古いシートを削除
  ss.getSheets().forEach(function (sheet) {
    var sheetId = sheet.getSheetId().toString();
    var date = sheetDate[sheetId];

    if (date && date < thresholdDate) {
      ss.deleteSheet(sheet);
    }
  });
}
