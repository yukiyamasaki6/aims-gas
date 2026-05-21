/**
 * ポータル用スプレッドシートの点数一覧シートに表示する点数データを更新する．
 *
 * @param {Array<Object>} scoreData - 全部員の点数オブジェクト配列．
 * @param {Object<string, Object>} memberMap - {氏名: 部員の属性情報オブジェクト}のマップ．
 */
function updateDashboard(scoreData, memberMap) {
  if (scoreData.length == 0) {
    return;
  }

  scoreData = filterMember(scoreData, memberMap);
  scoreData = divideSH(scoreData);
  scoreData = addRecord(scoreData);

  // 自己新，試合新，最新のデータを残して1000件に制限
  scoreData.sort(function (a, b) {
    if (a["自己新"] != "" && b["自己新"] == "") return -1;
    if (a["自己新"] == "" && b["自己新"] != "") return 1;
    if (a["試合新"] != "" && b["試合新"] == "") return -1;
    if (a["試合新"] == "" && b["試合新"] != "") return 1;
    if (a["日付"] > b["日付"]) return -1;
    if (a["日付"] < b["日付"]) return 1;
    return 0;
  });
  scoreData.splice(1000);

  var ss = SpreadsheetApp.openById(SS_IDS.PORTAL);
  var sheet = ss.getSheetByName("点数");

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

  var outputValues = scoreData.map((rowObj) => {
    return colNames.map((key) => rowObj[key] || "");
  });

  // D2セルを起点に出力範囲を指定
  var destinationRange = sheet.getRange(
    2,
    4,
    outputValues.length,
    outputValues[0].length,
  );

  // 既存データと更新データの点数列が一致する場合は，同じデータとみなして更新をスキップ
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

  destinationRange.setValues(outputValues);
}

/**
 * 全部員の点数データから対象部員のみを抽出する．
 *
 * @param {Array<Object>} input - 全部員の点数オブジェクト配列．
 * @param {Object<string, Object>} memberMap - 対象部員の{氏名: 部員の属性情報オブジェクト}のマップ．
 * @returns {Array<Object>} 対象部員に限定した点数オブジェクト配列．
 */
function filterMember(input, memberMap) {
  var output = [];

  // マップに存在する部員のデータのみを抽出
  for (var i = 0; i < input.length; i++) {
    var rowObj = input[i];

    if (memberMap[rowObj["氏名"]]) {
      output.push(rowObj);
    }
  }

  return output;
}

/**
 * 距離がSH（50/30/GT）のレコードを50m，30m，SHの3つのレコードに分割し，数字以外の点数レコードを除外する．
 *
 * @param {Array<Object>} input - 分割前の点数オブジェクト配列．
 * @returns {Array<Object>} SH分割および数値バリデーション適用後の点数オブジェクト配列．
 */
function divideSH(input) {
  var output = [];

  for (var i = 0; i < input.length; i++) {
    var rowObj = input[i];

    // SH（50/30/GT）のデータを50m，30m，SHの3レコードに分割して追加
    if (rowObj["距離"] == "SH(50/30/GT)") {
      var splitScore = String(rowObj["点数"]).split("/");

      if (splitScore.length < 3) {
        continue;
      }

      output.push({
        ...rowObj,
        距離: "50m",
        点数: splitScore[0],
      });
      output.push({
        ...rowObj,
        距離: "30m",
        点数: splitScore[1],
      });
      output.push({
        ...rowObj,
        距離: "SH",
        点数: splitScore[2],
        "(50/30)": "(" + splitScore[0] + "/" + splitScore[1] + ")",
      });
    } else {
      if (!isFinite(rowObj["点数"])) {
        continue;
      }

      output.push(rowObj);
    }
  }

  return output;
}

/**
 * 点数データに対して自己新および試合新のフラグを付与する．
 *
 * @param {Array<Object>} input - フラグ付与前の点数オブジェクト配列．
 * @returns {Array<Object>} フラグ付与後の点数オブジェクト配列．
 */
function addRecord(input) {
  // 氏名・距離ごとに点数の高い順かつ日付の古い順でソート
  input.sort(function (a, b) {
    if (a["氏名"] > b["氏名"]) return 1;
    if (a["氏名"] < b["氏名"]) return -1;
    if (a["距離"] > b["距離"]) return 1;
    if (a["距離"] < b["距離"]) return -1;

    if (b["点数"] - a["点数"] != 0) {
      return b["点数"] - a["点数"];
    }

    if (a["日付"] > b["日付"]) return 1;
    if (a["日付"] < b["日付"]) return -1;
    return 0;
  });

  var gameRecordFlag = false;
  var output = [];

  for (var i = 0; i < input.length; i++) {
    var rowObj = input[i];
    var personalRecord = "";
    var gameRecord = "";

    // 同一人物かつ同一距離の先頭レコードを自己新と判定
    if (
      i == 0 ||
      rowObj["氏名"] != input[i - 1]["氏名"] ||
      rowObj["距離"] != input[i - 1]["距離"]
    ) {
      personalRecord = "自己新";
      gameRecordFlag = false;
    }

    // 最初の試合データのみを試合新と判定
    if (rowObj["形式"] == "試合" && !gameRecordFlag) {
      gameRecord = "試合新";
      gameRecordFlag = true;
    }

    output.push({
      ...rowObj,
      自己新: personalRecord,
      試合新: gameRecord,
    });
  }

  return output;
}
