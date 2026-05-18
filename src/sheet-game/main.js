/**
 * 保存ボタンが押されたら，試合データのデータベース保存，PDF保存，入力のクリアを行う．
 * 実行タイミング：シート変更時．
 */
function saveGameResult() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var value = range.getValue();

  if (sheet.getName() != "結果保存") {
    return;
  }

  if (value != "保存") {
    return;
  }

  var a1Notation = range.getA1Notation();
  var meta = GAME_SHEETS_META[a1Notation];
  if (!meta) {
    return;
  }

  var saveData = fetchGameData(meta);
  if (!saveData || saveData.length === 0) {
    return;
  }

  saveScoreData("試合", saveData);
  exportGamePdf(meta);
  clearGameInput(meta);

  range.clearContent();
}
