// スクリプトプロパティから環境変数を一括取得
const properties = PropertiesService.getScriptProperties().getProperties();

// スプレッドシートID
const SS_IDS = {
  DB: properties.DB_SS_ID,
  GAME: properties.GAME_SS_ID,
};
