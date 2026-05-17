function updateDashboard(scoreData, memberMap) {
  // 点数データがなければ処理を終了
  if (scoreData.length == 0) {
    return;
  }

  // 活動中のメンバーに限定
  scoreData = filterActiveMember(scoreData, memberMap);
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

function filterActiveMember(input, memberMap) {
  // データごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];

    // 部員データが存在する場合は追加
    if (memberMap[item["氏名"]]) {
      output.push(item);
    }
  }

  // 結果を返す
  return output;
}

function divideSH(input) {
  // 行ごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];

    // 距離がSH(50/30/GT)なら
    if (item["距離"] == "SH(50/30/GT)") {
      // 点数を分割
      var splitScore = item["点数"].split("/");

      // データを追加
      output.push({
        ...item,
        距離: "50m",
        点数: splitScore[0],
      });
      output.push({
        ...item,
        距離: "30m",
        点数: splitScore[1],
      });
      output.push({
        ...item,
        距離: "SH",
        点数: splitScore[2],
        "(50/30)": "(" + splitScore[0] + "/" + splitScore[1] + ")",
      });
    } else {
      // 数字以外の入力を除く
      if (!isFinite(item["点数"])) {
        continue;
      }

      // データを追加
      output.push(item);
    }
  }

  // 結果を返す
  return output;
}

function addRecord(input) {
  // 氏名、距離、点数、日付で並び替え
  input.sort(function (a, b) {
    // 氏名は昇順
    if (a["氏名"] > b["氏名"]) return 1;
    if (a["氏名"] < b["氏名"]) return -1;
    // 距離は昇順
    if (a["距離"] > b["距離"]) return 1;
    if (a["距離"] < b["距離"]) return -1;
    // 点数は降順
    if (a["点数"] - b["点数"] > 0) return -1;
    if (a["点数"] - b["点数"] < 0) return 1;
    // 日付は昇順
    if (a["日付"] > b["日付"]) return 1;
    if (a["日付"] < b["日付"]) return -1;
    return 0;
  });

  // 試合新フラグ
  var gameRecordFlag = false;

  // データごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];
    var personalRecord = "";
    var gameRecord = "";

    // 自己新なら（最初、または前の行と氏名か距離が異なる場合）
    if (
      i == 0 ||
      item["氏名"] != input[i - 1]["氏名"] ||
      item["距離"] != input[i - 1]["距離"]
    ) {
      personalRecord = "自己新";
      // 試合新フラグをリセット
      gameRecordFlag = false;
    }

    // 試合新なら
    if (item["形式"] == "試合" && !gameRecordFlag) {
      gameRecord = "試合新";
      gameRecordFlag = true;
    }

    // データを追加
    output.push({
      ...item,
      自己新: personalRecord,
      試合新: gameRecord,
    });
  }

  // 結果を返す
  return output;
}
