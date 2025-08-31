import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sendFriendRequest } from '@/services/communityService';

type Props = { userId: string; currentUserId?: string };

export default function FriendButton({ userId, currentUserId }: Props) {
  const [status, setStatus] = useState<'none'|'pending'|'accepted'>('none');

  const onClick = async () => {
    if (!currentUserId) return;
    try {
      setStatus('pending');
      await sendFriendRequest(currentUserId, userId);
    } catch (e) {
      setStatus('none');
    }
  };

  return <Button onClick={onClick} disabled={status!=='none'}>{status==='none'? 'Add Friend' : status==='pending' ? 'Requested' : 'Friends'}</Button>;
}
