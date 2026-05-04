import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { CountryResult } from "@/lib/simulator";

// Public TopoJSON of world countries; iso_a2 / iso_a3 are present on properties
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Props {
  results: CountryResult[];
  homeIso2: string;
  onSelect?: (iso3: string) => void;
}

export const WorldMap = ({ results, homeIso2, onSelect }: Props) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // build lookup by iso3 numeric (the topojson uses numeric ids); we map by ISO_A3 via name fallback
  const byIso3 = new Map<string, CountryResult>();
  results.forEach((r) => byIso3.set(r.country.iso3, r));

  return (
    <div className="relative">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 155 }}
        width={900}
        height={420}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso3 = (geo.properties as any).iso_a3 ?? (geo.properties as any).ISO_A3 ?? geo.id;
              // world-atlas provides numeric id; we match by name when possible
              const name = (geo.properties as any).name ?? (geo.properties as any).NAME;
              const result =
                byIso3.get(iso3) ||
                results.find((r) => r.country.name === name);
              const isHome = result?.country.iso2 === homeIso2 || (geo.properties as any)?.name === homeIso2;
              const score = result?.score ?? 0;

              const fill = isHome
                ? "hsl(38 92% 50%)"
                : !result
                  ? "hsl(220 18% 16%)"
                  : score > 1 ? "hsl(158 64% 42%)"
                  : score > 0 ? "hsl(158 64% 32%)"
                  : score === 0 ? "hsl(43 96% 35%)"
                  : score < -1 ? "hsl(0 70% 45%)"
                  : "hsl(0 70% 35%)";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => result && onSelect?.(result.country.iso3)}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    default: { fill, stroke: "hsl(222 47% 5%)", strokeWidth: 0.4, outline: "none" },
                    hover:   { fill, stroke: "hsl(38 92% 60%)", strokeWidth: 0.8, outline: "none", cursor: result ? "pointer" : "default" },
                    pressed: { fill, outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {hovered && (
        <div className="absolute top-2 left-2 text-xs bg-background/80 backdrop-blur border border-border/60 rounded-md px-2 py-1 pointer-events-none">
          {hovered}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend color="hsl(38 92% 50%)" label="You" />
        <Legend color="hsl(158 64% 42%)" label="Better outcome" />
        <Legend color="hsl(43 96% 35%)" label="Similar" />
        <Legend color="hsl(0 70% 45%)" label="Worse outcome" />
        <Legend color="hsl(220 18% 16%)" label="Not in dataset" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
    {label}
  </span>
);
