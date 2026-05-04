import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.105.1/cors";

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

    const resp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You compare two countries in a short, plain-English paragraph (80-120 words). Highlight 2-3 of the most striking differences a citizen would feel day-to-day. No lists, no headings." },
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
