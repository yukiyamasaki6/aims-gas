function updateFormMember(memberMap) {
  // 点数申告フォーム/氏名を取得
  var form = FormApp.openById(FORM_IDS.SCORE);

  // 氏名の選択肢を書き換え
  for (let item of form.getItems()) {
    if (item.getTitle() === "氏名") {
      item.asListItem().setChoiceValues(Object.keys(memberMap));
    }
  }
}
