import React from 'react'

export const Input = ({ className = '', ...props }) => (
  <input className={`w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a5b4fc] ${className}`} {...props} />
)
