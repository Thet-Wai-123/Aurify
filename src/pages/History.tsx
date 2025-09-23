import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import JellyfishAvatar from "@/components/branding/JellyfishAvatar";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/components/ui/use-toast";

interface Score { name: string; score: number }
type SavedResponse = string | { question?: string; response: string; expectedElements?: string[] };
interface HistoryItem {
  id: number;
  createdAt: string;
  scenario: string;
  mode: string;
  coachName: string;
  voice: string;
  // older versions saved an array of strings; newer versions save objects
  responses: SavedResponse[];
  scores: Score[];
}

const speak = (text: string) => {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

// NEW: safely extract text from either string or object response shapes
const getResponseText = (r: SavedResponse) =>
  typeof r === "string" ? r : (r.response ?? r.question ?? "");

const History = () => {
  useSEO({ title: "History – Aurify", description: "Review past practice sessions with transcripts, scores, and replay." });
  const { toast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aurify_history");
      const list = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  const empty = useMemo(() => items.length === 0, [items]);

  if (empty) {
    return (
      <main className="container mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">History</h1>
            <p className="text-muted-foreground">Your saved sessions appear here.</p>
          </div>
          <JellyfishAvatar size={80} />
        </header>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>No sessions yet</CardTitle>
            <CardDescription>Practice to see your progress over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/practice">Start Practicing</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 pb-24 pt-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">History</h1>
          <p className="text-muted-foreground">Saved sessions with scores and transcripts.</p>
        </div>
        <JellyfishAvatar size={80} />
      </header>

      <div className="grid gap-4">
        {items.map((it) => (
          <Card key={it.id} className="animate-fade-in">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{it.scenario} · {it.mode === "quiz" ? "Quiz" : "Practice"}</CardTitle>
                <CardDescription>{new Date(it.createdAt).toLocaleString()}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {it.scores.map((s) => (
                  <div key={s.name} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{s.name}</span><span className="text-muted-foreground">{s.score}</span></div>
                    <div className="h-2 w-full rounded bg-secondary">
                      <div className="h-2 rounded bg-primary" style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const toSpeak = it.responses.map(getResponseText).filter(Boolean).join(". ");
                    speak(toSpeak);
                  }}
                >
                  Replay (TTS)
                </Button>
                <Button onClick={() => setExpanded(expanded === it.id ? null : it.id)}>{expanded === it.id ? "Hide Details" : "View Details"}</Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const next = items.filter(x => x.id !== it.id);
                    localStorage.setItem("aurify_history", JSON.stringify(next));
                    setItems(next);
                    toast({ title: "Deleted", description: "Session removed from history." });
                  }}
                >
                  Delete
                </Button>
              </div>
              {expanded === it.id && (
                <div className="mt-4 rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Coach: {it.coachName} · Voice: {it.voice}</p>
                  <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm">
                    {it.responses.map((r, idx) => {
                      const text = getResponseText(r);
                      return (
                        <li key={idx}><span className="font-medium">Q{idx + 1}:</span> {text}</li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default History;
