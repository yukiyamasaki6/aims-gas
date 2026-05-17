function fetchNorumaData(id) {
  // すべてのシートを取得
  var ss = SpreadsheetApp.openById(id);
  var sheets = ss.getSheets();

  // テンプレシートを除く各シートを集計
  var sheetMap = {};
  var sheetDate = {};
  for (var i = 1; i < sheets.length; i++) {
    var sheet = sheets[i];

    // シートIDを取得
    var sheetId = sheet.getSheetId().toString();

    // シートの存在を記録
    sheetMap[sheetId] = [];
    sheetDate[sheetId] = null;

    // データの最終行を取得
    var lastRow = sheet.getLastRow();

    // データがなければ処理をスキップ
    if (lastRow <= 4) {
      continue;
    }

    // データを取得(4行目までは列名)
    var rows = sheet
      .getRange(5, 1, lastRow - 4, sheet.getMaxColumns())
      .getValues();

    // 人ごとに集計
    for (var j = 0; j < rows.length - 2; j += 3) {
      // 氏名を取得
      var name = rows[j][0];

      // 氏名が空なら処理を終了
      if (name == "") {
        break;
      }

      // 処理中の日付を記録
      var date = "";

      // 点数を集計
      for (var k = 2; k < rows[0].length; k++) {
        // 距離が空なら処理を終了
        if (rows[j][k] == "") {
          break;
        }

        // 日付が入力されているなら日付を更新
        if (rows[j + 2][k] != "") {
          date = rows[j + 2][k];
        }

        // 距離が近射、もしくは点数がない、もしくは日付が空なら処理をスキップ
        if (rows[j][k] == "近射" || rows[j + 1][k] === "" || date == "") {
          continue;
        }

        // データを追加
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

  // 結果を返す
  return [sheetMap, sheetDate];
}
