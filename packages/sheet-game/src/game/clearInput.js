/**
 * 試合集計システムから，指定されたシートの入力領域をクリアする．
 *
 * @param {Object} meta - シート名とクリア対象範囲の配列を含むメタ情報オブジェクト．
 */
function clearGameInput(meta) {
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName(meta.name);

  // メタ情報で指定されたすべての入力範囲のデータをクリア
  meta.clearRanges.forEach(function (rangeStr) {
    sheet.getRange(rangeStr).clearContent();
  });
}
