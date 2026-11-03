import { useState } from 'react'

type GameFormData = {
  date: string
  homeTeam: string
  awayTeam: string
  location: string
  innings: number
  homeScores: number[]
  awayScores: number[]
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
    homeScores: Array(9).fill(0),
    awayScores: Array(9).fill(0),
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
    if (name === 'innings') {
      const innings = Number(value)
      setForm(prev => ({
        ...prev,
        innings,
        homeScores: Array.from({ length: innings }, (_, index) => prev.homeScores[index] ?? 0),
        awayScores: Array.from({ length: innings }, (_, index) => prev.awayScores[index] ?? 0),
      }))
      return
    }
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleScoreChange = (
    team: 'homeScores' | 'awayScores',
    inningIndex: number,
    value: string
  ) => {
    const score = Number(value)
    if (!Number.isInteger(score) || score < 0) return

    setForm(prev => ({
      ...prev,
      [team]: prev[team].map((currentScore, index) =>
        index === inningIndex ? score : currentScore
      ),
    }))
  }

  const scoreTeams = [
    { key: 'homeScores', label: form.homeTeam || 'ホーム', scores: form.homeScores },
    { key: 'awayScores', label: form.awayTeam || 'アウェイ', scores: form.awayScores },
  ] as const

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
      <p className="score-team-name-hint">
        チーム名は下のスコアボードにも反映されます。
      </p>

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
        <label>イニング別スコア</label>
        <div className="score-table-wrapper">
          <table className="score-input-table">
            <thead>
              <tr>
                <th scope="col">チーム</th>
                {Array.from({ length: form.innings }, (_, index) => (
                  <th scope="col" key={index}>{index + 1}回</th>
                ))}
                <th scope="col">合計</th>
              </tr>
            </thead>
            <tbody>
              {scoreTeams.map(team => (
                <tr key={team.key}>
                  <th scope="row">{team.label}</th>
                  {team.scores.map((score, index) => (
                    <td key={index}>
                      <input
                        aria-label={`${team.label} ${index + 1}回の得点`}
                        type="number"
                        min={0}
                        step={1}
                        value={score}
                        onChange={event => handleScoreChange(team.key, index, event.target.value)}
                      />
                    </td>
                  ))}
                  <td className="score-input-total">
                    {team.scores.reduce((total, inningScore) => total + inningScore, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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