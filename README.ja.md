# [Client Side Python](https://github.com/europanite/client_side_python "Client Side Python")

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![OS](https://img.shields.io/badge/OS-Linux%20%7C%20macOS%20%7C%20Windows-blue)
[![CI](https://github.com/europanite/client_side_python/actions/workflows/ci.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/ci.yml)
[![Frontend Tests via Docker](https://github.com/europanite/client_side_python/actions/workflows/docker.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/docker.yml)
[![Deploy Expo Web to GitHub Pages](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/europanite/client_side_python/actions/workflows/deploy-pages.yml)

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

<p align="right">
  <a href="./README.md">🇺🇸 English</a> |
  <a href="./README.ja.md">🇯🇵 日本語</a> |
  <a href="./README.zh-CN.md">🇨🇳 简体中文</a> |
  <a href="./README.es.md">🇪🇸 Español</a> |
  <a href="./README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="./README.ko.md">🇰🇷 한국어</a> |
  <a href="./README.de.md">🇩🇪 Deutsch</a> |
  <a href="./README.fr.md">🇫🇷 Français</a>
</p>


> **Note**
> This is a translated version of this README. The English version (`README.md`) is the source of truth.

!["web_ui"](./assets/images/web_ui.png)

 [PlayGround](https://europanite.github.io/client_side_python/)

ブラウザ上で動作するクライアントサイドの Python プレイグラウンド。 

---

## 概要

Client Side Python は、**Pyodide を利用したブラウザベースの Python プレイグラウンド**である。  
すべての Python コードは **ブラウザタブ内で完結して実行される**（WebAssembly、バックエンドなし）ため、コードがマシンの外に出ることはない。

そのため、次のような用途に向いている。

- 小さな Python スニペットをすばやく試す
- 授業やワークショップで Python の基礎を実演する
- 安全なサンドボックスで簡単な数値処理やスクリプト作業を試す
- WebAssembly + Pyodide によって“本物の” Python をブラウザに持ち込めることを示す

---

## 特長

- **完全なクライアントサイド実行**  
  - [Pyodide](https://pyodide.org) を使用して、WebAssembly 上で CPython を実行する。
  - デフォルトではサーバー、データベース、認証は不要。

- **シンプルなコードエディタ + コンソール**  
  - Python コード用のテキストエリア。
  - `stdout` と `stderr` を表示するコンソール領域。
  - ボタン: **Run**, **Stop**, **Clear**, **Load Sample**, **Copy Output**。

- **ソフトな“Stop”機構**  
  - 実行はソフトキャンセルトークンでラップされる。
  - **Stop** を押すと、現在の実行は論理的にキャンセルされ、遅れて返ってきた結果は UI を壊す代わりに無視される。

- **レスポンシブな Web UI**  
  - **Expo / React Native Web** と **Material UI** コンポーネントで構築。
  - レイアウトは異なるビューポートサイズ（デスクトップ / タブレット）に適応する。

- **Docker による決定的な CI**  
  - Jest テストは `docker-compose.test.yml` を使って Docker コンテナ内で実行される。
  - GitHub Actions のワークフローが CI と Docker ベースのテスト用に用意されている。

- **GitHub Pages への自動デプロイ**  
  - GitHub Actions ワークフローが Expo Web バンドルをビルドし、`main` ブランチ向けに GitHub Pages へ公開する。

---

## 仕組み

初回ロード時に、アプリは次の処理を行う。

1. CDN から Pyodide を取得する。
2. Pyodide ランタイムを初期化し、`runPythonAsync` を公開する。
3. Python の出力をページ内コンソールへストリーミングするために、`stdout` と `stderr` 用のカスタムハンドラを接続する。
4. シンプルな実行トークンを使って、**soft Stop** を実装する。
   - 実行のたびに内部 `execId` をインクリメントする。
   - 古い `execId` を持つ実行が完了した場合、その出力は破棄される。
   - これにより、古い実行結果がコンソールを汚染するのを防ぐ。

これらはすべて **ブラウザ内** で行われ、バックエンド API の呼び出しは一切発生しない。

---

## 🚀 はじめに

### 1. 前提条件
- [Docker](https://www.docker.com/) と [Docker Compose](https://docs.docker.com/compose/)

### 2. すべてのサービスをビルドして起動する

```bash
# set environment variables:
export REACT_NATIVE_PACKAGER_HOSTNAME=${YOUR_HOST}

# Build the image
docker compose build

# Run the container
docker compose up
```

### 3. テスト
```bash
docker compose -f docker-compose.test.yml up --build --exit-code-from frontend_test 
```

---

# License
- Apache License 2.0
