function updateSystem() {

  // データベースを同期
  syncAll();

  // 点数一覧表示を更新
  refreshDashboard();
}