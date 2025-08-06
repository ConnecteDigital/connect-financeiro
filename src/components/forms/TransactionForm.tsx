'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { formatDateForInput } from '@/utils/format'
import { Category } from '@/types'

interface TransactionFormProps {
  onSuccess?: () => void
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { token } = useAuth()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(formatDateForInput(new Date()))
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount.replace(/[^\d,.-]/g, '').replace(',', '.')),
          type,
          date,
          categoryId: type === 'EXPENSE' ? categoryId : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Transação registrada com sucesso!')
        // Limpar formulário
        setDescription('')
        setAmount('')
        setDate(formatDateForInput(new Date()))
        setCategoryId('')
        
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(data.error || 'Erro ao registrar transação')
      }
    } catch (error) {
      setError('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrencyInput = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '')
    
    // Converte para formato de moeda
    const formatted = (parseInt(numbers) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    
    return formatted
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(formatCurrencyInput(value))
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Nova Transação</h2>
        <p className="text-gray-600">Registre uma entrada ou saída</p>
      </div>

      {/* Seletor de Tipo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Transação
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
              type === 'INCOME'
                ? 'border-success-500 bg-success-50 text-success-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
              type === 'EXPENSE'
                ? 'border-danger-500 bg-danger-50 text-danger-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <TrendingDown className="h-5 w-5 mr-2" />
            Saída
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-600 text-sm">{success}</p>
          </div>
        )}

        <Input
          type="text"
          label="Descrição"
          placeholder="Ex: Pagamento do cliente X"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText className="h-4 w-4" />}
          required
        />

        <Input
          type="text"
          label="Valor"
          placeholder="R$ 0,00"
          value={amount}
          onChange={handleAmountChange}
          icon={<DollarSign className="h-4 w-4" />}
          required
        />

        <Input
          type="date"
          label="Data"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={<Calendar className="h-4 w-4" />}
          required
        />

        {type === 'EXPENSE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={!description || !amount || !date || (type === 'EXPENSE' && !categoryId)}
        >
          Registrar Transação
        </Button>
      </form>
    </Card>
  )
}

export default TransactionForm

