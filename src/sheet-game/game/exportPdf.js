/**
 * 試合集計システムから，試合結果をPDFとして出力しGoogleドライブに保存する．
 *
 * @param {Object} meta - シート名，形式セル範囲，インデックスを含むメタ情報オブジェクト．
 */
function exportGamePdf(meta) {
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName(meta.name);

  var format = sheet.getRange(meta.formatRange).getValue();

  var today = new Date();
  var date =
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

  var ssId = ss.getId();
  var sheetId = sheet.getSheetId();

  var fileName =
    date +
    " " +
    sheet.getRange("M3").getValue() +
    "(" +
    format +
    " " +
    meta.name +
    ")";

  var pdfOption =
    "&exportFormat=pdf" +
    "&format=pdf" +
    "&size=A4" +
    "&portrait=true" +
    "&fitw=true" +
    "&top_margin=0.50" +
    "&bottom_margin=0.50" +
    "&right_margin=0.50" +
    "&left_margin=0.50" +
    "&horizontal_alignment=CENTER" +
    "&vertical_alignment=TOP" +
    "&printtitle=false" +
    "&sheetnames=false" +
    "&gridlines=false" +
    "&fzr=false" +
    "&fzc=false";

  // スプレッドシートのPDFエクスポートURLにOAuthトークンを用いてアクセス
  var token = ScriptApp.getOAuthToken();
  var option = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  var url =
    "https://docs.google.com/spreadsheets/d/" +
    ssId +
    "/export?gid=" +
    sheetId +
    "&" +
    pdfOption;

  var blob = UrlFetchApp.fetch(url, option)
    .getBlob()
    .setName(fileName + ".pdf");

  var folder = DriveApp.getFolderById(FOLDER_IDS.PDF);
  folder.createFile(blob);
}
