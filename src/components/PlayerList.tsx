import { useEffect, useState } from 'react'
import DeletePlayerButton from './DeletePlayerButton'
import EditPlayerForm from './EditPlayerForm'
import FieldError from './FieldError'

type Player = {
  id: number
  name: string
  number: number
  position: string
  batHand: string
  throwHand: string
}

type NewPlayerForm = {
  name: string
  number: string
  position: string
  batHand: string
  throwHand: string
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: '山田 太郎', number: 7,  position: 'SS', batHand: '右', throwHand: '右' },
  { id: 2, name: '佐藤 次郎', number: 3,  position: '1B', batHand: '左', throwHand: '左' },
  { id: 3, name: '田中 花子', number: 21, position: 'CF', batHand: '左', throwHand: '右' },
]

const EMPTY_FORM: NewPlayerForm = {
  name: '',
  number: '',
  position: 'SS',
  batHand: '右',
  throwHand: '右',
}

const STORAGE_KEY = 'baseball-score-app-players'

const POSITION_ALIASES: Record<string, string[]> = {
  SS: ['SS', 'shortstop', 'ショート', 'ショートストップ', '遊撃', '遊撃手'],
  '1B': ['1B', 'first base', 'firstbase', 'ファースト', '一塁', '一塁手'],
  '2B': ['2B', 'second base', 'secondbase', 'セカンド', '二塁', '二塁手'],
  '3B': ['3B', 'third base', 'thirdbase', 'サード', '三塁', '三塁手'],
  C: ['C', 'catcher', 'キャッチャー', '捕手'],
  CF: ['CF', 'center field', 'centerfield', 'センター', '中堅', '中堅手'],
  LF: ['LF', 'left field', 'leftfield', 'レフト', '左翼', '左翼手'],
  RF: ['RF', 'right field', 'rightfield', 'ライト', '右翼', '右翼手'],
  P: ['P', 'pitcher', 'ピッチャー', '投手'],
}

