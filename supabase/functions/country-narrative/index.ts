import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.105.1/cors";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface Metric { label: string; yours: number; theirs: number; unit: string; verdict: string; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { country, homeCountry, input, metrics } = await req.json();

    if (!country?.name || !Array.isArray(metrics)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metricLines = (metrics as Metric[]).map((m) =>
      `- ${m.label}: yours ${m.yours}${m.unit}, ${country.name} ${m.theirs}${m.unit} (${m.verdict})`
    ).join("\n");

    const system = `You write short, emotionally resonant, statistically grounded paragraphs about how a person's life would be different if they had been born in another country. Tone: National Geographic meets data journalism. Use second-person ("you would..."). Be specific, weave in 3-4 of the numbers naturally. 90-120 words. No headings, no lists, no markdown. Do not invent facts beyond the provided numbers.`;

    const user = `Person is currently ${input.age} years old, ${input.gender}, lives in ${homeCountry?.name ?? "their home country"}, earns roughly $${input.monthlyIncomeUsd}/month, education: ${input.education}, employed: ${input.employed ? "yes" : "no"}.

Write a paragraph beginning naturally with "If you were born in ${country.name}..." comparing their life to ${country.name} using these data points:
${metricLines}`;

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
