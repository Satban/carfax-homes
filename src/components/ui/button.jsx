import React from 'react'

export const Button = ({ className = '', variant = 'primary', size='md', children, ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition'
  const styles = variant === 'secondary'
    ? 'border border-[#d1d5db] bg-white text-[#111827] hover:bg-[#f3f4f6]'
    : 'bg-[#4f46e5] text-white hover:bg-[#4338ca]'
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>
}
