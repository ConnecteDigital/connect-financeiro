import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'weekly' ou 'monthly'
    const date = searchParams.get('date') // Data de referência (opcional)

    if (!type || !['weekly', 'monthly'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de relatório inválido. Use "weekly" ou "monthly"' },
        { status: 400 }
      )
    }

    const referenceDate = date ? new Date(date) : new Date()
    let startDate: Date
    let endDate: Date
    let periodName: string

    if (type === 'weekly') {
      startDate = startOfWeek(referenceDate, { weekStartsOn: 1 }) // Segunda-feira
      endDate = endOfWeek(referenceDate, { weekStartsOn: 1 }) // Domingo
      periodName = `Semana de ${format(startDate, 'dd/MM', { locale: ptBR })} a ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`
    } else {
      startDate = startOfMonth(referenceDate)
      endDate = endOfMonth(referenceDate)
      periodName = format(referenceDate, 'MMMM yyyy', { locale: ptBR })
      periodName = periodName.charAt(0).toUpperCase() + periodName.slice(1)
    }

    // Buscar todas as transações do período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calcular totais
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Agrupar despesas por categoria
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .reduce((acc: any[], transaction) => {
        const categoryName = transaction.category!.name
        
        const existing = acc.find(item => item.category === categoryName)
        if (existing) {
          existing.amount += transaction.amount
          existing.transactions.push(transaction)
        } else {
          acc.push({
            category: categoryName,
            amount: transaction.amount,
            transactions: [transaction]
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.amount - a.amount)

    // Principais entradas
    const topIncomes = transactions
      .filter(t => t.type === 'INCOME')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Principais despesas
    const topExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const report = {
      period: periodName,
      type,
      startDate,
      endDate,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      },
      expensesByCategory,
      topIncomes,
      topExpenses,
      allTransactions: transactions
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)

