/**
 * 点数申告フォームの氏名の選択肢を最新の部員名簿に基づいて書き換える．
 *
 * @param {Object<string, Object>} memberMap - {氏名: 部員の属性情報オブジェクト}のマップ．
 */
function updateFormMember(memberMap) {
  var form = FormApp.openById(FORM_IDS.SCORE.EDIT);

  // フォーム内の項目を走査し，氏名アイテムの選択肢を更新
  for (let item of form.getItems()) {
    if (item.getTitle() === "氏名") {
      item.asListItem().setChoiceValues(Object.keys(memberMap));
    }
  }
}
