import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-soft border border-gray-100',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

export default Card

