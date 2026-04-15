import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { answer, isResolved, question, topic } = body;
  const doubt = await db.doubtNote.update({
    where: { id },
    data: {
      ...(answer !== undefined && { answer }),
      ...(isResolved !== undefined && { isResolved }),
      ...(question !== undefined && { question }),
      ...(topic !== undefined && { topic }),
    },
  });
  return NextResponse.json(doubt);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.doubtNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
