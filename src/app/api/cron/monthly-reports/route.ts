import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReportViaWhatsApp, ReportData } from '@/lib/whatsapp'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  try {
    // Verificar se a requisição vem do Vercel Cron
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Iniciando envio de relatórios mensais...')

    // Buscar todos os usuários com WhatsApp cadastrado
    const users = await prisma.user.findMany({
      where: {
        whatsapp: {
          not: null
        }
      }
    })

    if (users.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum usuário com WhatsApp encontrado',
        sent: 0 
      })
    }

    // Data do mês passado
    const lastMonth = subMonths(new Date(), 1)
    const startDate = startOfMonth(lastMonth)
    const endDate = endOfMonth(lastMonth)
    const periodName = format(lastMonth, 'MMMM yyyy', { locale: ptBR })
    const formattedPeriod = periodName.charAt(0).toUpperCase() + periodName.slice(1)

    let sentCount = 0
    let errors: string[] = []

    for (const user of users) {
      try {
        // Buscar transações do mês passado
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: user.id,
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

        // Se não há transações, pular usuário
        if (transactions.length === 0) {
          console.log(`Usuário ${user.name} não possui transações no mês passado`)
          continue
        }

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
          period: formattedPeriod,
          type: 'monthly',
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
          user.whatsapp!
        )

        if (result.success) {
          sentCount++
          console.log(`Relatório mensal enviado para ${user.name}`)
          
          // Registrar envio no banco
          await prisma.reportSent.create({
            data: {
              userId: user.id,
              type: 'monthly',
              period: formattedPeriod,
              sentAt: new Date(),
              whatsappNumber: user.whatsapp!
            }
          }).catch(() => {
            // Ignora erro se a tabela não existir
          })
        } else {
          errors.push(`${user.name}: ${result.error}`)
          console.error(`Erro ao enviar para ${user.name}:`, result.error)
        }

        // Aguardar 2 segundos entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        errors.push(`${user.name}: ${error}`)
        console.error(`Erro ao processar usuário ${user.name}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Relatórios mensais processados',
      sent: sentCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Erro no cron job mensal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

