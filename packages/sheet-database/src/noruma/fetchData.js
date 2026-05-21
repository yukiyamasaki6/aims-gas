/**
 * ノルマ練習管理用のスプレッドシートから全てのシートを読み取り，点数データの一次元配列と日付をシートごとのマップで取得．
 *
 * @param {string} id - 対象となるスプレッドシートのID．
 * @returns {[Object<string, Array<Object>>, Object<string, Date>]} [{シートID: 点数オブジェクト配列}のマップ, {シートID: 日付}のマップ]のペア．
 */
function fetchNorumaData(id) {
  var ss = SpreadsheetApp.openById(id);
  var sheets = ss.getSheets();

  var sheetMap = {};
  var sheetDate = {};

  // 1番目のシートはテンプレートのためスキップ
  for (var i = 1; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetId = sheet.getSheetId().toString();

    sheetMap[sheetId] = [];
    sheetDate[sheetId] = null;

    // 列名ヘッダを除いた5行目以降のデータを取得
    var lastRow = sheet.getLastRow();
    var dataRowCount = lastRow - 4;

    if (dataRowCount <= 0) {
      continue;
    }

    var rows = sheet
      .getRange(5, 1, dataRowCount, sheet.getMaxColumns())
      .getValues();

    // 距離行，点数行，日付行の3行で1部員分のデータとして処理
    for (var j = 0; j < rows.length - 2; j += 3) {
      var name = rows[j][0];
      if (name == "") {
        break;
      }

      var date = "";

      // C列以降に記録されている練習記録を取得
      for (var k = 2; k < rows[0].length; k++) {
        if (rows[j][k] == "") {
          break;
        }

        if (rows[j + 2][k] != "") {
          date = rows[j + 2][k];
        }

        if (rows[j][k] == "近射" || rows[j + 1][k] === "" || date == "") {
          continue;
        }

        sheetMap[sheetId].push({
          シートID: sheetId,
          日付: date,
          形式: "ノルマ練習",
          氏名: name,
          距離: rows[j][k],
          点数: rows[j + 1][k],
        });

        if (!sheetDate[sheetId] || sheetDate[sheetId]) {
          sheetDate[sheetId] = date;
        }
      }
    }
  }

  return [sheetMap, sheetDate];
}
