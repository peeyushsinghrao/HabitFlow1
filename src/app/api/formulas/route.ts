import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const formulas = await db.formulaEntry.findMany({
    where: { userId: userId, ...(subject ? { subject } : {}) },
    orderBy: [{ subject: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(formulas);
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  const body = await request.json();
  const { subject, chapter = '', formula, desc = '', tags = '' } = body;
  if (!subject?.trim() || !formula?.trim()) return NextResponse.json({ error: 'Subject and formula required' }, { status: 400 });
  const entry = await db.formulaEntry.create({
    data: { userId: userId, subject: subject.trim(), chapter, formula: formula.trim(), desc, tags },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.formulaEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
