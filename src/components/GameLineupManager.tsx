import { useState } from 'react'
import { GameLineup, type LineupEntry, type TeamSide } from '../domain/GameLineup'
import type { Player } from '../domain/Player'
import type { GameResult, GameLineupData } from './GameResultList'
import GameLineupEditor from './GameLineupEditor'
import FieldError from './FieldError'

type Props = {
  players: Player[]
  games: GameResult[]
  onSaveLineup: (gameId: number, lineup: GameLineupData) => void
}

function GameLineupManager({ players, games, onSaveLineup }: Props) {
  const gamesWithoutLineup = games.filter(game => !game.lineup)
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(
    gamesWithoutLineup[0]?.id
  )
  const selectedGame = gamesWithoutLineup.find(game => game.id === selectedGameId)
    ?? gamesWithoutLineup[0]

  if (!selectedGame) {
    return (
      <section id="game-lineups" className="game-lineup">
        <h2>ラインアップ</h2>
        <p className="empty-state">
          {games.length === 0
            ? '試合を登録するとラインアップを設定できます。'
            : 'すべての試合でラインアップが登録済みです。試合結果から確認できます。'}
        </p>
      </section>
    )
  }

  return (
    <LegacyLineupSetup
      key={selectedGame.id}
      game={selectedGame}
      games={gamesWithoutLineup}
      players={players}
      onGameSelect={setSelectedGameId}
      onSaveLineup={onSaveLineup}
    />
  )
}

function LegacyLineupSetup({
  game,
  games,
  players,
  onGameSelect,
  onSaveLineup,
}: {
  game: GameResult
  games: GameResult[]
  players: Player[]
  onGameSelect: (gameId: number) => void
  onSaveLineup: (gameId: number, lineup: GameLineupData) => void
}) {
  const [teamSide, setTeamSide] = useState<TeamSide>('home')
  const [entries, setEntries] = useState<LineupEntry[]>([])
  const [error, setError] = useState('')

  const handleSave = () => {
    const lineup = new GameLineup(game.id, teamSide, entries)
    const validationError = lineup.validate()
    if (validationError) {
      setError(validationError)
      return
    }

    onSaveLineup(game.id, { teamSide, entries: lineup.entries })
  }

  return (
    <section id="game-lineups" className="game-lineup legacy-lineup-setup">
      <h2>過去の試合にラインアップを登録</h2>
      <p className="stats-note">
        試合登録時にラインアップを設定していない試合は、ここから一度だけ登録できます。登録後は表示のみになります。
      </p>
      <div className="form-group">
        <label htmlFor="legacy-lineup-game">対象試合</label>
        <select
          id="legacy-lineup-game"
          value={game.id}
          onChange={event => onGameSelect(Number(event.target.value))}
        >
          {games.map(item => (
            <option key={item.id} value={item.id}>
              {item.date}：{item.homeTeam} vs {item.awayTeam}
            </option>
          ))}
        </select>
      </div>
      <GameLineupEditor
        gameId={game.id}
        teamSide={teamSide}
        entries={entries}
        players={players}
        homeTeam={game.homeTeam}
        awayTeam={game.awayTeam}
        onTeamSideChange={side => {
          setTeamSide(side)
          setError('')
        }}
        onEntriesChange={nextEntries => {
          setEntries(nextEntries)
          setError('')
        }}
      />
      <FieldError message={error} />
      <div className="form-actions">
        <button type="button" className="btn-submit" onClick={handleSave}>
          ラインアップを登録
        </button>
      </div>
    </section>
  )
}

export default GameLineupManager
