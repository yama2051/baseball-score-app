import { GameLineup, type LineupEntry, type TeamSide } from '../domain/GameLineup'
import type { Player } from '../domain/Player'

type Props = {
  gameId: number
  teamSide: TeamSide
  entries: LineupEntry[]
  players: Player[]
  homeTeam: string
  awayTeam: string
  onTeamSideChange: (teamSide: TeamSide) => void
  onEntriesChange: (entries: LineupEntry[]) => void
}

const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']

function GameLineupEditor({
  gameId,
  teamSide,
  entries,
  players,
  homeTeam,
  awayTeam,
  onTeamSideChange,
  onEntriesChange,
}: Props) {
  const lineup = new GameLineup(gameId, teamSide, entries)

  const changeLineup = (updated: GameLineup) => onEntriesChange(updated.entries)

  const changeRole = (entry: LineupEntry, role: LineupEntry['role']) => {
    if (role === 'reserve') {
      changeLineup(lineup.updatePlayer(entry.playerId, { role, battingOrder: null }))
      return
    }

    const assignedOrders = new Set(
      lineup.starters
        .filter(starter => starter.playerId !== entry.playerId)
        .map(starter => starter.battingOrder)
    )
    const battingOrder = Array.from({ length: 9 }, (_, index) => index + 1)
      .find(order => !assignedOrders.has(order)) ?? null
    changeLineup(lineup.updatePlayer(entry.playerId, { role, battingOrder }))
  }

  const addPlayer = (player: Player, included: boolean) => {
    changeLineup(included
      ? lineup.withPlayer(player.id, player.position)
      : lineup.withoutPlayer(player.id))
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor={`lineup-side-${gameId}`}>自チームの側</label>
        <select
          id={`lineup-side-${gameId}`}
          value={teamSide}
          onChange={event => onTeamSideChange(event.target.value as TeamSide)}
        >
          <option value="home">ホーム：{homeTeam}</option>
          <option value="away">アウェー：{awayTeam}</option>
        </select>
      </div>
      <p className="stats-note">
        出場選手を選び、スタメンには打順と守備位置を、控えには守備位置を設定してください。スタメンは最大9人です。
      </p>
      <div className="score-table-wrapper">
        <table className="lineup-table">
          <thead>
            <tr>
              <th scope="col">出場</th>
              <th scope="col">選手</th>
              <th scope="col">区分</th>
              <th scope="col">打順</th>
              <th scope="col">守備位置</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => {
              const entry = lineup.entries.find(item => item.playerId === player.id)
              return (
                <tr key={player.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${player.name}を出場選手にする`}
                      checked={Boolean(entry)}
                      onChange={event => addPlayer(player, event.target.checked)}
                    />
                  </td>
                  <th scope="row">#{player.number} {player.name}</th>
                  <td>
                    {entry && (
                      <select
                        aria-label={`${player.name}の区分`}
                        value={entry.role}
                        onChange={event => changeRole(entry, event.target.value as LineupEntry['role'])}
                      >
                        <option value="starter">スタメン</option>
                        <option value="reserve">控え</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {entry?.role === 'starter' && (
                      <select
                        aria-label={`${player.name}の打順`}
                        value={entry.battingOrder ?? ''}
                        onChange={event => changeLineup(
                          lineup.updatePlayer(player.id, {
                            battingOrder: event.target.value ? Number(event.target.value) : null,
                          })
                        )}
                      >
                        <option value="">未設定</option>
                        {Array.from({ length: 9 }, (_, index) => (
                          <option key={index + 1} value={index + 1}>{index + 1}番</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {entry && (
                      <select
                        aria-label={`${player.name}の守備位置`}
                        value={entry.position}
                        onChange={event => changeLineup(
                          lineup.updatePlayer(player.id, { position: event.target.value })
                        )}
                      >
                        {!positions.includes(entry.position) && (
                          <option value={entry.position}>{entry.position}</option>
                        )}
                        {positions.map(position => (
                          <option value={position} key={position}>{position}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default GameLineupEditor
