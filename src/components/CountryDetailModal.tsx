import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CountryResult, SimulationInput, getCountry } from "@/lib/simulator";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ country: result.country, homeCountry: home, input, metrics: result.metrics }),
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

  const chartData = metrics.map((m) => ({
    name: m.label,
    yours: m.unit === "$" ? Math.min(m.yours, m.theirs * 3) : m.yours,
    theirs: m.theirs,
    fill: m.verdict === "better" ? "hsl(158 64% 52%)" : m.verdict === "worse" ? "hsl(0 84% 60%)" : "hsl(43 96% 56%)",
  }));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch { toast.error("Couldn't copy link"); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <span className="text-5xl" aria-hidden>{country.flag}</span>
            <div>
              <DialogTitle className="font-display text-3xl">{country.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{country.continent}</p>
            </div>
          </div>
        </DialogHeader>

        <section className="mt-2">
          <h3 className="font-display text-xl mb-2">If you were born in {country.name}, statistically...</h3>
          <p className="text-foreground/90 leading-relaxed min-h-[6rem] whitespace-pre-wrap">
            {narrative || (loading ? "" : "—")}
            {loading && <Loader2 className="inline-block h-4 w-4 ml-1 animate-spin text-primary" />}
          </p>
        </section>

        <section className="mt-6">
          <h3 className="font-display text-lg mb-3">By the numbers</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 110 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="hsl(220 9% 64%)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(220 26% 12%)", border: "1px solid hsl(220 18% 22%)", borderRadius: 8 }}
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
          <Button onClick={share} variant="outline">
            <Share2 className="h-4 w-4 mr-2" /> Share this country
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
