type GameResult = {
  id: number
  date: string
  homeTeam: string
  awayTeam: string
  location: string
  innings: number
  weather: string
  memo: string
}

type Props = {
  games: GameResult[]
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

function GameResultList({ games }: Props) {
  if (games.length === 0) {
    return (
      <section className="game-results">
        <h2>試合結果</h2>
        <div className="empty-state">まだ試合結果がありません。</div>
      </section>
    )
  }

  return (
    <section className="game-results">
      <h2>試合結果</h2>
      <div className="game-results-grid">
        {games.map(game => (
          <article key={game.id} className="game-card">
            <div className="game-date">{formatDate(game.date)}</div>
            <div className="game-score">
              <span>{game.homeTeam}</span>
              <strong>vs</strong>
              <span>{game.awayTeam}</span>
            </div>
            <div className="game-meta">
              <span>場所: {game.location || '未入力'}</span>
              <span>イニング: {game.innings}</span>
              <span>天気: {game.weather}</span>
            </div>
            {game.memo && <p className="game-memo">メモ: {game.memo}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

export type { GameResult }
export default GameResultList
