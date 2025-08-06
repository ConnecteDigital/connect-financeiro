'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import TransactionFilters, { FilterState } from '@/components/TransactionFilters'
import TransactionList from '@/components/TransactionList'
import { Transaction, Category, PaginationInfo } from '@/types'

interface TransactionResponse {
  transactions: Transaction[]
  pagination: PaginationInfo
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    categoryId: '',
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchCategories()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTransactions(1)
    }
  }, [user, filters])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('connect-financeiro-token')
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  const fetchTransactions = async (page: number) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('connect-financeiro-token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      // Adicionar filtros aos parâmetros
      if (filters.search) params.append('search', filters.search)
      if (filters.type !== 'ALL') params.append('type', filters.type)
      if (filters.categoryId) params.append('categoryId', filters.categoryId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: TransactionResponse = await response.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
      } else {
        setError('Erro ao carregar transações')
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      setError('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const handlePageChange = (page: number) => {
    fetchTransactions(page)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">CF</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Transações</h1>
          <p className="text-gray-600 mt-1">
            Visualize e filtre todas as suas movimentações financeiras
          </p>
        </div>

        <TransactionFilters
          onFiltersChange={handleFiltersChange}
          categories={categories}
        />

        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600">{error}</p>
          </div>
        )}

        <TransactionList
          transactions={transactions}
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  )
}

