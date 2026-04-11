/**
 * Draw a 4-axis radar chart on a canvas.
 */
export function drawRadarChart(
  canvas: HTMLCanvasElement,
  values: { calories: number; color: number; aroma: number; taste: number },
  maxValue: number = 800,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = Math.min(cx, cy) - 30

  ctx.clearRect(0, 0, w, h)

  const labels = ['卡路里', '色', '香', '味']
  const keys = ['calories', 'color', 'aroma', 'taste'] as const
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / 4 - Math.PI / 2)

  // Draw grid circles
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  for (let level = 1; level <= 4; level++) {
    const r = (radius * level) / 4
    ctx.beginPath()
    for (let i = 0; i <= 4; i++) {
      const a = angles[i % 4]
      const x = cx + r * Math.cos(a)
      const y = cy + r * Math.sin(a)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = '#d1d5db'
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + radius * Math.cos(angles[i]), cy + radius * Math.sin(angles[i]))
    ctx.stroke()
  }

  // Draw data polygon
  const clamp = (v: number) => Math.max(0, Math.min(v, maxValue))
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const val = clamp(values[keys[i]])
    const r = (val / maxValue) * radius
    const x = cx + r * Math.cos(angles[i])
    const y = cy + r * Math.sin(angles[i])
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(255, 107, 53, 0.25)'
  ctx.fill()
  ctx.strokeStyle = '#FF6B35'
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Draw data points
  for (let i = 0; i < 4; i++) {
    const val = clamp(values[keys[i]])
    const r = (val / maxValue) * radius
    const x = cx + r * Math.cos(angles[i])
    const y = cy + r * Math.sin(angles[i])
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#FF6B35'
    ctx.fill()
  }

  // Draw labels
  ctx.fillStyle = '#374151'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  for (let i = 0; i < 4; i++) {
    const lx = cx + (radius + 20) * Math.cos(angles[i])
    const ly = cy + (radius + 20) * Math.sin(angles[i])
    ctx.fillText(labels[i], lx, ly + 5)
  }
}
