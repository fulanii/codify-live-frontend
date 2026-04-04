import { Code, ExternalLink, Wrench, Clock } from "lucide-react";
import { useEffect } from "react";

export default function UnderConstructionPage() {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(".fade-in-on-scroll").forEach((el) => {
        el.classList.remove("opacity-0");
        el.classList.add("opacity-100");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".fade-in-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-8 mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">CodifyLive</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="relative overflow-hidden w-full py-20 md:py-32">
          {/* Background gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container relative px-4 md:px-8 mx-auto">
            <div className="mx-auto max-w-2xl text-center fade-in-on-scroll opacity-0">
              {/* Icon cluster */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
                Under Construction
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-lg mx-auto">
                We're building something great. CodifyLive is getting a major upgrade.
              </p>
              <p className="text-base text-muted-foreground/70 mb-10 max-w-lg mx-auto">
                A free and open-source platform for chatting, collaborating, and coding together
                in real time — launching soon.
              </p>

              {/* Status bar */}
              <div className="mx-auto max-w-sm mb-10">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Development progress</span>
                  <span className="text-primary font-medium">Coming Soon</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Follow the progress:</span>
                <a
                  href="https://www.github.com/fulanii/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://x.com/yassinecodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  X/Twitter <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://yassinecodes.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container px-4 md:px-8 mx-auto text-center text-sm text-muted-foreground">
          © {currentYear} CodifyLive. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
