function addGourenSheet(id) {
  // 合同練習管理用スプレッドシートを取得
  var ss = SpreadsheetApp.openById(id);

  // シート数が1なら処理を終了
  if (ss.getNumSheets() == 1) {
    return;
  }

  // 最新のシートを取得
  var latestSheet = ss.getSheets()[1];

  // 今日の日付を取得
  var today = new Date();
  var date = Utilities.formatDate(today, "Asia/Tokyo", "M/d");

  // 最新のシートが今日のシートなら処理を終了
  if (date == latestSheet.getSheetName().replace(" ", "")) {
    return;
  }

  // 出欠から点数の一列目までを取得
  var inputArray = latestSheet.getRange("B3:F").getValues();

  // 出欠の入力が無いか確認
  var inputCheck = false;
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < inputArray.length; j += 2) {
      if (inputArray[j][i] == true) {
        inputCheck = true;
        break;
      }
    }
    if (inputCheck) {
      break;
    }
  }

  // 点数の入力が無いか確認
  for (var i = 0; i < inputArray.length - 1; i += 2) {
    if (inputArray[i][4] != "") {
      inputCheck = true;
      break;
    }
  }

  // 入力が有るなら新たなシートを生成
  if (inputCheck) {
    // テンプレのシートを複製
    var templateSheet = ss.getSheets()[0];
    var generatedSheet = templateSheet.copyTo(ss);

    // 複製後のシートを2番目に移動
    generatedSheet.activate();
    ss.moveActiveSheet(2);
  }

  // (改めて)最新のシートを取得
  latestSheet = ss.getSheets()[1];

  // 最新のシートの名前を変更
  for (;;) {
    if (ss.getSheetByName(date) == null) {
      latestSheet.setName(date);
      return;
    } else {
      date = date + " ";
    }
  }
}
