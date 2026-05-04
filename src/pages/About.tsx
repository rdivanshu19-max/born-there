import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Database, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const About = () => (
  <>
    <SEO
      title="About — If I Was Born There"
      description="The story behind a statistical life simulator: the data sources, the philosophy, and the disclaimer."
      canonical="/about"
    />

    <section className="relative">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="container relative py-14 md:py-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
            <Sparkles className="h-3 w-3" /> Our story
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-6 leading-tight">
            A reminder that <span className="text-gradient-amber italic">luck</span> wrote your first chapter.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <em>If I Was Born There</em> exists for a single, simple reason: the country you were born in shapes your life more than almost anything else — and you didn't choose it. We turn that quiet truth into something you can <em>feel</em>: a cinematic, data-grounded look at the parallel lives waiting for you across 50+ countries.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {[
            { icon: Heart, title: "Built with empathy", body: "Every chart is a person. Every story is a possibility." },
            { icon: Database, title: "Powered by open data", body: "World Bank, UN HDI, WHO, OECD, World Happiness Report." },
          ].map((c, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-amber grid place-items-center mb-3 text-primary-foreground"><c.icon className="h-5 w-5" /></div>
              <h3 className="font-display text-xl mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <h2 id="data" className="font-display text-3xl mt-16 mb-3">Data sources</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li>• <strong>World Bank</strong> — GDP per capita PPP, employment, literacy</li>
          <li>• <strong>UN HDI</strong> — Education completion, gender equality</li>
          <li>• <strong>WHO</strong> — Life expectancy, healthcare access</li>
          <li>• <strong>World Happiness Report</strong> — Happiness scores</li>
          <li>• <strong>OECD</strong> — Median income (PPP-adjusted)</li>
        </ul>

        <div id="privacy" className="mt-16 glass rounded-2xl p-6 border-l-4 border-warning">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-xl mb-2">A disclaimer worth reading</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This is a <strong>statistical exploration</strong>, not a prediction. Real lives are shaped by family, community, opportunity, and chance — none of which a dataset can capture. Treat the results as a window into <em>averages</em>, not destinies.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-gradient-amber text-primary-foreground"><Link to="/simulator">Run your simulation</Link></Button>
        </div>
      </div>
    </section>
  </>
);

export default About;
