import { useEffect, useRef, useState } from "react";

/**
 * Lightweight wrapper around react-globe.gl that:
 *  - lazy-loads the WebGL globe on desktop only
 *  - falls back to an animated SVG dotted globe on mobile / SSR
 */
export const Globe = ({ size = 520 }: { size?: number }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [GlobeGl, setGlobeGl] = useState<any>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) return;
    let cancelled = false;
    import("react-globe.gl").then((mod) => {
      if (!cancelled) setGlobeGl(() => mod.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [isMobile]);

  if (isMobile || !GlobeGl) {
    return <SvgGlobe size={size} />;
  }

  return (
    <div ref={wrapRef} style={{ width: size, height: size }} className="pointer-events-none">
      <GlobeGl
        width={size}
        height={size}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="hsl(28, 88%, 60%)"
        atmosphereAltitude={0.22}
        showGraticules={false}
        animateIn
        ref={(g: any) => {
          if (g) {
            const c = g.controls?.();
            if (c) {
              c.autoRotate = true;
              c.autoRotateSpeed = 0.6;
              c.enableZoom = false;
            }
          }
        }}
      />
    </div>
  );
};

const SvgGlobe = ({ size }: { size: number }) => (
  <div
    className="relative animate-spin-slow rounded-full"
    style={{ width: size, height: size }}
    aria-hidden
  >
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-secondary/15 to-transparent blur-2xl" />
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
      <defs>
        <radialGradient id="g" cx="35%" cy="35%">
          <stop offset="0%" stopColor="hsl(38 95% 75%)" stopOpacity="1" />
          <stop offset="55%" stopColor="hsl(28 88% 55%)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(18 60% 35%)" stopOpacity="1" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#g)" />
      {[...Array(12)].map((_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="100"
          rx={92 - i * 0.5}
          ry={92 - i * 7.4}
          fill="none"
          stroke="hsl(0 0% 100% / 0.35)"
          strokeWidth="0.6"
        />
      ))}
      {[...Array(7)].map((_, i) => (
        <line
          key={i}
          x1={100 - 92 * Math.cos((i * Math.PI) / 7)}
          y1={100}
          x2={100 + 92 * Math.cos((i * Math.PI) / 7)}
          y2={100}
          stroke="hsl(0 0% 100% / 0.25)"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  </div>
);
