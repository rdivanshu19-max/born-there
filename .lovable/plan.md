## If I Was Born There — Build Plan

A cinematic, dark-themed life simulator that compares a user's life statistics against 50+ countries, with AI-generated narratives, interactive maps, and shareable results.

### Design system

- **Background** `#0a0e1a`, **surface** `#111827`, **amber** `#f59e0b`, **blue** `#60a5fa`, **text** `#f9fafb`, **muted** `#9ca3af`, **success** `#34d399`, **danger** `#ef4444`
- **Fonts**: Playfair Display (headings), DM Sans (body) via Google Fonts
- All colors as HSL tokens in `index.css`; semantic Tailwind tokens in `tailwind.config.ts`
- Custom animations: fade-in, slide-up, stagger, count-up, globe-spin, choropleth-fill

### Pages & routes

```
/                  Landing (hero + globe + how it works + sample card)
/auth              Sign up / log in (email + password, no verification, persistent session)
/simulator         Core simulator (input form + results)
/result/:id        Public shareable result page (works without login)
/dashboard         "My Simulations" — saved runs, re-run, share
/explore           Browse all countries + Compare Two Countries
/about             Story + data sources + disclaimer
*                  404
```

### Page details

**Landing** — Full-screen hero with `react-globe.gl` (desktop) / animated SVG globe (mobile, detected via `useIsMobile`). Headline in Playfair, amber CTA, horizontally scrolling country-name ticker, 3-step "how it works", animated stats bar, teaser card, emotional pull-quote, footer.

**Auth** — Centered glass card. Email + password sign-up/login. Skip email confirmation in Cloud auth settings. Session persists (Supabase default). Redirect to `/simulator`.

**Simulator** — Two-panel layout (stacks on mobile):
- *Left*: Age slider, gender select, country combobox (auto-detect via `navigator.language` + IP fallback `ipapi.co`), income slider+input, education select, employed toggle. "Simulate My Parallel Lives" button.
- *Right*: Choropleth world map (`react-simple-maps` + world-atlas TopoJSON) colored green/yellow/red vs user. Below: grid of country cards (top 10 better, 5 similar, 5 worse), each with flag, country name, 6 color-coded stat comparisons, "Explore This Country" button.

**Country detail modal** — Large flag header, AI-generated narrative paragraph (Lovable AI, streamed), bar charts (recharts) comparing each metric vs home country, share button.

**Dashboard** — Table/grid of saved simulations (date, input snapshot, top result country). Re-run and share actions. AI "Insight of the day" card at top, generated from the user's simulation history.

**Explore** — Searchable country grid with filters (continent, GDP band, happiness rank, life expectancy). "Compare Two Countries" side-by-side view with AI-summarized differences.

**About** — Story, data sources list, last updated, disclaimer.

### Backend (Lovable Cloud)

Tables:
- `profiles` (id → auth.users, display_name, created_at) + auto-create trigger
- `simulations` (id, user_id nullable, input jsonb, results jsonb, share_slug unique, is_public bool, created_at) — RLS: owner can CRUD; anyone can SELECT where `is_public = true`
- `user_roles` + `app_role` enum + `has_role()` security-definer (per security best practices, even if unused at launch)

Edge functions:
- `country-narrative` — input: user stats + country code → streamed AI paragraph ("If you were born in X…")
- `compare-countries` — input: 2 country codes + user stats → AI comparison summary
- `daily-insight` — input: user_id → AI reflection on their saved simulations

All AI calls go through Lovable AI Gateway (default model `google/gemini-3-flash-preview`), with 429/402 toast handling.

### Data layer

- `src/data/countries.json` — 50+ countries (your full list). Each entry: ISO code, name, flag emoji, continent, life_expectancy (by gender), gdp_per_capita_ppp, median_income_monthly_usd_ppp, literacy_rate, healthcare_access_score, gender_equality_index, happiness_score, education_completion_rates by level, employment_rate.
- `src/lib/simulator.ts` — pure functions: `simulate(input, countries)` → ranked results with per-stat better/similar/worse classification.

### Sharing

- Each result has `share_slug` (nanoid). Public route `/result/:slug` renders without auth.
- Share buttons: Twitter/X, WhatsApp, LinkedIn, copy link.
- OG meta tags injected per-page via `react-helmet-async`; static OG preview image (designed asset) — dynamic OG image generation deferred to v2.

### Responsiveness & polish

- Mobile: panels stack, country cards become horizontal snap-scroll, globe shrinks to decorative SVG.
- Loading skeletons on all async views, error boundary at route level, 404 page styled to match.
- ARIA labels on all interactive elements, keyboard nav, focus rings in amber.
- SEO meta + OG tags per page.

### Defaults assumed (you didn't pick auth options)

- Email + password, no verification, persistent session
- Public shareable links work without login (anonymous sims save to localStorage; logged-in sims save to cloud)
- No Google sign-in for now (can add later)

### Build order

1. Design system tokens, fonts, base layout
2. Landing page + globe + ticker
3. Lovable Cloud + auth + profiles + simulations table
4. Countries dataset + simulator engine
5. Simulator page with form, map, cards, modal
6. AI edge functions (narrative, compare, insight)
7. Dashboard + Explore + Compare
8. Sharing + OG tags + public result route
9. About page, 404, error boundary, accessibility pass
10. Mobile polish + animations