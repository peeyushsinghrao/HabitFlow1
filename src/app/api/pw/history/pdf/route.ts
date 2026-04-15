import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

// GET /api/pw/history/pdf?date=2026-04-09
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Fetch history record
    const record = await db.pWHistory.findUnique({
      where: { date },
    });

    // Even if no history record, try to fetch live data
    let classes: {
      subject: string;
      time: string;
      topic: string;
      teacher: string;
      attendedLive: boolean;
      attendedRecorded: boolean;
    }[] = [];
    let todos: { title: string; completed: boolean }[] = [];
    let daily: {
      studyWork: Record<string, boolean>;
      task: Record<string, string | boolean>;
    } = { studyWork: {}, task: {} };
    let isRestDay = false;
    let hasTest = false;
    let classesAttended = 0;
    let todosCompleted = 0;
    let todosTotal = 0;

    if (record) {
      classes = JSON.parse(record.classesJson);
      todos = JSON.parse(record.todosJson);
      daily = JSON.parse(record.dailyJson);
      isRestDay = record.isRestDay;
      hasTest = record.hasTest;
      classesAttended = record.classesAttended;
      todosCompleted = record.todosCompleted;
      todosTotal = record.todosTotal;
    } else {
      // Fetch live data if no snapshot exists
      const [dailyRecord, classRecords, todoRecords] = await Promise.all([
        db.pWDaily.findUnique({ where: { date } }),
        db.pWClass.findMany({ where: { date }, orderBy: { createdAt: 'asc' } }),
        db.pWTodo.findMany({ orderBy: { createdAt: 'asc' } }),
      ]);

      if (dailyRecord) {
        isRestDay = dailyRecord.isRestDay;
        hasTest = dailyRecord.hasTask;
        daily = {
          studyWork: {
            theoryRevised: dailyRecord.theoryRevised,
            dppSolved: dailyRecord.dppSolved,
            practiceSheet: dailyRecord.practiceSheet,
            pyqPracticed: dailyRecord.pyqPracticed,
            formulaRevised: dailyRecord.formulaRevised,
          },
          task: {
            hasTask: dailyRecord.hasTask,
            testName: dailyRecord.testName,
            score: dailyRecord.taskScore,
            accuracy: dailyRecord.taskAccuracy,
            mistakes: dailyRecord.taskMistakes,
            improvedAt: dailyRecord.taskImprovedAt,
          },
        };
      }

      classes = classRecords.map((c) => ({
        subject: c.subject,
        time: c.time,
        topic: c.topic,
        teacher: c.teacher,
        attendedLive: c.attendedLive,
        attendedRecorded: c.attendedRecorded,
      }));
      classesAttended = classes.filter(
        (c) => c.attendedLive || c.attendedRecorded,
      ).length;

      todos = todoRecords.map((t) => ({
        title: t.title,
        completed: t.completed,
      }));
      todosCompleted = todos.filter((t) => t.completed).length;
      todosTotal = todos.length;
    }

    // Format date for display
    const dateObj = new Date(date + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Collect PDF bytes
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(new Uint8Array(chunk)));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // ── Color palette (warm copper theme) ──
    const PRIMARY = '#C08552';
    const DARK = '#4B2E2B';
    const MUTED = '#8C5A3C';
    const BG_LIGHT = '#FFF8F0';
    const SUCCESS = '#22C55E';
    const WHITE = '#FFFFFF';

    // ── Background ──
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);

    // ── Header band ──
    doc.rect(0, 0, doc.page.width, 100).fill(PRIMARY);
    doc.fillColor(WHITE).fontSize(24).font('Helvetica-Bold');
    doc.text('Nuviora', 50, 30, { align: 'left' });
    doc.fontSize(11).font('Helvetica');
    doc.text('Daily Study Report', 50, 60, { align: 'left' });
    doc.fontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 50, 78, {
      align: 'left',
    });

    // ── Date Section ──
    let y = 120;
    doc.fillColor(PRIMARY).fontSize(20).font('Helvetica-Bold');
    doc.text(formattedDate, 50, y, { align: 'center', width: 495 });
    y += 25;
    doc.fillColor(MUTED).fontSize(12).font('Helvetica');
    doc.text(dayName, 50, y, { align: 'center', width: 495 });
    y += 30;

    // ── Status badges ──
    if (isRestDay) {
      doc.roundedRect(170, y, 255, 28, 14).fill('#FEF3C7');
      doc.fillColor('#92400E').fontSize(11).font('Helvetica-Bold');
      doc.text('☕ REST DAY — No Classes', 170, y + 8, {
        width: 255,
        align: 'center',
      });
      y += 40;
    }

    // ── Stats Summary ──
    doc.roundedRect(50, y, 495, 70, 8).fill(WHITE);
    doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold');
    doc.text('Quick Stats', 65, y + 10);
    doc.fillColor(MUTED).fontSize(10).font('Helvetica');

    const statsData = [
      { label: 'Classes Attended', value: `${classesAttended}` },
      { label: 'Study Tasks Done', value: `${todosCompleted}/${todosTotal}` },
      { label: 'Had Test', value: hasTest ? 'Yes' : 'No' },
    ];
    statsData.forEach((stat, i) => {
      const xOff = 65 + i * 165;
      doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold');
      doc.text(stat.value, xOff, y + 28, { width: 145, align: 'center' });
      doc.fillColor(MUTED).fontSize(9).font('Helvetica');
      doc.text(stat.label, xOff, y + 50, { width: 145, align: 'center' });
    });
    y += 90;

    // ── Classes Table ──
    if (classes.length > 0) {
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold');
      doc.text('📚 Classes', 50, y);
      y += 22;

      // Table header
      doc.roundedRect(50, y, 495, 22, 4).fill(PRIMARY);
      doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold');
      const headers = ['Subject', 'Time', 'Topic', 'Teacher', 'Type'];
      const colWidths = [100, 55, 140, 100, 100];
      let xPos = 55;
      headers.forEach((h, i) => {
        doc.text(h, xPos, y + 6, { width: colWidths[i] });
        xPos += colWidths[i];
      });
      y += 26;

      // Table rows
      classes.forEach((cls, idx) => {
        const rowH = 22;
        if (y + rowH > doc.page.height - 60) {
          doc.addPage();
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
          y = 50;
        }

        doc
          .roundedRect(50, y, 495, rowH, idx % 2 === 0 ? 0 : 0)
          .fill(idx % 2 === 0 ? WHITE : '#FFF0E0');
        doc.fillColor(DARK).fontSize(8).font('Helvetica');
        xPos = 55;
        const rowData = [
          cls.subject || '—',
          cls.time || '—',
          cls.topic || '—',
          cls.teacher || '—',
          cls.attendedLive ? 'Live ✓' : cls.attendedRecorded ? 'Recorded ✓' : '—',
        ];
        rowData.forEach((d, i) => {
          doc.text(d, xPos, y + 6, { width: colWidths[i] });
          xPos += colWidths[i];
        });
        y += rowH;
      });
      y += 10;
    }

    // ── Study Work ──
    const sw = daily.studyWork || {};
    if (Object.keys(sw).length > 0) {
      if (y + 60 > doc.page.height - 60) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
        y = 50;
      }
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold');
      doc.text('📖 Study Work', 50, y);
      y += 20;

      doc.roundedRect(50, y, 495, 45, 8).fill(WHITE);
      const studyItems = [
        { label: 'Theory Revised', done: sw.theoryRevised },
        { label: 'DPP Solved', done: sw.dppSolved },
        { label: 'Practice Sheet', done: sw.practiceSheet },
        { label: 'PYQ Practiced', done: sw.pyqPracticed },
        { label: 'Formula Revised', done: sw.formulaRevised },
      ];
      studyItems.forEach((item, i) => {
        const ix = 65 + (i % 3) * 160;
        const iy = y + 8 + Math.floor(i / 3) * 20;
        const check = item.done ? '✓' : '○';
        doc
          .fillColor(item.done ? SUCCESS : '#D1D5DB')
          .fontSize(10)
          .font(item.done ? 'Helvetica-Bold' : 'Helvetica');
        doc.text(`${check} ${item.label}`, ix, iy);
      });
      y += 55;
    }

    // ── To-Do List ──
    if (todos.length > 0) {
      if (y + 30 + todos.length * 20 > doc.page.height - 60) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
        y = 50;
      }
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold');
      doc.text(`✅ To-Do List (${todosCompleted}/${todosTotal})`, 50, y);
      y += 20;

      todos.forEach((todo) => {
        const rowH = 18;
        if (y + rowH > doc.page.height - 60) {
          doc.addPage();
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
          y = 50;
        }
        doc.roundedRect(50, y, 495, rowH, 4).fill(WHITE);
        const check = todo.completed ? '✓' : '○';
        doc
          .fillColor(todo.completed ? SUCCESS : MUTED)
          .fontSize(9)
          .font(todo.completed ? 'Helvetica-Bold' : 'Helvetica');
        doc.text(
          `${check}  ${todo.title}`,
          65,
          y + 4,
        );
        y += rowH;
      });
      y += 10;
    }

    // ── Test Info ──
    const task = daily.task || {};
    if (hasTest && task) {
      if (y + 120 > doc.page.height - 60) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
        y = 50;
      }
      doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold');
      doc.text('📝 Test Details', 50, y);
      y += 20;

      doc.roundedRect(50, y, 495, 80, 8).fill(WHITE);
      doc.fillColor(DARK).fontSize(9).font('Helvetica');

      const taskFields = [
        { label: 'Test Name', value: String(task.testName || '—') },
        { label: 'Score', value: String(task.score || '—') },
        { label: 'Accuracy', value: String(task.accuracy || '—') },
        { label: 'Mistakes', value: String(task.mistakes || '—') },
        { label: 'Improved At', value: String(task.improvedAt || '—') },
      ];

      taskFields.forEach((field, i) => {
        const iy = y + 8 + i * 15;
        doc.fillColor(MUTED).font('Helvetica-Bold').text(`${field.label}:`, 65, iy);
        doc
          .fillColor(DARK)
          .font('Helvetica')
          .text(
            field.value.length > 60 ? field.value.slice(0, 60) + '...' : field.value,
            170,
            iy,
          );
      });
      y += 90;
    }

    // ── Footer ──
    if (y + 40 > doc.page.height - 30) {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG_LIGHT);
      y = doc.page.height - 80;
    }
    doc
      .moveTo(50, doc.page.height - 40)
      .lineTo(545, doc.page.height - 40)
      .stroke(PRIMARY);
    doc
      .fillColor(MUTED)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Generated by Nuviora — Your Personal Study Companion',
        50,
        doc.page.height - 30,
        {
          align: 'center',
          width: 495,
        },
      );

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nuviora-${date}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
