/**
 * 「AI分析」シートの入力内容をもとに対象メンバーの点数データをAPIへ送信し，結果を出力する．
 */
function updateAiAnalytics() {
  var ss = SpreadsheetApp.openById(SS_IDS.PORTAL);
  var sheet = ss.getSheetByName("AI分析");

  var memberName = String(sheet.getRange("B3").getValue()).trim();
  var customPrompt = String(sheet.getRange("B4").getValue()).trim();
  var targetRange = sheet.getRange("A8");

  if (memberName == "") {
    targetRange.setValue("氏名を入力してください");
    return;
  }

  targetRange.setValue("分析中...");
  SpreadsheetApp.flush();

  // 対象メンバーの点数データを取得し，日付降順でソートして最新50件を抽出する．
  var scoreData = readScoreData()
    .filter(function (rowObj) {
      return rowObj["氏名"] == memberName;
    })
    .sort((a, b) => new Date(b["日付"]) - new Date(a["日付"]))
    .slice(0, 50);

  if (scoreData.length == 0) {
    targetRange.setValue(`${memberName}さんの点数データが見つかりませんでした`);
    return;
  }

  try {
    var responseText = requestGeminiAnalytics(customPrompt, scoreData);
    targetRange.setValue(responseText);
  } catch (error) {
    targetRange.setValue("分析に失敗しました\n" + error.message);
  }
}

/**
 * カスタムプロンプトと点数データをGemini APIへ送信し，分析結果を取得する．
 *
 * @param {string} customPrompt カスタムプロンプト．
 * @param {Array<Object>} scoreData 点数データ．
 * @returns {string} AIの分析結果．
 */
function requestGeminiAnalytics(customPrompt, scoreData) {
  var apiKey = GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const systemInstruction =
    "【役割】優秀なアーチェリー部コーチ\n\n" +
    "【出力形式】必ず以下の形式で出力してください。Markdownは一切使用しないこと。\n" +
    "■要約\n" +
    "（点数データから読み取れる強みや課題を3行程度で記述）\n\n" +
    "■詳細\n" +
    "（上記につながる数値的な根拠を300字程度で記述）\n\n" +
    "【分析のコツ】\n" +
    "・1.主要な距離を比較する→2.距離ごとの点数推移を見る→3.距離ごとの練習頻度の推移を見る\n" +
    "・データ数が多い距離は、部員が重視していると判断できます。\n" +
    "・「30mの平均がX点なので、50mではY点相当のポテンシャルがある」といった具体的な仮説を提示してください。\n" +
    "・「50mと30mの点数に差がある」といった、アーチェリーにおいて当然の事実は伝える意味がありません。\n\n";

  const header = "日付,形式,距離,点数";
  const rows = scoreData
    .map((row) => `${row["日付"]},${row["形式"]},${row["距離"]},${row["点数"]}`)
    .join("\n");
  const rawData = `${header}\n${rows}`;

  const summaryStats = calculateStats(scoreData);

  const userContent =
    `【生の練習データ（CSV）】:\n${rawData}\n\n` +
    `【統計値（CSV）】:\n${summaryStats}\n\n` +
    `【カスタムプロンプト】:${customPrompt}`;

  const payload = {
    contents: [
      {
        parts: [{ text: userContent }],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.5,
    },
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(
      `Gemini API Error (Status: ${responseCode}): ${responseText}`,
    );
  }

  const json = JSON.parse(responseText);

  if (
    !json.candidates ||
    !json.candidates[0] ||
    !json.candidates[0].content ||
    !json.candidates[0].content.parts[0]
  ) {
    throw new Error("Invalid response structure from Gemini API");
  }

  const aiResponse = json.candidates[0].content.parts[0].text;
  return aiResponse;
}

/**
 * 点数データを距離と形式ごとにグループ化し、統計値を計算する。
 * @param {Array<Object>} scoreData 点数データの配列
 * @returns {string} CSV形式の統計値文字列
 */
function calculateStats(scoreData) {
  const statsMap = {};

  // 1. データをグループ化して配列に格納
  scoreData.forEach((row) => {
    const key = `${row["距離"]}_${row["形式"]}`;
    if (!statsMap[key]) {
      statsMap[key] = { scores: [], distance: row["距離"], type: row["形式"] };
    }
    statsMap[key].scores.push(Number(row["点数"]));
  });

  // 2. 各グループの統計値を計算
  const resultRows = ["距離,形式,データ数,平均,標準偏差,30m換算,50m換算"];

  for (let key in statsMap) {
    const group = statsMap[key];
    const n = group.scores.length;
    const avg = group.scores.reduce((a, b) => a + b, 0) / n;

    // 標準偏差の計算
    const variance =
      group.scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // 換算ロジック
    let convert30 = "-";
    let convert50 = "-";
    const dist = group.distance;

    if (dist === "50m") {
      convert30 = (avg * 0.57 + 160).toFixed(1);
    } else if (dist === "30m") {
      convert50 = (avg * 1.75 - 280).toFixed(1);
    } else if (dist === "70m") {
      convert30 = (avg * 0.57 + 160).toFixed(1);
      convert50 = avg.toFixed(1);
    }

    resultRows.push(
      `${dist},${group.type},${n},${avg.toFixed(1)},${stdDev.toFixed(1)},${convert30},${convert50}`,
    );
  }

  return resultRows.join("\n");
}
