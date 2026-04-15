'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, Check, X, Trash2, Clock, Trophy, Flame, Star } from 'lucide-react';
import { toast } from 'sonner';

interface FriendStats {
  currentStreak: number;
  level: number;
  xp: number;
  totalCompleted: number;
}

interface Friend {
  userId: string;
  name: string;
  username: string | null;
  studentClass: string;
  examGoal: string;
  stats: FriendStats | null;
  friendshipId: string;
}

interface PendingRequest {
  friendshipId: string;
  userId: string;
  name: string;
  username: string;
}

interface FriendsData {
  friends: Friend[];
  incomingRequests: PendingRequest[];
  outgoingRequests: PendingRequest[];
}

const cardCls = 'bg-card border border-border/40 rounded-2xl p-4 shadow-card';

export function FriendsScreen() {
  const [data, setData] = useState<FriendsData>({ friends: [], incomingRequests: [], outgoingRequests: [] });
  const [loading, setLoading] = useState(true);
  const [addUsername, setAddUsername] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error('Could not load friends.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: addUsername.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Could not send request.');
      } else {
        toast.success(`Friend request sent to @${json.target?.username || addUsername}!`);
        setAddUsername('');
        load();
        setActiveTab('requests');
      }
    } catch {
      toast.error('Something went wrong.');
    }
    setAddLoading(false);
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        toast.success('Friend request accepted!');
        load();
        setActiveTab('friends');
      } else {
        toast.error('Could not accept request.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) {
        toast.success('Request declined.');
        load();
      } else {
        toast.error('Could not decline request.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const handleRemove = async (friendshipId: string, name: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Removed ${name} from friends.`);
        load();
      } else {
        toast.error('Could not remove friend.');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const totalPending = data.incomingRequests.length + data.outgoingRequests.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="space-y-4 pb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Friends</h2>
          <p className="text-xs text-muted-foreground">{data.friends.length} friend{data.friends.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Add Friend Form */}
      <div className={cardCls}>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Add a Friend</p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-medium">@</span>
            <input
              type="text"
              placeholder="username"
              value={addUsername}
              onChange={e => setAddUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_\.]/g, ''))}
              className="w-full h-11 pl-7 pr-4 rounded-xl bg-muted/60 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={addLoading || addUsername.trim().length < 3}
            className="h-11 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90"
          >
            {addLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><UserPlus className="h-4 w-4" /> Add</>
            )}
          </button>
        </form>
<<<<<<< HEAD
        <p className="text-[11px] text-muted-foreground mt-2">Enter your friend's exact username to send a request.</p>
=======
        <p className="text-xs text-muted-foreground mt-2">Enter your friend's exact username to send a request.</p>
>>>>>>> 925ef42 (Initial commit)
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        {([
          { id: 'friends', label: 'Friends', count: data.friends.length },
          { id: 'requests', label: 'Requests', count: totalPending },
        ] as { id: 'friends' | 'requests'; label: string; count: number }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            {tab.label}
            {tab.count > 0 && (
<<<<<<< HEAD
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
=======
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-black ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
>>>>>>> 925ef42 (Initial commit)
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Friends List */}
        {activeTab === 'friends' && (
          <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : data.friends.length === 0 ? (
              <div className={`${cardCls} flex flex-col items-center justify-center py-10 text-center gap-3`}>
                <div className="w-14 h-14 rounded-3xl bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No friends yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a friend above using their username</p>
                </div>
              </div>
            ) : (
              data.friends.map((friend) => (
                <motion.div
                  key={friend.userId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cardCls}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{friend.name?.[0]?.toUpperCase() || '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{friend.name}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username || 'unknown'}</p>
                        {(friend.studentClass || friend.examGoal) && (
<<<<<<< HEAD
                          <p className="text-[11px] text-primary/70 font-medium mt-0.5">
=======
                          <p className="text-xs text-primary/70 font-medium mt-0.5">
>>>>>>> 925ef42 (Initial commit)
                            {friend.studentClass}{friend.studentClass && friend.examGoal ? ' · ' : ''}{friend.examGoal}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(friend.friendshipId, friend.name)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {friend.stats && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/40">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-amber-500" />
                          <span className="text-sm font-black text-foreground">{friend.stats.currentStreak}</span>
                        </div>
<<<<<<< HEAD
                        <p className="text-[10px] text-muted-foreground">Streak</p>
=======
                        <p className="text-xs text-muted-foreground">Streak</p>
>>>>>>> 925ef42 (Initial commit)
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-primary" />
                          <span className="text-sm font-black text-foreground">Lv {friend.stats.level}</span>
                        </div>
<<<<<<< HEAD
                        <p className="text-[10px] text-muted-foreground">Level</p>
=======
                        <p className="text-xs text-muted-foreground">Level</p>
>>>>>>> 925ef42 (Initial commit)
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-violet-500" />
                          <span className="text-sm font-black text-foreground">{friend.stats.totalCompleted}</span>
                        </div>
<<<<<<< HEAD
                        <p className="text-[10px] text-muted-foreground">Done</p>
=======
                        <p className="text-xs text-muted-foreground">Done</p>
>>>>>>> 925ef42 (Initial commit)
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Incoming */}
            {data.incomingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incoming Requests</p>
                {data.incomingRequests.map(req => (
                  <motion.div key={req.friendshipId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-base">{req.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{req.name}</p>
                          <p className="text-xs text-muted-foreground">@{req.username || 'unknown'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleAccept(req.friendshipId)}
                          className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        >
                          <Check className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleReject(req.friendshipId)}
                          className="w-9 h-9 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Outgoing */}
            {data.outgoingRequests.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent Requests</p>
                {data.outgoingRequests.map(req => (
                  <motion.div key={req.friendshipId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{req.name || req.username}</p>
                          <p className="text-xs text-muted-foreground">@{req.username} · Pending</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(req.friendshipId, req.username)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {data.incomingRequests.length === 0 && data.outgoingRequests.length === 0 && (
              <div className={`${cardCls} flex flex-col items-center justify-center py-10 text-center gap-3`}>
                <div className="w-14 h-14 rounded-3xl bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No pending requests</p>
                  <p className="text-xs text-muted-foreground mt-1">Add friends by their username above</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
