import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, GitCompare, Sparkles, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { Flag } from "@/components/Flag";
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

  const compareRows: Array<{ label: string; a: string; b: string; aHigher: boolean }> = a && b ? [
    { label: "Life expectancy", a: `${Math.round((a.life_expectancy.male + a.life_expectancy.female)/2)} yrs`, b: `${Math.round((b.life_expectancy.male + b.life_expectancy.female)/2)} yrs`, aHigher: ((a.life_expectancy.male + a.life_expectancy.female) > (b.life_expectancy.male + b.life_expectancy.female)) },
    { label: "Median income", a: `$${a.median_income_monthly_usd_ppp.toLocaleString()}/mo`, b: `$${b.median_income_monthly_usd_ppp.toLocaleString()}/mo`, aHigher: a.median_income_monthly_usd_ppp > b.median_income_monthly_usd_ppp },
    { label: "Healthcare", a: `${a.healthcare_access_score}/100`, b: `${b.healthcare_access_score}/100`, aHigher: a.healthcare_access_score > b.healthcare_access_score },
    { label: "Education", a: `${a.literacy_rate}%`, b: `${b.literacy_rate}%`, aHigher: a.literacy_rate > b.literacy_rate },
    { label: "Gender equality", a: `${a.gender_equality_index}/100`, b: `${b.gender_equality_index}/100`, aHigher: a.gender_equality_index > b.gender_equality_index },
    { label: "Happiness", a: `${a.happiness_score.toFixed(1)}/10`, b: `${b.happiness_score.toFixed(1)}/10`, aHigher: a.happiness_score > b.happiness_score },
  ] : [];

  return (
    <>
      <SEO
        title="Explore countries — If I Was Born There"
        description="Search 50+ countries and compare any two side-by-side, with an AI-written summary of the differences."
        canonical="/explore"
      />

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-float-blob pointer-events-none" />
        <div className="container relative py-10 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Browse the dataset
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-3">
              Every country, <span className="text-gradient-amber italic">a different life.</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Pick any two countries to compare them side-by-side — laws, freedoms, daily life. AI summarises the human story behind the data.
            </p>
          </motion.div>

          {/* COMPARE TRAY */}
          <div className="mt-8 md:mt-10 glass-strong rounded-3xl p-4 md:p-8 grid md:grid-cols-[1fr_auto_1fr_auto] gap-3 md:gap-4 items-stretch">
            <Slot c={a} placeholder="Pick country A" onClear={() => { setPickA(null); setAiSummary(""); }} />
            <GitCompare className="h-6 w-6 text-primary mx-auto self-center hidden md:block" />
            <Slot c={b} placeholder="Pick country B" onClear={() => { setPickB(null); setAiSummary(""); }} />
            <Button
              onClick={compare}
              disabled={!a || !b || aiLoading}
              className="bg-gradient-amber text-primary-foreground hover:opacity-90 h-12 md:h-auto"
            >
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Comparing…</> : "Compare with AI"}
            </Button>
          </div>

          {/* SIDE BY SIDE */}
          {a && b && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Flag iso2={a.iso2} emoji={a.flag} size={44} />
                  <div className="font-display text-xl">{a.name}</div>
                </div>
                <ul className="space-y-2 text-sm">
                  {compareRows.map((r) => (
                    <li key={r.label} className="flex justify-between items-center border-b border-border/40 pb-1 last:border-0">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-medium ${r.aHigher ? "text-success" : "text-foreground/70"}`}>{r.a}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Flag iso2={b.iso2} emoji={b.flag} size={44} />
                  <div className="font-display text-xl">{b.name}</div>
                </div>
                <ul className="space-y-2 text-sm">
                  {compareRows.map((r) => (
                    <li key={r.label} className="flex justify-between items-center border-b border-border/40 pb-1 last:border-0">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-medium ${!r.aHigher ? "text-success" : "text-foreground/70"}`}>{r.b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {(aiSummary || aiLoading) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 glass-strong rounded-2xl p-5 md:p-6">
              <h3 className="font-display text-lg md:text-xl mb-2 inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {a?.name} vs {b?.name}</h3>
              <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {aiSummary || "Generating an AI comparison…"}
              </p>
            </motion.div>
          )}

          {/* FILTERS */}
          <div className="mt-10 md:mt-12 grid md:grid-cols-[1fr_220px] gap-3">
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
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
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
                  className={`text-left glass rounded-2xl p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-card ${
                    selected ? "border-primary ring-2 ring-primary/40 shadow-glow-amber" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Flag iso2={c.iso2} emoji={c.flag} size={40} />
                    <div className="min-w-0">
                      <div className="font-display text-base md:text-lg leading-tight truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.continent}</div>
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

const Slot = ({ c, placeholder, onClear }: { c: CountryData | null; placeholder: string; onClear: () => void }) => (
  <div className={`relative rounded-2xl border p-4 flex items-center gap-3 min-h-[80px] ${c ? "border-primary/40 bg-primary/5" : "border-dashed border-border"}`}>
    {c ? (
      <>
        <Flag iso2={c.iso2} emoji={c.flag} size={44} />
        <div className="min-w-0">
          <div className="font-display text-base md:text-lg truncate">{c.name}</div>
          <div className="text-xs text-muted-foreground">{c.continent}</div>
        </div>
        <button onClick={onClear} aria-label="Remove" className="absolute top-2 right-2 p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
          <X className="h-4 w-4" />
        </button>
      </>
    ) : (
      <span className="text-muted-foreground text-sm">{placeholder}</span>
    )}
  </div>
);

const Mini = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0 gap-2">
    <span className="text-muted-foreground truncate">{label}</span>
    <span className="font-medium whitespace-nowrap">{value}</span>
  </div>
);

export default Explore;
