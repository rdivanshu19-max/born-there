import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Trash2, ExternalLink, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Sim {
  id: string;
  share_slug: string;
  top_country: string | null;
  created_at: string;
  input: any;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("simulations")
        .select("id,share_slug,top_country,created_at,input")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSims((data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const fetchInsight = async () => {
    if (!sims.length) { toast("Run a simulation first."); return; }
    setInsightLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-insight", {
        body: { simulations: sims.slice(0, 10) },
      });
      if (error) throw error;
      setInsight(data?.insight ?? data?.text ?? "");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't generate insight");
    } finally { setInsightLoading(false); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("simulations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { setSims((s) => s.filter((x) => x.id !== id)); toast.success("Deleted"); }
  };

  if (authLoading || !user) {
    return <div className="container py-32 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <>
      <SEO title="My parallel lives — Dashboard" description="Your saved simulations and AI insight of the day." canonical="/dashboard" />
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="container relative py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4">
              <Sparkles className="h-3 w-3" /> Welcome back
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-3">Your <span className="text-gradient-amber italic">parallel lives</span></h1>
            <p className="text-muted-foreground">Every simulation you've run, kept safe. Re-run, share, or delete any time.</p>
          </motion.div>

          {/* INSIGHT */}
          <div className="mt-10 glass-strong rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h2 className="font-display text-2xl">Insight of the day</h2>
              <Button onClick={fetchInsight} disabled={insightLoading} className="bg-gradient-amber text-primary-foreground">
                {insightLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Reflecting…</> : "Generate insight"}
              </Button>
            </div>
            <p className="text-foreground/85 leading-relaxed whitespace-pre-wrap min-h-[3rem]">
              {insight || (insightLoading ? "" : "Click \"Generate insight\" to see what your simulations reveal about you.")}
            </p>
          </div>

          {/* SIMS */}
          <div className="mt-10 flex justify-between items-center">
            <h2 className="font-display text-2xl">Saved simulations</h2>
            <Button asChild variant="outline"><Link to="/simulator"><Plus className="h-4 w-4 mr-2" /> New simulation</Link></Button>
          </div>

          {loading ? (
            <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
          ) : sims.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center mt-6">
              <p className="text-muted-foreground mb-4">No simulations yet — your story begins now.</p>
              <Button asChild className="bg-gradient-amber text-primary-foreground"><Link to="/simulator">Run your first simulation</Link></Button>
            </div>
          ) : (
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sims.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="glass rounded-2xl p-5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Best parallel life</div>
                      <div className="font-display text-xl mt-1">{s.top_country ?? "—"}</div>
                    </div>
                    <button onClick={() => remove(s.id)} aria-label="Delete" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded hover:bg-destructive/10 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    From {s.input?.countryIso2} · {new Date(s.created_at).toLocaleDateString()}
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={`/result/${s.share_slug}`}>Open <ExternalLink className="h-3.5 w-3.5 ml-1" /></Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;
