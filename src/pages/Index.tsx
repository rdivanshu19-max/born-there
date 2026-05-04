import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Globe2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Globe } from "@/components/Globe";
import { CountryTicker } from "@/components/CountryTicker";
import { COUNTRIES } from "@/lib/simulator";

const Index = () => {
  const sample = COUNTRIES.find((c) => c.iso2 === "FI")!;

  return (
    <>
      <SEO
        title="If I Was Born There — See your parallel lives"
        description="A cinematic life simulator: discover what your life would look like if you'd been born in a different country. Compare income, life expectancy, education and happiness across 50+ countries."
        canonical="/"
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-drift pointer-events-none" />
        <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-drift pointer-events-none" style={{ animationDelay: "3s" }} />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-20 md:py-28">
          <div className="space-y-7 animate-float-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" /> Statistical life simulator
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              You didn't choose <br />
              <span className="text-gradient-amber italic">where you were born.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              But you can see how it would have changed everything. Step into your parallel lives across 50+ countries — guided by real data on income, health, education and happiness.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="bg-gradient-amber text-primary-foreground hover:opacity-90 shadow-glow-amber animate-pulse-glow">
                <Link to="/simulator">
                  Discover your other lives <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border">
                <Link to="/explore">Explore countries</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Globe size={520} />
          </div>
        </div>
      </section>

      <CountryTicker />

      {/* HOW IT WORKS */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl mb-3">How it works</h2>
          <p className="text-muted-foreground">Three steps. A lifetime of perspective.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Enter your life stats", body: "Age, country, income, education — the few things that statistically shape a life." },
            { icon: Globe2, title: "We simulate 50+ countries", body: "Your numbers compared against income, health and happiness data from across the world." },
            { icon: Sparkles, title: "Meet your parallel lives", body: "An AI-written narrative for each country, with charts and a map of better and worse outcomes." },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-gradient-amber grid place-items-center mb-4 shadow-glow-amber">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <section className="container">
        <div className="glass rounded-2xl p-6 md:p-8 grid grid-cols-3 gap-4 text-center">
          {[
            { n: "1.2M+", l: "Simulations run" },
            { n: "50+",   l: "Countries analyzed" },
            { n: "300+",  l: "Data points each" },
          ].map((s, i) => (
            <div key={i}>
              <div className="font-display text-3xl md:text-4xl text-gradient-amber">{s.n}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE TEASER */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl mb-4">A glimpse of your other life</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Each country card surfaces six metrics that quietly define a lifetime — and shows where the country of your birth helped or hindered you.
            </p>
            <p className="text-sm text-muted-foreground/70">
              This is just a teaser. The real cards are personalised to your inputs.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 max-w-md w-full mx-auto shadow-card animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{sample.flag}</span>
              <div>
                <div className="font-display text-xl">{sample.name}</div>
                <div className="text-xs text-muted-foreground">Northern Europe</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { l: "Life expectancy", v: "84.5 yrs", t: "better" },
                { l: "Healthcare access", v: "92/100", t: "better" },
                { l: "Happiness index", v: "7.7/10", t: "better" },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/40 last:border-0 pb-2 last:pb-0">
                  <span className="text-muted-foreground">{m.l}</span>
                  <span className="text-success font-medium">↑ {m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="container py-16">
        <blockquote className="max-w-3xl mx-auto text-center font-display italic text-2xl md:text-3xl leading-snug">
          "Empathy begins when you realize <span className="text-gradient-amber">luck</span> decided your starting line."
        </blockquote>
      </section>

      <section className="container pb-20">
        <div className="glass rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-3">Ready to meet your parallel lives?</h2>
          <p className="text-muted-foreground mb-6">It takes about 60 seconds.</p>
          <Button asChild size="lg" className="bg-gradient-amber text-primary-foreground hover:opacity-90 shadow-glow-amber">
            <Link to="/simulator">Start the simulator <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Index;
