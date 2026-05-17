function exportGamePdf(meta) {
  // 保存元のスプレッドシート(試合集計システム)を取得
  var sourceSpreadsheet = SpreadsheetApp.openById(SS_IDS.GAME);

  // 保存元のシートを取得
  var sheet = sourceSpreadsheet.getSheetByName(meta.name);

  // 各シートの点取り形式を取得
  var format = sheet.getRange(meta.formatRange).getValue();

  // 日付を取得
  var today = new Date();
  var date =
    today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();

  // 保存元のスプレッドシート(試合集計システム)のIDを取得
  var sourceSpreadsheetId = sourceSpreadsheet.getId();

  // 保存元のシートのIDを取得
  var sheetId = sheet.getSheetId();

  // 試合形式の判別（メタデータのインデックスから紐付け）
  var matchType = meta.index < 2 ? " 団体戦)" : " 個人戦)";

  // 保存先のPDFの名前を設定
  var fileName =
    date + " " + sheet.getRange("M3").getValue() + "(" + format + matchType;

  // PDFのオプションを指定
  var pdfOption =
    "&exportFormat=pdf" +
    "&format=pdf" +
    "&size=A4" + //用紙サイズ (A4)
    "&portrait=true" + //用紙の向き true: 縦向き / false: 横向き
    "&fitw=true" + //ページ幅を用紙にフィットさせるか true: フィットさせる / false: 原寸大
    "&top_margin=0.50" + //上の余白
    "&bottom_margin=0.50" + //下の余白
    "&right_margin=0.50" + //右の余白
    "&left_margin=0.50" + //左の余白
    "&horizontal_alignment=CENTER" + //水平方向の位置
    "&vertical_alignment=TOP" + //垂直方向の位置
    "&printtitle=false" + //スプレッドシート名の表示有無
    "&sheetnames=false" + //シート名の表示有無
    "&gridlines=false" + //グリッドラインの表示有無
    "&fzr=false" + //固定行の表示有無
    "&fzc=false"; //固定列の表示有無;

  // API使用のためのOAuth認証用トークン
  var token = ScriptApp.getOAuthToken();

  // headersにアクセストークンを格納する
  var option = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };

  // URLの組み立て
  var url =
    "https://docs.google.com/spreadsheets/d/" +
    sourceSpreadsheetId +
    "/export?gid=" +
    sheetId +
    "&" +
    pdfOption;

  // PDFを作成する
  var blob = UrlFetchApp.fetch(url, option)
    .getBlob()
    .setName(fileName + ".pdf");

  // 保存するフォルダを指定（確定された環境変数を使用）
  var folder = DriveApp.getFolderById(FOLDER_IDS.PDF);

  // PDFを指定したフォルダに保存
  folder.createFile(blob);
}
