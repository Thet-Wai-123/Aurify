import React, { useEffect, useState } from 'react';
import { getChallenges, getChallengeProgress } from '@/services/communityService';
import type { Challenge } from '@/types/community';

export default function Challenges(){
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  useEffect(()=>{(async()=>{setChallenges(await getChallenges())})();},[]);

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Active Challenges</h3>
      <div className="space-y-3">
        {challenges.map(c=> (
          <div key={c.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(c.starts_at).toLocaleDateString()} - {new Date(c.ends_at).toLocaleDateString()}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{c.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
