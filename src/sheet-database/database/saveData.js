/**
 * データベースの指定したシートに最新の点数データを保存．
 * 保存する際は差分が存在するシートのレコードのみを更新．
 *
 * @param {string} name - 保存対象のシート名．
 * @param {Object<string, Array<Object>>} newSheetMap - {シートID: 点数オブジェクト配列}のマップ．
 */
function saveScoreData(name, newSheetMap) {
  var [colNames, oldData] = readDbData(name);

  var oldSheetMap = {};
  oldData.forEach(function (rowObj) {
    var sheetId = rowObj["シートID"].toString();
    (oldSheetMap[sheetId] = oldSheetMap[sheetId] || []).push(rowObj);
  });

  // データベースとの日付型の混在を吸収して厳密に比較するためのハッシュ関数
  var rowHash = (rowObj) => {
    return JSON.stringify(
      colNames.map((key) => {
        var val = rowObj[key];
        if (val instanceof Date) {
          return Utilities.formatDate(val, "JST", "yyyy/MM/dd");
        }
        return val ? val.toString() : "";
      }),
    );
  };

  var updateRecords = [];
  var persistentSet = new Set(Object.keys(oldSheetMap));

  for (var sheetId in newSheetMap) {
    var newRecord = newSheetMap[sheetId];
    var oldRecord = oldSheetMap[sheetId] || [];

    // シート単位で1箇所でも変更があれば，そのシートの全レコードを更新対象とする
    if (
      JSON.stringify(newRecord.map(rowHash)) !==
      JSON.stringify(oldRecord.map(rowHash))
    ) {
      updateRecords = updateRecords.concat(newRecord);
      persistentSet.delete(sheetId);
    }
  }

  var persistentSheetIds = Array.from(persistentSet);

  var ss = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = ss.getSheetByName(name);
  if (updateRecords.length > 0) {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // ユーザによるフィルタが存在する場合は除去
      if (sheet.getFilter()) sheet.getFilter().remove();

      var range = sheet.getRange(1, 1, lastRow, colNames.length);
      var filter = range.createFilter();

      // 変更のない行をフィルタで隠蔽し，変更対象のレコードのみを一括で削除
      var criteria = SpreadsheetApp.newFilterCriteria()
        .setHiddenValues(persistentSheetIds)
        .build();
      filter.setColumnFilterCriteria(1, criteria);
      sheet.deleteRows(2, lastRow - 1);
      filter.remove();
    }

    // 変更後の点数データを最終行の直下に一括で挿入
    var outputValues = updateRecords.map(function (record) {
      return colNames.map(function (key) {
        return record[key] || "";
      });
    });
    sheet
      .getRange(sheet.getLastRow() + 1, 1, outputValues.length, colNames.length)
      .setValues(outputValues);
  }
}
