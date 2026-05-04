import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";

const Result = () => {
  const { slug } = useParams();
  return (
    <>
      <SEO title="Simulation Result — If I Was Born There" description="A shared life simulation result." />
      <section className="container mx-auto px-4 py-20">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Simulation Result</h1>
        <p className="text-muted-foreground">Result <span className="text-primary">{slug}</span> — coming soon.</p>
      </section>
    </>
  );
};

export default Result;
