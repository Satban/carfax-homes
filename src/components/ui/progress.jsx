import React from 'react'

export const Progress = ({ value = 0, className = '', ...props }) => (
  <div className={`w-full h-2 bg-[#e5e7eb] rounded ${className}`} {...props}>
    <div style={{width: `${Math.max(0, Math.min(100, value))}%`}} className="h-2 rounded bg-[#6366f1]"></div>
  </div>
)
