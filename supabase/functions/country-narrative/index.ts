const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface Metric { label: string; yours: number; theirs: number; unit: string; verdict: string; }

const ANGLES = [
  "morning routines and how a typical weekday might unfold",
  "the legal and civic freedoms that shape what you can do, say, marry, or wear",
  "social attitudes toward gender, sexuality and relationships",
  "religious and cultural rhythms that color daily life",
  "education path and what it costs in time, money and competition",
  "how money, taxes and housing would feel on your income",
  "the climate, food and small daily pleasures you'd grow up with",
  "what aging, healthcare and old age might look like",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { country, homeCountry, input, metrics, seed } = await req.json();

    if (!country?.name || !Array.isArray(metrics)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metricLines = (metrics as Metric[]).map((m) =>
      `- ${m.label}: yours ${m.yours}${m.unit}, ${country.name} ${m.theirs}${m.unit} (${m.verdict})`
    ).join("\n");

    // Use seed to deterministically pick 2 angles -> different narrative each run
    const s = String(seed ?? Math.random());
    let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const a1 = ANGLES[h % ANGLES.length];
    const a2 = ANGLES[(h >> 3) % ANGLES.length];

    const ageGroup = input.age < 18 ? "as a child / teenager" : input.age < 30 ? "as a young adult" : input.age < 60 ? "as an adult" : "as an older adult";
    const adult = input.age >= 18;

    const system = `You write short, emotionally resonant, statistically grounded paragraphs about how a person's life would be different if they had been born in another country. Tone: National Geographic meets data journalism. Use second-person ("you would..."). Be specific, concrete and HUMAN. Weave 2-3 of the numbers naturally. Mention real cultural, legal or social differences (laws, freedoms, gender norms, religion, family structure, ${adult ? "and where appropriate, frank but tasteful notes on relationships, sexuality, dating norms, LGBTQ+ rights" : "and child-appropriate context only"}). 110-150 words, single paragraph, no headings, no lists, no markdown. Do NOT moralise. Be honest about both the freedoms gained AND lost. Vary your opening — never start with the same sentence twice.`;

    const user = `Person: ${input.age}y ${input.gender}, lives in ${homeCountry?.name ?? "their home country"}, earns roughly $${input.monthlyIncomeUsd}/month, education: ${input.education}, employed: ${input.employed ? "yes" : "no"}.

Write ONE fresh paragraph (~120 words) imagining their life if born in ${country.name} ${ageGroup}, focusing especially on: ${a1}; and ${a2}.
Compare honestly to ${homeCountry?.name ?? "their home"} using these data points where natural:
${metricLines}

Variation seed: ${s}. Do not start with "If you were born". Begin with a vivid concrete image.`;

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: true,
        temperature: 0.95,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached, please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Add funds to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await resp.text();
      console.error("AI gateway:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("country-narrative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
