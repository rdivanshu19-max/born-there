import { Link } from "react-router-dom";
import { Github } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/40 mt-20">
    <div className="container py-12 grid gap-8 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="font-display text-xl mb-2">
          If I Was <span className="text-gradient-amber">Born There</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          A statistical life simulator that explores how the country of your birth shapes
          the lives we live. Built with empathy, powered by open data.
        </p>
      </div>

      <div>
        <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">Product</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/simulator" className="hover:text-primary transition-colors">Simulator</Link></li>
          <li><Link to="/explore" className="hover:text-primary transition-colors">Explore countries</Link></li>
          <li><Link to="/dashboard" className="hover:text-primary transition-colors">My simulations</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3">About</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/about" className="hover:text-primary transition-colors">Story & data sources</Link></li>
          <li><Link to="/about#privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
          <li>
            <a href="https://github.com" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/40">
      <div className="container py-5 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} If I Was Born There. Educational use only.</span>
        <span>Data: World Bank · UN HDI · WHO · World Happiness Report · OECD</span>
      </div>
    </div>
  </footer>
);
