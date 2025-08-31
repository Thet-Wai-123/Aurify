import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JellyfishAvatar from "@/components/branding/JellyfishAvatar";
import BackgroundJellies from "@/components/branding/BackgroundJellies";
import { useSEO } from "@/hooks/use-seo";
import { CheckCircle2, MessageSquare, Sparkles, Mic2, PlayCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const FeatureCard = ({ title, desc, icon: Icon, delay = 0 }: { title: string; desc: string; icon: any; delay?: number }) => (
  <Card 
    className="group animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardHeader className="space-y-3">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-base leading-relaxed">{desc}</CardDescription>
    </CardHeader>
  </Card>
);

const Index = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  useSEO({
    title: "Aurify – AI Communication Coach & Interview Prep",
    description: "Scenario-based practice with real-time AI feedback, transcripts, and scores. Say it right, every time.",
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <main className="overflow-x-hidden">
      {/* Hero Section - Enhanced with better spacing */}
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-subtle" aria-hidden="true" />
        <BackgroundJellies />
        <section className="container mx-auto max-w-6xl px-4 pt-32 pb-24 text-center">
          <div className="mx-auto mb-12 max-w-3xl animate-fade-in">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Aurify
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl font-medium">
                AI Communication Coach
              </span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Say it right. Every time. Practice interviews, pitching, stand-ups, and friendships with real-time AI feedback.
            </p>
          </div>
          
          <div className="mb-16 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="hero" className="group">
              <a href="/practice" className="flex items-center gap-2">
                Start Practicing
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="group">
              <a href="/pricing" className="flex items-center gap-2">
                See Pricing
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
          
          <div className="mx-auto max-w-sm animate-float">
            <JellyfishAvatar size={240} />
          </div>
        </section>
      </header>

      {/* Feature Highlights - Enhanced with staggered animations */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to communicate with confidence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From job interviews to difficult conversations, we've got you covered
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard 
            title="Real-Time Feedback" 
            desc="AI evaluates confidence, clarity, empathy, relevance, and energy with actionable insights." 
            icon={Sparkles} 
            delay={0}
          />
          <FeatureCard 
            title="Voice or Text" 
            desc="Speak naturally or type your responses. Get transcripts and replay sessions anytime." 
            icon={Mic2} 
            delay={100}
          />
          <FeatureCard 
            title="Scenario Practice" 
            desc="Interview prep, sales pitches, stand-ups, or relationship conversations - perfectly tailored." 
            icon={MessageSquare} 
            delay={200}
          />
          <FeatureCard 
            title="Progress Tracking" 
            desc="Watch your scores improve over time with detailed analytics and personalized insights." 
            icon={CheckCircle2} 
            delay={300}
          />
        </div>
      </section>

      {/* How it works - Enhanced with interactive elements */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Master communication in 3 simple steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No complicated setup. Just choose, practice, and improve.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: 1,
              title: "Choose your scenario",
              description: "Pick from interview prep, sales pitches, stand-ups, or relationship conversations",
              icon: "🎯"
            },
            {
              step: 2,
              title: "Practice naturally",
              description: "Speak or type your responses while our AI coach guides you in real-time",
              icon: "🗣️"
            },
            {
              step: 3,
              title: "Get instant insights",
              description: "Receive detailed feedback and personalized improvement suggestions",
              icon: "📊"
            }
          ].map((item, index) => (
            <div 
              key={item.step}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative rounded-xl border bg-card p-8 transition-all duration-300 group-hover:shadow-xl">
                <div className="mb-4 text-4xl">{item.icon}</div>
                <div className="mb-2 text-sm font-medium text-primary">Step {item.step}</div>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep dive sections - Enhanced with expandable content */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="group transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                💼
              </div>
              <CardTitle className="text-2xl mb-2">Professional Mode</CardTitle>
              <CardDescription className="text-base">
                Nail your next interview, pitch, or presentation with AI-powered coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Upload your resume and job description for targeted questions",
                  "Practice with real interview questions from top companies",
                  "Get instant feedback on your delivery and content",
                  "Track improvement with detailed analytics"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Casual Mode removed */}
        </div>
      </section>

      {/* Demo video - Enhanced with better spacing */}
      <section className="container mx-auto max-w-5xl px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            See Aurify in action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how our AI coach helps you communicate with confidence
          </p>
        </div>
        
        <div className="rounded-2xl border bg-card p-6 shadow-lg">
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
              title="Aurify Demo Video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="mt-6 flex items-center justify-center">
            <Button asChild size="lg" className="group">
              <a href="/practice" className="flex items-center gap-2">
                Try it yourself
                <PlayCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA - Enhanced with better visual hierarchy */}
      <section className="container mx-auto max-w-7xl px-4 py-32">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-16 text-center text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Ready to find your voice?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their communication skills with Aurify
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="group">
                <a href="/login" className="flex items-center gap-2">
                  Create free account
                  <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                <a href="/pricing">View pricing plans</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
