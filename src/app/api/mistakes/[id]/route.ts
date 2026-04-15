import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { correction, isResolved, topic, mistake, source } = body;
    const note = await db.mistakeNote.update({
      where: { id },
      data: {
        ...(correction !== undefined && { correction }),
        ...(isResolved !== undefined && { isResolved }),
        ...(topic !== undefined && { topic }),
        ...(mistake !== undefined && { mistake }),
        ...(source !== undefined && { source }),
      },
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating mistake:', error);
    return NextResponse.json({ error: 'Failed to update mistake' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.mistakeNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mistake:', error);
    return NextResponse.json({ error: 'Failed to delete mistake' }, { status: 500 });
  }
}
