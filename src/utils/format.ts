import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 0 }), // Domingo
    end: endOfWeek(date, { weekStartsOn: 0 })
  }
}

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  }
}

export const formatPeriod = (startDate: Date, endDate: Date): string => {
  const start = format(startDate, 'dd/MM', { locale: ptBR })
  const end = format(endDate, 'dd/MM/yyyy', { locale: ptBR })
  return `${start} - ${end}`
}

export const parseCurrencyInput = (value: string): number => {
  // Remove tudo exceto números e vírgula/ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '')
  // Substitui vírgula por ponto para conversão
  const normalizedValue = cleanValue.replace(',', '.')
  return parseFloat(normalizedValue) || 0
}

