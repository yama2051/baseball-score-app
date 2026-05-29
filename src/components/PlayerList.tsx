import { useState } from 'react'

type Player = {
  id: number
  name: string
  number: number
  position: string
  batHand: string
  throwHand: string
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: '山田 太郎', number: 7,  position: 'SS', batHand: '右', throwHand: '右' },
  { id: 2, name: '佐藤 次郎', number: 3,  position: '1B', batHand: '左', throwHand: '左' },
  { id: 3, name: '田中 花子', number: 21, position: 'CF', batHand: '左', throwHand: '右' },
]

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS)
  const [search, setSearch] = useState('')

  const filtered = players.filter(p =>
    p.name.includes(search) || p.position.includes(search)
  )

  const deletePlayer = (id: number) => {
    if (confirm('本当に削除しますか？')) {
      setPlayers(players.filter(p => p.id !== id))
    }
  }

  return (
    <div className="player-list">
      <div className="list-header">
        <h2>選手一覧</h2>
        <button>＋ 選手を追加</button>
      </div>

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
            filtered.map(player => (
              <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.number}</td>
                <td><span className="badge-pos">{player.position}</span></td>
                <td>{player.throwHand}投{player.batHand}打</td>
                <td>
                  <button className="btn-edit">編集</button>
                  <button className="btn-delete" onClick={() => deletePlayer(player.id)}>削除</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default PlayerList