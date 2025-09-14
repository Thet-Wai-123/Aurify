import * as React from "react";
import Loader from "@/components/ui/Loader";
import { getDashboardData, DashboardData } from "@/lib/data/sessions";

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    getDashboardData()
      .then(d => alive && setData(d))
      .catch(e => alive && setError(e?.message ?? "Failed to load dashboard"));
    return () => { alive = false; };
  }, []);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return <Loader label="Loading dashboard…" fullscreen overlay />;

  return (
    <div className="p-4 space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total Sessions" value={data.totalSessions} />
        <Stat label="Avg. Score" value={`${data.avgScore ?? "-"}%`} />
        <Stat label="Streak" value={`${data.streakDays ?? 0} days`} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Sessions</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-muted/40">
              <tr><Th>Started</Th><Th>Topic</Th><Th>Duration</Th><Th>Score</Th></tr>
            </thead>
            <tbody>
              {data.recent.map(s => (
                <tr key={s.id} className="border-t">
                  <Td>{new Date(s.startedAt).toLocaleString()}</Td>
                  <Td>{s.topic}</Td>
                  <Td>{s.durationMin} min</Td>
                  <Td>{s.score ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button className="px-3 py-2 rounded-lg border">Start Practice</button>
        <button className="px-3 py-2 rounded-lg border bg-muted/40">Review Last Session</button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
const Th: React.FC<React.PropsWithChildren> = ({ children }) =>
  <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<React.PropsWithChildren> = ({ children }) =>
  <td className="p-2">{children}</td>;
