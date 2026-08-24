import { useEffect, useRef, useState } from "react"
import type { Sector } from "@/engine"
import { cn } from "@/lib/utils"

type Props = {
  sectors: Sector[]
  spinning: boolean
  landedIndex: number | null
  onLand: (index: number) => void
}

const CX = 100
const CY = 100
const OUTER = 90
const INNER = 23
const LABEL_R = 58
const SPIN_MS = 3200

export function WheelDisc({ sectors, spinning, landedIndex, onLand }: Props) {
  const [turn, setTurn] = useState(0)
  const n = Math.max(sectors.length, 1)
  const slice = 360 / n
  const onLandRef = useRef(onLand)
  const fontSize = n > 8 ? 6.5 : 7.1
  const revealed = landedIndex != null && !spinning

  useEffect(() => {
    onLandRef.current = onLand
  })

  useEffect(() => {
    if (!spinning || sectors.length === 0) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const index = Math.floor(Math.random() * sectors.length)
    const landing = -(index * slice + slice / 2)
    const ms = reduce ? 0 : SPIN_MS
    setTurn((prev) => Math.ceil((prev + 1) / 360) * 360 + (reduce ? 0 : 360 * 5) + landing)
    const id = window.setTimeout(() => onLandRef.current(index), ms)
    return () => window.clearTimeout(id)
  }, [spinning, sectors.length, slice])

  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,19rem)] overflow-visible p-3">
      <svg
        viewBox="0 0 200 200"
        className="pointer-events-none size-full overflow-visible"
        role="img"
        aria-label="转盘"
      >
        <g
          style={{
            transform: `rotate(${turn}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
            transition: spinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.72, 0.08, 1)`
              : "none",
          }}
        >
          {sectors.map((sector, index) => {
            const start = -90 + index * slice
            const end = start + slice
            const won = revealed && index === landedIndex
            return (
              <path
                key={`${sector.id}-${index}`}
                d={sectorPath(start, end)}
                className={cn(
                  "stroke-none transition-[fill,opacity] duration-500 motion-reduce:duration-0",
                  won
                    ? sector.kind === "reward"
                      ? "fill-primary/40"
                      : "fill-destructive/35"
                    : sector.kind === "reward"
                      ? index % 2 === 0
                        ? "fill-primary/18"
                        : "fill-primary/12"
                      : index % 2 === 0
                        ? "fill-foreground/[0.08]"
                        : "fill-foreground/[0.045]",
                  revealed && !won && "opacity-35",
                )}
              />
            )
          })}
          {sectors.map((_, index) => {
            const a = -90 + index * slice
            const inner = polar(INNER, a)
            const outer = polar(OUTER, a)
            return (
              <line
                key={`d-${index}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className="stroke-border/80"
                strokeWidth="0.55"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
          {sectors.map((sector, index) => {
            const mid = -90 + (index + 0.5) * slice
            const pos = polar(LABEL_R, mid)
            const won = revealed && index === landedIndex
            const rot = mid + 90
            const lines = wrapLabel(sector.label, n > 8 ? 5.6 : 6.8)
            const lineHeight = fontSize + 1.4
            return (
              <g
                key={`t-${sector.id}-${index}`}
                transform={`translate(${pos.x} ${pos.y}) rotate(${rot})`}
                className={cn(
                  "transition-opacity duration-500 motion-reduce:duration-0",
                  revealed && !won && "opacity-35",
                )}
              >
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn("font-sans", won ? "fill-foreground" : "fill-foreground/70")}
                  style={{ fontSize: won ? fontSize + 0.35 : fontSize, fontWeight: won ? 600 : 500 }}
                >
                  {lines.map((line, lineIndex) => (
                    <tspan
                      key={`${sector.id}-${lineIndex}`}
                      x={0}
                      y={(lineIndex - (lines.length - 1) / 2) * lineHeight}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            )
          })}
        </g>

        <circle
          cx={CX}
          cy={CY}
          r={OUTER}
          className="fill-none stroke-sluice/80"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={CX}
          cy={CY}
          r={INNER}
          className="fill-[hsl(204_30%_8%)] stroke-sluice/70"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={CX} cy={CY} r="2.2" className="fill-primary" />

        <g aria-hidden>
          <line
            x1={CX}
            y1="3"
            x2={CX}
            y2="10"
            className="stroke-primary"
            strokeWidth="1.25"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <polygon points="100,18 96.6,9.5 103.4,9.5" className="fill-primary" />
        </g>
      </svg>
    </div>
  )
}

function polar(radius: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  }
}

function sectorPath(startDeg: number, endDeg: number) {
  const outerStart = polar(OUTER, startDeg)
  const outerEnd = polar(OUTER, endDeg)
  const innerEnd = polar(INNER, endDeg)
  const innerStart = polar(INNER, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    "Z",
  ].join(" ")
}

function wrapLabel(text: string, maxUnits = 6.2): string[] {
  const width = (s: string) =>
    [...s].reduce((n, ch) => n + (ch.charCodeAt(0) < 256 ? 0.52 : 1), 0)
  const lines: string[] = []
  let line = ""

  for (const ch of text) {
    const trial = line + ch
    if (width(trial) > maxUnits && line) {
      lines.push(line.trim())
      line = ch === " " ? "" : ch
    } else {
      line = trial
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines.slice(0, 3)
}
