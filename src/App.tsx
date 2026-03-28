import { useState } from 'react'
import Header from './components/Header'
import ScoreBoard from './components/ScoreBoard'

function App() {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  return (
    <div>
      <Header />
      <ScoreBoard teamName="ホームチーム" score={homeScore} />
      <button onClick={() => setHomeScore(homeScore + 1)}>ホーム +1</button>

      <ScoreBoard teamName="アウェイチーム" score={awayScore} />
      <button onClick={() => setAwayScore(awayScore + 1)}>アウェイ +1</button>
    </div>
  )
}

export default App