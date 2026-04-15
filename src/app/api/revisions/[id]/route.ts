import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { doneReview1, doneReview3, doneReview7 } = body;
    const item = await db.revisionItem.update({
      where: { id },
      data: {
        ...(doneReview1 !== undefined && { doneReview1 }),
        ...(doneReview3 !== undefined && { doneReview3 }),
        ...(doneReview7 !== undefined && { doneReview7 }),
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating revision:', error);
    return NextResponse.json({ error: 'Failed to update revision' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.revisionItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting revision:', error);
    return NextResponse.json({ error: 'Failed to delete revision' }, { status: 500 });
  }
}
