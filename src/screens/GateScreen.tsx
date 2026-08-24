import { useState } from "react"
import { DISCLAIMER } from "@/engine"
import { Button } from "@/components/ui/button"

export function GateScreen({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 px-5 py-10">
      <header className="space-y-2 border-b border-border pb-4">
        <p className="text-xs text-muted-foreground">
          适用产品：{DISCLAIMER.product}
          <span className="mx-2 text-border">|</span>
          生效日期：{DISCLAIMER.effective}
        </p>
        <h1 className="text-2xl font-medium tracking-wide">{DISCLAIMER.title}</h1>
      </header>

      <p className="text-sm leading-7 text-muted-foreground">{DISCLAIMER.preamble}</p>

      <div className="max-h-[min(48vh,28rem)] space-y-5 overflow-y-auto rounded-md border border-border bg-card/50 p-4">
        {DISCLAIMER.articles.map((article) => (
          <section key={article.heading} className="space-y-1.5">
            <h2 className="text-sm font-medium">{article.heading}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{article.body}</p>
          </section>
        ))}
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-primary"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>{DISCLAIMER.checkbox}</span>
      </label>

      <Button size="lg" disabled={!agreed} onClick={onAccept}>
        {DISCLAIMER.accept}
      </Button>
    </main>
  )
}
