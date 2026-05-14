# Aurora パッケージマネージャー

外部依存関係なしで設計された、**Aurora Austral** 言語向けの高性能でスタンドアロンなパッケージマネージャー。

## インストール

```bash
npm install -g @aurora.purecore.codes/latest@1.1.0
```

**注意：** このパッケージは完全に自己完結型です。Node.js ネイティブ API（`fetch`、`fs`、`path`、`os`、`child_process`）のみを使用します。

## 主なコマンド

- `aurora init`: 新しいプロジェクトを初期化し、ローカルコンパイラを設定します。
- `aurora install <package>`: 公式リポジトリからパッケージをダウンロード、コンパイル、テストします。
- `aurora find <query>`: 名前および README.md ファイル内を対象としたインテリジェントな検索。
- `aurora list`: 利用可能またはローカルにインストールされたパッケージを一覧表示します。
- `aurora update`: プロジェクトの依存関係を更新します。

## 標準ライブラリの統合
マネージャーは `aurora-austral-standard-lib` の場所を自動的に検出し、すべてのパッケージがローカルバージョンの標準ライブラリに対して正しくコンパイルされるようにします。

## ライセンス
Apache-2.0
