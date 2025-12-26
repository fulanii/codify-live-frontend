import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  Video,
  Phone,
  Code,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // If user prefers reduced motion, show all elements immediately
      const elements = document.querySelectorAll(".fade-in-on-scroll");
      elements.forEach((el) => {
        el.classList.remove("opacity-0");
        el.classList.add("opacity-100");
      });
      return;
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(".fade-in-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const primaryCta = {
    label: isAuthenticated ? "Go to Dashboard" : "Get Started",
    href: isAuthenticated ? "/dashboard" : "/register",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">CodifyLive</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Features
            </a>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="ghost" data-testid="button-login">
                  Login
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => {
                  void logout();
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            )}
            <Link to={primaryCta.href}>
              <Button data-testid="button-register">{primaryCta.label}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container relative px-4 md:px-8 mx-auto">
            <div className="mx-auto max-w-4xl text-center fade-in-on-scroll opacity-0">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
                CodifyLive
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                A free and open-source platform for chatting, collaborating, and
                coding together in real time.
              </p>
              <p className="text-base md:text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
                Chat with friends, work on projects together, code in the
                browser, manage files, and make audio or video calls—all in one
                place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={primaryCta.href}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto transition-transform duration-200 hover:scale-105 will-change-transform"
                    data-testid="button-hero-register"
                  >
                    {primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto transition-transform duration-200 hover:scale-105 will-change-transform"
                    data-testid="button-learn-more"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-muted/30">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-16 fade-in-on-scroll opacity-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What CodifyLive Does
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Simple platform for real-time collaboration and communication
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add Friends */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-friends"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Friends</h3>
                <p className="text-muted-foreground">
                  Connect with friends and see who's online. Send and receive
                  friend requests.
                </p>
              </Card>

              {/* Chat */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-chat"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chat</h3>
                <p className="text-muted-foreground">
                  Send direct messages with typing indicators. Real-time
                  messaging for instant communication.
                </p>
              </Card>

              {/* Audio Call */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-audio"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Audio Call</h3>
                <p className="text-muted-foreground">
                  Make voice calls with friends. Clear audio quality for
                  conversations.
                </p>
              </Card>

              {/* Video Call */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-video"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Call</h3>
                <p className="text-muted-foreground">
                  Video calls with friends. See and hear each other in real
                  time.
                </p>
              </Card>

              {/* Real-time Collaborative Browser Coding */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-coding"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Real-time Collaborative Browser Coding
                </h3>
                <p className="text-muted-foreground">
                  Code together in the browser. Multiple people can edit code
                  simultaneously with live updates.
                </p>
              </Card>

              {/* File Management */}
              <Card
                className="p-8 hover:shadow-lg transition-all duration-300 fade-in-on-scroll opacity-0 will-change-transform"
                data-testid="card-feature-files"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 transition-transform duration-300 hover:scale-110 will-change-transform">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Work on Local Files or Upload Files
                </h3>
                <p className="text-muted-foreground">
                  Manage files locally or upload them. Work with your existing
                  files or create new ones.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="fade-in-on-scroll opacity-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                  <Code className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">CodifyLive</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                A free and open-source platform for chatting, collaborating, and
                coding together in real time.
              </p>
            </div>

            <div className="fade-in-on-scroll opacity-0">
              <h4 className="font-semibold mb-4">About the Creator</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://yassinecodes.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/yassinecodes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    X/Twitter <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/yassinecodes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.github.com/fulanii/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground fade-in-on-scroll opacity-0">
            © {currentYear} CodifyLive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
