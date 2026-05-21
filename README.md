# aims-gas

## プロジェクト概要

大阪公立大学体育会アーチェリー部における点数管理用システムのローカル開発用リポジトリです．

ユーザ・チーム運営用操作マニュアル，システム全体の構造は以下の URL で公開しています．
https://yukiyamasaki6.github.io/aims-gas/

## ディレクトリ構成

- docs: 操作マニュアル用 HTML
- packages/sheet-database: 集計データベース用 GAS プロジェクト
- packages/sheet-game: 試合記録用 GAS プロジェクト

## セットアップ（初回のみ）

### 1. Apps Script API を有効化

1. https://script.google.com/home/usersettings にアクセス
2. Google Apps Script API を オン に変更

### 2. clasp のインストールと認証

```bash
npm install -g @google/clasp
clasp login
```

## デプロイ（ローカル -> GAS）

```bash
cd packages/<project-dir>
clasp push
```

ローカルの変更を指定した GAS プロジェクトに反映させます．
`<project-dir>` には対象のプロジェクトを指定してください．

## 取得（GAS -> ローカル）

```bash
cd packages/<project-dir>
clasp pull
```

GAS プロジェクトの最新状態をローカルに反映させます．
`<project-dir>` には対象のプロジェクトを指定してください．
