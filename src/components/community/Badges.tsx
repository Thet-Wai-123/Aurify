import React, { useEffect, useState } from 'react';
import { getBadges } from '@/services/communityService';
import type { Badge } from '@/types/community';

export default function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  useEffect(()=>{(async()=>{setBadges(await getBadges())})();},[]);

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Badges</h3>
      <div className="grid grid-cols-2 gap-3">
        {badges.map(b=> (
          <div key={b.id} className="rounded border p-3">
            <div className="font-medium">{b.name}</div>
            <div className="text-xs text-muted-foreground">{b.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
