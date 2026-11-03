import { useState } from 'react'
import FieldError from './FieldError'

type Player = {
  id: number
  name: string
  number: number
  position: string
  batHand: string
  throwHand: string
}

type PlayerFormValues = {
  name: string
  number: string
  position: string
  batHand: string
  throwHand: string
}

type EditPlayerFormProps = {
  player: Player
  allPlayers: Player[]
  onSave: (updatedPlayer: Player) => void
  onCancel: () => void
}

const toFormValues = (player: Player): PlayerFormValues => ({
  name: player.name,
  number: String(player.number),
  position: player.position,
  batHand: player.batHand,
  throwHand: player.throwHand,
})

function EditPlayerForm({ player, allPlayers, onSave, onCancel }: EditPlayerFormProps) {
  const [form, setForm] = useState<PlayerFormValues>(toFormValues(player))
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const hasFieldError = (fieldName: 'name' | 'number') => {
    if (!error) return false
    if (fieldName === 'name') return error.includes('選手名')
    return error.includes('背番号')
  }

  const handleSubmit = () => {
    const trimmedName = form.name.trim()
    const number = Number(form.number)

    if (!trimmedName) {
      setError('選手名を入力してください。')
      return
    }

    if (!form.number || Number.isNaN(number) || number <= 0) {
      setError('背番号は1以上の数字を入力してください。')
      return
    }

    const isDuplicateNumber = allPlayers.some(
      existingPlayer => existingPlayer.id !== player.id && existingPlayer.number === number
    )

    if (isDuplicateNumber) {
      setError(`背番号${number}はすでに登録されています。別の番号を選んでください。`)
      return
    }

    onSave({
      ...player,
      name: trimmedName,
      number,
      position: form.position,
      batHand: form.batHand,
      throwHand: form.throwHand,
    })
  }

  return (
    <div className="game-form player-form">
      <h2>選手編集</h2>

      <div className="form-group">
        <label>選手名 <span className="required">*</span></label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="例：山田 太郎"
          className={hasFieldError('name') ? 'input-error' : ''}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>背番号 <span className="required">*</span></label>
          <input
            type="number"
            name="number"
            value={form.number}
            min={1}
            onChange={handleChange}
            placeholder="7"
            className={hasFieldError('number') ? 'input-error' : ''}
          />
        </div>

        <div className="form-group">
          <label>ポジション</label>
          <select name="position" value={form.position} onChange={handleChange}>
            <option value="SS">SS</option>
            <option value="1B">1B</option>
            <option value="2B">2B</option>
            <option value="3B">3B</option>
            <option value="C">C</option>
            <option value="CF">CF</option>
            <option value="LF">LF</option>
            <option value="RF">RF</option>
            <option value="P">P</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>打席</label>
          <select name="batHand" value={form.batHand} onChange={handleChange}>
            <option value="右">右</option>
            <option value="左">左</option>
            <option value="両">両</option>
          </select>
        </div>

        <div className="form-group">
          <label>投球</label>
          <select name="throwHand" value={form.throwHand} onChange={handleChange}>
            <option value="右">右</option>
            <option value="左">左</option>
            <option value="両">両</option>
          </select>
        </div>
      </div>

      <FieldError message={error} />

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          キャンセル
        </button>
        <button type="button" className="btn-submit" onClick={handleSubmit}>
          保存する
        </button>
      </div>
    </div>
  )
}

export default EditPlayerForm
