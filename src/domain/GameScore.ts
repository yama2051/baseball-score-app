export type InningScore = {
  inning: number
  home: number
  away: number
}

export class GameScore {
  readonly innings: InningScore[]

  constructor(homeScores: number[], awayScores: number[]) {
    if (homeScores.length !== awayScores.length) {
      throw new Error('ホームとアウェイのイニング数が一致していません。')
    }

    this.innings = homeScores.map((home, index) => ({
      inning: index + 1,
      home,
      away: awayScores[index],
    }))
  }

  get homeTotal(): number {
    return this.innings.reduce((total, inning) => total + inning.home, 0)
  }

  get awayTotal(): number {
    return this.innings.reduce((total, inning) => total + inning.away, 0)
  }

  getResult(homeTeam: string, awayTeam: string): string {
    if (this.homeTotal === this.awayTotal) return '引き分け'
    return this.homeTotal > this.awayTotal
      ? `${homeTeam}の勝ち`
      : `${awayTeam}の勝ち`
  }
}
