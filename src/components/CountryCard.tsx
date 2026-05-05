import { CountryResult, verdictBg } from "@/lib/simulator";
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/Flag";

const fmt = (n: number, unit: string) => {
  if (unit === "$") return `$${Math.round(n).toLocaleString()}`;
  if (unit === "%" || unit === "/100") return `${Math.round(n)}${unit}`;
  if (unit === "/10") return `${n.toFixed(1)}${unit}`;
  return `${Math.round(n)}${unit}`;
};

const Icon = ({ v }: { v: "better" | "similar" | "worse" }) =>
  v === "better" ? <TrendingUp className="h-3.5 w-3.5" /> :
  v === "worse"  ? <TrendingDown className="h-3.5 w-3.5" /> :
  <Minus className="h-3.5 w-3.5" />;

interface Props { result: CountryResult; onOpen: () => void; }

export const CountryCard = ({ result, onOpen }: Props) => {
  const { country, metrics, score } = result;
  const tone = score > 0 ? "success" : score < 0 ? "destructive" : "warning";
  const toneCls =
    tone === "success" ? "border-success/30 hover:border-success/50" :
    tone === "destructive" ? "border-destructive/30 hover:border-destructive/50" :
    "border-warning/30 hover:border-warning/50";

  return (
    <div className={`glass rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-card ${toneCls} flex flex-col`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Flag iso2={country.iso2} emoji={country.flag} size={44} />
          <div className="min-w-0">
            <div className="font-display text-lg leading-tight truncate">{country.name}</div>
            <div className="text-[11px] text-muted-foreground">{country.continent}</div>
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full font-medium tabular-nums shrink-0 ${score > 0 ? "bg-success/15 text-success" : score < 0 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>
          {score > 0 ? `+${score}` : score}
        </div>
      </div>

      <ul className="space-y-1.5 text-sm flex-1">
        {metrics.map((m) => (
          <li key={m.key} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-[13px] truncate">{m.label}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border whitespace-nowrap ${verdictBg[m.verdict]}`}>
              <Icon v={m.verdict} />
              {fmt(m.theirs, m.unit)}
            </span>
          </li>
        ))}
      </ul>

      <Button onClick={onOpen} variant="ghost" size="sm" className="mt-4 self-start text-primary hover:text-primary hover:bg-primary/10 px-2">
        Read your story <ArrowRight className="h-3.5 w-3.5 ml-1" />
      </Button>
    </div>
  );
};
