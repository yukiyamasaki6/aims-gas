function saveScoreData(name, newSheetMap) {
  // 保存されている情報を取得
  var [colNames, oldData] = readDbData(name);

  // シートIDごとにマップ化
  var oldSheetMap = {};
  oldData.forEach(function (r) {
    var sheetId = r["シートID"].toString();
    (oldSheetMap[sheetId] = oldSheetMap[sheetId] || []).push(r);
  });

  // 行ごとにハッシュ化する共通関数
  var rowHash = (row) => {
    return JSON.stringify(
      colNames.map((key) => {
        var val = row[key];
        if (val instanceof Date)
          return Utilities.formatDate(val, "JST", "yyyy/MM/dd");
        return val.toString();
      }),
    );
  };

  var updateRecords = [];
  var persistentSet = new Set(Object.keys(oldSheetMap));

  // 更新の有無のみを確認（アーカイブ判定はここで行わない）
  for (var sheetId in newSheetMap) {
    var newRecord = newSheetMap[sheetId];
    var oldRecord = oldSheetMap[sheetId] || [];

    if (
      JSON.stringify(newRecord.map(rowHash)) !==
      JSON.stringify(oldRecord.map(rowHash))
    ) {
      updateRecords = updateRecords.concat(newRecord);
      persistentSet.delete(sheetId);
    }
  }

  var persistentSheetIds = Array.from(persistentSet);

  // データベース反映
  var spreadsheet = SpreadsheetApp.openById(SS_IDS.DB);
  var sheet = spreadsheet.getSheetByName(name);
  if (updateRecords.length > 0) {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      if (sheet.getFilter()) sheet.getFilter().remove();
      var range = sheet.getRange(1, 1, lastRow, 6);
      var filter = range.createFilter();

      var criteria = SpreadsheetApp.newFilterCriteria()
        .setHiddenValues(persistentSheetIds)
        .build();
      filter.setColumnFilterCriteria(1, criteria);
      sheet.deleteRows(2, lastRow - 1);
      filter.remove();
    }

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
