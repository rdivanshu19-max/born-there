import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { SEO } from "@/components/SEO";
import { Flag } from "@/components/Flag";
import { COUNTRIES, simulate, type Education, type Gender, type SimulationInput } from "@/lib/simulator";
import { getCurrency, fromLocalToUsd, fromUsdToLocal, formatLocal } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Simulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>("female");
  const [countryIso2, setCountry] = useState("IN");
  const [incomeUsd, setIncomeUsd] = useState(500);
  const [education, setEducation] = useState<Education>("university");
  const [employed, setEmployed] = useState(true);
  const [busy, setBusy] = useState(false);

  const sortedCountries = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const currency = getCurrency(countryIso2);
  const localValue = Math.round(fromUsdToLocal(incomeUsd, countryIso2));
  const setLocalValue = (local: number) => {
    setIncomeUsd(Math.max(0, Math.round(fromLocalToUsd(local, countryIso2))));
  };

  const onSimulate = async () => {
    setBusy(true);
    try {
      const input: SimulationInput = { age, gender, countryIso2, monthlyIncomeUsd: incomeUsd, education, employed };
      // Add a fresh seed so AI narratives stay variable for repeat runs
      const seed = nanoid(8);
      const results = simulate(input);
      const slug = nanoid(10);
      const payload = {
        share_slug: slug,
        input: { ...input, seed } as any,
        results: results as any,
        top_country: results.topCountry?.name ?? null,
        is_public: true,
        user_id: user?.id ?? null,
      };
      const { error } = await supabase.from("simulations").insert(payload);
      if (error) {
        console.error(error);
        localStorage.setItem(`sim:${slug}`, JSON.stringify(payload));
      }
      navigate(`/result/${slug}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not run simulation");
    } finally {
      setBusy(false);
    }
  };

  const homeCountry = COUNTRIES.find((c) => c.iso2 === countryIso2);

  return (
    <>
      <SEO
        title="Simulator — If I Was Born There"
        description="Enter your life stats and discover what your life would statistically look like in 50+ countries."
        canonical="/simulator"
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-float-blob pointer-events-none" />
        <div className="absolute top-40 -right-32 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-float-blob pointer-events-none" style={{ animationDelay: "4s" }} />

        <div className="container relative py-10 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-8 md:mb-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Tell us about your life
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight mb-3">
              Your <span className="text-gradient-amber italic">parallel lives</span><br/> begin here.
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Six small inputs. A lifetime of perspective across 50+ countries.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* LEFT — form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-strong rounded-3xl p-5 md:p-10 space-y-7 md:space-y-8 order-2 lg:order-1"
            >
              {/* Age */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <Label className="text-base">Your age</Label>
                  <span className="font-display text-2xl md:text-3xl text-primary tabular-nums">{age}</span>
                </div>
                <Slider value={[age]} min={1} max={90} step={1} onValueChange={(v) => setAge(v[0])} />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label className="text-base">Gender</Label>
                <RadioGroup value={gender} onValueChange={(v) => setGender(v as Gender)} className="grid grid-cols-3 gap-2 md:gap-3">
                  {(["female","male","nonbinary"] as Gender[]).map((g) => (
                    <label
                      key={g}
                      htmlFor={`g-${g}`}
                      className={`flex items-center justify-center text-sm cursor-pointer rounded-xl border px-2 py-3 transition-colors capitalize text-center ${
                        gender === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem id={`g-${g}`} value={g} className="sr-only" />
                      {g === "nonbinary" ? "Non-binary" : g}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Country */}
              <div className="space-y-3">
                <Label className="text-base">Where you were born</Label>
                <Select value={countryIso2} onValueChange={setCountry}>
                  <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {sortedCountries.map((c) => (
                      <SelectItem key={c.iso2} value={c.iso2}>
                        <span className="mr-2">{c.flag}</span>{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Income — in local currency */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <Label className="text-base">Monthly income ({currency.code})</Label>
                  <span className="font-display text-xl md:text-2xl text-primary tabular-nums">
                    {formatLocal(localValue, countryIso2)}
                  </span>
                </div>
                <Slider
                  value={[localValue]}
                  min={0}
                  max={Math.round(fromUsdToLocal(15000, countryIso2))}
                  step={Math.max(1, Math.round(fromUsdToLocal(50, countryIso2)))}
                  onValueChange={(v) => setLocalValue(v[0])}
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <Input
                    type="number"
                    min={0}
                    value={localValue}
                    onChange={(e) => setLocalValue(Math.max(0, Number(e.target.value) || 0))}
                    className="max-w-[200px]"
                  />
                  <span className="text-xs text-muted-foreground">≈ ${incomeUsd.toLocaleString()} USD</span>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-3">
                <Label className="text-base">Education</Label>
                <Select value={education} onValueChange={(v) => setEducation(v as Education)}>
                  <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No formal schooling</SelectItem>
                    <SelectItem value="primary">Primary school</SelectItem>
                    <SelectItem value="secondary">Secondary / high school</SelectItem>
                    <SelectItem value="university">University degree</SelectItem>
                    <SelectItem value="postgrad">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Employed */}
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <Label className="text-base">Currently employed</Label>
                  <p className="text-xs text-muted-foreground">Helps weight income comparisons</p>
                </div>
                <Switch checked={employed} onCheckedChange={setEmployed} />
              </div>

              <Button
                onClick={onSimulate} disabled={busy} size="lg"
                className="w-full h-14 text-base bg-gradient-amber text-primary-foreground hover:opacity-90 shadow-glow-amber animate-pulse-glow"
              >
                {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Simulating…</>
                      : <>Reveal my parallel lives <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </motion.div>

            {/* RIGHT — preview */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 order-1 lg:order-2"
            >
              <div className="glass rounded-3xl p-5 md:p-6 lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-4">
                  {homeCountry && <Flag iso2={homeCountry.iso2} emoji={homeCountry.flag} size={56} />}
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Your starting line</div>
                    <div className="font-display text-xl md:text-2xl truncate">
                      {homeCountry?.name}
                    </div>
                  </div>
                </div>
                <Stat label="Age" value={`${age} years old`} />
                <Stat label="Gender" value={gender === "nonbinary" ? "Non-binary" : gender} />
                <Stat label="Income" value={`${formatLocal(localValue, countryIso2)}/mo`} />
                <Stat label="Education" value={education} />
                <Stat label="Employed" value={employed ? "Yes" : "No"} />
                <p className="mt-5 text-xs text-muted-foreground italic leading-relaxed">
                  We'll compare these to real-world data from 50+ countries — life expectancy, healthcare, income, happiness, gender equality, culture and more.
                </p>
              </div>
            </motion.aside>
          </div>
        </div>
      </section>
    </>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border/60 last:border-0 py-2 text-sm capitalize gap-3">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="font-medium truncate text-right">{value}</span>
  </div>
);

export default Simulator;
