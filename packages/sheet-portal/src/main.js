/**
 * 「AI分析」シートの分析ボタンが押された場合にAI分析を実行する．
 * 実行タイミング：シート変更時．
 */
function analyzeWithAI() {
  var currSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currRange = currSheet.getActiveRange();

  if (currSheet.getName() != "AI分析") {
    return;
  }

  if (currRange.getValue() != "分析") {
    return;
  }

  var webAppUrl = DB_WEBAPP_URL;
  var options = {
    method: "post",
    muteHttpExceptions: true,
  };

  try {
    UrlFetchApp.fetch(webAppUrl, options);
  } catch (error) {
    currSheet.getRange("A8").setValue("通信エラーが発生しました");
  }

  currRange.clearContent();
}
