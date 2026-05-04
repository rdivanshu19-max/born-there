import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, ArrowLeft, Sparkles, Trophy, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { WorldMap } from "@/components/WorldMap";
import { CountryCard } from "@/components/CountryCard";
import { CountryDetailModal } from "@/components/CountryDetailModal";
import { supabase } from "@/integrations/supabase/client";
import {
  type CountryResult, type SimulationInput, type SimulationResult,
  COUNTRIES, simulate,
} from "@/lib/simulator";
import { toast } from "sonner";

const Result = () => {
  const { slug } = useParams();
  const [data, setData] = useState<{ input: SimulationInput; results: SimulationResult } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCountry, setOpenCountry] = useState<CountryResult | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { data: row, error } = await supabase
        .from("simulations")
        .select("input,results")
        .eq("share_slug", slug)
        .maybeSingle();

      if (!cancelled) {
        if (row && row.input && row.results) {
          setData({ input: row.input as any, results: row.results as any });
        } else {
          // localStorage fallback
          const local = localStorage.getItem(`sim:${slug}`);
          if (local) {
            const parsed = JSON.parse(local);
            setData({ input: parsed.input, results: parsed.results });
          }
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Recompute results from input if needed (in case shape evolves)
  const computed = useMemo(() => {
    if (!data) return null;
    if (data.results?.ranked?.length) return data.results;
    return simulate(data.input);
  }, [data]);

  const home = data ? COUNTRIES.find((c) => c.iso2 === data.input.countryIso2) : null;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch { toast.error("Couldn't copy link"); }
  };

  if (loading) {
    return (
      <div className="container py-32 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || !computed || !home) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-3xl mb-3">Simulation not found</h1>
        <p className="text-muted-foreground mb-6">This link may have expired.</p>
        <Button asChild><Link to="/simulator">Run a new simulation</Link></Button>
      </div>
    );
  }

  const top = computed.better[0];
  const worst = computed.ranked[computed.ranked.length - 1];

  return (
    <>
      <SEO
        title={`Your parallel lives — ${top?.country.name ?? "Results"}`}
        description={`Born in ${home.name}, your statistical best parallel life is in ${top?.country.name ?? "another country"}. Explore your simulation.`}
        canonical={`/result/${slug}`}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="container relative py-14 md:py-20">
          <Button asChild variant="ghost" className="mb-6 -ml-2"><Link to="/simulator"><ArrowLeft className="h-4 w-4 mr-2" /> New simulation</Link></Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Your simulation is ready
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">
              Born in <span className="text-gradient-amber">{home.flag} {home.name}</span>,<br/>
              your best parallel life waits in
              <br/>
              <span className="italic text-gradient-sunset">
                {top?.country.flag} {top?.country.name ?? "—"}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mb-6">
              {computed.better.length} countries would give you statistically better outcomes. {computed.worse.length} would be tougher. Hover the map, then click a card to read your story there.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={share} variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share this simulation
              </Button>
              <Button asChild className="bg-gradient-amber text-primary-foreground"><Link to="/explore">Explore all countries</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MAP */}
      <section className="container pb-12">
        <div className="glass-strong rounded-3xl p-4 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl mb-1">Your world, recoloured</h2>
          <p className="text-sm text-muted-foreground mb-5">Green = better than {home.name}. Red = worse. Click a coloured country to dive in.</p>
          <WorldMap
            results={computed.ranked}
            homeIso2={home.iso2}
            onSelect={(iso3) => {
              const r = computed.ranked.find((x) => x.country.iso3 === iso3);
              if (r) setOpenCountry(r);
            }}
          />
        </div>
      </section>

      {/* TOP */}
      <Section
        icon={<Trophy className="h-5 w-5" />}
        title="Where life would be statistically better"
        subtitle={`Top ${computed.better.length} parallel lives ranked by net outcome`}
      >
        <Grid results={computed.better} onOpen={setOpenCountry} />
      </Section>

      {/* SIMILAR */}
      {computed.similar.length > 0 && (
        <Section title="A familiar life" subtitle="Statistically similar to where you were born">
          <Grid results={computed.similar} onOpen={setOpenCountry} />
        </Section>
      )}

      {/* WORSE */}
      <Section
        icon={<TrendingDown className="h-5 w-5" />}
        title="Where life would be harder"
        subtitle="A reminder of how much luck shapes a starting line"
      >
        <Grid results={computed.worse} onOpen={setOpenCountry} />
      </Section>

      {worst && (
        <section className="container pb-20">
          <blockquote className="max-w-3xl mx-auto text-center font-display italic text-2xl md:text-3xl leading-snug text-foreground/85">
            "Empathy begins when you realize <span className="text-gradient-amber">luck</span> decided your starting line."
          </blockquote>
        </section>
      )}

      <CountryDetailModal
        open={!!openCountry}
        onClose={() => setOpenCountry(null)}
        result={openCountry}
        input={data.input}
      />
    </>
  );
};

const Section = ({ icon, title, subtitle, children }: { icon?: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) => (
  <section className="container py-10">
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-amber text-primary-foreground shadow-glow-amber">{icon}</div>}
      <div>
        <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const Grid = ({ results, onOpen }: { results: CountryResult[]; onOpen: (r: CountryResult) => void }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {results.map((r, i) => (
      <motion.div
        key={r.country.iso2}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.45, delay: i * 0.04 }}
      >
        <CountryCard result={r} onOpen={() => onOpen(r)} />
      </motion.div>
    ))}
  </div>
);

export default Result;
