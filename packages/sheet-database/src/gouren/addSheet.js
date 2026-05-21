/**
 * 合同練習入力用のスプレッドシートに最新の日付の入力用シートを追加する．
 *
 * @param {string} id - 対象となるスプレッドシートのID．
 */
function addGourenSheet(id) {
  var ss = SpreadsheetApp.openById(id);

  if (ss.getNumSheets() < 2) {
    return;
  }

  var templateSheet = ss.getSheets()[0];
  var latestSheet = ss.getSheets()[1];
  var today = new Date();
  var date = Utilities.formatDate(today, "Asia/Tokyo", "M/d");

  if (date == latestSheet.getSheetName().replace(" ", "")) {
    return;
  }

  var inputArray = latestSheet.getRange("B3:F").getValues();
  var inputCheck = false;

  // 出欠が1箇所でも入力されているか確認
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

  // 点数が1箇所でも入力されているか確認
  for (var i = 0; i < inputArray.length - 1; i += 2) {
    if (inputArray[i][4] != "") {
      inputCheck = true;
      break;
    }
  }

  // 既存の最新シートに入力形跡がある場合のみテンプレートを複製
  if (inputCheck) {
    var generatedSheet = templateSheet.copyTo(ss);

    generatedSheet.activate();
    ss.moveActiveSheet(2);

    latestSheet = ss.getSheets()[1];
  }

  // シート名の重複を回避するため末尾に空白を付与
  for (;;) {
    if (ss.getSheetByName(date) == null) {
      latestSheet.setName(date);
      return;
    } else {
      date = date + " ";
    }
  }
}
