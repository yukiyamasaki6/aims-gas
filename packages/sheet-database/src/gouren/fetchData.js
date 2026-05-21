/**
 * 合同練習入力用のスプレッドシートから全てのシートを読み取り，点数データの一次元配列と日付をシートごとのマップで取得．
 *
 * @param {string} id - 対象となるスプレッドシートのID．
 * @returns {[Object<string, Array<Object>>, Object<string, Date>]} [{シートID: 点数オブジェクト配列}のマップ, {シートID: 日付}のマップ]のペア．
 */
function fetchGourenData(id) {
  var ss = SpreadsheetApp.openById(id);
  var sheets = ss.getSheets();

  var referenceDate = new Date();
  var sheetMap = {};
  var sheetDate = {};

  // 1番目のシートはテンプレートのためスキップ
  for (var i = 1; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetId = sheet.getSheetId().toString();
    var sheetName = sheet.getSheetName().replace(" ", "");

    // スプレッドシートのM/d形式のシート名から基準日に最も近い有効な年を補完して日付を特定
    var refYear = referenceDate.getFullYear();
    var candidates = [refYear - 1, refYear, refYear + 1].map((y) => {
      return Utilities.parseDate(y + "/" + sheetName, "JST", "yyyy/MM/dd");
    });

    var date = candidates.reduce(function (prev, curr) {
      return Math.abs(curr - referenceDate) < Math.abs(prev - referenceDate)
        ? curr
        : prev;
    });

    // 次のシートの年を正しく判定するため基準日を時系列順に更新
    referenceDate = date;

    sheetMap[sheetId] = [];
    sheetDate[sheetId] = date;

    // 列名ヘッダを除いた3行目以降のデータを取得
    var lastRow = sheet.getLastRow();
    var dataRowCount = lastRow - 2;

    if (dataRowCount <= 0) {
      continue;
    }

    var rows = sheet
      .getRange(3, 1, dataRowCount, sheet.getMaxColumns())
      .getValues();

    // 距離行と点数行の2行で1部員分のデータとして処理
    for (var j = 0; j < rows.length - 1; j += 2) {
      var name = rows[j][0];
      if (name == "") {
        continue;
      }

      // F列以降に記録されている距離と点数を取得
      for (var k = 5; k < rows[0].length; k++) {
        var dist = rows[j][k];
        var score = rows[j + 1][k];

        if (dist == "" || score == "") {
          break;
        }

        sheetMap[sheetId].push({
          シートID: sheetId,
          日付: date,
          形式: "合同練習",
          氏名: name,
          距離: dist,
          点数: score,
        });
      }
    }
  }

  return [sheetMap, sheetDate];
}
