import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, GitCompare, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { COUNTRIES, type CountryData } from "@/lib/simulator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const continents = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Oceania"];

const Explore = () => {
  const [q, setQ] = useState("");
  const [continent, setContinent] = useState("All");
  const [pickA, setPickA] = useState<string | null>(null);
  const [pickB, setPickB] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = useMemo(() => {
    return COUNTRIES.filter((c) => {
      const okC = continent === "All" || c.continent === continent;
      const okQ = !q || c.name.toLowerCase().includes(q.toLowerCase());
      return okC && okQ;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [q, continent]);

  const onPick = (iso: string) => {
    if (pickA === iso) { setPickA(null); return; }
    if (pickB === iso) { setPickB(null); return; }
    if (!pickA) setPickA(iso);
    else if (!pickB) setPickB(iso);
    else { setPickA(iso); setPickB(null); setAiSummary(""); }
  };

  const a = pickA ? COUNTRIES.find((c) => c.iso2 === pickA) : null;
  const b = pickB ? COUNTRIES.find((c) => c.iso2 === pickB) : null;

  const compare = async () => {
    if (!a || !b) return;
    setAiLoading(true); setAiSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("compare-countries", {
        body: { countryA: a, countryB: b },
      });
      if (error) throw error;
      setAiSummary(data?.summary ?? data?.text ?? "");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't generate comparison");
    } finally { setAiLoading(false); }
  };

  return (
    <>
      <SEO
        title="Explore countries — If I Was Born There"
        description="Search 50+ countries and compare any two side-by-side, with an AI-written summary of the differences."
        canonical="/explore"
      />

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="container relative py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Browse the dataset
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-tight mb-3">
              Every country, <span className="text-gradient-amber italic">a different life.</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Pick any two countries to compare them side-by-side. We'll have AI summarise the human story behind the data.
            </p>
          </motion.div>

          {/* COMPARE TRAY */}
          <div className="mt-10 glass-strong rounded-3xl p-6 md:p-8 grid md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-center">
            <Slot c={a} placeholder="Pick country A" />
            <GitCompare className="h-6 w-6 text-primary mx-auto hidden md:block" />
            <Slot c={b} placeholder="Pick country B" />
            <Button
              onClick={compare}
              disabled={!a || !b || aiLoading}
              className="bg-gradient-amber text-primary-foreground hover:opacity-90 h-12"
            >
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Comparing…</> : "Compare with AI"}
            </Button>
          </div>

          {(aiSummary || aiLoading) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass rounded-2xl p-6">
              <h3 className="font-display text-xl mb-2">{a?.name} vs {b?.name}</h3>
              <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {aiSummary || "Generating an AI comparison…"}
              </p>
            </motion.div>
          )}

          {/* FILTERS */}
          <div className="mt-12 grid md:grid-cols-[1fr_220px] gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a country…"
                className="h-12 pl-11 text-base"
              />
            </div>
            <Select value={continent} onValueChange={setContinent}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {continents.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* GRID */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c, i) => {
              const selected = c.iso2 === pickA || c.iso2 === pickB;
              return (
                <motion.button
                  key={c.iso2}
                  onClick={() => onPick(c.iso2)}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.4) }}
                  className={`text-left glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${
                    selected ? "border-primary ring-2 ring-primary/30 shadow-glow-amber" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{c.flag}</span>
                    <div className="min-w-0">
                      <div className="font-display text-lg leading-tight truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.continent}</div>
                    </div>
                  </div>
                  <Mini label="Life expectancy" value={`${Math.round((c.life_expectancy.male + c.life_expectancy.female)/2)} yrs`} />
                  <Mini label="Median income" value={`$${c.median_income_monthly_usd_ppp.toLocaleString()}/mo`} />
                  <Mini label="Happiness" value={`${c.happiness_score.toFixed(1)}/10`} />
                  <Mini label="Healthcare" value={`${c.healthcare_access_score}/100`} />
                </motion.button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground mt-12">No countries match those filters.</p>
          )}
        </div>
      </section>
    </>
  );
};

const Slot = ({ c, placeholder }: { c: CountryData | null; placeholder: string }) => (
  <div className={`rounded-2xl border p-4 flex items-center gap-3 min-h-[80px] ${c ? "border-primary/40 bg-primary/5" : "border-dashed border-border"}`}>
    {c ? (
      <>
        <span className="text-4xl">{c.flag}</span>
        <div>
          <div className="font-display text-lg">{c.name}</div>
          <div className="text-xs text-muted-foreground">{c.continent}</div>
        </div>
      </>
    ) : (
      <span className="text-muted-foreground text-sm">{placeholder}</span>
    )}
  </div>
);

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default Explore;
