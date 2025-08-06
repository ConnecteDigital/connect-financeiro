import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

let client: twilio.Twilio | null = null

if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
}

export interface ReportData {
  period: string
  type: 'weekly' | 'monthly'
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
  expensesByCategory: {
    category: string
    amount: number
  }[]
  topIncomes: {
    description: string
    amount: number
    date: Date
  }[]
  topExpenses: {
    description: string
    amount: number
    date: Date
  }[]
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function generateReportMessage(report: ReportData, userName: string): string {
  const { period, summary, expensesByCategory, topIncomes, topExpenses } = report
  
  let message = `📊 *RELATÓRIO FINANCEIRO*\n`
  message += `👤 ${userName}\n`
  message += `📅 ${period}\n\n`
  
  // Resumo
  message += `💰 *RESUMO GERAL*\n`
  message += `💚 Entradas: ${formatCurrency(summary.totalIncome)}\n`
  message += `💸 Saídas: ${formatCurrency(summary.totalExpense)}\n`
  message += `${summary.balance >= 0 ? '✅' : '❌'} Resultado: ${formatCurrency(summary.balance)}\n`
  message += `📋 Total de transações: ${summary.transactionCount}\n\n`
  
  // Despesas por categoria
  if (expensesByCategory.length > 0) {
    message += `📊 *GASTOS POR CATEGORIA*\n`
    expensesByCategory.slice(0, 5).forEach((category, index) => {
      const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index] || '•'
      message += `${emoji} ${category.category}: ${formatCurrency(category.amount)}\n`
    })
    message += `\n`
  }
  
  // Principais entradas
  if (topIncomes.length > 0) {
    message += `💚 *PRINCIPAIS ENTRADAS*\n`
    topIncomes.slice(0, 3).forEach((income, index) => {
      const emoji = ['🥇', '🥈', '🥉'][index]
      message += `${emoji} ${income.description}: ${formatCurrency(income.amount)}\n`
    })
    message += `\n`
  }
  
  // Principais despesas
  if (topExpenses.length > 0) {
    message += `💸 *PRINCIPAIS DESPESAS*\n`
    topExpenses.slice(0, 3).forEach((expense, index) => {
      const emoji = ['🥇', '🥈', '🥉'][index]
      message += `${emoji} ${expense.description}: ${formatCurrency(expense.amount)}\n`
    })
    message += `\n`
  }
  
  message += `🚀 *Connect Financeiro*\n`
  message += `Seu controle financeiro sempre em dia!`
  
  return message
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!client || !whatsappNumber) {
    return {
      success: false,
      error: 'WhatsApp não configurado. Verifique as variáveis de ambiente.'
    }
  }

  try {
    // Formatar número para WhatsApp (remover caracteres especiais e adicionar código do país)
    const cleanNumber = to.replace(/\D/g, '')
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    const whatsappTo = `whatsapp:+${formattedNumber}`

    await client.messages.create({
      from: whatsappNumber,
      to: whatsappTo,
      body: message
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao enviar WhatsApp:', error)
    return {
      success: false,
      error: error.message || 'Erro ao enviar mensagem'
    }
  }
}

export async function sendReportViaWhatsApp(
  report: ReportData,
  userName: string,
  userWhatsApp: string
): Promise<{ success: boolean; error?: string }> {
  const message = generateReportMessage(report, userName)
  return await sendWhatsAppMessage(userWhatsApp, message)
}

