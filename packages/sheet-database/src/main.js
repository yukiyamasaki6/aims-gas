/**
 * 練習データをデータベースに同期し，データベースをもとにダッシュボードを更新する．
 * 実行タイミング：毎時実行（定時トリガー）．
 */
function refreshDashboard() {
  var syncTargets = [
    {
      label: "中百舌鳥：合同練習",
      id: SS_IDS.CAMPUS.NAKAMOZU.GOUREN,
      fetchFn: fetchGourenData,
      deleteFn: deleteGourenSheet,
    },
    {
      label: "杉本：合同練習",
      id: SS_IDS.CAMPUS.SUGIMOTO.GOUREN,
      fetchFn: fetchGourenData,
      deleteFn: deleteGourenSheet,
    },
    {
      label: "中百舌鳥：ノルマ練習",
      id: SS_IDS.CAMPUS.NAKAMOZU.NORUMA,
      fetchFn: fetchNorumaData,
      deleteFn: null,
    },
    {
      label: "杉本：ノルマ練習",
      id: SS_IDS.CAMPUS.SUGIMOTO.NORUMA,
      fetchFn: fetchNorumaData,
      deleteFn: null,
    },
  ];

  syncTargets.forEach(function (target) {
    var [sheetMap, sheetDate] = target.fetchFn(target.id);
    saveScoreData(target.label, sheetMap);

    if (target.deleteFn) {
      target.deleteFn(target.id, sheetDate);
    }
  });

  var scoreData = readScoreData();
  var memberMap = readMemberMap();

  updateDashboard(scoreData, memberMap);
}

/**
 * 練習記録用スプレッドシートと点数申告フォームの初期値を当日の日付をもとに準備する．
 * 実行タイミング：毎日実行．
 */
function prepareDailySheet() {
  addGourenSheet(SS_IDS.CAMPUS.NAKAMOZU.GOUREN);
  addGourenSheet(SS_IDS.CAMPUS.SUGIMOTO.GOUREN);

  addNorumaColumn(SS_IDS.CAMPUS.NAKAMOZU.NORUMA);
  addNorumaColumn(SS_IDS.CAMPUS.SUGIMOTO.NORUMA);

  var spreadsheet = SpreadsheetApp.openById(SS_IDS.PORTAL);
  var sheet = spreadsheet.getSheetByName("目次");

  // 日付を事前入力済みのハイパーリンクを設定
  var linkCell = sheet.getRange("A13");
  var date = new Date();
  var linkData =
    '=HYPERLINK("https://docs.google.com/forms/d/e/' +
    FORM_IDS.SCORE.INPUT +
    "/viewform?usp=pp_url&entry.341669978=" +
    Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd") +
    '","　点数申告フォーム")';
  linkCell.setValue(linkData);
}

/**
 * 更新ボタンが押された場合に，データベースの名簿を基にシステム全体の名簿を更新する．
 * 実行タイミング：シート変更時．
 */
function syncMemberMaster() {
  var currSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currRange = currSheet.getActiveRange();

  if (currSheet.getName() != "名簿") {
    return;
  }

  if (currRange.getValue() != "更新") {
    return;
  }

  var memberMap = readMemberMap(true);

  updatePortalMember(memberMap);
  updateGameMember(memberMap);
  updateFormMember(memberMap);

  currRange.clearContent();
}
