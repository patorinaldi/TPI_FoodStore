import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const estiloControl =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-stone-100'

interface CampoProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function Campo({ id, label, error, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

function bordeSegunError(error?: string): string {
  return error ? 'border-red-400' : 'border-stone-300'
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function Input({ id, label, error, className = '', ...props }: InputProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${estiloControl} ${bordeSegunError(error)} ${className}`}
        {...props}
      />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
  error?: string
}

export function Select({ id, label, error, className = '', children, ...props }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`${estiloControl} ${bordeSegunError(error)} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Campo>
  )
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  error?: string
}

export function TextArea({ id, label, error, className = '', ...props }: TextAreaProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={`${estiloControl} ${bordeSegunError(error)} ${className}`}
        {...props}
      />
    </Campo>
  )
}
