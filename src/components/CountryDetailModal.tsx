import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CountryResult, SimulationInput, getCountry } from "@/lib/simulator";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Share2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Flag } from "@/components/Flag";
import { getCurrency, fromUsdToLocal, formatLocal } from "@/lib/currency";

interface Props {
  open: boolean;
  onClose: () => void;
  result: CountryResult | null;
  input: SimulationInput;
}

export const CountryDetailModal = ({ open, onClose, result, input }: Props) => {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !result) return;
    let cancelled = false;
    setNarrative(""); setLoading(true);

    const run = async () => {
      try {
        const home = getCountry(input.countryIso2);
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/country-narrative`;
        const seed = (input as any).seed || Math.random().toString(36).slice(2, 10);
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ country: result.country, homeCountry: home, input, metrics: result.metrics, seed }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) toast.error("Too many requests. Try again shortly.");
          else if (resp.status === 402) toast.error("AI credits required. Add funds in your workspace.");
          else toast.error("Couldn't generate narrative.");
          setLoading(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";
        let done = false;
        while (!done) {
          const { value, done: d } = await reader.read();
          if (d) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { done = true; break; }
            try {
              const p = JSON.parse(json);
              const c = p.choices?.[0]?.delta?.content;
              if (c) { acc += c; if (!cancelled) setNarrative(acc); }
            } catch { buffer = line + "\n" + buffer; break; }
          }
        }
      } catch (e) {
        console.error(e);
        toast.error("Network error generating story.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [open, result, input]);

  if (!result) return null;
  const { country, metrics } = result;
  const localCurrency = getCurrency(country.iso2);
  const localIncome = formatLocal(country.median_income_monthly_usd_ppp * localCurrency.perUsd, country.iso2);

  const chartData = metrics.map((m) => ({
    name: m.label,
    theirs: m.unit === "$" ? Math.min(m.theirs, 5000) : m.theirs,
    fill: m.verdict === "better" ? "hsl(152 60% 42%)" : m.verdict === "worse" ? "hsl(0 72% 55%)" : "hsl(43 90% 55%)",
  }));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch { toast.error("Couldn't copy link"); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3 md:gap-4">
            <Flag iso2={country.iso2} emoji={country.flag} size={56} />
            <div className="min-w-0">
              <DialogTitle className="font-display text-2xl md:text-3xl truncate">{country.name}</DialogTitle>
              <p className="text-xs md:text-sm text-muted-foreground">{country.continent} · Median income {localIncome}/mo</p>
            </div>
          </div>
        </DialogHeader>

        <section className="mt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-3">
            <Sparkles className="h-3 w-3" /> AI life-story
          </div>
          <h3 className="font-display text-lg md:text-xl mb-2">If you were born in {country.name}, statistically...</h3>
          <p className="text-foreground/90 leading-relaxed min-h-[6rem] whitespace-pre-wrap text-sm md:text-base">
            {narrative || (loading ? "" : "—")}
            {loading && <Loader2 className="inline-block h-4 w-4 ml-1 animate-spin text-primary" />}
          </p>
        </section>

        <section className="mt-6">
          <h3 className="font-display text-base md:text-lg mb-3">By the numbers</h3>
          <div className="h-64 md:h-72 -mx-2">
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 90, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="hsl(215 18% 42%)" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(214 28% 88%)", borderRadius: 8 }}
                  formatter={(v: any) => Math.round(v as number)}
                />
                <Bar dataKey="theirs" radius={[4, 4, 4, 4]}>
                  {chartData.map((d, i) => (<Cell key={i} fill={d.fill} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={share} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
