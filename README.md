# ECS Application Demo

## 概要

このプロジェクトは、AWS CDK を使用して ECS アプリケーションのインフラストラクチャをコード化したデモプロジェクトです。

## プロジェクト構成

```
.
├── README.md
├── app/ # アプリケーションコード
│ └── ecspresso/ # ecspresso用設定ファイル
│ └── .env.example # 環境変数ファイルの例
│ └── ecspresso.sh # ecspresso用シェルスクリプト
│ └── main.go
├── infra/ # インフラストラクチャコード
│ ├── bin/ # エントリーポイント
│ │ ├── main.ts
│ ├── lib/ # CDKスタック定義
│ │ ├── construct/
│ │ └── ecspresso-demo-stack.ts
│ ├── cdk.json
│ ├── package.json
│ └── tsconfig.json
│ └── cdk.sh # CDK用スクリプト
```

## 必要な環境

- Go 1.20 以上
- Docker
- Node.js 20.x 以上
- AWS CDK v2
- AWS CLI
- AWS 認証情報の設定

## セットアップ

1. 依存関係のインストール

   ```bash
   npm install --prefix infra
   ```

2. CDK の初期化（初回のみ）

   ```bash
   npm run --prefix infra cdk -- bootstrap
   ```

3. 環境変数の設定
   ```bash
   cp app/.env.example app/.env
   # .envファイルを編集して必要な値を設定
   ```

## デプロイ方法

### インフラストラクチャのデプロイ

1. 変更内容の確認

   ```bash
   infra/cdk.sh diff
   ```

2. デプロイの実行(初回)

   ```bash
   infra/cdk.sh deploy
   ```

3. デプロイの実行(2 回目以降)
   ```bash
   infra/cdk.sh deploy:n
   ```

### アプリケーションのデプロイ

1. ECR へのログイン

   ```bash
   app/ecspresso.sh login
   ```

2. Docker イメージのビルド & プッシュ

   ```bash
   app/ecspresso.sh push
   ```

3. ecspresso のファイル検証

   ```bash
   app/ecspresso.sh verify
   ```

4. デプロイの実行

   ```bash
   app/ecspresso.sh deploy
   ```

## 環境の削除

1. アプリケーションの削除

   ```bash
   app/ecspresso.sh scale0
   app/ecspresso.sh delete
   ```

2. インフラストラクチャの削除

   ```bash
   infra/cdk.sh destroy
   ```
