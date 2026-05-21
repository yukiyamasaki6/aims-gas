/**
 * ノルマ練習管理用のスプレッドシートの最新シートに対して列を追加する．
 *
 * @param {string} id - 対象となるスプレッドシートのID．
 */
function addNorumaColumn(id) {
  var ss = SpreadsheetApp.openById(id);

  if (ss.getNumSheets() == 1) {
    return;
  }

  var latestSheet = ss.getSheets()[1];
  var maxColumn = latestSheet.getMaxColumns();
  var lastColumn = latestSheet.getLastColumn();

  var availableColumnCount = maxColumn - lastColumn;

  // 入力可能な残り列数が5列未満になった場合に列を追加
  if (availableColumnCount < 5) {
    latestSheet.insertColumnsAfter(maxColumn, 5);

    var maxRow = latestSheet.getMaxRows();

    // 追加列に対して直前5列分の書式を複製
    var sourceRange = latestSheet.getRange(1, maxColumn - 4, maxRow, 5);
    var destinationRange = latestSheet.getRange(1, maxColumn + 1, maxRow, 5);
    sourceRange.copyTo(destinationRange, { formatOnly: true });
  }
}
