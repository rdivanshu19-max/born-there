const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { countryA, countryB } = await req.json();
    if (!countryA?.name || !countryB?.name) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const summarize = (c: any) =>
      `${c.name}: life expectancy ${c.life_expectancy.male}/${c.life_expectancy.female} (M/F), median monthly income $${c.median_income_monthly_usd_ppp} PPP, literacy ${c.literacy_rate}%, healthcare access ${c.healthcare_access_score}/100, gender equality ${c.gender_equality_index}/100, happiness ${c.happiness_score}/10.`;

    const system = `You compare two countries in 130-180 words across THREE concise paragraphs separated by blank lines:
1) Daily life & money — what's normal, what's expensive, what people earn.
2) Laws & freedoms — what's legal in one but illegal/taboo in the other (alcohol, drugs, marriage, LGBTQ+ rights, women's rights, free speech, religion). Be honest, frank, neutral.
3) What's common to both — shared values, similar challenges.
No headings, no lists, no markdown. Plain text only.`;

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.85,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Compare these two countries:\n${summarize(countryA)}\n${summarize(countryB)}` },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
