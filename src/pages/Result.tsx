import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Share2, ArrowLeft, Sparkles, Trophy, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Flag } from "@/components/Flag";
import { WorldMap } from "@/components/WorldMap";
import { CountryCard } from "@/components/CountryCard";
import { CountryDetailModal } from "@/components/CountryDetailModal";
import { supabase } from "@/integrations/supabase/client";
import {
  type CountryResult, type SimulationInput, type SimulationResult,
  COUNTRIES, simulate,
} from "@/lib/simulator";
import { getCurrency, fromUsdToLocal, formatLocal } from "@/lib/currency";
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
      const { data: row } = await supabase
        .from("simulations")
        .select("input,results")
        .eq("share_slug", slug)
        .maybeSingle();

      if (!cancelled) {
        if (row && row.input && row.results) {
          setData({ input: row.input as any, results: row.results as any });
        } else {
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
  const homeCurrency = getCurrency(home.iso2);
  const incomeLocal = formatLocal(fromUsdToLocal(data.input.monthlyIncomeUsd, home.iso2), home.iso2);

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
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-float-blob pointer-events-none" />
        <div className="absolute top-20 -right-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-float-blob pointer-events-none" style={{ animationDelay: "4s" }} />

        <div className="container relative py-10 md:py-20">
          <Button asChild variant="ghost" className="mb-6 -ml-2"><Link to="/simulator"><ArrowLeft className="h-4 w-4 mr-2" /> New simulation</Link></Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Your simulation is ready
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-4">
              Born in <span className="inline-flex items-baseline gap-2 align-middle"><Flag iso2={home.iso2} emoji={home.flag} size={36} /> <span className="text-gradient-amber">{home.name}</span></span>,<br/>
              your best parallel life waits in
              <br/>
              <span className="italic text-gradient-sunset inline-flex items-baseline gap-2 align-middle">
                {top && <Flag iso2={top.country.iso2} emoji={top.country.flag} size={36} />}
                {top?.country.name ?? "—"}
              </span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mb-2">
              {computed.better.length} countries would give you statistically better outcomes. {computed.worse.length} would be tougher.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground/80 mb-6">
              Based on your inputs: {data.input.age}y, {data.input.gender}, earning <span className="font-medium text-foreground">{incomeLocal}</span> ({homeCurrency.code}) ≈ ${data.input.monthlyIncomeUsd.toLocaleString()} USD/month.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={share} variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share this simulation
              </Button>
              <Button asChild className="bg-gradient-amber text-primary-foreground"><Link to="/explore">Compare countries</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MAP */}
      <section className="container pb-12">
        <div className="glass-strong rounded-3xl p-3 md:p-8 overflow-hidden">
          <h2 className="font-display text-xl md:text-3xl mb-1 px-2 md:px-0">Your world, recoloured</h2>
          <p className="text-xs md:text-sm text-muted-foreground mb-4 px-2 md:px-0">Green = better than {home.name}. Red = worse. Tap a country to dive in.</p>
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

      <Section
        icon={<Trophy className="h-5 w-5" />}
        title="Where life would be statistically better"
        subtitle={`Top ${computed.better.length} parallel lives ranked by net outcome`}
      >
        <Grid results={computed.better} onOpen={setOpenCountry} />
      </Section>

      {computed.similar.length > 0 && (
        <Section title="A familiar life" subtitle="Statistically similar to where you were born">
          <Grid results={computed.similar} onOpen={setOpenCountry} />
        </Section>
      )}

      <Section
        icon={<TrendingDown className="h-5 w-5" />}
        title="Where life would be harder"
        subtitle="A reminder of how much luck shapes a starting line"
      >
        <Grid results={computed.worse} onOpen={setOpenCountry} />
      </Section>

      <section className="container pb-20">
        <blockquote className="max-w-3xl mx-auto text-center font-display italic text-xl md:text-3xl leading-snug text-foreground/85">
          "Empathy begins when you realize <span className="text-gradient-amber">luck</span> decided your starting line."
        </blockquote>
      </section>

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
  <section className="container py-8 md:py-10">
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-amber text-primary-foreground shadow-glow-amber shrink-0">{icon}</div>}
      <div className="min-w-0">
        <h2 className="font-display text-xl md:text-3xl">{title}</h2>
        <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const Grid = ({ results, onOpen }: { results: CountryResult[]; onOpen: (r: CountryResult) => void }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
    {results.map((r, i) => (
      <motion.div
        key={r.country.iso2}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.4) }}
      >
        <CountryCard result={r} onOpen={() => onOpen(r)} />
      </motion.div>
    ))}
  </div>
);

export default Result;
