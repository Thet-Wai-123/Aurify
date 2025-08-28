import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import JellyfishAvatar from "@/components/branding/JellyfishAvatar";
import { useSEO } from "@/hooks/use-seo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Field = ({ id, label, placeholder, textarea = false, type = "text" }: { id: string; label: string; placeholder?: string; textarea?: boolean; type?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {textarea ? (
      <Textarea id={id} placeholder={placeholder} className="min-h-[120px]" />
    ) : (
      <Input id={id} placeholder={placeholder} type={type} />
    )}
  </div>
);

const Practice = () => {
  useSEO({
    title: "Practice – Aurify",
    description: "Scenario-based practice for interviews, pitching, stand-ups, and friendships with AI feedback.",
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 pb-24 pt-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Practice</h1>
          <p className="text-muted-foreground">Choose a mode, add context, and start.</p>
        </div>
        <JellyfishAvatar size={96} circular />
      </header>

      <Tabs defaultValue="professional" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="casual">Casual</TabsTrigger>
        </TabsList>

        <TabsContent value="professional" className="space-y-6">
          <ScenarioProfessional />
        </TabsContent>

        <TabsContent value="casual" className="space-y-6">
          <ScenarioCasual />
        </TabsContent>
      </Tabs>
    </main>
  );
};

const ScenarioProfessional = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState("Interviews");
  const [customScenario, setCustomScenario] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleScenarioChange = (value: string) => {
    setScenario(value);
    setIsCustom(value === "Custom");
    if (value !== "Custom") {
      setCustomScenario("");
    }
  };

  const getScenarioForSession = () => {
    return isCustom && customScenario.trim() ? customScenario.trim() : scenario;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Setup</CardTitle>
        <CardDescription>Select a scenario, attach your resume, and paste the job description.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Scenario</Label>
          <Select defaultValue={scenario} onValueChange={handleScenarioChange}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Select scenario" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Interviews">Interviews</SelectItem>
              <SelectItem value="Stand-up Meetings">Stand-up Meetings</SelectItem>
              <SelectItem value="Pitching Startups">Pitching Startups</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {isCustom && (
            <Input 
              className="mt-2" 
              placeholder="Type your custom scenario..." 
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="resumeFile">Resume (PDF or DOC/DOCX)</Label>
          <Input id="resumeFile" type="file" accept=".pdf,.doc,.docx" />
        </div>
        <div className="md:col-span-2">
          <Field id="jd" label="Job Description (paste)" placeholder="Paste text here" textarea />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <Button 
            variant="hero" 
            onClick={() => navigate(`/session?mode=practice&scenario=${encodeURIComponent(getScenarioForSession())}`)}
            disabled={isCustom && !customScenario.trim()}
          >
            Start Session
          </Button>
          <Button variant="outline">Use Voice</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ScenarioCasual = () => {
  const navigate = useNavigate();
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Improve a Friendship</CardTitle>
          <CardDescription>Describe your friend and your intention for the next chat.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field id="friend" label="Friend name & traits" placeholder="e.g., Ali – introverted, punctual, loves hiking" />
          <Field id="intention" label="Intention" placeholder="e.g., reconnect, resolve tension about X, plan trip" />
          <Field id="context" label="Context" placeholder="What happened recently? Any sensitivities?" textarea />
          <Button onClick={() => navigate(`/session?mode=practice&scenario=${encodeURIComponent("Improve Friendship")}`)}>Get Conversation Starters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Make a New Friend</CardTitle>
          <CardDescription>Enter your info, the event, and the kind of friend you're looking for.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field id="you" label="About you" placeholder="Tell us about yourself" />
          <Field id="event" label="Event" placeholder="e.g., hackathon, meetup, conference" />
          <Field id="lookingFor" label="Looking for" placeholder="e.g., accountability buddy, hiking pal" />
          <Button onClick={() => navigate(`/session?mode=practice&scenario=${encodeURIComponent("Make a New Friend")}`)}>Get Suggestions</Button>
        </CardContent>
      </Card>
    </>
  );
};

export default Practice;
