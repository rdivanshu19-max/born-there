import { SEO } from "@/components/SEO";

const Explore = () => {
  return (
    <>
      <SEO title="Explore Countries — If I Was Born There" description="Browse and compare countries." />
      <section className="container mx-auto px-4 py-20">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Explore Countries</h1>
        <p className="text-muted-foreground">Browse, search, and compare countries.</p>
      </section>
    </>
  );
};

export default Explore;
