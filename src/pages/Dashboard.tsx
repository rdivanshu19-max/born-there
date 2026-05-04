import { SEO } from "@/components/SEO";

const Dashboard = () => {
  return (
    <>
      <SEO title="Dashboard — If I Was Born There" description="Your saved simulations and insights." />
      <section className="container mx-auto px-4 py-20">
        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Your Dashboard</h1>
        <p className="text-muted-foreground">Saved simulations will appear here.</p>
      </section>
    </>
  );
};

export default Dashboard;
