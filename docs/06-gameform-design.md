# GameForm 設計書

## 1. 概要

`GameForm` は試合登録フォームであり、試合内容の入力とバリデーションを担当する。登録が完了したら親コンポーネントへ結果を渡す。

## 2. 役割と責務

### 2.1 主な責務

- 試合日、チーム名、場所、天気、メモの入力
- 必須入力項目の検証
- 登録ボタン押下時の親コンポーネントへの通知
- キャンセル時の閉じる処理

### 2.2 入力プロパティ

```ts
type Props = {
  onSubmit: (data: GameFormData) => void
  onCancel: () => void
}
```

## 図解（Excel風構成）

```text
┌──────────────────────────────────────────────────────────────┐
│ GameForm                                                   │
├──────────────────────────────────────────────────────────────┤
│ 試合日 │ ホームチーム │ アウェイチーム │ 場所 │ 天気 │ メモ │
├──────────────────────────────────────────────────────────────┤
│ 入力変更 │ バリデーション │ エラー表示 │ 登録/キャンセル   │
├──────────────────────────────────────────────────────────────┤
│ onSubmit │ onCancel │ Appへ送信                            │
└──────────────────────────────────────────────────────────────┘
```

### 検証フロー

```text
[入力] → [validate()] → [必須項目確認]
        ↓
   [OK] → [onSubmit(form)]
   [NG] → [error表示]
```

## 3. 状態設計

### 3.1 state

- `form: GameFormData`
- `errors: Partial<GameFormData>`

### 3.2 型定義

```ts
type GameFormData = {
  date: string
  homeTeam: string
  awayTeam: string
  location: string
  innings: number
  weather: string
  memo: string
}
```

## 4. バリデーション

`validate()` で以下を確認する。

- 試合日が必須か
- ホームチーム名が必須か
- アウェイチーム名が必須か

必須項目が不足している場合は `errors` に格納し、`false` を返す。

## 5. 画面遷移

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Validating: 登録ボタン押下
  Validating --> Draft: 入力不足
  Validating --> Submitted: バリデーション成功
  Draft --> Closed: キャンセル
  Submitted --> Closed: 親へ通知
  Closed --> [*]
```

## 6. 主要処理

### 6.1 `handleChange`

- 入力イベントから `name` と `value` を取り出す
- `setForm(prev => ({ ...prev, [name]: value }))` で state を更新する

### 6.2 `handleSubmit`

- `validate()` を呼ぶ
- 成功時のみ `onSubmit(form)` を実行する

## 7. エラー表示

- `errors.date`, `errors.homeTeam`, `errors.awayTeam` の値がある場合にメッセージを表示する
- フォーム直下に赤文字のメッセージを出す

## 8. 設計意図

- 試合登録の入力と検証を一つのフォームとしてまとめている
- 親コンポーネントからは「登録完了」「キャンセル」だけを受け取り、フォーム内のロジックを閉じている
- 将来的にスコア入力や詳細項目追加を行う際にも、フォームの構造を拡張しやすい

## 修正履歴

- 2026-10-25: 初版作成
