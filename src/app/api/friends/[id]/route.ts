import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getRequestUserId(request);
    const { id } = await params;
    const body = await request.json();
    const action = body.action as 'accept' | 'reject';

    const friendship = await db.friendship.findUnique({ where: { id } });
    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found.' }, { status: 404 });
    }

    if (friendship.friendId !== userId) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }

    if (action === 'accept') {
      const updated = await db.friendship.update({
        where: { id },
        data: { status: 'accepted' },
      });
      return NextResponse.json({ friendship: updated });
    }

    if (action === 'reject') {
      await db.friendship.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Friends PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update friend request.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getRequestUserId(request);
    const { id } = await params;

    const friendship = await db.friendship.findUnique({ where: { id } });
    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found.' }, { status: 404 });
    }

    if (friendship.userId !== userId && friendship.friendId !== userId) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }

    await db.friendship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Friends DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove friend.' }, { status: 500 });
  }
}
