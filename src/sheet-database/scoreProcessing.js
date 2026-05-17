function filterActiveMember(input) {
  
  // 活動中の部員情報を取得
  var memberMap = readMemberMap();

  // データごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];

    // 部員データが存在する場合は追加
    if (memberMap[item["氏名"]]) {
      output.push(item);
    }
  }

  // 結果を返す
  return output;
}


function divideSH(input) {

  // 行ごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];

    // 距離がSH(50/30/GT)なら
    if (item["距離"] == "SH(50/30/GT)") {

      // 点数を分割
      var splitScore = item["点数"].split("/");

      // データを追加
      output.push({
        ...item,
        "距離": "50m",
        "点数": splitScore[0]
      });
      output.push({
        ...item,
        "距離": "30m",
        "点数": splitScore[1]
      });
      output.push({
        ...item,
        "距離": "SH",
        "点数": splitScore[2],
        "(50/30)": "(" + splitScore[0] + "/" + splitScore[1] + ")"
      });

    } else {

      // 数字以外の入力を除く
      if (!isFinite(item["点数"])) {
        continue;
      }

      // データを追加
      output.push(item);
    }
  }

  // 結果を返す
  return output;
}


function addRecord(input) {

  // 氏名、距離、点数、日付で並び替え
  input.sort(function(a, b) {
    // 氏名は昇順
    if (a["氏名"] > b["氏名"]) return 1;
    if (a["氏名"] < b["氏名"]) return -1;
    // 距離は昇順
    if (a["距離"] > b["距離"]) return 1;
    if (a["距離"] < b["距離"]) return -1;
    // 点数は降順
    if (a["点数"] - b["点数"] > 0) return -1;
    if (a["点数"] - b["点数"] < 0) return 1;
    // 日付は昇順
    if (a["日付"] > b["日付"]) return 1;
    if (a["日付"] < b["日付"]) return -1;
    return 0;
  })
  
  // 試合新フラグ
  var gameRecordFlag = false;

  // データごとに処理
  var output = [];
  for (var i = 0; i < input.length; i++) {
    var item = input[i];
    var personalRecord = "";
    var gameRecord = "";

    // 自己新なら（最初、または前の行と氏名か距離が異なる場合）
    if (i == 0 || item["氏名"] != input[i-1]["氏名"] || item["距離"] != input[i-1]["距離"]) {   
      
      personalRecord = "自己新";
      // 試合新フラグをリセット
      gameRecordFlag = false;
    }

    // 試合新なら
    if (item["形式"] == "試合" && !gameRecordFlag) {      
      gameRecord = "試合新";
      gameRecordFlag = true;
    }

    // データを追加
    output.push({
      ...item,
      "自己新": personalRecord,
      "試合新": gameRecord
    });
  }

  // 結果を返す
  return output;
}