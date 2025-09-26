// src/app/api/webhooks/stripe/route.ts
// Stripe Webhookハンドラー - 決済完了通知処理
// 決済成功時の処理とセキュリティ検証を実装
// 関連: create-checkout-session/route.ts, premium/result/page.tsx

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2025-08-27.basil',
  }
)

// Webhook署名検証用
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Webhook署名検証
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // イベントタイプ別処理
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session

        // 決済完了時の処理
        console.log('Payment successful for session:', session.id)
        console.log('Customer email:', session.customer_details?.email)
        console.log('Amount paid:', session.amount_total)
        console.log('Metadata:', session.metadata)

        // 必要に応じて追加処理
        // - メール送信
        // - 分析データ保存（ただし、プロジェクト制約でDB不使用）
        // - 外部サービス通知

        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session
        console.log('Session expired:', expiredSession.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET method for webhook endpoint verification (optional)
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}