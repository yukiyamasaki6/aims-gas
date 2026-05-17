function clearGameInput(meta) {
  // 保存元のスプレッドシート(試合集計システム)を取得
  var sourceSpreadsheet = SpreadsheetApp.openById(SS_IDS.GAME);

  // 保存元のシートを取得
  var sheet = sourceSpreadsheet.getSheetByName(meta.name);

  // データをクリア
  meta.clearRanges.forEach(function (rangeStr) {
    sheet.getRange(rangeStr).clearContent();
  });
}
