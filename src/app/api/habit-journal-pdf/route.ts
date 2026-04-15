import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { format, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { getRequestUserId } from '@/lib/auth-user';

export async function GET(req: Request) {
  try {
    const userId = getRequestUserId(req);
    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get('year') || String(new Date().getFullYear());
    const monthStr = searchParams.get('month') || String(new Date().getMonth() + 1);
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const monthEnd = format(new Date(year, month - 1, getDaysInMonth(new Date(year, month - 1))), 'yyyy-MM-dd');
    const monthName = format(new Date(year, month - 1, 1), 'MMMM yyyy');

    const [habits, profile, stats] = await Promise.all([
      db.habit.findMany({
        where: { userId, isArchived: false },
        include: { logs: { where: { date: { gte: monthStart, lte: monthEnd }, status: 'completed' } } },
        orderBy: { sortOrder: 'asc' },
      }),
      db.userProfile.findUnique({ where: { userId: userId } }),
      db.userStats.findUnique({ where: { userId: userId } }),
    ]);

    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const completionByDay: Record<number, number> = {};
    for (const day of days) {
      const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
      const completedCount = habits.filter(h => h.logs.some(l => l.date === dateStr)).length;
      completionByDay[day] = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    }

    const totalCompletions = habits.reduce((a, h) => a + h.logs.length, 0);
    const possibleCompletions = habits.length * daysInMonth;
    const overallRate = possibleCompletions > 0 ? Math.round((totalCompletions / possibleCompletions) * 100) : 0;

    const habitRows = habits.map(h => {
      const cells = days.map(day => {
        const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
        const done = h.logs.some(l => l.date === dateStr);
        return `<td style="width:20px;height:20px;text-align:center;border:1px solid #e8d5c4;background:${done ? '#C08552' : '#FFF8F0'};color:${done ? '#fff' : '#ccc'};font-size:9px">${done ? '✓' : '·'}</td>`;
      }).join('');
      const rate = Math.round((h.logs.length / daysInMonth) * 100);
      return `<tr>
        <td style="padding:4px 8px;font-size:11px;white-space:nowrap;border:1px solid #e8d5c4">${h.icon} ${h.name}</td>
        ${cells}
        <td style="padding:4px 8px;font-size:11px;font-weight:700;color:#C08552;border:1px solid #e8d5c4;text-align:center">${rate}%</td>
      </tr>`;
    }).join('');

    const dayHeaders = days.map(d => `<th style="width:20px;font-size:8px;text-align:center;padding:2px;border:1px solid #e8d5c4">${d}</th>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nuviora Habit Journal — ${monthName}</title>
  <style>
    @media print { body { margin: 0; } @page { size: A4 landscape; margin: 10mm; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #FFF8F0; margin: 0; padding: 20px; }
    h1 { color: #C08552; margin: 0 0 4px; }
    .subtitle { color: #8C5A3C; font-size: 13px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; font-size: 10px; }
    th { background: #FFEFD8; color: #8C5A3C; font-weight: 600; }
    .stats-grid { display: flex; gap: 12px; margin-bottom: 16px; }
    .stat-box { background: white; border-radius: 10px; padding: 12px 16px; text-align: center; box-shadow: 0 1px 4px rgba(192,133,82,0.15); }
    .stat-num { font-size: 24px; font-weight: 700; color: #C08552; }
    .stat-lbl { font-size: 10px; color: #8C5A3C; }
    .print-btn { background: #C08552; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 16px; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <h1>🔥 Nuviora Habit Journal</h1>
  <div class="subtitle">${monthName} • ${profile?.name || 'Student'} • Level ${stats?.level ?? 1}</div>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  <div class="stats-grid">
    <div class="stat-box"><div class="stat-num">${overallRate}%</div><div class="stat-lbl">Monthly Rate</div></div>
    <div class="stat-box"><div class="stat-num">${totalCompletions}</div><div class="stat-lbl">Total Completions</div></div>
    <div class="stat-box"><div class="stat-num">${stats?.currentStreak ?? 0}</div><div class="stat-lbl">Current Streak 🔥</div></div>
    <div class="stat-box"><div class="stat-num">${habits.length}</div><div class="stat-lbl">Active Habits</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="padding:6px 8px;text-align:left;border:1px solid #e8d5c4;min-width:120px">Habit</th>
        ${dayHeaders}
        <th style="padding:6px 8px;border:1px solid #e8d5c4">Rate</th>
      </tr>
    </thead>
    <tbody>${habitRows}</tbody>
  </table>
  <div style="margin-top:20px;padding:12px;background:white;border-radius:10px;font-size:11px;color:#8C5A3C;text-align:center">
    Generated by Nuviora • Your Personal Habit Tracker • Track habits. Build streaks. Level up.
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate journal' }, { status: 500 });
  }
}
