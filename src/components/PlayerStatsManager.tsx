import { useEffect, useState } from 'react'
import {
  createEmptyPlayerGameStats,
  validatePlayerGameStats,
  type PlayerGameStats,
} from '../domain/PlayerGameStats'
import type { GameResult } from './GameResultList'
import PlayerStatsCalculator from './PlayerStatsCalculator'
import PlayerStatsTrend from './PlayerStatsTrend'

type Player = {
  id: number
  name: string
  number: number
}

type Props = {
  players: Player[]
  games: GameResult[]
}

type StatField = Exclude<keyof PlayerGameStats, 'gameId' | 'playerId'>

const STORAGE_KEY = 'baseball-score-app-player-game-stats'

const battingFields: { key: StatField; label: string }[] = [
  { key: 'atBats', label: '打数' },
  { key: 'hits', label: '安打' },
  { key: 'doubles', label: '二塁打' },
  { key: 'triples', label: '三塁打' },
  { key: 'homeRuns', label: '本塁打' },
  { key: 'runsBattedIn', label: '打点' },
  { key: 'walks', label: '四球' },
  { key: 'strikeouts', label: '三振' },
  { key: 'hitByPitch', label: '死球' },
  { key: 'sacrificeFlies', label: '犠牲フライ' },
]

const pitchingFields: { key: StatField; label: string }[] = [
  { key: 'pitchingOuts', label: '投球アウト数' },
  { key: 'earnedRuns', label: '自責点' },
  { key: 'pitchingStrikeouts', label: '奪三振' },
  { key: 'hitsAllowed', label: '被安打' },
  { key: 'pitchingWalks', label: '与四球' },
]

const readSavedStats = (): PlayerGameStats[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed as PlayerGameStats[] : []
  } catch {
    return []
  }
}

function PlayerStatsManager({ players, games }: Props) {
  const [records, setRecords] = useState<PlayerGameStats[]>(readSavedStats)
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(games[0]?.id)
  const [draftsByGame, setDraftsByGame] = useState<
    Record<number, Record<number, PlayerGameStats>>
  >({})
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const activeGameId = selectedGameId ?? games[0]?.id

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  const drafts = activeGameId === undefined
    ? {}
    : Object.fromEntries(players.map(player => {
        const draft = draftsByGame[activeGameId]?.[player.id]
        const savedRecord = records.find(record =>
          record.gameId === activeGameId && record.playerId === player.id
        )
        return [
          player.id,
          draft ?? savedRecord ?? createEmptyPlayerGameStats(activeGameId, player.id),
        ]
      }))

  const updateDraft = (playerId: number, field: StatField, value: string) => {
    if (activeGameId === undefined) return
    const parsedValue = value === '' ? 0 : Number(value)
    if (!Number.isInteger(parsedValue) || parsedValue < 0) return

    setDraftsByGame(prev => ({
      ...prev,
      [activeGameId]: {
        ...drafts,
        [playerId]: { ...drafts[playerId], [field]: parsedValue },
      },
    }))
    setSavedMessage('')
  }

  const handleSave = () => {
    if (activeGameId === undefined) return
    const gameStats = Object.values(drafts)
    const invalidStats = gameStats.find(stats => validatePlayerGameStats(stats))
    if (invalidStats) {
      setError(validatePlayerGameStats(invalidStats) ?? '成績を確認してください。')
      return
    }

    setRecords(prev => [
      ...prev.filter(record =>
        record.gameId !== activeGameId ||
        !players.some(player => player.id === record.playerId)
      ),
      ...gameStats,
    ])
    setError('')
    setSavedMessage('この試合の成績を保存しました。')
  }

  return (
    <section className="player-stats" id="player-stats">
      <h2>選手成績</h2>
      {games.length === 0 ? (
        <p className="empty-state">先に試合を登録してください。</p>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="stats-game">成績を入力する試合</label>
            <select
              id="stats-game"
              value={activeGameId ?? ''}
              onChange={event => {
                setSelectedGameId(Number(event.target.value))
                setError('')
                setSavedMessage('')
              }}
            >
              {games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.date}：{game.homeTeam} vs {game.awayTeam}
                </option>
              ))}
            </select>
          </div>
          {players.length === 0 ? (
            <p className="empty-state">選手を登録すると成績を入力できます。</p>
          ) : (
            <>
              <p className="stats-note">
                選手ごとに打撃・投手成績を入力し、「成績を保存」を押してください。
              </p>
              <div className="player-stat-entry-list">
                {players.map(player => (
                  <details className="player-stat-entry" key={player.id}>
                    <summary>#{player.number} {player.name}</summary>
                    <div className="stats-input-section">
                      <h3>打撃成績</h3>
                      <div className="stats-input-grid">
                        {battingFields.map(field => (
                          <label key={field.key}>
                            {field.label}
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={drafts[player.id]?.[field.key] ?? 0}
                              onChange={event => updateDraft(player.id, field.key, event.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                      <h3>投手成績</h3>
                      <p className="stats-note">投球アウト数は1アウトを1として入力してください。</p>
                      <div className="stats-input-grid">
                        {pitchingFields.map(field => (
                          <label key={field.key}>
                            {field.label}
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={drafts[player.id]?.[field.key] ?? 0}
                              onChange={event => updateDraft(player.id, field.key, event.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
              {error && <p className="error stats-message">{error}</p>}
              {savedMessage && <p className="stats-success">{savedMessage}</p>}
              <div className="form-actions">
                <button type="button" className="btn-submit" onClick={handleSave}>
                  成績を保存
                </button>
              </div>
            </>
          )}
        </>
      )}
      <PlayerStatsCalculator players={players} records={records} />
      <PlayerStatsTrend players={players} games={games} records={records} />
    </section>
  )
}

export default PlayerStatsManager
