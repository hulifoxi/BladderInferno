import { RULES } from "@/engine"

export function RulesList() {
  return (
    <div className="space-y-5 text-sm">
      {RULES.map((section) => (
        <section key={section.title}>
          <h3 className="border-l-2 border-foreground pl-3 text-sm font-semibold">{section.title}</h3>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
