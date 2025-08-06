import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

async function getHandler(req: AuthenticatedRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.user!.id
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const { name, color } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se já existe uma categoria com esse nome para o usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId: req.user!.id
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#f97316', // Laranja padrão
        userId: req.user!.id
      }
    })

    return NextResponse.json({
      message: 'Categoria criada com sucesso',
      category
    })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)

