// スクリプトプロパティから環境変数を一括取得
const properties = PropertiesService.getScriptProperties().getProperties();

const SS_IDS = {
  DB: properties.DB_SS_ID,
  PORTAL: properties.PORTAL_SS_ID,
  GAME: properties.GAME_SS_ID,

  CAMPUS: {
    NAKAMOZU: {
      GOUREN: properties.NAKAMOZU_GOUREN_SS_ID,
      NORUMA: properties.NAKAMOZU_NORUMA_SS_ID,
    },
    SUGIMOTO: {
      GOUREN: properties.SUGIMOTO_GOUREN_SS_ID,
      NORUMA: properties.SUGIMOTO_NORUMA_SS_ID,
    },
  },
};

const FORM_IDS = {
  SCORE: {
    INPUT: properties.SCORE_INPUT_FORM_ID,
    EDIT: properties.SCORE_EDIT_FORM_ID,
  },
};

const GEMINI_API_KEY = properties.GEMINI_API_KEY;
