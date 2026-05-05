import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Beautiful, lightweight rotating globe with animated orbital rings,
 * shimmer highlights and floating "country" pings. Works on mobile (SVG only)
 * and upgrades to react-globe.gl on desktop.
 */
export const Globe = ({ size = 520 }: { size?: number }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [GlobeGl, setGlobeGl] = useState<any>(null);
  const isMobile = useIsMobile();
  const effectiveSize = isMobile ? Math.min(size, 320) : size;

  useEffect(() => {
    if (isMobile) return;
    let cancelled = false;
    import("react-globe.gl").then((mod) => {
      if (!cancelled) setGlobeGl(() => mod.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [isMobile]);

  if (isMobile || !GlobeGl) {
    return <SvgGlobe size={effectiveSize} />;
  }

  return (
    <div ref={wrapRef} style={{ width: size, height: size }} className="pointer-events-none relative">
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
      <GlobeGl
        width={size}
        height={size}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="hsl(217, 91%, 60%)"
        atmosphereAltitude={0.25}
        showGraticules={false}
        animateIn
        ref={(g: any) => {
          if (g) {
            const c = g.controls?.();
            if (c) {
              c.autoRotate = true;
              c.autoRotateSpeed = 0.7;
              c.enableZoom = false;
            }
          }
        }}
      />
    </div>
  );
};

const PINGS = [
  { x: 70, y: 60 },  { x: 130, y: 75 }, { x: 100, y: 110 },
  { x: 145, y: 130 }, { x: 60, y: 130 }, { x: 110, y: 155 },
];

const SvgGlobe = ({ size }: { size: number }) => (
  <div className="relative" style={{ width: size, height: size }} aria-hidden>
    {/* halo */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-transparent blur-3xl animate-pulse-glow" />
    {/* orbital rings */}
    <div className="absolute inset-0 animate-spin-slow">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="96" fill="none" stroke="hsl(217 91% 55% / 0.25)" strokeWidth="0.6" strokeDasharray="2 4" />
        <ellipse cx="100" cy="100" rx="96" ry="40" fill="none" stroke="hsl(199 95% 55% / 0.35)" strokeWidth="0.6" />
        <ellipse cx="100" cy="100" rx="80" ry="96" fill="none" stroke="hsl(217 91% 55% / 0.25)" strokeWidth="0.5" />
      </svg>
    </div>

    {/* sphere */}
    <div className="absolute inset-3 animate-spin-slow" style={{ animationDuration: "120s" }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <radialGradient id="ocean" cx="35%" cy="35%">
            <stop offset="0%" stopColor="hsl(199 95% 88%)" />
            <stop offset="55%" stopColor="hsl(217 91% 55%)" />
            <stop offset="100%" stopColor="hsl(222 80% 22%)" />
          </radialGradient>
          <radialGradient id="hl" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="hsl(0 0% 100% / 0.7)" />
            <stop offset="100%" stopColor="hsl(0 0% 100% / 0)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#ocean)" />
        {/* meridians */}
        {[...Array(11)].map((_, i) => (
          <ellipse key={`m${i}`} cx="100" cy="100"
            rx={92 - i * 0.6} ry={92 - i * 8}
            fill="none" stroke="hsl(0 0% 100% / 0.28)" strokeWidth="0.45" />
        ))}
        {/* parallels */}
        {[...Array(7)].map((_, i) => (
          <line key={`p${i}`}
            x1={100 - 92 * Math.cos((i * Math.PI) / 7)} y1={100}
            x2={100 + 92 * Math.cos((i * Math.PI) / 7)} y2={100}
            stroke="hsl(0 0% 100% / 0.22)" strokeWidth="0.4" />
        ))}
        {/* fake continents */}
        <g fill="hsl(152 50% 75% / 0.85)">
          <path d="M55 75 q15 -10 30 -5 q10 6 5 18 q-12 9 -25 5 q-12 -3 -10 -18 z" />
          <path d="M105 60 q18 0 22 12 q-3 14 -18 16 q-15 -2 -14 -16 q2 -8 10 -12 z" />
          <path d="M120 100 q20 -2 28 12 q-2 18 -22 22 q-18 -2 -16 -22 q2 -8 10 -12 z" />
          <path d="M70 120 q14 -4 22 6 q1 14 -10 20 q-16 0 -18 -12 q-2 -8 6 -14 z" />
          <path d="M140 80 q10 -2 14 6 q-2 9 -10 11 q-9 -1 -8 -10 z" />
          <path d="M55 145 q14 -2 18 8 q-2 10 -12 12 q-10 -2 -10 -12 z" />
        </g>
        <circle cx="100" cy="100" r="92" fill="url(#hl)" />
      </svg>
    </div>

    {/* pings */}
    <svg viewBox="0 0 200 200" className="absolute inset-3 w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]">
      {PINGS.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.2" fill="hsl(38 95% 55%)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={p.x} cy={p.y} r="2.2" fill="none" stroke="hsl(38 95% 55%)" strokeWidth="0.6">
            <animate attributeName="r" values="2;9;2" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  </div>
);
