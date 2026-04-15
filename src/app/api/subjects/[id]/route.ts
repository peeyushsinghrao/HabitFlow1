import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { chapter, progress, status, notes } = body;
    const item = await db.subjectProgress.update({
      where: { id },
      data: {
        ...(chapter !== undefined && { chapter }),
        ...(progress !== undefined && { progress }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { chapter, progress, status, notes } = body;
    const item = await db.subjectProgress.update({
      where: { id },
      data: {
        ...(chapter !== undefined && { chapter }),
        ...(progress !== undefined && { progress }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.subjectProgress.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
