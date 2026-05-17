function readMemberMap(isActive = true) {
  // 名簿を取得
  const ss = SpreadsheetApp.openById(SS_IDS.DB);
  const sheet = ss.getSheetByName("名簿");
  const values = sheet.getRange("A:E").getValues();

  // 列名とデータを分離
  const header = values[0].map((h) => h.toString().trim());
  const rows = values.slice(1);

  // マップに変換
  const memberMap = {};
  rows.forEach(function (row) {
    const obj = {};
    header.forEach(function (colName, i) {
      // 列名をキーとして値を格納
      obj[colName] = row[i];
    });

    // 活動中の部員に限定
    if (isActive && obj["非表示"] === true) {
      return;
    }

    // 氏名をキーにしてマップに格納
    memberMap[obj["氏名"]] = obj;
  });

  return memberMap;
}

function readScoreData() {
  return [].concat(
    readFormData(),
    readDbData("中百舌鳥：合同練習")[1],
    readDbData("杉本：合同練習")[1],
    readDbData("中百舌鳥：ノルマ練習")[1],
    readDbData("杉本：ノルマ練習")[1],
    readDbData("試合")[1],
  );
}

function readFormData() {
  // 点数申告シートを取得
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName("点数申告");

  // 最終行を取得
  var lastRow = sheet.getLastRow();

  // データがなければ空配列を返す
  if (lastRow <= 1) {
    return [];
  }

  // データを取得（1行目は列名)
  var rows = sheet
    .getRange(2, 1, lastRow - 1, sheet.getMaxColumns())
    .getValues();

  // 解答ごとに集計
  var scoreData = [];
  for (var j = 0; j < rows.length; j++) {
    // 氏名・日付・形式を取得
    var name = rows[j][1];
    var date = rows[j][2];
    var format = rows[j][3];

    // 点数を集計
    for (var k = 4; k < rows[0].length - 2; k += 2) {
      // 距離・点数を取得
      var dist = rows[j][k];
      var score = rows[j][k + 1];

      // 距離か点数が空なら処理を終了
      if (dist == "" || score == "") {
        break;
      }

      // データを追加
      scoreData.push({
        日付: date instanceof Date ? date : new Date(date),
        形式: format,
        氏名: name,
        距離: dist,
        点数: score,
      });
    }
  }

  // 結果を返す
  return scoreData;
}

function readDbData(name) {
  // 結果を取得
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);
  var values = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getMaxColumns())
    .getValues();

  // 列名とデータを分離
  var header = values[0].map((h) => h.toString().trim());
  var rows = values.slice(1);

  // データごとに処理
  var data = rows.map((row) => {
    var obj = {};
    header.forEach((colName, index) => {
      var value = row[index];
      // 列名をキーにして値を格納
      if (colName === "日付") {
        var d = value instanceof Date ? value : new Date(value);
        obj[colName] = !isNaN(d.getTime()) ? d : value;
      } else {
        obj[colName] = value;
      }
    });
    return obj;
  });

  return [header, data];
}
