import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Globe2, BarChart3, Heart, Map as MapIcon, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Globe } from "@/components/Globe";
import { CountryTicker } from "@/components/CountryTicker";
import { Flag } from "@/components/Flag";
import { COUNTRIES } from "@/lib/simulator";

const Index = () => {
  const featured = ["FI", "JP", "BR", "NO", "IN", "SG", "DE", "NZ"]
    .map((iso) => COUNTRIES.find((c) => c.iso2 === iso))
    .filter(Boolean) as typeof COUNTRIES;

  return (
    <>
      <SEO
        title="If I Was Born There — See your parallel lives"
        description="A cinematic life simulator: discover what your life would statistically look like if you'd been born in a different country. Compare income, life expectancy, education and happiness across 50+ countries."
        canonical="/"
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute -top-32 -left-32 h-80 md:h-96 w-80 md:w-96 rounded-full bg-primary/30 blur-3xl animate-float-blob pointer-events-none" />
        <div className="absolute top-40 -right-32 h-80 md:h-96 w-80 md:w-96 rounded-full bg-accent/30 blur-3xl animate-float-blob pointer-events-none" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-[80%] rounded-full bg-primary-glow/20 blur-3xl animate-float-blob pointer-events-none" style={{ animationDelay: "7s" }} />

        <div className="container relative grid lg:grid-cols-2 gap-10 md:gap-12 items-center py-14 md:py-24 lg:py-28">
          <div className="space-y-6 md:space-y-7 animate-float-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" /> Statistical life simulator
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              You didn't choose <br />
              <span className="text-gradient-amber italic">where you were born.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              But you can see how it would have changed everything. Step into your parallel lives across 50+ countries — guided by real data on income, health, education, culture and happiness.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-gradient-amber text-primary-foreground hover:opacity-90 shadow-glow-amber animate-pulse-glow">
                <Link to="/simulator">
                  Discover your other lives <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border">
                <Link to="/explore">Explore countries</Link>
              </Button>
            </div>

            {/* Featured flag strip */}
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-4 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Featured</span>
              {featured.slice(0, 6).map((c) => (
                <Flag key={c.iso2} iso2={c.iso2} emoji={c.flag} size={28} />
              ))}
              <span className="text-xs text-muted-foreground">+44 more</span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Globe size={520} />
          </div>
        </div>
      </section>

      <CountryTicker />

      {/* HOW IT WORKS */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12 md:mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-3">How it works</h2>
          <p className="text-muted-foreground">Three steps. A lifetime of perspective.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {[
            { icon: BarChart3, title: "Enter your life stats", body: "Age, country, income (in your currency), education — the few things that statistically shape a life." },
            { icon: Globe2, title: "We simulate 50+ countries", body: "Your numbers compared against income, health, happiness, laws and cultural norms across the world." },
            { icon: Sparkles, title: "Meet your parallel lives", body: "An AI-written narrative for each country, with charts, currency conversion and a map of better and worse outcomes." },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 hover:border-primary/40 hover:shadow-card transition-all hover:-translate-y-1">
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
        <div className="glass-strong rounded-2xl p-6 md:p-8 grid grid-cols-3 gap-4 text-center">
          {[
            { n: "1.2M+", l: "Simulations run" },
            { n: "50+",   l: "Countries analyzed" },
            { n: "300+",  l: "Data points each" },
          ].map((s, i) => (
            <div key={i}>
              <div className="font-display text-2xl md:text-3xl lg:text-4xl text-gradient-amber">{s.n}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU'LL SEE */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((c) => (
                <div key={c.iso2} className="glass rounded-2xl p-4 hover:shadow-card transition-shadow">
                  <Flag iso2={c.iso2} emoji={c.flag} size={48} />
                  <div className="font-display mt-3">{c.name}</div>
                  <div className="text-xs text-muted-foreground">Happiness {c.happiness_score.toFixed(1)}/10</div>
                  <div className="text-xs text-muted-foreground">Life exp. {Math.round((c.life_expectancy.male + c.life_expectancy.female)/2)} yrs</div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <MapIcon className="h-3 w-3" /> Real, layered data
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-4">A glimpse of your other life</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Each country card surfaces six metrics that quietly define a lifetime — life expectancy, healthcare, income (converted to your currency), happiness, gender equality, and education access.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Plus an AI-written life story exploring laws, customs, freedoms and the small daily details that make each place its own world.
            </p>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
          <blockquote className="font-display italic text-2xl md:text-3xl lg:text-4xl leading-snug">
            "Empathy begins when you realize <span className="text-gradient-amber">luck</span> decided your starting line."
          </blockquote>
        </div>
      </section>

      <section className="container pb-20">
        <div className="glass-strong rounded-3xl p-6 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-aurora opacity-60 pointer-events-none" />
          <div className="relative">
            <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-3xl md:text-4xl mb-3">Ready to meet your parallel lives?</h2>
            <p className="text-muted-foreground mb-6">It takes about 60 seconds.</p>
            <Button asChild size="lg" className="bg-gradient-amber text-primary-foreground hover:opacity-90 shadow-glow-amber">
              <Link to="/simulator">Start the simulator <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
