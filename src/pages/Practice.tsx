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
          </TabsList>

          <TabsContent value="professional" className="space-y-6">
            <ScenarioProfessional />
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
        <CardTitle>Choose Your Practice Scenario</CardTitle>
        <CardDescription>Select what you'd like to practice and start your AI-powered session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="flex gap-3 pt-4">
          <Button 
            variant="hero" 
            onClick={() => navigate(`/session?mode=practice&scenario=${encodeURIComponent(getScenarioForSession())}`)}
            disabled={isCustom && !customScenario.trim()}
            size="lg"
            className="flex-1"
          >
            Start Practice Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Practice;
