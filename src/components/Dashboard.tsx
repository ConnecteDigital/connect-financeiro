'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Card from './ui/Card'
import { formatCurrency } from '@/utils/format'
import { DashboardData } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface DashboardProps {
  data: DashboardData
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Total */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Total</p>
              <p className={`text-2xl font-bold ${data.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(data.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${data.balance >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
              <DollarSign className={`h-6 w-6 ${data.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
            </div>
          </div>
        </Card>

        {/* Entradas do Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(data.monthlyIncome)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-success-100">
              <ArrowUpRight className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>

        {/* Saídas do Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(data.monthlyExpense)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-danger-100">
              <ArrowDownRight className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </Card>

        {/* Resultado do Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resultado do Mês</p>
              <p className={`text-2xl font-bold ${data.monthlyBalance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(data.monthlyBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${data.monthlyBalance >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
              {data.monthlyBalance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-success-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-danger-600" />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Despesas por Categoria */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Despesas por Categoria</h3>
            <p className="text-sm text-gray-600">Distribuição dos gastos do mês</p>
          </div>
          {data.expensesByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma despesa registrada este mês</p>
              </div>
            </div>
          )}
        </Card>

        {/* Transações Recentes */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
            <p className="text-sm text-gray-600">Últimas movimentações</p>
          </div>
          {data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${transaction.type === 'INCOME' ? 'bg-success-100' : 'bg-danger-100'}`}>
                      {transaction.type === 'INCOME' ? (
                        <ArrowUpRight className="h-4 w-4 text-success-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-danger-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.category?.name || 'Sem categoria'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${transaction.type === 'INCOME' ? 'text-success-600' : 'text-danger-600'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma transação encontrada</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

