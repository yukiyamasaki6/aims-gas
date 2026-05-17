function saveButtonClicked() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var range = sheet.getActiveRange();
  var value = range.getValue();

  // 現在のシートが結果保存シートなら処理を行う
  if (sheet.getName() != "結果保存") {
    return;
  }

  // 保存ボタンが押されているなら処理を行う
  if (value != "保存") {
    return;
  }

  // 押されたセルの位置をキーにして、メタデータを一発で取得
  var a1Notation = range.getA1Notation();
  var meta = GAME_SHEETS_META[a1Notation];
  if (!meta) return;

  // 試合結果を取得
  var saveData = fetchGameData(meta);
  if (!saveData || saveData.length === 0) return;

  // データベースへ保存
  saveScoreData("試合", saveData);

  // PDFを作成する
  exportGamePdf(meta);

  // データをクリア
  clearGameInput(meta);

  // 送信ボタンをクリア
  range.clearContent();
}
