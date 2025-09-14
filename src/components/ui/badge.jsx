import React from 'react'

export const Badge = ({ className = '', variant = 'secondary', children }) => {
  const styles = variant === 'secondary'
    ? 'bg-[#eef2ff] text-[#3730a3]'
    : 'bg-[#4f46e5] text-white'
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles} ${className}`}>{children}</span>
}
