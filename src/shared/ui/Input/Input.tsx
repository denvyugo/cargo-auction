import './Input.css'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`input-field ${className}`.trim()}>
      {label && (
        <label className="input-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input id={inputId} className={`input-field__input ${error ? 'input-field__input--error' : ''}`} {...props} />
      {error && <span className="input-field__error">{error}</span>}
    </div>
  )
}
