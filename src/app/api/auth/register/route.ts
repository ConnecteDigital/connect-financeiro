import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json()

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Cria o usuário
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    // Cria categorias padrão para o usuário
    const defaultCategories = [
      { name: 'Gasolina', color: '#ef4444' },
      { name: 'Funcionário', color: '#3b82f6' },
      { name: 'Fornecedores', color: '#8b5cf6' },
      { name: 'Material', color: '#10b981' },
      { name: 'Impostos', color: '#f59e0b' },
      { name: 'Outros', color: '#6b7280' }
    ]

    await prisma.category.createMany({
      data: defaultCategories.map(category => ({
        ...category,
        userId: user.id
      }))
    })

    // Gera token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user,
      token
    })

  } catch (error) {
    console.error('Erro no cadastro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

