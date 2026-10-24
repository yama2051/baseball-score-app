import { useState } from 'react'
import Header from './components/Header'
import PlayerList from './components/PlayerList'
import GameForm from './components/GameForm'
import GameResultList, { type GameResult } from './components/GameResultList'

type RegisteredGame = GameResult

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

function App() {
  const [showForm, setShowForm] = useState(false)
  const [games, setGames] = useState<RegisteredGame[]>(initialGames)

  const handleSubmit = (data: Omit<RegisteredGame, 'id'>) => {
    const newGame: RegisteredGame = {
      ...data,
      id: Date.now(),
    }

    setGames(prev => [newGame, ...prev])
    alert(`試合を登録しました！\n${data.homeTeam} vs ${data.awayTeam}`)
    setShowForm(false)
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
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      <GameResultList games={games} />
      <PlayerList />
    </div>
  )
}

export default App