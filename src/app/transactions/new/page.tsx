'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import TransactionForm from '@/components/forms/TransactionForm'

export default function NewTransactionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSuccess = () => {
    // Redirecionar para o dashboard após sucesso
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (loading) {
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
      <div className="max-w-2xl mx-auto">
        <TransactionForm onSuccess={handleSuccess} />
      </div>
    </Layout>
  )
}

