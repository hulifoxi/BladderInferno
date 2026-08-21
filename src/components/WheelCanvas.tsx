import { useEffect, useRef } from "react"
import { SPIN_DURATION_MS } from "@/game"
import type { WheelKind, WheelSector } from "@/game/types"
import { cn } from "@/lib/utils"

const REWARD_COLORS: [string, string][] = [
  ["#FFD700", "#FFA500"],
  ["#FFC300", "#FF8C00"],
  ["#FFBF00", "#FF8C00"],
  ["#FFD700", "#FF8C00"],
]

const PUNISHMENT_COLORS: [string, string][] = [
  ["#DC143C", "#B22222"],
  ["#FF0000", "#8B0000"],
  ["#FF3333", "#CC0000"],
  ["#FF4500", "#CC0000"],
]

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = []
  let line = ""
  for (const char of text) {
    const test = line + char
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function paintWheel(
  canvas: HTMLCanvasElement,
  sectors: WheelSector[],
  kind: WheelKind,
  rotationAngle: number,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx || sectors.length === 0) return

  const dpr = window.devicePixelRatio || 1
  const size = canvas.clientWidth
  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const centerX = size / 2
  const centerY = size / 2
  const radius = Math.min(centerX, centerY) - 20

  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotationAngle)
  ctx.translate(-centerX, -centerY)

  const bgGradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius,
  )
  bgGradient.addColorStop(0, "rgba(42, 42, 42, 0.8)")
  bgGradient.addColorStop(1, "rgba(26, 26, 26, 0.8)")
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, size, size)

  const anglePerSector = (Math.PI * 2) / sectors.length
  const colors = kind === "reward" ? REWARD_COLORS : PUNISHMENT_COLORS

  for (let i = 0; i < sectors.length; i++) {
    const startAngle = i * anglePerSector
    const endAngle = (i + 1) * anglePerSector
    const gradient = ctx.createLinearGradient(
      centerX + Math.cos(startAngle) * radius,
      centerY + Math.sin(startAngle) * radius,
      centerX + Math.cos(endAngle) * radius,
      centerY + Math.sin(endAngle) * radius,
    )
    gradient.addColorStop(0, colors[i % colors.length][0])
    gradient.addColorStop(1, colors[i % colors.length][1])

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
    ctx.lineWidth = 2
    ctx.stroke()

    const textRadius = radius * 0.62
    const textAngle = startAngle + anglePerSector / 2
    const textX = centerX + Math.cos(textAngle) * textRadius
    const textY = centerY + Math.sin(textAngle) * textRadius

    ctx.save()
    ctx.translate(textX, textY)
    ctx.rotate(textAngle)
    ctx.fillStyle = "#fff"
    ctx.font = "bold 13px 'PingFang SC', 'Microsoft YaHei', sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)"
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const lines = wrapText(ctx, sectors[i].label, radius * 0.42)
    const lineHeight = 16
    lines.forEach((line, index) => {
      ctx.fillText(line, 0, (index - (lines.length - 1) / 2) * lineHeight)
    })
    ctx.restore()
  }

  ctx.restore()

  const hub = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 35)
  hub.addColorStop(0, "#fff")
  hub.addColorStop(0.5, "#ddd")
  hub.addColorStop(1, "#bbb")
  ctx.beginPath()
  ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
  ctx.fillStyle = hub
  ctx.fill()
  ctx.strokeStyle = "#aaa"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
  ctx.lineWidth = 4
  ctx.stroke()
}

type WheelCanvasProps = {
  sectors: WheelSector[]
  kind: WheelKind | null
  visible: boolean
  spinToken: number
  targetIndex: number
  onSpinComplete: (index: number) => void
}

export function WheelCanvas({
  sectors,
  kind,
  visible,
  spinToken,
  targetIndex,
  onSpinComplete,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible || !kind || sectors.length === 0) return

    const redraw = () => paintWheel(canvas, sectors, kind, angleRef.current)
    redraw()

    const observer = new ResizeObserver(redraw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [sectors, kind, visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || spinToken === 0 || !kind || sectors.length === 0) return

    const anglePerSector = (Math.PI * 2) / sectors.length
    const targetAngle =
      (Math.PI * 3) / 2 -
      targetIndex * anglePerSector -
      anglePerSector / 2
    const extraRotations = 5 * Math.PI * 2
    let finalAngle = targetAngle + extraRotations
    while (finalAngle < angleRef.current) {
      finalAngle += Math.PI * 2
    }

    const startAngle = angleRef.current
    const startTime = performance.now()
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / SPIN_DURATION_MS)
      const current =
        startAngle + (finalAngle - startAngle) * easeOutExpo(progress)
      angleRef.current = current
      paintWheel(canvas, sectors, kind, current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        angleRef.current = finalAngle % (Math.PI * 2)
        paintWheel(canvas, sectors, kind, angleRef.current)
        onSpinComplete(targetIndex)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [spinToken, targetIndex, sectors, kind, onSpinComplete])

  return (
    <div
      className={cn(
        "relative mx-auto mt-4 mb-2 aspect-square w-[min(90vw,28rem)]",
        !visible && "hidden",
      )}
    >
      <div
        className="absolute top-[-10px] left-1/2 z-10 -translate-x-1/2 border-x-[20px] border-t-[35px] border-x-transparent border-t-sky-500 drop-shadow-md"
        aria-hidden
      />
      <canvas ref={canvasRef} className="size-full rounded-full" />
    </div>
  )
}
