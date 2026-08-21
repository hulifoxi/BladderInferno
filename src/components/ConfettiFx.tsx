function unit(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const COLORS = ["#ffd700", "#ffa500", "#ff4500", "#ff69b4", "#1e90ff", "#32cd32"]

const PIECES = Array.from({ length: 50 }, (_, id) => ({
  id,
  left: unit(id + 1.1) * 100,
  color: COLORS[Math.floor(unit(id + 2.2) * COLORS.length)],
  delay: unit(id + 3.3) * 3,
  rotate: unit(id + 4.4) * 360,
}))

export function ConfettiFx({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-[-20px] h-5 w-2.5 animate-[confetti-fall_5s_linear_infinite]"
          style={{
            left: `${piece.left}vw`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
