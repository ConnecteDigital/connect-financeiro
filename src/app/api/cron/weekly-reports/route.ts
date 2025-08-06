import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReportViaWhatsApp, ReportData } from '@/lib/whatsapp'
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function GET(req: NextRequest) {
  try {
    // Verificar se a requisição vem do Vercel Cron
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Iniciando envio de relatórios semanais...')

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

    // Data da semana passada (domingo)
    const lastSunday = subWeeks(new Date(), 1)
    const startDate = startOfWeek(lastSunday, { weekStartsOn: 1 })
    const endDate = endOfWeek(lastSunday, { weekStartsOn: 1 })
    const periodName = `Semana de ${format(startDate, 'dd/MM', { locale: ptBR })} a ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`

    let sentCount = 0
    let errors: string[] = []

    for (const user of users) {
      try {
        // Buscar transações da semana passada
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
          console.log(`Usuário ${user.name} não possui transações na semana passada`)
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
          period: periodName,
          type: 'weekly',
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
          console.log(`Relatório semanal enviado para ${user.name}`)
          
          // Registrar envio no banco
          await prisma.reportSent.create({
            data: {
              userId: user.id,
              type: 'weekly',
              period: periodName,
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

        // Aguardar 1 segundo entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        errors.push(`${user.name}: ${error}`)
        console.error(`Erro ao processar usuário ${user.name}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Relatórios semanais processados',
      sent: sentCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Erro no cron job semanal:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

