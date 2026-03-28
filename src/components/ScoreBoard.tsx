type Props = {
  teamName: string
  score: number
}

function ScoreBoard({ teamName, score }: Props) {
  return (
    <div>
      <h2>{teamName}</h2>
      <p>得点：{score}</p>
    </div>
  )
}

export default ScoreBoard