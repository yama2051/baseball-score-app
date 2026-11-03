import { PlayerSeasonStats, type PlayerGameStats } from '../domain/PlayerGameStats'

type Player = {
  id: number
  name: string
  number: number
}

type Props = {
  players: Player[]
  records: PlayerGameStats[]
}

const formatRate = (value: number | null) =>
  value === null ? '—' : value.toFixed(3).replace(/^0(?=\.)/, '')

const formatInnings = (outs: number) => `${Math.floor(outs / 3)}.${outs % 3}`

function PlayerStatsCalculator({ players, records }: Props) {
  const summaries = players.map(player => ({
    player,
    stats: new PlayerSeasonStats(records.filter(record => record.playerId === player.id)),
  }))

  return (
    <section className="player-stats-summary">
      <h3>選手別通算成績</h3>
      {players.length === 0 ? (
        <p className="empty-state">選手を登録すると成績を表示できます。</p>
      ) : (
        <>
          <div className="score-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">選手</th>
                  <th scope="col">試合</th>
                  <th scope="col">打数</th>
                  <th scope="col">安打</th>
                  <th scope="col">二塁打</th>
                  <th scope="col">三塁打</th>
                  <th scope="col">本塁打</th>
                  <th scope="col">打点</th>
                  <th scope="col">四球</th>
                  <th scope="col">三振</th>
                  <th scope="col">打率</th>
                  <th scope="col">出塁率</th>
                  <th scope="col">長打率</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(({ player, stats }) => (
                  <tr key={player.id}>
                    <th scope="row">#{player.number} {player.name}</th>
                    <td>{stats.games}</td>
                    <td>{stats.atBats}</td>
                    <td>{stats.hits}</td>
                    <td>{stats.doubles}</td>
                    <td>{stats.triples}</td>
                    <td>{stats.homeRuns}</td>
                    <td>{stats.runsBattedIn}</td>
                    <td>{stats.walks}</td>
                    <td>{stats.strikeouts}</td>
                    <td>{formatRate(stats.battingAverage)}</td>
                    <td>{formatRate(stats.onBasePercentage)}</td>
                    <td>{formatRate(stats.sluggingPercentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>投手成績</h3>
          <p className="stats-note">投球回は野球表記です（.1＝1/3回、.2＝2/3回）。</p>
          <div className="score-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">投手</th>
                  <th scope="col">投球回</th>
                  <th scope="col">自責点</th>
                  <th scope="col">奪三振</th>
                  <th scope="col">被安打</th>
                  <th scope="col">与四球</th>
                  <th scope="col">防御率</th>
                  <th scope="col">WHIP</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(({ player, stats }) => (
                  <tr key={player.id}>
                    <th scope="row">#{player.number} {player.name}</th>
                    <td>{formatInnings(stats.pitchingOuts)}</td>
                    <td>{stats.earnedRuns}</td>
                    <td>{stats.pitchingStrikeouts}</td>
                    <td>{stats.hitsAllowed}</td>
                    <td>{stats.pitchingWalks}</td>
                    <td>{stats.earnedRunAverage?.toFixed(2) ?? '—'}</td>
                    <td>{stats.walksAndHitsPerInningPitched?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default PlayerStatsCalculator
