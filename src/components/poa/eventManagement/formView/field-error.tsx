interface FieldErrorProps {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null

  return <div className="text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">{message}</div>
}

