# 野球スコアアプリ

草野球の選手名簿と試合結果を管理する React + TypeScript アプリです。

## 主な機能

- 選手の追加・編集・削除、背番号の重複確認、選手検索
- 試合情報の登録と一覧表示
- ホーム／アウェーチーム名と7回または9回分の得点入力
- イニング別スコアボード、合計得点、勝敗の表示
- 試合登録時の出場選手、スタメン打順、守備位置、控えの確定
- 選手・試合データの `localStorage` 保存
- 試合ごとの選手別打撃・投手成績入力と通算成績の自動集計

## 起動方法

Node.js と npm がインストールされた環境で、プロジェクトのルートから実行します。

```bash
npm install
npm run dev
```

ブラウザーで http://localhost:5173/ を開きます。Vite の開発サーバーは localhost で待ち受けます。

## 確認コマンド

```bash
npm run build
npm run lint
```

## 構成と設計

- `src/components/`: 画面表示とユーザー操作を担当
- `src/domain/GameScore.ts`: イニング別得点の組み立て、合計点、勝敗判定を担当
- `src/domain/PlayerGameStats.ts`: 試合ごとの選手成績、打率・出塁率・長打率・防御率・WHIPの計算を担当
- `src/domain/GameLineup.ts`: 試合ごとの出場選手、打順、守備位置のルールを担当
- `src/components/PlayerStatsManager.tsx`: 試合選択、成績入力、保存を担当
- `src/components/PlayerStatsCalculator.tsx`: 選手ごとの通算成績を表示
- `src/components/GameLineupManager.tsx`: 試合ごとのラインアップ入力・保存・確認を担当
- `src/App.tsx`: 試合データの状態管理と `localStorage` 保存を担当
- `docs/`: コンポーネントとドメインモデルの設計書

得点計算の業務ルールを UI コンポーネントから分離することで、表示と計算それぞれの責務を明確にしています。設計書一覧は [docs/00-design-index.md](docs/00-design-index.md) を参照してください。
