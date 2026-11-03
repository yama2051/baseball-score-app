import { GameScore } from '../domain/GameScore'
import { GameLineup, type LineupEntry, type TeamSide } from '../domain/GameLineup'
import type { Player } from '../domain/Player'

export type GameLineupData = {
  teamSide: TeamSide
  entries: LineupEntry[]
}

export type GameResult = {
  id: number
  date: string
  homeTeam: string
  awayTeam: string
  location: string
  innings: number
  homeScores?: number[]
  awayScores?: number[]
  lineup?: GameLineupData
  weather: string
  memo: string
}

type Props = {
  games: GameResult[]
  players: Player[]
}

const formatDate = (date: string) => {
  if (!date) return '日付未設定'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(parsed)
}

function GameResultList({ games, players }: Props) {
  if (games.length === 0) {
    return (
      <section className="game-results" id="game-results">
        <h2>試合結果</h2>
        <div className="empty-state">まだ試合結果がありません。</div>
      </section>
    )
  }

  return (
    <section className="game-results" id="game-results">
      <h2>試合結果</h2>
      <div className="game-results-grid">
        {games.map(game => (
          <article key={game.id} className="game-card">
            <div className="game-date">{formatDate(game.date)}</div>
            {game.homeScores && game.awayScores && (
              <Scoreboard game={game} />
            )}
            {(!game.homeScores || !game.awayScores) && (
              <div className="game-score">
                <span>{game.homeTeam}</span>
                <strong>vs</strong>
                <span>{game.awayTeam}</span>
              </div>
            )}
            <div className="game-meta">
              <span>場所: {game.location || '未入力'}</span>
              <span>イニング: {game.innings}</span>
              <span>天気: {game.weather}</span>
            </div>
            {game.memo && <p className="game-memo">メモ: {game.memo}</p>}
            {game.lineup && <GameLineupSummary game={game} players={players} />}
          </article>
        ))}
      </div>
    </section>
  )
}

function GameLineupSummary({ game, players }: { game: GameResult; players: Player[] }) {
  if (!game.lineup) return null

  const lineup = new GameLineup(game.id, game.lineup.teamSide, game.lineup.entries)
  const teamName = game.lineup.teamSide === 'home' ? game.homeTeam : game.awayTeam

  return (
    <details className="game-lineup-summary">
      <summary>ラインアップ：{teamName}</summary>
      <h3>スタメン</h3>
      {lineup.starters.length === 0 ? (
        <p>スタメン未登録</p>
      ) : (
        <ol>
          {lineup.starters.map(entry => (
            <li key={entry.playerId}>
              {entry.battingOrder}番 {entry.position} {players.find(player => player.id === entry.playerId)?.name ?? '退団選手'}
            </li>
          ))}
        </ol>
      )}
      <h3>控え</h3>
      <p>
        {lineup.reserves
          .map(entry => `${entry.position} ${players.find(player => player.id === entry.playerId)?.name ?? '退団選手'}`)
          .join('、') || '控えなし'}
      </p>
    </details>
  )
}

function Scoreboard({ game }: { game: GameResult }) {
  if (!game.homeScores || !game.awayScores) return null

  const score = new GameScore(game.homeScores, game.awayScores)

  return (
    <div className="score-table-wrapper">
      <table className="score-result-table">
        <thead>
          <tr>
            <th scope="col">チーム</th>
            {score.innings.map(inning => (
              <th scope="col" key={inning.inning}>{inning.inning}回</th>
            ))}
            <th scope="col">計</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{game.homeTeam}</th>
            {score.innings.map(inning => <td key={inning.inning}>{inning.home}</td>)}
            <td>{score.homeTotal}</td>
          </tr>
          <tr>
            <th scope="row">{game.awayTeam}</th>
            {score.innings.map(inning => <td key={inning.inning}>{inning.away}</td>)}
            <td>{score.awayTotal}</td>
          </tr>
        </tbody>
      </table>
      <p className="game-outcome">
        {score.getResult(game.homeTeam, game.awayTeam)}
      </p>
    </div>
  )
}

export default GameResultList
