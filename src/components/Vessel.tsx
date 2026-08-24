import { DISPLAY_CAP_ML, FDV_ML, FSF_ML, SDV_ML } from "@/engine"
import { cn } from "@/lib/utils"

const MARKS = [
  { ml: FSF_ML, label: "有尿" },
  { ml: FDV_ML, label: "想尿" },
  { ml: SDV_ML, label: "很急" },
]

type Props = {
  ml: number
  gateMl: number
  locked: boolean
  wave: boolean
}

export function Vessel({ ml, gateMl, locked, wave }: Props) {
  const fill = Math.min(100, (ml / DISPLAY_CAP_ML) * 100)
  const gate = (gateMl / DISPLAY_CAP_ML) * 100

  return (
    <div className="mx-auto flex w-[min(100%,260px)] flex-col items-center">
      <div className="relative h-[min(38vh,340px)] w-full pb-2 md:h-[min(52vh,480px)]">
        <div className="absolute inset-y-0 left-1/2 w-[88px] -translate-x-1/2 md:w-[104px]">
          <div className="absolute inset-x-[9px] top-0 h-3.5 rounded-t-full border border-sluice/70 bg-card/50" />
          <div className="absolute inset-x-2 top-3 bottom-0 overflow-hidden rounded-b-[2.1rem] border border-sluice/80 bg-[hsl(204_30%_8%)] shadow-[inset_0_0_30px_rgba(80,160,170,0.18)]">
            {fill > 1 ? (
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 origin-bottom bg-[linear-gradient(180deg,#d6b24a_0%,#b8862f_70%,#8a5a18_100%)] transition-[height] duration-500",
                  wave && "animate-pulse",
                )}
                style={{ height: `${fill}%` }}
              >
                <div className="absolute inset-x-0 -top-2 h-4 rounded-[100%] bg-[#e4c56a]/80" />
              </div>
            ) : null}
            <div
              className="absolute inset-x-0 z-10 h-px bg-primary"
              style={{ bottom: `${gate}%` }}
            />
            <div className="pointer-events-none absolute inset-y-6 left-1 w-3 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="absolute top-3 bottom-0 left-[calc(50%+50px)] w-[7.2rem] md:left-[calc(50%+58px)]">
          {MARKS.map((mark) => (
            <div
              key={mark.ml}
              className="absolute left-0 flex -translate-y-1/2 items-center gap-1 text-[10px] tracking-wide text-muted-foreground"
              style={{ bottom: `${(mark.ml / DISPLAY_CAP_ML) * 100}%` }}
            >
              <span className="h-px w-3 shrink-0 bg-border" />
              <span>
                {mark.ml}
                <span className="ml-1 opacity-70">{mark.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 text-center">
        <p
          className={cn(
            "font-display text-5xl leading-none tabular-nums md:text-6xl",
            locked ? "text-urine" : "text-foreground",
          )}
        >
          {Math.round(ml)}
        </p>
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">ml</p>
      </div>
    </div>
  )
}
