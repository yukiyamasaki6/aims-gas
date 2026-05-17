function addNorumaColumn(id) {
  // ノルマ練習管理用スプレッドシートを取得
  var ss = SpreadsheetApp.openById(id);

  // シート数が1なら処理を終了
  if (ss.getNumSheets() == 1) {
    return;
  }

  // 最新のシートを取得
  var latestSheet = ss.getSheets()[1];

  // シートの列数を取得する
  var maxColumn = latestSheet.getMaxColumns();

  // データが入力されている最後の列を取得する
  var lastColumn = latestSheet.getLastColumn();

  // 残り行数が少ないなら
  if (maxColumn < lastColumn + 5) {
    // 5列追加する
    latestSheet.insertColumnsAfter(maxColumn, 5);

    // シートの行数を取得する
    var maxRow = latestSheet.getMaxRows();

    // 書式をコピーして貼り付ける
    var sourceRange = latestSheet.getRange(5, maxColumn - 4, maxRow - 4, 5);
    var destinationRange = latestSheet.getRange(
      5,
      maxColumn + 1,
      maxRow - 4,
      5,
    );
    sourceRange.copyTo(destinationRange, { formatOnly: true });
  }
}
