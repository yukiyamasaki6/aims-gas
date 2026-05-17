function updateMember() {
  var currSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var currRange = currSheet.getActiveRange();

  // 現在のシートが名簿シートなら処理を行う
  if (currSheet.getName() != "名簿") {
    return;
  }

  // 更新ボタンが押されているなら処理を行う
  if (currRange.getValue() != "更新") {
    return;
  }

  // 活動中の部員を取得
  var memberMap = readMemberMap(true);

  // 大阪公立大学アーチェリー部/名簿に書き込み
  var ss = SpreadsheetApp.openById(SS_IDS.PORTAL);
  var sheet = ss.getSheetByName("名簿");
  writeMember(sheet, memberMap);

  // 試合集計システム/名簿に書き込み
  var ss = SpreadsheetApp.openById(SS_IDS.GAME);
  var sheet = ss.getSheetByName("名簿");
  writeMember(sheet, memberMap);

  // 点数申告フォーム/氏名の選択肢書き換え
  var form = FormApp.openById(FORM_IDS.SCORE);
  for (let item of form.getItems()) {
    if (item.getTitle() === "氏名") {
      item.asListItem().setChoiceValues(Object.keys(memberMap));
    }
  }

  // 更新ボタンをクリア
  currRange.clearContent();
}

function writeMember(sheet, memberMap) {
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
