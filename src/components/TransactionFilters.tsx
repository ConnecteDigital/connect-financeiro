'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Filter, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Category } from '@/types'

interface TransactionFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  categories: Category[]
}

export interface FilterState {
  search: string
  type: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryId: string
  startDate: string
  endDate: string
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onFiltersChange,
  categories
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    categoryId: '',
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'ALL',
      categoryId: '',
      startDate: '',
      endDate: ''
    })
  }

  const hasActiveFilters = filters.search || filters.type !== 'ALL' || 
    filters.categoryId || filters.startDate || filters.endDate

  return (
    <Card>
      <div className="space-y-4">
        {/* Barra de busca sempre visível */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por descrição..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                {[filters.type !== 'ALL', filters.categoryId, filters.startDate, filters.endDate].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Tipo de transação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Transação
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ALL', label: 'Todas' },
                  { value: 'INCOME', label: 'Entradas' },
                  { value: 'EXPENSE', label: 'Saídas' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFilterChange('type', option.value)}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                      filters.type === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Data inicial"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
              />
              <Input
                type="date"
                label="Data final"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>

            {/* Botão limpar filtros */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default TransactionFilters

