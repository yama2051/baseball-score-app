# 野球スコアアプリ 設計書一覧

## 目的

本設計書は、現在の野球スコアアプリの構成を機能別・クラス別に整理し、責務、状態遷移、データの流れ、修正履歴を明確にするための資料である。

## 対象一覧

1. [01-app-design.md](01-app-design.md) - App
2. [02-playerlist-design.md](02-playerlist-design.md) - PlayerList
3. [03-editplayerform-design.md](03-editplayerform-design.md) - EditPlayerForm
4. [04-deleteplayerbutton-design.md](04-deleteplayerbutton-design.md) - DeletePlayerButton
5. [05-fielderror-design.md](05-fielderror-design.md) - FieldError
6. [06-gameform-design.md](06-gameform-design.md) - GameForm
7. [07-gameresultlist-design.md](07-gameresultlist-design.md) - GameResultList
8. [08-header-design.md](08-header-design.md) - Header

## 設計方針

- 各クラスは責務を単一化し、画面表示・状態更新・バリデーション・UIイベントを分離する
- UIの状態遷移は妥当なイベント駆動で管理する
- 変更が発生した場合は設計書にも反映し、修正履歴を残す
- 今回の運用では、最小修正で機能追加を連続して行える設計を採用している

## 図解（Excel風構成）

```text
┌──────────────────────────────────────────────────────────────┐
│ Appルート                                                  │
├──────────────────────────────────────────────────────────────┤
│ Header      │ GameForm      │ GameResultList │ PlayerList   │
├──────────────────────────────────────────────────────────────┤
│ タイトル表示 │ 試合登録入力  │ 試合結果一覧   │ 選手管理     │
├──────────────────────────────────────────────────────────────┤
│                         PlayerList内部                      │
├──────────────────────────────────────────────────────────────┤
│ EditPlayerForm │ DeletePlayerButton │ FieldError │ Search    │
├──────────────────────────────────────────────────────────────┤
│ 選手編集       │ 削除確認           │ エラー表示 │ 検索処理   │
└──────────────────────────────────────────────────────────────┘
```

## 修正履歴

- 2026-10-25: 初版作成
