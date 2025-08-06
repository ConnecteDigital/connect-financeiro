import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: req.user!.id
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.description = {
        contains: search
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const { description, amount, type, date, categoryId } = await req.json()

    if (!description || !amount || !type || !date) {
      return NextResponse.json(
        { error: 'Descrição, valor, tipo e data são obrigatórios' },
        { status: 400 }
      )
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Tipo deve ser INCOME ou EXPENSE' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Para despesas, categoria é obrigatória
    if (type === 'EXPENSE' && !categoryId) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória para despesas' },
        { status: 400 }
      )
    }

    // Verifica se a categoria pertence ao usuário (se fornecida)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: req.user!.id
        }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 404 }
        )
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date(date),
        categoryId: categoryId || null,
        userId: req.user!.id
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      message: 'Transação criada com sucesso',
      transaction
    })
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)

