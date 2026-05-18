/**
 * データベースの名簿シートから部員情報をマップで取得．
 *
 * @param {boolean} [isActive=true] - 活動中の部員に限定するかどうか．
 * @returns {Object<string, Object>} {氏名: 部員の属性情報オブジェクト}のマップ．
 */
function readMemberMap(isActive = true) {
  const ss = SpreadsheetApp.openById(SS_IDS.DB);
  const sheet = ss.getSheetByName("名簿");
  const values = sheet.getRange("A:E").getValues();

  // 1行目から列名を取得し，データ行と分離
  const header = values[0].map((h) => h.toString().trim());
  const rows = values.slice(1);

  // 取得した二次元配列を氏名をキーとするオブジェクトマップに変換
  const memberMap = {};
  rows.forEach(function (row) {
    const rowObj = {};
    header.forEach(function (colName, i) {
      rowObj[colName] = row[i];
    });

    // 退部や引退など非表示フラグが立っている部員を除外
    if (isActive && rowObj["非表示"] === true) {
      return;
    }

    memberMap[rowObj["氏名"]] = rowObj;
  });

  return memberMap;
}

/**
 * データベースのすべての点数データを集約した一次元配列を返す．
 *
 * @returns {Array<Object>} 点数オブジェクトの一次元配列．データがない場合は空配列．
 */
function readScoreData() {
  return [].concat(
    readFormData()[1],
    readDbData("中百舌鳥：合同練習")[1],
    readDbData("杉本：合同練習")[1],
    readDbData("中百舌鳥：ノルマ練習")[1],
    readDbData("杉本：ノルマ練習")[1],
    readDbData("試合")[1],
  );
}

/**
 * データベースの点数申告シートを読み込んで列名と点数オブジェクトの配列を返す．
 *
 * @returns {[Array<string>, Array<Object>]} [列名配列, 点数オブジェクト配列]のペア．データがない場合は点数オブジェクトの配列は空配列．
 */
function readFormData() {
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName("点数申告");
  var values = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getMaxColumns())
    .getValues();

  var header = values[0].map((h) => h.toString().trim());
  var rows = values.slice(1);

  var data = [];
  for (var j = 0; j < rows.length; j++) {
    var rowObj = {};
    header.forEach(function (colName, index) {
      var value = rows[j][index];

      // 日付列に対してのみデータの安全性を考慮して明示的に型をキャストする
      if (colName === "日付") {
        var d = value instanceof Date ? value : new Date(value);
        rowObj[colName] = d instanceof Date && !isNaN(d.getTime()) ? d : value;
      } else {
        rowObj[colName] = value;
      }
    });

    // 4列目以降の列に複数並ぶ距離と点数のセットをそれぞれ独立した1レコードとして配列へ展開する
    for (var k = 4; k < rows[0].length - 2; k += 2) {
      var dist = rows[j][k];
      var score = rows[j][k + 1];

      if (dist == "" || score == "") {
        break;
      }

      data.push({
        ...rowObj,
        距離: dist,
        点数: score,
      });
    }
  }

  return [header, data];
}

/**
 * データベースの指定したシートを読み込んで列名と点数オブジェクトの配列を返す．
 *
 * @param {string} name - 読み込み対象のシート名．
 * @returns {[Array<string>, Array<Object>]} [列名配列, 点数オブジェクト配列]のペア．データがない場合は点数オブジェクトの配列は空配列．
 */
function readDbData(name) {
  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);
  var values = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getMaxColumns())
    .getValues();

  var header = values[0].map((h) => h.toString().trim());
  var rows = values.slice(1);

  // 二次元配列を1行ごとにヘッダの列名と対応する値を持つオブジェクトに変換する
  var data = [];
  rows.forEach(function (row) {
    var rowObj = {};
    header.forEach(function (colName, index) {
      var value = row[index];

      // 日付列に対してのみデータの安全性を考慮して明示的に型をキャストする
      if (colName === "日付") {
        var d = value instanceof Date ? value : new Date(value);
        rowObj[colName] = d instanceof Date && !isNaN(d.getTime()) ? d : value;
      } else {
        rowObj[colName] = value;
      }
    });
    data.push(rowObj);
  });

  return [header, data];
}
