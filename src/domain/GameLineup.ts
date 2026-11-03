export type TeamSide = 'home' | 'away'
export type LineupRole = 'starter' | 'reserve'

export type LineupEntry = {
  playerId: number
  role: LineupRole
  battingOrder: number | null
  position: string
}

export class GameLineup {
  readonly gameId: number
  readonly teamSide: TeamSide
  private readonly lineupEntries: LineupEntry[]

  constructor(gameId: number, teamSide: TeamSide, entries: LineupEntry[] = []) {
    this.gameId = gameId
    this.teamSide = teamSide
    this.lineupEntries = entries.map(entry => ({ ...entry }))
  }

  get entries(): LineupEntry[] {
    return this.lineupEntries.map(entry => ({ ...entry }))
  }

  get starters(): LineupEntry[] {
    return this.lineupEntries
      .filter(entry => entry.role === 'starter')
      .sort((left, right) => (left.battingOrder ?? 0) - (right.battingOrder ?? 0))
      .map(entry => ({ ...entry }))
  }

  get reserves(): LineupEntry[] {
    return this.lineupEntries
      .filter(entry => entry.role === 'reserve')
      .map(entry => ({ ...entry }))
  }

  withPlayer(playerId: number, position: string): GameLineup {
    if (this.lineupEntries.some(entry => entry.playerId === playerId)) return this

    return new GameLineup(this.gameId, this.teamSide, [
      ...this.lineupEntries,
      { playerId, role: 'reserve', battingOrder: null, position },
    ])
  }

  withoutPlayer(playerId: number): GameLineup {
    return new GameLineup(
      this.gameId,
      this.teamSide,
      this.lineupEntries.filter(entry => entry.playerId !== playerId)
    )
  }

  updatePlayer(playerId: number, changes: Partial<Omit<LineupEntry, 'playerId'>>): GameLineup {
    return new GameLineup(
      this.gameId,
      this.teamSide,
      this.lineupEntries.map(entry =>
        entry.playerId === playerId ? { ...entry, ...changes } : entry
      )
    )
  }

  withTeamSide(teamSide: TeamSide): GameLineup {
    return new GameLineup(this.gameId, teamSide, this.lineupEntries)
  }

  validate(): string | null {
    const starters = this.starters
    if (starters.length !== 9) {
      return `スタメンは9人必要です。現在のスタメンは${starters.length}人です。`
    }

    const playerIds = this.lineupEntries.map(entry => entry.playerId)
    if (new Set(playerIds).size !== playerIds.length) {
      return '同じ選手を重複して登録できません。'
    }

    const battingOrders = starters.map(entry => entry.battingOrder)
    if (battingOrders.some(order => order === null || !Number.isInteger(order) || order < 1 || order > 9)) {
      return 'スタメン全員に1から9までの打順を設定してください。'
    }
    if (new Set(battingOrders).size !== battingOrders.length) {
      return '打順が重複しています。'
    }
    if (this.reserves.some(entry => entry.battingOrder !== null)) {
      return '控え選手には打順を設定できません。'
    }
    if (this.lineupEntries.some(entry => !entry.position.trim())) {
      return '出場選手全員に守備位置を設定してください。'
    }

    return null
  }
}
