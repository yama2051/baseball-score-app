import { useEffect, useState } from 'react'
import Header from './components/Header'
import PlayerList from './components/PlayerList'
import GameForm from './components/GameForm'
import GameResultList, { type GameLineupData, type GameResult } from './components/GameResultList'
import { type LineupEntry, type TeamSide } from './domain/GameLineup'
import { readSavedPlayers, savePlayers, type Player } from './domain/Player'

type RegisteredGame = GameResult

const STORAGE_KEY = 'baseball-score-app-games'
const LEGACY_LINEUP_STORAGE_KEY = 'baseball-score-app-game-lineups'

type SavedLineup = GameLineupData & { gameId: number }

const initialGames: RegisteredGame[] = [
  {
    id: 1,
    date: '2026-10-20',
    homeTeam: 'Aチーム',
    awayTeam: 'Bチーム',
    location: '中央公園',
    innings: 9,
    weather: '晴れ',
    memo: '接戦だった',
  },
  {
    id: 2,
    date: '2026-10-18',
    homeTeam: 'Cチーム',
    awayTeam: 'Dチーム',
    location: '西グラウンド',
    innings: 7,
    weather: '曇り',
    memo: '7回で終了',
  },
]

const isLineupEntry = (value: unknown): value is LineupEntry => {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return Number.isInteger(entry.playerId) &&
    (entry.role === 'starter' || entry.role === 'reserve') &&
    (entry.battingOrder === null || Number.isInteger(entry.battingOrder)) &&
    typeof entry.position === 'string'
}

const isTeamSide = (value: unknown): value is TeamSide =>
  value === 'home' || value === 'away'

const readLegacyLineups = (): SavedLineup[] => {
  try {
    const saved = localStorage.getItem(LEGACY_LINEUP_STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((value): value is SavedLineup => {
      if (typeof value !== 'object' || value === null) return false
      const lineup = value as Partial<SavedLineup>
      return Number.isInteger(lineup.gameId) &&
        isTeamSide(lineup.teamSide) &&
        Array.isArray(lineup.entries) &&
        lineup.entries.every(isLineupEntry)
    })
  } catch {
    return []
  }
}

const attachLegacyLineups = (games: RegisteredGame[]): RegisteredGame[] => {
  const legacyLineups = readLegacyLineups()
  return games.map(game => {
    const lineup = legacyLineups.find(item => item.gameId === game.id)
    return game.lineup || !lineup
      ? game
      : { ...game, lineup: { teamSide: lineup.teamSide, entries: lineup.entries } }
  })
}

const readSavedGames = (): RegisteredGame[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return attachLegacyLineups(initialGames)

    const parsed = JSON.parse(saved) as RegisteredGame[]
    return attachLegacyLineups(
      Array.isArray(parsed) && parsed.length > 0 ? parsed : initialGames
    )
  } catch {
    return attachLegacyLineups(initialGames)
  }
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [games, setGames] = useState<RegisteredGame[]>(readSavedGames)
  const [players, setPlayers] = useState<Player[]>(readSavedPlayers)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
  }, [games])

  useEffect(() => {
    savePlayers(players)
  }, [players])

  const handleSubmit = (data: Omit<RegisteredGame, 'id'>) => {
    const newGame: RegisteredGame = {
      ...data,
      id: Date.now(),
    }

    setGames(prev => [newGame, ...prev])
    alert(`試合を登録しました！\n${data.homeTeam} vs ${data.awayTeam}`)
    setShowForm(false)
  }

  const handleSaveLineup = (gameId: number, lineup: GameLineupData) => {
    setGames(prev => prev.map(game =>
      game.id === gameId && !game.lineup ? { ...game, lineup } : game
    ))
  }

  return (
    <div className="app-shell">
      <Header />
      <button
        className="action-button"
        style={{ margin: '16px 24px' }}
        onClick={() => setShowForm(true)}
      >
        ＋ 試合を登録
      </button>
      {showForm && (
        <GameForm
          players={players}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      <GameResultList games={games} players={players} />
      <PlayerList
        games={games}
        players={players}
        onPlayersChange={setPlayers}
        onSaveLineup={handleSaveLineup}
      />
    </div>
  )
}

export default App