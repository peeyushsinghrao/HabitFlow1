'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, TrendingUp, Target, Zap, CalendarClock, ChevronRight, BookOpen, Clock, Moon, Printer } from 'lucide-react';

interface StudyBlock {
  time: string;
  duration: number;
  subject: string;
  task: string;
  type: 'study' | 'break' | 'revision' | 'mock' | 'wrap';
  emoji: string;
}

interface SummaryStats {
  completionRate: number;
  streak: number;
  totalFocusMin: number;
  avgMood: number;
  avgSleep: number;
  level: number;
  xp: number;
  topHabits: string[];
  weakHabits: string[];
}


const BLOCK_TYPE_CONFIG: Record<StudyBlock['type'], { bg: string; border: string; dot: string }> = {
  study:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200/60 dark:border-blue-700/30',    dot: 'bg-blue-500' },
  break:    { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200/60 dark:border-green-700/30',  dot: 'bg-green-500' },
  revision: { bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200/60 dark:border-amber-700/30',  dot: 'bg-amber-500' },
  mock:     { bg: 'bg-rose-50 dark:bg-rose-900/20',    border: 'border-rose-200/60 dark:border-rose-700/30',    dot: 'bg-rose-500' },
  wrap:     { bg: 'bg-violet-50 dark:bg-violet-900/20',border: 'border-violet-200/60 dark:border-violet-700/30',dot: 'bg-violet-500' },
};

function AriaAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
      }}
    >
      A
    </div>
  );
}

