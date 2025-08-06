'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Transaction, PaginationInfo } from '@/types'
import { formatCurrency, formatDate } from '@/utils/format'

interface TransactionListProps {
  transactions: Transaction[]
  pagination: PaginationInfo
  loading: boolean
  onPageChange: (page: number) => void
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  pagination,
  loading,
  onPageChange
}) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando transações...</p>
        </div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou registre uma nova transação.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Ícone do tipo */}
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  transaction.type === 'INCOME' 
                    ? 'bg-success-50 text-success-600' 
                    : 'bg-danger-50 text-danger-600'
                }`}>
                  {transaction.type === 'INCOME' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>

                {/* Informações da transação */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {transaction.description}
                    </h4>
                    <span className={`font-semibold ${
                      transaction.type === 'INCOME' 
                        ? 'text-success-600' 
                        : 'text-danger-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transaction.date)}
                    </div>
                    
                    {transaction.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${transaction.category.color}20`,
                            color: transaction.category.color
                          }}
                        >
                          {transaction.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Paginação */}
      {pagination.pages > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} transações
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center gap-1"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default TransactionList

