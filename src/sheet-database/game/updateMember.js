function updateGameMember(memberMap) {
  // 試合集計システム/名簿シートを取得
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName("名簿");

  // 列名を取得
  var headerValues = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues();
  var header = headerValues[0].map((h) => h.toString().trim());

  // 保存用配列を作成
  var outputValues = Object.values(memberMap).map((row) => {
    return header.map((key) => row[key] || "");
  });

  // データの最終行を取得
  var lastRow = sheet.getLastRow();

  // 既存のデータを削除
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, header.length).clearContent();
  }

  // 新しいデータを保存
  sheet
    .getRange(2, 1, outputValues.length, header.length)
    .setValues(outputValues);
}
