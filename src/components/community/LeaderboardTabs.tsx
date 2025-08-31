import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Row = { user: string; country: string; streak: number; score: number };

const sample: Row[] = [
  { user: 'Ava', country: 'US', streak: 12, score: 87 },
  { user: 'Kenji', country: 'JP', streak: 9, score: 84 },
  { user: 'Lina', country: 'DE', streak: 7, score: 81 },
  { user: 'Malik', country: 'KE', streak: 15, score: 92 },
];

export default function LeaderboardTabs({ userId }: { userId?: string }){
  const [tab, setTab] = useState<'global'|'friends'|'this_week'|'all_time'>('global');
  const [data, setData] = useState<Row[]>([]);

  useEffect(()=>{ setData(sample); },[]);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button className={`btn ${tab==='global'?'btn-primary':''}`} onClick={()=>setTab('global')}>Global</button>
        <button className={`btn ${tab==='friends'?'btn-primary':''}`} onClick={()=>setTab('friends')}>Friends</button>
        <button className={`btn ${tab==='this_week'?'btn-primary':''}`} onClick={()=>setTab('this_week')}>This Week</button>
        <button className={`btn ${tab==='all_time'?'btn-primary':''}`} onClick={()=>setTab('all_time')}>All Time</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map(r=> (
          <Card key={r.user}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between"><span>{r.user} · {r.country}</span><span className="text-sm text-muted-foreground">Streak: {r.streak}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full rounded bg-secondary"><div className="h-2 rounded bg-primary" style={{ width: `${r.score}%` }} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
