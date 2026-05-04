import { SEO } from "@/components/SEO";

const About = () => {
  return (
    <>
      <SEO title="About — If I Was Born There" description="The story, data sources, and disclaimer." />
      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">About</h1>
        <p className="text-muted-foreground leading-relaxed">
          If I Was Born There is a cinematic life simulator powered by global statistics. Data drawn from
          public sources including the World Bank, UN, and WHO. Results are statistical estimates, not predictions.
        </p>
      </section>
    </>
  );
};

export default About;
