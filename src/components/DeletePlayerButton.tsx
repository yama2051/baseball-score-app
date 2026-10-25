type DeletePlayerButtonProps = {
  playerName: string
  playerNumber: number
  onDelete: () => void
}

function DeletePlayerButton({ playerName, playerNumber, onDelete }: DeletePlayerButtonProps) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      `${playerName}（背番号${playerNumber}）を削除しますか？`
    )

    if (confirmed) {
      onDelete()
    }
  }

  return (
    <button type="button" className="btn-delete" onClick={handleDelete}>
      削除
    </button>
  )
}

export default DeletePlayerButton
