import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/pw/classes?date=2026-04-09
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const classes = await db.pWClass.findMany({
      where: { date },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching PW classes:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST /api/pw/classes — Create or batch-save classes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, classes, _action } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Batch save: delete existing + create new
    if (_action === 'save-batch' && Array.isArray(classes)) {
      await db.pWClass.deleteMany({ where: { date } });

      for (const cls of classes) {
        await db.pWClass.create({
          data: {
            date,
            subject: cls.subject || '',
            topic: cls.topic || '',
            teacher: cls.teacher || '',
            time: cls.time || '',
            attendedLive: cls.attendedLive ?? false,
            attendedRecorded: cls.attendedRecorded ?? false,
          },
        });
      }

      const updated = await db.pWClass.findMany({
        where: { date },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(updated);
    }

    // Single class create
    const cls = await db.pWClass.create({
      data: {
        date,
        subject: body.subject || '',
        topic: body.topic || '',
        teacher: body.teacher || '',
        time: body.time || '',
        attendedLive: body.attendedLive ?? false,
        attendedRecorded: body.attendedRecorded ?? false,
      },
    });

    return NextResponse.json(cls);
  } catch (error) {
    console.error('Error saving PW classes:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
