function refreshDashboard() {
  // 点数データを取得
  var scoreData = readScoreData();

  // データがなければ処理を終了
  if (scoreData.length == 0) {
    return;
  }

  // 活動中のメンバーに限定
  scoreData = filterActiveMember(scoreData);
  // SHを分割
  scoreData = divideSH(scoreData);
  // 自己新を追加
  scoreData = addRecord(scoreData);

  // 重要な情報が前に来るように並び替え
  scoreData.sort(function (a, b) {
    // 自己新試合新は前
    if (a["自己新"] != "" && b["自己新"] == "") return -1;
    if (a["自己新"] == "" && b["自己新"] != "") return 1;
    if (a["試合新"] != "" && b["試合新"] == "") return -1;
    if (a["試合新"] == "" && b["試合新"] != "") return 1;
    // 日付は降順
    if (a["日付"] > b["日付"]) return -1;
    if (a["日付"] < b["日付"]) return 1;
    return 0;
  });

  // 1000行に制限
  scoreData.splice(1000);

  // 見やすいように並び替え
  scoreData.sort(function (a, b) {
    // 日付は降順
    if (a["日付"] > b["日付"]) return -1;
    if (a["日付"] < b["日付"]) return 1;
    // 氏名は昇順
    if (a["氏名"] > b["氏名"]) return 1;
    if (a["氏名"] < b["氏名"]) return -1;
    // 距離は昇順
    if (a["距離"] > b["距離"]) return 1;
    if (a["距離"] < b["距離"]) return -1;
    return 0;
  });

  // 送信先のシート(大阪公立大学アーチェリー部/点数)を取得
  var ss = SpreadsheetApp.openById(SS_IDS.PORTAL);
  var sheet = ss.getSheetByName("点数");

  // 二次元配列に変換
  var colNames = [
    "氏名",
    "日付",
    "形式",
    "距離",
    "点数",
    "(50/30)",
    "自己新",
    "試合新",
  ];
  var outputValues = scoreData.map((row) => {
    return colNames.map((key) => row[key] || "");
  });

  // 送信先の範囲を設定
  var destinationRange = sheet.getRange(
    2,
    4,
    outputValues.length,
    outputValues[0].length,
  );

  // 送信先と内容(点数)が同じなら更新しない
  var destinationData = destinationRange.getValues();
  var same = true;
  var scoreIdx = colNames.indexOf("点数");
  for (var i = 0; i < outputValues.length; i++) {
    if (outputValues[i][scoreIdx] != destinationData[i][scoreIdx]) {
      same = false;
      break;
    }
  }
  if (same) {
    return;
  }

  // 送信
  destinationRange.setValues(outputValues);
}