const normalizeSearchText = (value: string): string[] => {
  const compact = value.normalize('NFKC').replace(/\s+/g, '').toLowerCase()
  const hiragana = compact.replace(/[ァ-ヶ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
  const katakana = hiragana.replace(/[ぁ-ゖ]/g, char => String.fromCharCode(char.charCodeAt(0) + 0x60))

  return Array.from(new Set([compact, hiragana, katakana]))
}

const matchesSearchTerm = (value: string, keyword: string) => {
  const normalizedKeyword = normalizeSearchText(keyword)
  return normalizeSearchText(value).some(variant =>
    normalizedKeyword.some(term => variant.includes(term) || term.includes(variant))
  )
}

const readSavedPlayers = (): Player[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return INITIAL_PLAYERS

    const parsed = JSON.parse(saved) as Player[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PLAYERS
  } catch {
    return INITIAL_PLAYERS
  }
}

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>(readSavedPlayers)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null)
  const [form, setForm] = useState<NewPlayerForm>(EMPTY_FORM)
  const [error, setError] = useState('')

  const editingPlayer = players.find(player => player.id === editingPlayerId) ?? null

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
  }, [players])

  const filtered = players.filter(player => {
    const keyword = search.trim()
    if (!keyword) return true

    const searchableValues = [
      player.name,
      player.position,
      ...(POSITION_ALIASES[player.position] ?? [player.position]),
    ]

    return searchableValues.some(value => matchesSearchTerm(value, keyword))
  })

  const deletePlayer = (id: number) => {
    setPlayers(prev => prev.filter(player => player.id !== id))
    setEditingPlayerId(currentId => (currentId === id ? null : currentId))
    setShowAddForm(false)
  }

  const handleAddChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const hasFieldError = (fieldName: 'name' | 'number') => {
    if (!error) return false
    if (fieldName === 'name') {
      return error.includes('選手名')
    }
    return error.includes('背番号')
  }

  const duplicateTargetNumber = form.number.trim() !== '' ? Number(form.number) : null

  const duplicateNumbers = new Set<number>()

  players.forEach(player => {
    const count = players.filter(item => item.number === player.number).length
    if (count > 1) {
      duplicateNumbers.add(player.number)
    }
  })

  if (
    duplicateTargetNumber !== null &&
    !Number.isNaN(duplicateTargetNumber) &&
    duplicateTargetNumber > 0 &&
    players.some(player => player.number === duplicateTargetNumber)
  ) {
    duplicateNumbers.add(duplicateTargetNumber)
  }

  const handleAddPlayer = () => {
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

    const isDuplicateNumber = players.some(player => player.number === number)
    if (isDuplicateNumber) {
      setError(`背番号${number}はすでに登録されています。別の番号を選んでください。`)
      return
    }

    const newPlayer: Player = {
      id: Date.now(),
      name: trimmedName,
      number,
      position: form.position,
      batHand: form.batHand,
      throwHand: form.throwHand,
    }

    setPlayers(prev => [newPlayer, ...prev])
    setForm(EMPTY_FORM)
    setError('')
    setShowAddForm(false)
  }

  const handleSaveEditedPlayer = (updatedPlayer: Player) => {
    setPlayers(prev =>
      prev.map(player => (player.id === updatedPlayer.id ? updatedPlayer : player))
    )
    setEditingPlayerId(null)
  }

  return (
    <div className="player-list">
      <div className="list-header">
        <h2>選手一覧</h2>
        <button type="button" className="action-button" onClick={() => setShowAddForm(true)}>
          ＋ 選手を追加
        </button>
      </div>

      {editingPlayer && (
        <EditPlayerForm
          player={editingPlayer}
          allPlayers={players}
          onSave={handleSaveEditedPlayer}
          onCancel={() => setEditingPlayerId(null)}
        />
      )}

      {showAddForm && !editingPlayer && (
        <div className="game-form player-form">
          <h2>選手追加</h2>

          <div className="form-group">
            <label>選手名 <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleAddChange}
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
                onChange={handleAddChange}
                placeholder="7"
                className={hasFieldError('number') ? 'input-error' : ''}
              />
            </div>

            <div className="form-group">
              <label>ポジション</label>
              <select name="position" value={form.position} onChange={handleAddChange}>
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
              <select name="batHand" value={form.batHand} onChange={handleAddChange}>
                <option value="右">右</option>
                <option value="左">左</option>
                <option value="両">両</option>
              </select>
            </div>

            <div className="form-group">
              <label>投球</label>
              <select name="throwHand" value={form.throwHand} onChange={handleAddChange}>
                <option value="右">右</option>
                <option value="左">左</option>
                <option value="両">両</option>
              </select>
            </div>
          </div>

          <FieldError message={error} />

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => {
              setShowAddForm(false)
              setError('')
              setForm(EMPTY_FORM)
            }}>
              キャンセル
            </button>
            <button type="button" className="btn-submit" onClick={handleAddPlayer}>
              追加する
            </button>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="選手名・ポジションで検索..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="player-table">
        <thead>
          <tr>
            <th>選手名</th>
            <th>#</th>
            <th>ポジション</th>
            <th>投打</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                選手が見つかりません
              </td>
            </tr>
          ) : (
            filtered.map(player => {
              const isDuplicate = duplicateNumbers.has(player.number)

              return (
                <tr key={player.id} className={isDuplicate ? 'duplicate-row' : ''}>
                  <td className={isDuplicate ? 'duplicate-cell' : ''}>{player.name}</td>
                  <td className={isDuplicate ? 'duplicate-cell' : ''}>{player.number}</td>
                  <td className={isDuplicate ? 'duplicate-cell' : ''}><span className="badge-pos">{player.position}</span></td>
                  <td className={isDuplicate ? 'duplicate-cell' : ''}>{player.throwHand}投{player.batHand}打</td>
                  <td className={isDuplicate ? 'duplicate-cell' : ''}>
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingPlayerId(player.id)
                      }}
                    >
                      編集
                    </button>
                    <DeletePlayerButton
                      playerName={player.name}
                      playerNumber={player.number}
                      onDelete={() => deletePlayer(player.id)}
                    />
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default PlayerList