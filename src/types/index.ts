export interface User {
  id: string
  email: string
  name: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: Date
  categoryId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  category?: Category
}

export interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
  expensesByCategory: {
    category: string
    amount: number
    color: string
  }[]
  recentTransactions: Transaction[]
}

export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE' | 'ALL'
  startDate?: Date
  endDate?: Date
  categoryId?: string
  search?: string
}

export interface ReportData {
  period: string
  totalIncome: number
  totalExpense: number
  balance: number
  expensesByCategory: {
    category: string
    amount: number
  }[]
  transactions: Transaction[]
}


export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

