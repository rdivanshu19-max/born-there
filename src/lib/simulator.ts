import countries from "@/data/countries.json";

export type Gender = "male" | "female" | "nonbinary";
export type Education = "none" | "primary" | "secondary" | "university" | "postgrad";

export interface SimulationInput {
  age: number;
  gender: Gender;
  countryIso2: string;
  monthlyIncomeUsd: number;
  education: Education;
  employed: boolean;
}

export interface CountryData {
  iso2: string;
  iso3: string;
  name: string;
  flag: string;
  continent: string;
  life_expectancy: { male: number; female: number };
  gdp_per_capita_ppp: number;
  median_income_monthly_usd_ppp: number;
  literacy_rate: number;
  healthcare_access_score: number;
  gender_equality_index: number;
  happiness_score: number;
  university_completion_rate: number;
  employment_rate: number;
}

export const COUNTRIES: CountryData[] = countries as CountryData[];

export function getCountry(iso2: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.iso2 === iso2);
}

export type Verdict = "better" | "similar" | "worse";

export interface MetricCompare {
  key: string;
  label: string;
  yours: number;
  theirs: number;
  unit: string;
  verdict: Verdict;
  higherIsBetter: boolean;
}

export interface CountryResult {
  country: CountryData;
  score: number;          // signed: + better than user, - worse
  metrics: MetricCompare[];
}

function lifeExpectancyFor(c: CountryData, gender: Gender) {
  if (gender === "male") return c.life_expectancy.male;
  if (gender === "female") return c.life_expectancy.female;
  return (c.life_expectancy.male + c.life_expectancy.female) / 2;
}

function classify(yours: number, theirs: number, threshold: number, higherIsBetter: boolean): Verdict {
  const diff = (theirs - yours) / Math.max(Math.abs(yours), 1);
  if (Math.abs(diff) < threshold) return "similar";
  const isBetter = higherIsBetter ? diff > 0 : diff < 0;
  return isBetter ? "better" : "worse";
}

export function compareToCountry(input: SimulationInput, target: CountryData, home?: CountryData): CountryResult {
  const homeC = home ?? getCountry(input.countryIso2);
  const yourLE = homeC ? lifeExpectancyFor(homeC, input.gender) : 75;
  const yourLiteracy = homeC?.literacy_rate ?? 90;
  const yourHealth = homeC?.healthcare_access_score ?? 65;
  const yourGEI = homeC?.gender_equality_index ?? 70;
  const yourHappy = homeC?.happiness_score ?? 5.5;

  const metrics: MetricCompare[] = [
    {
      key: "life_expectancy",
      label: "Life expectancy",
      yours: yourLE,
      theirs: lifeExpectancyFor(target, input.gender),
      unit: " yrs",
      higherIsBetter: true,
      verdict: classify(yourLE, lifeExpectancyFor(target, input.gender), 0.03, true),
    },
    {
      key: "income",
      label: "Avg monthly income (PPP)",
      yours: input.monthlyIncomeUsd,
      theirs: target.median_income_monthly_usd_ppp,
      unit: "$",
      higherIsBetter: true,
      verdict: classify(input.monthlyIncomeUsd, target.median_income_monthly_usd_ppp, 0.15, true),
    },
    {
      key: "literacy",
      label: "Education access",
      yours: yourLiteracy,
      theirs: target.literacy_rate,
      unit: "%",
      higherIsBetter: true,
      verdict: classify(yourLiteracy, target.literacy_rate, 0.04, true),
    },
    {
      key: "healthcare",
      label: "Healthcare access",
      yours: yourHealth,
      theirs: target.healthcare_access_score,
      unit: "/100",
      higherIsBetter: true,
      verdict: classify(yourHealth, target.healthcare_access_score, 0.06, true),
    },
    {
      key: "gender_equality",
      label: "Gender equality",
      yours: yourGEI,
      theirs: target.gender_equality_index,
      unit: "/100",
      higherIsBetter: true,
      verdict: classify(yourGEI, target.gender_equality_index, 0.06, true),
    },
    {
      key: "happiness",
      label: "Happiness index",
      yours: yourHappy,
      theirs: target.happiness_score,
      unit: "/10",
      higherIsBetter: true,
      verdict: classify(yourHappy, target.happiness_score, 0.06, true),
    },
  ];

  const score = metrics.reduce((s, m) => {
    if (m.verdict === "better") return s + 1;
    if (m.verdict === "worse") return s - 1;
    return s;
  }, 0);

  return { country: target, score, metrics };
}

export interface SimulationResult {
  ranked: CountryResult[];
  better: CountryResult[];
  similar: CountryResult[];
  worse: CountryResult[];
  topCountry?: CountryData;
}

export function simulate(input: SimulationInput): SimulationResult {
  const home = getCountry(input.countryIso2);
  const all = COUNTRIES
    .filter((c) => c.iso2 !== input.countryIso2)
    .map((c) => compareToCountry(input, c, home))
    .sort((a, b) => b.score - a.score);

  const better = all.filter((r) => r.score > 0).slice(0, 10);
  const worse  = all.filter((r) => r.score < 0).slice(-5).reverse();
  const similar = all.filter((r) => r.score === 0).slice(0, 5);

  return { ranked: all, better, similar, worse, topCountry: better[0]?.country };
}

export const verdictColor: Record<Verdict, string> = {
  better:  "text-success",
  similar: "text-warning",
  worse:   "text-destructive",
};

export const verdictBg: Record<Verdict, string> = {
  better:  "bg-success/15 text-success border-success/30",
  similar: "bg-warning/15 text-warning border-warning/30",
  worse:   "bg-destructive/15 text-destructive border-destructive/30",
};