export function AISummaryScreen() {
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const [dailyPlan, setDailyPlan] = useState<StudyBlock[] | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [planGeneratedAt, setPlanGeneratedAt] = useState('');

  const fetchDailyPlan = async () => {
    setPlanLoading(true);
    setDailyPlan(null);
    try {
      const res = await fetch(`/api/ai-study-plan?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDailyPlan(data.plan || []);
        setPlanGeneratedAt(data.generatedAt || '');
        setPlanExpanded(true);
      }
    } catch { }
    setPlanLoading(false);
  };

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || '');
        setStats(data.stats || null);
        setLoaded(true);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const printPlan = () => {
    if (!dailyPlan || dailyPlan.length === 0) return;
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const TYPE_LABEL: Record<string, string> = { study: 'Study', break: 'Break', revision: 'Revision', mock: 'Mock Test', wrap: 'Wrap-up' };
    const rows = dailyPlan.map(b => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;font-weight:600;white-space:nowrap;color:#1a1a1a">${b.emoji} ${b.time}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#444">${b.subject || '—'}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#555">${b.task}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;color:#888;white-space:nowrap">${b.duration} min</td>
        <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;color:#888">${TYPE_LABEL[b.type] || b.type}</td>
      </tr>`).join('');
    const total = dailyPlan.reduce((a, b) => a + b.duration, 0);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>Study Plan – ${today}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Segoe UI',Arial,sans-serif; padding:40px; color:#1a1a1a; background:#fff; }
          h1 { font-size:22px; font-weight:800; color:#C08552; margin-bottom:4px; }
          .subtitle { font-size:13px; color:#888; margin-bottom:28px; }
          table { width:100%; border-collapse:collapse; }
          th { background:#f9f6f3; padding:10px 14px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#888; border-bottom:2px solid #e8ddd4; }
          th:last-child,th:nth-child(4) { text-align:right; }
          th:nth-child(5) { text-align:center; }
          tr:last-child td { border-bottom:none; }
          .total { margin-top:20px; text-align:right; font-size:13px; color:#888; }
          .total strong { color:#C08552; font-weight:700; }
          .footer { margin-top:36px; font-size:11px; color:#bbb; text-align:center; border-top:1px solid #f0e8e0; padding-top:16px; }
          .check-col { width:80px; }
          .checkbox { display:inline-block; width:16px; height:16px; border:2px solid #C08552; border-radius:4px; vertical-align:middle; }
        </style>
      </head><body>
        <h1>📚 Today&apos;s Study Plan</h1>
        <div class="subtitle">${today}${planGeneratedAt ? ` · Generated at ${planGeneratedAt}` : ''}</div>
        <table>
          <thead><tr>
            <th>Time</th><th>Subject</th><th>Task</th><th>Duration</th><th>Type</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="total">Total study time: <strong>${Math.floor(total / 60)}h ${total % 60}m</strong></div>
        <div class="footer">Generated by Nuviora · nuviora.app</div>
      </body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const lines = summary.split('\n').filter(l => l.trim());

  const statCards = stats ? [
    { icon: Target, label: 'Habits This Week', value: `${stats.completionRate}%`, sub: 'completion rate', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Zap, label: 'Streak', value: `${stats.streak}`, sub: 'days in a row 🔥', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Clock, label: 'Focus Time', value: `${Math.floor(stats.totalFocusMin / 60)}h ${stats.totalFocusMin % 60}m`, sub: 'this week', color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { icon: TrendingUp, label: 'Level', value: `${stats.level}`, sub: `${stats.xp} XP earned`, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Moon, label: 'Avg Sleep', value: stats.avgSleep > 0 ? `${stats.avgSleep.toFixed(1)}h` : '—', sub: 'per night', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { icon: BookOpen, label: 'Mood Score', value: stats.avgMood > 0 ? `${stats.avgMood.toFixed(1)}/5` : '—', sub: 'avg this week', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ] : [];

  return (
    <div className="space-y-4 pt-2 pb-4">

      {/* Aria Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AriaAvatar size={36} />
          <div>
            <h2 className="text-base font-bold leading-tight">Aria — Your Study Buddy</h2>
            <p className="text-xs text-muted-foreground">Remembers your conversations · Always here for you</p>
          </div>
        </div>
        {loaded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={fetchSummary}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
              >
                <span className="text-xl text-white font-bold">A</span>
              </motion.div>
              <div className="text-center">
                <p className="font-semibold text-sm">Aria is analysing your week…</p>
                <p className="text-xs text-muted-foreground mt-0.5">Checking habits, focus, sleep & mood</p>
              </div>
              <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loaded && (
        <>
          {/* Stat Cards grid */}
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              {statCards.map(({ icon: Icon, label, value, sub, color, bg }) => (
                <Card key={label} className="border border-border/40 shadow-sm">
                  <CardContent className="p-3">
                    <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary card */}
          <Card className="border border-violet-200/40 dark:border-violet-800/20 shadow-sm bg-gradient-to-br from-violet-50/70 to-purple-50/50 dark:from-violet-900/15 dark:to-purple-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AriaAvatar size={20} />
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Aria&apos;s Weekly Summary</p>
                <Sparkles className="h-3.5 w-3.5 text-violet-500 ml-auto" />
              </div>
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    className="text-sm leading-relaxed text-foreground/90"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Habits highlights */}
          {stats && (stats.topHabits.length > 0 || stats.weakHabits.length > 0) && (
            <div className="grid grid-cols-2 gap-2">
              {stats.topHabits.length > 0 && (
                <Card className="border border-emerald-200/40 dark:border-emerald-800/20 shadow-sm bg-emerald-50/70 dark:bg-emerald-900/10">
                  <CardContent className="p-3">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">✅ Strongest</p>
                    {stats.topHabits.slice(0, 3).map((h, i) => (
                      <p key={i} className="text-xs text-foreground/80 leading-snug">• {h}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
              {stats.weakHabits.length > 0 && (
                <Card className="border-0 shadow-sm bg-amber-50/70 dark:bg-amber-900/10">
                  <CardContent className="p-3">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5">⚠️ Needs Work</p>
                    {stats.weakHabits.slice(0, 3).map((h, i) => (
                      <p key={i} className="text-xs text-foreground/80 leading-snug">• {h}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* AI Daily Study Plan */}
          <Card className="border border-sky-200/40 dark:border-sky-800/20 shadow-sm bg-gradient-to-br from-sky-50/70 to-blue-50/50 dark:from-sky-900/15 dark:to-blue-900/10">
            <CardContent className="p-0">
              <button
                className="w-full flex items-center gap-2 p-4 pb-3"
                onClick={() => {
                  if (!dailyPlan) {
                    fetchDailyPlan();
                  } else {
                    setPlanExpanded(p => !p);
                  }
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <CalendarClock className="h-4 w-4 text-sky-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">Today&apos;s AI Study Plan</p>
                  <p className="text-xs text-muted-foreground">
                    {planGeneratedAt ? `Generated at ${planGeneratedAt}` : 'Time-blocked plan for the rest of your day'}
                  </p>
                </div>
                {planLoading ? (
                  <RefreshCw className="h-4 w-4 text-sky-500 animate-spin" />
                ) : dailyPlan ? (
                  <motion.div animate={{ rotate: planExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ) : (
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                    Generate
                  </span>
                )}
              </button>

              <AnimatePresence>
                {planExpanded && dailyPlan && dailyPlan.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {dailyPlan.map((block, i) => {
                        const cfg = BLOCK_TYPE_CONFIG[block.type] || BLOCK_TYPE_CONFIG.study;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex gap-3 items-start rounded-xl px-3 py-2.5 border ${cfg.bg} ${cfg.border}`}
                          >
                            <span className="text-lg leading-none mt-0.5">{block.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-foreground">{block.time}</span>
                                {block.subject && (
                                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full text-white ${cfg.dot}`}>
                                    {block.subject}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">{block.duration} min</span>
                              </div>
                              <p className="text-xs text-foreground/80 leading-snug mt-0.5">{block.task}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={fetchDailyPlan}
                          disabled={planLoading}
                          className="flex-1 text-center text-xs font-semibold text-sky-600 dark:text-sky-400 disabled:opacity-50"
                        >
                          {planLoading ? '⏳ Regenerating…' : '↻ Regenerate Plan'}
                        </button>
                        <button
                          onClick={printPlan}
                          className="flex items-center gap-1.5 text-xs font-semibold text-foreground/60 hover:text-foreground bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Printer className="h-3 w-3" />
                          Print / PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
