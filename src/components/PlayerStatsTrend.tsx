import { useState } from 'react'
import {
  PlayerGameStatsCalculator,
  type PlayerGameStats,
} from '../domain/PlayerGameStats'
import type { GameResult } from './GameResultList'

type MetricKey =
  | 'battingAverage'
  | 'onBasePercentage'
  | 'sluggingPercentage'
  | 'earnedRunAverage'
  | 'walksAndHitsPerInningPitched'

type Metric = {
  key: MetricKey
  label: string
  type: 'batting' | 'pitching'
}

type TrendPoint = {
  gameId: number
  label: string
  value: number
}

type Props = {
  players: { id: number; name: string; number: number }[]
  games: GameResult[]
  records: PlayerGameStats[]
}

const metrics: Metric[] = [
  { key: 'battingAverage', label: '打率', type: 'batting' },
  { key: 'onBasePercentage', label: '出塁率', type: 'batting' },
  { key: 'sluggingPercentage', label: '長打率', type: 'batting' },
  { key: 'earnedRunAverage', label: '防御率', type: 'pitching' },
  { key: 'walksAndHitsPerInningPitched', label: 'WHIP', type: 'pitching' },
]

const formatDate = (date: string) => {
  if (!date) return '日付未設定'
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' }).format(parsed)
}

const formatMetricValue = (value: number, type: Metric['type']) =>
  type === 'batting'
    ? value.toFixed(3).replace(/^0(?=\.)/, '')
    : value.toFixed(2)

function PlayerStatsTrend({ players, games, records }: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | undefined>(players[0]?.id)
  const [selectedMetricKey, setSelectedMetricKey] = useState<MetricKey>('battingAverage')
  const selectedPlayer = players.find(player => player.id === selectedPlayerId) ?? players[0]
  const metric = metrics.find(item => item.key === selectedMetricKey) ?? metrics[0]

  const points: TrendPoint[] = selectedPlayer
    ? [...games]
        .sort((left, right) => left.date.localeCompare(right.date))
        .flatMap(game => {
          const record = records.find(item =>
            item.gameId === game.id && item.playerId === selectedPlayer.id
          )
          if (!record) return []

          const calculator = new PlayerGameStatsCalculator(record)
          const value = calculator[metric.key]
          return value === null
            ? []
            : [{ gameId: game.id, label: formatDate(game.date), value }]
        })
    : []

  const chart = createChart(points)

  return (
    <section className="player-stats-trend">
      <h3>成績推移（試合ごと）</h3>
      {players.length === 0 ? (
        <p className="empty-state">選手を登録すると成績推移を表示できます。</p>
      ) : (
        <>
          <div className="trend-controls">
            <label>
              選手
              <select
                value={selectedPlayer?.id ?? ''}
                onChange={event => setSelectedPlayerId(Number(event.target.value))}
              >
                {players.map(player => (
                  <option value={player.id} key={player.id}>
                    #{player.number} {player.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              指標
              <select
                value={selectedMetricKey}
                onChange={event => setSelectedMetricKey(event.target.value as MetricKey)}
              >
                {metrics.map(item => (
                  <option value={item.key} key={item.key}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
          {points.length === 0 ? (
            <p className="empty-state trend-empty">
              {metric.type === 'batting'
                ? 'この選手の打撃成績が入力された試合はありません。'
                : 'この選手の投手成績が入力された試合はありません。'}
            </p>
          ) : (
            <>
              <p className="stats-note">
                {selectedPlayer?.name} の試合ごとの{metric.label}です。成績が入力されていない試合は除外しています。
              </p>
              <div className="trend-chart-scroll">
                <svg
                  className="trend-chart"
                  viewBox="0 0 640 300"
                  role="img"
                  aria-label={`${selectedPlayer?.name}の試合ごとの${metric.label}推移`}
                >
                  <text x="12" y="24" className="trend-axis-title">{metric.label}</text>
                  {chart.gridLines.map(line => (
                    <g key={line.value}>
                      <line
                        x1={chart.left}
                        x2={chart.right}
                        y1={line.y}
                        y2={line.y}
                        className="trend-grid-line"
                      />
                      <text x={chart.left - 8} y={line.y + 4} className="trend-axis-label" textAnchor="end">
                        {formatMetricValue(line.value, metric.type)}
                      </text>
                    </g>
                  ))}
                  <line
                    x1={chart.left}
                    x2={chart.left}
                    y1={chart.top}
                    y2={chart.bottom}
                    className="trend-axis-line"
                  />
                  <line
                    x1={chart.left}
                    x2={chart.right}
                    y1={chart.bottom}
                    y2={chart.bottom}
                    className="trend-axis-line"
                  />
                  {chart.path && <path d={chart.path} className="trend-line" />}
                  {chart.points.map((point, index) => (
                    <g key={point.gameId}>
                      <circle cx={point.x} cy={point.y} r="5" className="trend-point">
                        <title>{`${point.label}: ${formatMetricValue(point.value, metric.type)}`}</title>
                      </circle>
                      <text
                        x={point.x}
                        y={chart.bottom + 22 + (index % 2) * 14}
                        className="trend-date-label"
                        textAnchor="middle"
                      >
                        {point.label}
                      </text>
                      <text
                        x={point.x}
                        y={point.y - 10}
                        className="trend-value-label"
                        textAnchor="middle"
                      >
                        {formatMetricValue(point.value, metric.type)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

function createChart(points: TrendPoint[]) {
  const left = 58
  const right = 620
  const top = 40
  const bottom = 220
  const maximum = Math.max(...points.map(point => point.value), 0)
  const yMaximum = maximum > 0 ? maximum * 1.2 : 1
  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const value = (yMaximum * (4 - index)) / 4
    return { value, y: top + ((bottom - top) * index) / 4 }
  })
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: points.length === 1
      ? (left + right) / 2
      : left + ((right - left) * index) / (points.length - 1),
    y: bottom - ((bottom - top) * point.value) / yMaximum,
  }))

  return {
    left,
    right,
    top,
    bottom,
    gridLines,
    points: chartPoints,
    path: chartPoints.length > 1
      ? chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
      : '',
  }
}

export default PlayerStatsTrend
