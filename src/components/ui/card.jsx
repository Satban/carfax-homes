import React from 'react'

export const Card = ({ className = '', children, ...props }) => (
  <div className={`rounded-xl border border-[#e5e7eb] bg-white ${className}`} {...props}>{children}</div>
)

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
)
