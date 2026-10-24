import { useState } from 'react'

type GameFormData = {
  date: string
  homeTeam: string
  awayTeam: string
  location: string
  innings: number
  weather: string
  memo: string
}

type Props = {
  onSubmit: (data: GameFormData) => void
  onCancel: () => void
}

function GameForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<GameFormData>({
    date: '',
    homeTeam: '',
    awayTeam: '',
    location: '',
    innings: 9,
    weather: '晴れ',
    memo: '',
  })

  const [errors, setErrors] = useState<Partial<GameFormData>>({})

  const validate = () => {
    const newErrors: Partial<GameFormData> = {}
    if (!form.date) newErrors.date = '試合日は必須です'
    if (!form.homeTeam) newErrors.homeTeam = 'ホームチームは必須です'
    if (!form.awayTeam) newErrors.awayTeam = 'アウェイチームは必須です'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="game-form">
      <h2>試合登録</h2>

      <div className="form-group">
        <label>試合日 <span className="required">*</span></label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
        {errors.date && <p className="error">{errors.date}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ホームチーム <span className="required">*</span></label>
          <input
            type="text"
            name="homeTeam"
            placeholder="チーム名を入力"
            value={form.homeTeam}
            onChange={handleChange}
          />
          {errors.homeTeam && <p className="error">{errors.homeTeam}</p>}
        </div>
        <div className="form-group">
          <label>アウェイチーム <span className="required">*</span></label>
          <input
            type="text"
            name="awayTeam"
            placeholder="チーム名を入力"
            value={form.awayTeam}
            onChange={handleChange}
          />
          {errors.awayTeam && <p className="error">{errors.awayTeam}</p>}
        </div>
      </div>

      <div className="form-group">
        <label>場所</label>
        <input
          type="text"
          name="location"
          placeholder="例：〇〇グラウンド"
          value={form.location}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>イニング数</label>
          <select name="innings" value={form.innings} onChange={handleChange}>
            <option value={7}>7</option>
            <option value={9}>9</option>
          </select>
        </div>
        <div className="form-group">
          <label>天気</label>
          <select name="weather" value={form.weather} onChange={handleChange}>
            <option>晴れ</option>
            <option>曇り</option>
            <option>雨</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>メモ</label>
        <textarea
          name="memo"
          placeholder="備考など..."
          value={form.memo}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button className="btn-cancel" onClick={onCancel}>キャンセル</button>
        <button className="btn-submit" onClick={handleSubmit}>登録する</button>
      </div>
    </div>
  )
}

export default GameForm