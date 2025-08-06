import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  return NextResponse.json({
    user: req.user
  })
}

export const GET = withAuth(handler)

