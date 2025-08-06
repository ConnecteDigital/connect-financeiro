'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { 
  FileText, 
  Send, 
  Calendar,
  TrendingUp,
  MessageCircle,
  Clock
} from 'lucide-react'

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
  }, [user, authLoading, router])

  const sendReport = async (type: 'weekly' | 'monthly') => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const token = localStorage.getItem('connect-financeiro-token')
      const response = await fetch('/api/reports/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Relatório ${type === 'weekly' ? 'semanal' : 'mensal'} enviado com sucesso via WhatsApp!`)
      } else {
        setError(data.error || 'Erro ao enviar relatório')
      }
    } catch (error) {
      console.error('Erro ao enviar relatório:', error)
      setError('Erro interno do servidor')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600 mt-1">
            Envie relatórios detalhados via WhatsApp
          </p>
        </div>

        {/* Status do WhatsApp */}
        <Card>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              user.whatsapp 
                ? 'bg-success-50 text-success-600' 
                : 'bg-warning-50 text-warning-600'
            }`}>
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Status do WhatsApp
              </h3>
              <p className="text-sm text-gray-600">
                {user.whatsapp 
                  ? `Configurado: ${user.whatsapp}`
                  : 'WhatsApp não configurado'
                }
              </p>
            </div>
            {!user.whatsapp && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
              >
                Configurar
              </Button>
            )}
          </div>
        </Card>

        {/* Mensagens de feedback */}
        {message && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-600">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-600">{error}</p>
          </div>
        )}

        {/* Relatórios Manuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="text-center space-y-4">
              <div className="p-3 bg-primary-50 rounded-lg inline-flex">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Relatório Semanal
                </h3>
                <p className="text-gray-600 text-sm">
                  Resumo das movimentações da semana atual
                </p>
              </div>
              <Button
                onClick={() => sendReport('weekly')}
                disabled={loading || !user.whatsapp}
                loading={loading}
                className="w-full flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar via WhatsApp
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center space-y-4">
              <div className="p-3 bg-success-50 rounded-lg inline-flex">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Relatório Mensal
                </h3>
                <p className="text-gray-600 text-sm">
                  Análise completa das finanças do mês atual
                </p>
              </div>
              <Button
                onClick={() => sendReport('monthly')}
                disabled={loading || !user.whatsapp}
                loading={loading}
                className="w-full flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar via WhatsApp
              </Button>
            </div>
          </Card>
        </div>

        {/* Relatórios Automáticos */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-50 rounded-lg">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Relatórios Automáticos
                </h3>
                <p className="text-gray-600 text-sm">
                  Configuração dos envios automáticos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Relatório Semanal</p>
                  <p className="text-sm text-gray-600">Toda segunda-feira às 8h</p>
                </div>
                <div className="text-success-600 text-sm font-medium">
                  Ativo
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Relatório Mensal</p>
                  <p className="text-sm text-gray-600">Todo dia 1º às 8h</p>
                </div>
                <div className="text-success-600 text-sm font-medium">
                  Ativo
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações sobre configuração */}
        <Card>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Como funciona
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Os relatórios incluem resumo de entradas, saídas e saldo</p>
              <p>• Análise por categorias com os maiores gastos</p>
              <p>• Lista das principais transações do período</p>
              <p>• Envio automático via WhatsApp nos horários configurados</p>
              <p>• Para receber relatórios automáticos, configure seu WhatsApp no perfil</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

