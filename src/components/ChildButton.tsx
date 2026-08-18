import type { ButtonHTMLAttributes } from 'react'

import type { ReactNode } from 'react'

interface ChildButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function ChildButton({ className = '', children, ...rest }: ChildButtonProps) {
  return (
    <button className={`child-button ${className}`} {...rest}>
      {children}
    </button>
  )
}

