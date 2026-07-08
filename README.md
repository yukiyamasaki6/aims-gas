# aims-gas

## プロジェクト概要

大阪公立大学体育会アーチェリー部における点数管理用システムのローカル開発用リポジトリです．

ユーザ・チーム運営用操作マニュアル，システム全体の構造は[AIMSマニュアル](https://yukiyamasaki6.github.io/aims-gas/)に記載しています．

面接官や採用担当者の方向けに，プロジェクトの背景や技術スタック，工夫した点などを [PORTFOLIO.md](./PORTFOLIO.md) に記載しています．

## ディレクトリ構成

- docs: 操作マニュアル用 HTML
- packages/sheet-database: 集計データベース用 GAS プロジェクト
- packages/sheet-game: 試合記録用 GAS プロジェクト
- packages/sheet-portal: ポータル用 GAS プロジェクト

## セットアップ（初回のみ）

### 1. Apps Script API を有効化

1. https://script.google.com/home/usersettings にアクセス
2. Google Apps Script API を オン に変更

### 2. 依存関係のインストール

```bash
npm install
```

### 3. clasp の認証

```bash
npx clasp login
```

### 4. GAS プロジェクトとの同期

```bash
# 1. 対象のプロジェクトディレクトリへ移動
cd packages/<project-dir>

# 2. example をコピーして .clasp.json を作成
cp .clasp.json.example .clasp.json

# 3. GAS プロジェクト ID を .clasp.json に記入

# 4. GAS プロジェクトの内容をローカルに取り込む
# ※ ローカルの内容は上書きされるため注意
npx clasp pull
```

## デプロイ（ローカル -> GAS）

```bash
cd packages/<project-dir>
npx clasp push
```
