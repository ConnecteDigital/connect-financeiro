import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    phone?: string
  }
}

export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Token de acesso não fornecido' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const user = await getUserFromToken(token)

      if (!user) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 401 }
        )
      }

      // Adiciona o usuário à requisição
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

