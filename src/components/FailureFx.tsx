const ITEMS = ["🧦", "💩", "🤢"] as const

function unit(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const THROWN = ITEMS.flatMap((emoji, itemIndex) =>
  Array.from({ length: 5 }, (_, i) => {
    const seed = itemIndex * 10 + i + 1
    return {
      id: `${itemIndex}-${i}`,
      emoji,
      leftPct: unit(seed * 1.7) * 100,
      endX: (unit(seed * 2.3) - 0.5) * 200,
      endY: 40 + unit(seed * 3.1) * 20,
      delay: i * 0.3,
    }
  }),
)

export function FailureFx({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {THROWN.map((item) => (
        <span
          key={item.id}
          className="absolute animate-[throw-item_2s_forwards] text-4xl"
          style={{
            left: `${item.leftPct}vw`,
            top: -50,
            animationDelay: `${item.delay}s`,
            ["--end-x" as string]: `${item.endX}px`,
            ["--end-y" as string]: `${item.endY}vh`,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  )
}
