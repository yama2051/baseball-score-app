export type Player = {
  id: number
  name: string
  number: number
  position: string
  batHand: string
  throwHand: string
}

export const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: '山田 太郎', number: 7, position: 'SS', batHand: '右', throwHand: '右' },
  { id: 2, name: '佐藤 次郎', number: 3, position: '1B', batHand: '左', throwHand: '左' },
  { id: 3, name: '田中 花子', number: 21, position: 'CF', batHand: '左', throwHand: '右' },
]

const STORAGE_KEY = 'baseball-score-app-players'

export const readSavedPlayers = (): Player[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return INITIAL_PLAYERS

    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed as Player[] : INITIAL_PLAYERS
  } catch {
    return INITIAL_PLAYERS
  }
}

export const savePlayers = (players: Player[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}
