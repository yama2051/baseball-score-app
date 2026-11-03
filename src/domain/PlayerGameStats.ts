export type PlayerGameStats = {
  gameId: number
  playerId: number
  atBats: number
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  runsBattedIn: number
  walks: number
  strikeouts: number
  hitByPitch: number
  sacrificeFlies: number
  pitchingOuts: number
  earnedRuns: number
  pitchingStrikeouts: number
  hitsAllowed: number
  pitchingWalks: number
}

export const createEmptyPlayerGameStats = (
  gameId: number,
  playerId: number
): PlayerGameStats => ({
  gameId,
  playerId,
  atBats: 0,
  hits: 0,
  doubles: 0,
  triples: 0,
  homeRuns: 0,
  runsBattedIn: 0,
  walks: 0,
  strikeouts: 0,
  hitByPitch: 0,
  sacrificeFlies: 0,
  pitchingOuts: 0,
  earnedRuns: 0,
  pitchingStrikeouts: 0,
  hitsAllowed: 0,
  pitchingWalks: 0,
})

export const validatePlayerGameStats = (stats: PlayerGameStats): string | null => {
  const countFields = Object.entries(stats).filter(([field]) =>
    field !== 'gameId' && field !== 'playerId'
  )

  if (countFields.some(([, value]) => !Number.isInteger(value) || value < 0)) {
    return '成績には0以上の整数を入力してください。'
  }
  if (stats.hits > stats.atBats) {
    return '安打数は打数以下にしてください。'
  }
  if (stats.doubles + stats.triples + stats.homeRuns > stats.hits) {
    return '二塁打・三塁打・本塁打の合計は安打数以下にしてください。'
  }
  return null
}

type StatTotals = Omit<PlayerGameStats, 'gameId' | 'playerId'>

export class PlayerGameStatsCalculator {
  private readonly stats: StatTotals

  constructor(stats: StatTotals) {
    this.stats = stats
  }

  get battingAverage(): number | null {
    return this.stats.atBats === 0 ? null : this.stats.hits / this.stats.atBats
  }

  get onBasePercentage(): number | null {
    const plateAppearances =
      this.stats.atBats + this.stats.walks + this.stats.hitByPitch + this.stats.sacrificeFlies
    return plateAppearances === 0
      ? null
      : (this.stats.hits + this.stats.walks + this.stats.hitByPitch) / plateAppearances
  }

  get sluggingPercentage(): number | null {
    if (this.stats.atBats === 0) return null
    const totalBases =
      this.stats.hits + this.stats.doubles + this.stats.triples * 2 + this.stats.homeRuns * 3
    return totalBases / this.stats.atBats
  }

  get earnedRunAverage(): number | null {
    return this.stats.pitchingOuts === 0
      ? null
      : (this.stats.earnedRuns * 27) / this.stats.pitchingOuts
  }

  get walksAndHitsPerInningPitched(): number | null {
    return this.stats.pitchingOuts === 0
      ? null
      : ((this.stats.hitsAllowed + this.stats.pitchingWalks) * 3) / this.stats.pitchingOuts
  }
}

const sum = (records: PlayerGameStats[], field: keyof PlayerGameStats) =>
  records.reduce((total, record) => total + Number(record[field]), 0)

export class PlayerSeasonStats {
  readonly games: number
  readonly atBats: number
  readonly hits: number
  readonly doubles: number
  readonly triples: number
  readonly homeRuns: number
  readonly runsBattedIn: number
  readonly walks: number
  readonly strikeouts: number
  readonly hitByPitch: number
  readonly sacrificeFlies: number
  readonly pitchingOuts: number
  readonly earnedRuns: number
  readonly pitchingStrikeouts: number
  readonly hitsAllowed: number
  readonly pitchingWalks: number

  constructor(records: PlayerGameStats[]) {
    this.games = records.filter(record =>
      record.atBats + record.walks + record.hitByPitch + record.sacrificeFlies > 0 ||
      record.pitchingOuts > 0
    ).length
    this.atBats = sum(records, 'atBats')
    this.hits = sum(records, 'hits')
    this.doubles = sum(records, 'doubles')
    this.triples = sum(records, 'triples')
    this.homeRuns = sum(records, 'homeRuns')
    this.runsBattedIn = sum(records, 'runsBattedIn')
    this.walks = sum(records, 'walks')
    this.strikeouts = sum(records, 'strikeouts')
    this.hitByPitch = sum(records, 'hitByPitch')
    this.sacrificeFlies = sum(records, 'sacrificeFlies')
    this.pitchingOuts = sum(records, 'pitchingOuts')
    this.earnedRuns = sum(records, 'earnedRuns')
    this.pitchingStrikeouts = sum(records, 'pitchingStrikeouts')
    this.hitsAllowed = sum(records, 'hitsAllowed')
    this.pitchingWalks = sum(records, 'pitchingWalks')
  }

  get battingAverage(): number | null {
    return new PlayerGameStatsCalculator(this).battingAverage
  }

  get onBasePercentage(): number | null {
    return new PlayerGameStatsCalculator(this).onBasePercentage
  }

  get sluggingPercentage(): number | null {
    return new PlayerGameStatsCalculator(this).sluggingPercentage
  }

  get earnedRunAverage(): number | null {
    return new PlayerGameStatsCalculator(this).earnedRunAverage
  }

  get walksAndHitsPerInningPitched(): number | null {
    return new PlayerGameStatsCalculator(this).walksAndHitsPerInningPitched
  }
}
