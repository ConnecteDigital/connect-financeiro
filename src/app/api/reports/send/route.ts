import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { sendReportViaWhatsApp, ReportData } from '@/lib/whatsapp'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

async function postHandler(req: AuthenticatedRequest) {
  try {
    const { type, date } = await req.json()

    if (!type || !['weekly', 'monthly'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de relatório inválido. Use "weekly" ou "monthly"' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    })

    if (!user || !user.whatsapp) {
      return NextResponse.json(
        { error: 'Usuário não possui WhatsApp cadastrado' },
        { status: 400 }
      )
    }

    const referenceDate = date ? new Date(date) : new Date()
    let startDate: Date
    let endDate: Date
    let periodName: string

    if (type === 'weekly') {
      startDate = startOfWeek(referenceDate, { weekStartsOn: 1 })
      endDate = endOfWeek(referenceDate, { weekStartsOn: 1 })
      periodName = `Semana de ${format(startDate, 'dd/MM', { locale: ptBR })} a ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`
    } else {
      startDate = startOfMonth(referenceDate)
      endDate = endOfMonth(referenceDate)
      periodName = format(referenceDate, 'MMMM yyyy', { locale: ptBR })
      periodName = periodName.charAt(0).toUpperCase() + periodName.slice(1)
    }

    // Buscar transações do período
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

    // Calcular dados do relatório
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .reduce((acc: any[], transaction) => {
        const categoryName = transaction.category!.name
        
        const existing = acc.find(item => item.category === categoryName)
        if (existing) {
          existing.amount += transaction.amount
        } else {
          acc.push({
            category: categoryName,
            amount: transaction.amount
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.amount - a.amount)

    const topIncomes = transactions
      .filter(t => t.type === 'INCOME')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(t => ({
        description: t.description,
        amount: t.amount,
        date: t.date
      }))

    const topExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(t => ({
        description: t.description,
        amount: t.amount,
        date: t.date
      }))

    const reportData: ReportData = {
      period: periodName,
      type,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      },
      expensesByCategory,
      topIncomes,
      topExpenses
    }

    // Enviar via WhatsApp
    const result = await sendReportViaWhatsApp(
      reportData,
      user.name,
      user.whatsapp
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Registrar envio no banco (opcional - para histórico)
    await prisma.reportSent.create({
      data: {
        userId: req.user!.id,
        type,
        period: periodName,
        sentAt: new Date(),
        whatsappNumber: user.whatsapp
      }
    }).catch(() => {
      // Ignora erro se a tabela não existir ainda
    })

    return NextResponse.json({
      success: true,
      message: 'Relatório enviado com sucesso via WhatsApp'
    })
  } catch (error) {
    console.error('Erro ao enviar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(postHandler)

