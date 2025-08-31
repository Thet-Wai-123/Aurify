import React, { useEffect, useState } from 'react';
import { getFeed, createPost } from '@/services/communityService';
import type { Post } from '@/types/community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = { userId?: string };

export default function Feed({ userId }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getFeed(userId, true, 30);
      setPosts(data as Post[]);
    })();
  }, [userId]);

  const onPost = async () => {
    if (!userId || !text.trim()) return;
    const p = await createPost(userId, text.trim());
    setPosts((s) => [p, ...s]);
    setText('');
  };

  return (
    <div>
      {userId && (
        <div className="mb-4 flex gap-2">
          <Input placeholder="Share an update..." value={text} onChange={(e:any)=>setText(e.target.value)} />
          <Button onClick={onPost}>Post</Button>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.username || p.user_id}</div>
              <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            <div className="mt-1 text-sm">{p.message}</div>
            <div className="mt-2 text-xs text-muted-foreground">Streak: {p.streak || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
