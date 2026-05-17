function syncAll() {
  syncNakamozuGouren();
  syncSugimotoGouren();
  syncNakamozuNoruma();
  syncSugimotoNoruma();
}

function syncNakamozuGouren() {
  var [newSheetMap, newSheetDate] = fetchGourenData(
    SS_IDS.CAMPUS.NAKAMOZU.GOUREN,
  );
  var archiveSheetIds = syncDb("中百舌鳥：合同練習", newSheetMap, newSheetDate);

  // 入力元シートのアーカイブ（削除）
  var archiveSet = new Set(archiveSheetIds);
  if (archiveSet.size > 0) {
    var spreadsheet = SpreadsheetApp.openById(SS_IDS.CAMPUS.NAKAMOZU.GOUREN);
    // 全シートを走査し、Setに含まれるGIDを持つシートを削除
    spreadsheet.getSheets().forEach(function (sheet) {
      if (archiveSet.has(sheet.getSheetId().toString())) {
        spreadsheet.deleteSheet(sheet);
      }
    });
  }
}

function syncSugimotoGouren() {
  var [newSheetMap, newSheetDate] = fetchGourenData(
    SS_IDS.CAMPUS.SUGIMOTO.GOUREN,
  );
  var archiveSheetIds = syncDb("杉本：合同練習", newSheetMap, newSheetDate);

  // 入力元シートのアーカイブ（削除）
  var archiveSet = new Set(archiveSheetIds);
  if (archiveSet.size > 0) {
    var spreadsheet = SpreadsheetApp.openById(SS_IDS.CAMPUS.SUGIMOTO.GOUREN);
    // 全シートを走査し、Setに含まれるGIDを持つシートを削除
    spreadsheet.getSheets().forEach(function (sheet) {
      if (archiveSet.has(sheet.getSheetId().toString())) {
        spreadsheet.deleteSheet(sheet);
      }
    });
  }
}

function syncNakamozuNoruma() {
  var [newSheetMap, newSheetDate] = fetchNorumaData(
    SS_IDS.CAMPUS.NAKAMOZU.NORUMA,
  );
  syncDb("中百舌鳥：ノルマ練習", newSheetMap, newSheetDate);
}

function syncSugimotoNoruma() {
  var [newSheetMap, newSheetDate] = fetchNorumaData(
    SS_IDS.CAMPUS.SUGIMOTO.NORUMA,
  );
  syncDb("杉本：ノルマ練習", newSheetMap, newSheetDate);
}

function syncDb(name, newSheetMap, newSheetDate) {
  // 保存されている情報を取得
  var [colNames, oldData] = readDb(name);

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
  var archiveSheetIds = [];
  var now = new Date();
  var thresholdDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // 更新の有無とアーカイブ対象の確認
  for (var sheetId in newSheetMap) {
    var newRecord = newSheetMap[sheetId];
    var oldRecord = oldSheetMap[sheetId] || [];

    if (
      JSON.stringify(newRecord.map(rowHash)) !==
      JSON.stringify(oldRecord.map(rowHash))
    ) {
      updateRecords = updateRecords.concat(newRecord);
      persistentSet.delete(sheetId);
    } else if (newSheetDate[sheetId] < thresholdDate) {
      archiveSheetIds.push(sheetId);
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
      .getRange(sheet.getLastRow() + 1, 1, outputValues.length, 6)
      .setValues(outputValues);
  }

  return archiveSheetIds;
}
