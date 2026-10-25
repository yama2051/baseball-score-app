type FieldErrorProps = {
  message?: string
  tone?: 'error' | 'warning'
}

function FieldError({ message, tone = 'error' }: FieldErrorProps) {
  if (!message) return null

  return (
    <div className={tone === 'error' ? 'error-box' : 'warning-box'} role="alert">
      <p className={tone === 'error' ? 'error' : 'warning'}>{message}</p>
    </div>
  )
}

export default FieldError
