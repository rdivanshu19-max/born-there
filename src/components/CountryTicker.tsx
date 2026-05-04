import { COUNTRIES } from "@/lib/simulator";

export const CountryTicker = () => {
  // duplicate list to make seamless loop
  const items = [...COUNTRIES, ...COUNTRIES];
  return (
    <div className="relative overflow-hidden border-y border-border/40 bg-surface/40 backdrop-blur-sm py-4">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="ticker-track flex gap-10 whitespace-nowrap will-change-transform">
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-base">{c.flag}</span>
            <span className="font-display tracking-wide">{c.name}</span>
            <span className="text-primary/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};
