import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

async function getHandler(req: AuthenticatedRequest) {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Buscar todas as transações do usuário
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Transações do mês atual
    const monthlyTransactions = allTransactions.filter(t => 
      t.date >= monthStart && t.date <= monthEnd
    )

    // Calcular totais gerais
    const totalIncome = allTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = allTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Calcular totais mensais
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyBalance = monthlyIncome - monthlyExpense

    // Agrupar despesas por categoria (mês atual)
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .reduce((acc: any[], transaction) => {
        const categoryName = transaction.category!.name
        const categoryColor = transaction.category!.color
        
        const existing = acc.find(item => item.category === categoryName)
        if (existing) {
          existing.amount += transaction.amount
        } else {
          acc.push({
            category: categoryName,
            amount: transaction.amount,
            color: categoryColor
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.amount - a.amount)

    // Transações recentes (últimas 10)
    const recentTransactions = allTransactions.slice(0, 10)

    const dashboardData = {
      totalIncome,
      totalExpense,
      balance,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance,
      expensesByCategory,
      recentTransactions
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)

