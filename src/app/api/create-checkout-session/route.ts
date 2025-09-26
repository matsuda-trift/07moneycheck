// src/app/api/create-checkout-session/route.ts
// Stripe Checkout Session作成API - 500円決済処理
// 決済完了後は/premium/resultにリダイレクト
// 関連: premium/page.tsx, webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2025-08-27.basil',
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { totalScore, rank } = body

    // 環境変数チェック
    if (!process.env.STRIPE_SECRET_KEY_TEST && !process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe API keys not configured')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // アプリケーションURL取得
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Stripe Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_1SBWdBFynhtoF9fsVyIGa6uH',
          quantity: 1,
        },
      ],
      success_url: `${origin}/premium/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/premium?canceled=true`,
      metadata: {
        totalScore: totalScore.toString(),
        rank,
        productType: 'premium_analysis',
      },
      // 決済期限（30分）
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      // ユーザー情報収集（オプション）
      billing_address_collection: 'auto',
      // 重複決済防止
      client_reference_id: `${totalScore}_${rank}_${Date.now()}`,
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Stripe session creation error:', error)

    // エラーの詳細をログに記録（本番環境では機密情報を除外）
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error code:', error.code)
      console.error('Stripe error message:', error.message)

      return NextResponse.json(
        { error: 'Payment session creation failed', code: error.code },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for session validation (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      metadata: session.metadata,
    })

  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    )
  }
}