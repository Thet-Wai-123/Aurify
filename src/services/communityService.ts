import { supabase } from '@/lib/supabase';
import type { Post, Badge, Challenge, UserSummary } from '@/types/community';

export async function getFeed(userId?: string, friendsFirst = true, limit = 50) {
  // fetch friends' posts first if userId provided
  if (!userId) {
    const { data } = await supabase.from('posts').select(`*, users:auth_users(id, display_name)`).order('created_at', { ascending: false }).limit(limit);
    // transform minimal
    // @ts-ignore
    return (data || []).map((r) => ({ id: r.id, user_id: r.user_id, username: r.user_display_name || r.user?.display_name || 'User', message: r.message, streak: r.streak, confidence: r.confidence, created_at: r.created_at }));
  }

  // fetch friend ids
  const fr = await supabase.from('friendships').select('requester,requestee,status').or(`requester.eq.${userId},requestee.eq.${userId}`);
  const friendIds = new Set<string>();
  if (fr.data) {
    fr.data.forEach((f: any) => {
      if (f.status === 'accepted') {
        friendIds.add(f.requester);
        friendIds.add(f.requestee);
      }
    });
    friendIds.delete(userId);
  }

  // fetch friends posts
  const friendsArr = Array.from(friendIds);
  const friendPostsQ = friendsArr.length ? supabase.from('posts').select('*').in('user_id', friendsArr).order('created_at', { ascending: false }).limit(limit) : Promise.resolve({ data: [] });
  const globalPostsQ = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(limit);

  const [friendPostsRes, globalPostsRes] = await Promise.all([friendPostsQ, globalPostsQ]);
  const friendPosts = (friendPostsRes as any).data || [];
  const globalPosts = (globalPostsRes as any).data || [];

  const merged = friendsFirst ? [...friendPosts, ...globalPosts.filter((g: any) => !friendPosts.some((f: any) => f.id === g.id))] : [...globalPosts];
  return merged.map((r: any) => ({ id: r.id, user_id: r.user_id, username: r.username || 'User', message: r.message, streak: r.streak, confidence: r.confidence, created_at: r.created_at } as Post));
}

export async function createPost(userId: string, message: string, streak?: number, confidence?: number) {
  const { data, error } = await supabase.from('posts').insert([{ user_id: userId, message, streak, confidence }]).select();
  if (error) throw error;
  return data?.[0] as Post;
}

export async function sendFriendRequest(requester: string, requestee: string) {
  const { data, error } = await supabase.from('friendships').insert([{ requester, requestee, status: 'pending' }]).select();
  if (error) throw error;
  return data?.[0];
}

export async function respondFriendRequest(id: string, accept: boolean) {
  const status = accept ? 'accepted' : 'rejected';
  const { data, error } = await supabase.from('friendships').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

export async function getBadges() {
  const { data } = await supabase.from('badges').select('*');
  return (data || []) as Badge[];
}

export async function getChallenges() {
  const { data } = await supabase.from('challenges').select('*').order('starts_at', { ascending: true });
  return (data || []) as Challenge[];
}

export async function getChallengeProgress(challengeId: string) {
  const { data } = await supabase.from('challenge_progress').select('*').eq('challenge_id', challengeId);
  return (data || []);
}

export default { getFeed, createPost, sendFriendRequest, respondFriendRequest, getBadges, getChallenges };
