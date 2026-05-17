// スクリプトプロパティから環境変数を一括取得
const properties = PropertiesService.getScriptProperties().getProperties();

// スプレッドシートID
const SS_IDS = {
  DB: properties.DB_SS_ID,
  GAME: properties.GAME_SS_ID,
};

// フォルダID
const FOLDER_IDS = {
  PDF: properties.PDF_FOLDER_ID,
};

// 試合集計システムのメタ情報
const GAME_SHEETS_META = {
  C5: {
    name: "団体戦1",
    formatRange: "K3",
    titleRange: "M3",
    dataRanges: ["C9:K48", "P9:X48"],
    clearRanges: ["D6", "Q6", "M3", "C9:C48", "E9:J48", "P9:P48", "R9:W48"],
  },
  C7: {
    name: "団体戦2",
    formatRange: "K3",
    titleRange: "M3",
    dataRanges: ["C9:K48", "P9:X48"],
    clearRanges: ["D6", "Q6", "M3", "C9:C48", "E9:J48", "P9:P48", "R9:W48"],
  },
  C9: {
    name: "個人戦1",
    formatRange: "I3",
    titleRange: "M3",
    dataRanges: ["D7:L102"],
    clearRanges: ["M3", "D7:D102", "F7:K102", "N7:O102"],
  },
  C11: {
    name: "個人戦2",
    formatRange: "I3",
    titleRange: "M3",
    dataRanges: ["D7:L102"],
    clearRanges: ["M3", "D7:D102", "F7:K102", "N7:O102"],
  },
};
