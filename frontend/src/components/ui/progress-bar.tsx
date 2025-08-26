'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  label: string
  color?: 'green' | 'blue' | 'orange' | 'red'
  showValue?: boolean
  className?: string
}

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-blue-500', 
  orange: 'bg-orange-500',
  red: 'bg-red-500'
}

export function ProgressBar({ 
  value, 
  max, 
  label, 
  color = 'blue', 
  showValue = true, 
  className 
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-gray-500">
            {value}/{max} ({Math.round(percentage)}%)
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={cn(
            'h-3 rounded-full transition-all duration-500 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface SimpleChartProps {
  data: Array<{
    label: string
    value: number
    color?: 'green' | 'blue' | 'orange' | 'red'
  }>
  title?: string
  className?: string
}

export function SimpleChart({ data, title, className }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      )}
      <div className="space-y-4">
        {data.map((item, index) => (
          <ProgressBar
            key={index}
            value={item.value}
            max={maxValue}
            label={item.label}
            color={item.color || 'blue'}
          />
        ))}
      </div>
    </div>
  )
}