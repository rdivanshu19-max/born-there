import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Globe2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/simulator", label: "Simulator" },
    { to: "/explore", label: "Explore" },
    { to: "/about", label: "About" },
    ...(user ? [{ to: "/dashboard", label: "My Lives" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur-xl bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid place-items-center h-9 w-9 rounded-full bg-gradient-amber shadow-glow-amber transition-transform group-hover:scale-110">
            <Globe2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <span className="font-display text-lg leading-none">
            If I Was <span className="text-gradient-amber">Born There</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Log in</Link></Button>
              <Button asChild size="sm" className="bg-gradient-amber text-primary-foreground hover:opacity-90">
                <Link to="/simulator">Try the simulator</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-surface"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn("px-3 py-2 rounded-md text-sm", isActive ? "text-primary bg-surface" : "text-muted-foreground")
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-border/40 mt-2 flex gap-2">
              {user ? (
                <Button variant="ghost" className="flex-1" onClick={async () => { await signOut(); setOpen(false); navigate("/"); }}>
                  Sign out
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" className="flex-1"><Link to="/auth" onClick={() => setOpen(false)}>Log in</Link></Button>
                  <Button asChild className="flex-1 bg-gradient-amber text-primary-foreground">
                    <Link to="/simulator" onClick={() => setOpen(false)}>Simulate</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
