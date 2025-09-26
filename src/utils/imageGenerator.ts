// src/utils/imageGenerator.ts
// SNS用画像生成ユーティリティ
// Canvas APIを使用してMoneyCheckの結果を画像化する
// 関連ファイル: ShareButtons.tsx, result/page.tsx, premium/result/page.tsx

import { UserData } from '@/types/moneycheck'

interface ImageConfig {
  width: number
  height: number
  bgColor: string
  textColor: string
  accentColor: string
}

const CONFIGS = {
  square: { // Instagram用
    width: 1080,
    height: 1080,
    bgColor: '#1e3a8a', // blue-800
    textColor: '#ffffff',
    accentColor: '#60a5fa' // blue-400
  },
  landscape: { // Twitter用
    width: 1200,
    height: 675,
    bgColor: '#1e3a8a',
    textColor: '#ffffff',
    accentColor: '#60a5fa'
  }
} as const

export async function generateShareImage(
  score: number,
  rank: string,
  action: string,
  format: 'square' | 'landscape' = 'square',
  isPremium: boolean = false
): Promise<string> {
  const config = CONFIGS[format]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not supported')
  }

  canvas.width = config.width
  canvas.height = config.height

  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#1e3a8a')
  gradient.addColorStop(1, '#111827')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // フォント設定
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  if (format === 'square') {
    // タイトル
    ctx.fillStyle = config.textColor
    ctx.font = 'bold 64px system-ui'
    ctx.fillText('MoneyCheck', centerX, centerY - 300)

    // プレミアムバッジ
    if (isPremium) {
      ctx.fillStyle = '#fbbf24' // yellow-400
      ctx.font = 'bold 32px system-ui'
      ctx.fillText('🔥 詳細分析版', centerX, centerY - 220)
    }

    // スコア
    ctx.fillStyle = config.accentColor
    ctx.font = 'bold 120px system-ui'
    ctx.fillText(`${score}点`, centerX, centerY - 100)

    // ランク
    ctx.fillStyle = config.textColor
    ctx.font = 'bold 48px system-ui'
    ctx.fillText(`${rank}ランク`, centerX, centerY + 20)

    // アクション（テキスト折り返し）
    const maxWidth = canvas.width - 160
    const lines = wrapText(ctx, action, maxWidth, '32px system-ui')

    ctx.font = '32px system-ui'
    lines.forEach((line, index) => {
      ctx.fillText(line, centerX, centerY + 120 + (index * 40))
    })

    // URL
    ctx.fillStyle = config.accentColor
    ctx.font = '28px system-ui'
    ctx.fillText('moneycheck.app', centerX, centerY + 280)

  } else {
    // landscape レイアウト
    const leftX = canvas.width * 0.3
    const rightX = canvas.width * 0.7

    // タイトル
    ctx.fillStyle = config.textColor
    ctx.font = 'bold 48px system-ui'
    ctx.fillText('MoneyCheck', leftX, centerY - 150)

    if (isPremium) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 24px system-ui'
      ctx.fillText('🔥 詳細分析版', leftX, centerY - 100)
    }

    // スコア
    ctx.fillStyle = config.accentColor
    ctx.font = 'bold 96px system-ui'
    ctx.fillText(`${score}点`, leftX, centerY)

    // ランク
    ctx.fillStyle = config.textColor
    ctx.font = 'bold 36px system-ui'
    ctx.fillText(`${rank}ランク`, leftX, centerY + 80)

    // アクション
    const maxWidth = canvas.width * 0.4
    const lines = wrapText(ctx, action, maxWidth, '24px system-ui')

    ctx.font = '24px system-ui'
    ctx.textAlign = 'left'
    lines.forEach((line, index) => {
      ctx.fillText(line, rightX - 200, centerY - 50 + (index * 30))
    })

    // URL
    ctx.fillStyle = config.accentColor
    ctx.font = '20px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('moneycheck.app', canvas.width / 2, centerY + 200)
  }

  return canvas.toDataURL('image/png', 0.9)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string
): string[] {
  ctx.font = font
  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''

  for (const char of words) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.slice(0, 4) // 最大4行まで
}

export function generateShareText(
  score: number,
  rank: string,
  action: string,
  isPremium: boolean = false
): string {
  const version = isPremium ? '詳細分析' : '診断'
  const hashtags = '#MoneyCheck #資産診断'

  if (isPremium) {
    return `MoneyCheck ${version}結果！

スコア: ${score}点 (${rank}ランク)
改善アクション: ${action}

${hashtags} #詳細分析`
  }

  return `MoneyCheck ${version}結果！

スコア: ${score}点 (${rank}ランク)
改善アクション: ${action}

${hashtags}`
}