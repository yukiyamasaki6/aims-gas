// スクリプトプロパティから環境変数を一括取得
const properties = PropertiesService.getScriptProperties().getProperties();

const DB_WEBAPP_URL = properties.DB_WEBAPP_URL;
