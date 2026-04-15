import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const userId = getRequestUserId(request);

    const [sent, received] = await Promise.all([
      db.friendship.findMany({ where: { userId } }),
      db.friendship.findMany({ where: { friendId: userId } }),
    ]);

    const acceptedFriendIds = [
      ...sent.filter(f => f.status === 'accepted').map(f => f.friendId),
      ...received.filter(f => f.status === 'accepted').map(f => f.userId),
    ];

    const pendingReceived = received.filter(f => f.status === 'pending');
    const pendingSent = sent.filter(f => f.status === 'pending');

    const [friends, requestors, pending] = await Promise.all([
      db.userProfile.findMany({
        where: { userId: { in: acceptedFriendIds } },
        select: { userId: true, name: true, username: true, studentClass: true, examGoal: true },
      }),
      db.userProfile.findMany({
        where: { userId: { in: pendingReceived.map(f => f.userId) } },
        select: { userId: true, name: true, username: true },
      }),
      db.userProfile.findMany({
        where: { userId: { in: pendingSent.map(f => f.friendId) } },
        select: { userId: true, name: true, username: true },
      }),
    ]);

    const friendsWithStats = await Promise.all(
      friends.map(async (f) => {
        const stats = await db.userStats.findUnique({
          where: { userId: f.userId },
          select: { currentStreak: true, level: true, xp: true, totalCompleted: true },
        });
        const friendshipRecord = sent.find(s => s.friendId === f.userId) || received.find(r => r.userId === f.userId);
        return { ...f, stats, friendshipId: friendshipRecord?.id };
      })
    );

    const incomingRequests = pendingReceived.map(f => {
      const profile = requestors.find(p => p.userId === f.userId);
      return { friendshipId: f.id, userId: f.userId, name: profile?.name || '', username: profile?.username || '' };
    });

    const outgoingRequests = pendingSent.map(f => {
      const profile = pending.find(p => p.userId === f.friendId);
      return { friendshipId: f.id, userId: f.friendId, name: profile?.name || '', username: profile?.username || '' };
    });

    return NextResponse.json({ friends: friendsWithStats, incomingRequests, outgoingRequests });
  } catch (error) {
    console.error('Friends GET error:', error);
    return NextResponse.json({ error: 'Failed to load friends.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getRequestUserId(request);
    const body = await request.json();
    const targetUsername = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';

    if (!targetUsername) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const target = await db.userProfile.findUnique({
      where: { username: targetUsername },
      select: { userId: true, name: true, username: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'No user found with that username.' }, { status: 404 });
    }

    if (target.userId === userId) {
      return NextResponse.json({ error: "You can't add yourself as a friend." }, { status: 400 });
    }

    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: target.userId },
          { userId: target.userId, friendId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'You are already friends.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'A friend request already exists.' }, { status: 409 });
    }

    const friendship = await db.friendship.create({
      data: { userId, friendId: target.userId, status: 'pending' },
    });

    return NextResponse.json({ friendship, target });
  } catch (error) {
    console.error('Friends POST error:', error);
    return NextResponse.json({ error: 'Failed to send friend request.' }, { status: 500 });
  }
}
