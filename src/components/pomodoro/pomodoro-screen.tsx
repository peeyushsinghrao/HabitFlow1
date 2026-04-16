'use client';

import { SubjectFocusChart } from './subject-focus-chart';
import { getSubjectColors } from '@/lib/subject-colors';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings2,
  Maximize2,
  X,
  Timer,
  Coffee,
  TreePine,
  Target,
  CheckCircle2,
  Volume2,
  VolumeX,
  BookOpen,
  CloudRain,
  LampDesk,
  MessageSquareWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
}

interface TodayStats {
  date: string;
  completed: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  settings: 'habitflow-pomodoro-settings',
  todayStats: 'habitflow-pomodoro-today',
} as const;

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartNext: false,
  soundEnabled: true,
};

const MODE_CONFIG: Record<TimerMode, { label: string; icon: React.ElementType; color: string }> = {
  work: { label: 'Focus', icon: Target, color: 'bg-primary text-primary-foreground' },
  shortBreak: { label: 'Short Break', icon: Coffee, color: 'bg-emerald-500 text-white' },
  longBreak: { label: 'Long Break', icon: TreePine, color: 'bg-amber-500 text-white' },
};

const RING_RADIUS = 120;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ─── Service Worker + Notification Helpers ───────────────────────────────────

let swRegistration: ServiceWorkerRegistration | null = null;

async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    // SW not supported
  }
}

async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

function scheduleTimerNotification(endTime: number, mode: TimerMode) {
  const sw = swRegistration?.active ?? navigator.serviceWorker?.controller;
  if (sw) {
    sw.postMessage({ type: 'SCHEDULE_TIMER', endTime, mode });
  }
}

function cancelTimerNotification() {
  const sw = swRegistration?.active ?? navigator.serviceWorker?.controller;
  if (sw) {
    sw.postMessage({ type: 'CANCEL_TIMER' });
  }
}

// ─── Audio Utilities (Web Audio API) ────────────────────────────────────────

// ─── Ambient Sound System ─────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

type AmbientSound = 'none' | 'rain' | 'cafe' | 'whitenoise' | 'forest' | 'lofi';
type FocusVisualTheme = 'plain' | 'library' | 'rainy' | 'cafe';
type DistractionReason = 'phone' | 'noise' | 'thought' | 'other';

interface DistractionJournalEntry {
  id: string;
  date: string;
  reason: DistractionReason;
  note: string;
  subject: string;
  count: number;
  createdAt: string;
}

interface PendingDistractionJournal {
  date: string;
  subject: string;
  count: number;
}

const AMBIENT_SOUNDS: { id: AmbientSound; label: string; emoji: string }[] = [
  { id: 'none', label: 'None', emoji: '🔇' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'whitenoise', label: 'White Noise', emoji: '🌊' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'lofi', label: 'Lo-fi', emoji: '🎵' },
];

const VISUAL_THEMES: { id: FocusVisualTheme; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'plain', label: 'Clean', icon: Target, description: 'Minimal timer view' },
  { id: 'library', label: 'Library', icon: BookOpen, description: 'Warm desk study vibe' },
  { id: 'rainy', label: 'Rainy', icon: CloudRain, description: 'Cool window ambience' },
  { id: 'cafe', label: 'Café', icon: Coffee, description: 'Soft coffeehouse glow' },
];

const DISTRACTION_REASONS: { id: DistractionReason; label: string; hint: string }[] = [
  { id: 'phone', label: 'Phone', hint: 'notifications or scrolling' },
  { id: 'noise', label: 'Noise', hint: 'people, traffic, environment' },
  { id: 'thought', label: 'Thought', hint: 'overthinking or mind wandering' },
  { id: 'other', label: 'Other', hint: 'anything else' },
];

function generateAmbientNoise(ctx: AudioContext, type: AmbientSound): AudioBufferSourceNode | null {
  if (type === 'none') return null;
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'whitenoise' || type === 'rain') {
    // White/pink noise base
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'rain') {
        lastOut = 0.99 * lastOut + 0.01 * white;
        data[i] = lastOut * (type === 'rain' ? 12 : 1);
      } else {
        data[i] = white;
      }
    }
  } else if (type === 'cafe') {
    // Cafe: low rumble + occasional noise bursts
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * 0.15 + Math.sin(2 * Math.PI * 80 * t) * 0.03;
    }
  } else if (type === 'forest') {
    // Forest: layered low-frequency noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
  } else if (type === 'lofi') {
    // Lo-fi: simple chord-like tones
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (
        Math.sin(2 * Math.PI * 220 * t) * 0.1 +
        Math.sin(2 * Math.PI * 277 * t) * 0.08 +
        Math.sin(2 * Math.PI * 330 * t) * 0.06 +
        (Math.random() * 2 - 1) * 0.02
      );
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function startAmbientSound(type: AmbientSound, volume = 0.3) {
  stopAmbientSound();
  if (type === 'none') return;
  try {
    const ctx = getAudioContext();
    const source = generateAmbientNoise(ctx, type);
    if (!source) return;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    ambientSource = source;
    ambientGain = gain;
  } catch {
    // Audio not supported
  }
}

function stopAmbientSound() {
  try {
    if (ambientSource) { ambientSource.stop(); ambientSource = null; }
    if (ambientGain) { ambientGain.disconnect(); ambientGain = null; }
  } catch { /* ignore */ }
}

function updateAmbientGainVolume(vol: number) {
  if (ambientGain) ambientGain.gain.value = vol;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNotificationBeep() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone - C5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Second tone - E5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 659.25;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.25, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.1);

    // Third tone - G5
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 783.99;
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0.2, now + 0.5);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc3.start(now + 0.5);
    osc3.stop(now + 1.4);
  } catch {
    // Audio not supported, silently ignore
  }
}

function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Audio not supported, silently ignore
  }
}

function triggerVibration(pattern: number | number[] = 200) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not supported
  }
}

// ─── localStorage Helpers ────────────────────────────────────────────────────

function loadSettings(): PomodoroSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: PomodoroSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function loadTodayStats(): TodayStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.todayStats);
    if (stored) {
      const data = JSON.parse(stored) as TodayStats;
      if (data.date === getTodayString()) {
        return data;
      }
    }
  } catch {
    // ignore
  }
  return { date: getTodayString(), completed: 0 };
}

function saveTodayStats(stats: TodayStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.todayStats, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface FocusSession {
  id: string;
  duration: number;
  notes: string | null;
  xpEarned: number;
  createdAt: string;
}

function getUserSubjects(studentClass?: string): string[] {
  if (!studentClass) return ['Study Session', 'Revision', 'Mock Test', 'Reading', 'English', 'Maths'];
  const c = studentClass;
  if (c.includes('PCM')) return ['Physics', 'Chemistry', 'Maths', 'Revision', 'Mock Test'];
  if (c.includes('PCB')) return ['Physics', 'Chemistry', 'Biology', 'Revision', 'Mock Test'];
  if (c.includes('PCMB')) return ['Physics', 'Chemistry', 'Maths', 'Biology', 'Revision'];
  if (c.includes('Commerce')) return ['Accounts', 'Business Studies', 'Economics', 'Maths', 'Revision'];
  if (c.includes('Humanities')) return ['History', 'Geography', 'Economics', 'English', 'Revision'];
  const num = Number(studentClass.match(/\d+/)?.[0]);
  if (num >= 9 && num <= 10) return ['Maths', 'Science', 'English', 'Social Studies', 'Revision'];
  if (num >= 6 && num <= 8) return ['Maths', 'Science', 'English', 'Hindi', 'Study Session'];
  return ['Study Session', 'Revision', 'Mock Test', 'Reading', 'English'];
}

function getClassNumber(sc?: string) {
  if (!sc) return 0;
  return Number(sc.match(/\d+/)?.[0]) || 0;
}

function loadDistractionJournal(): DistractionJournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('nuviora-distraction-journal');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getThemeClasses(theme: FocusVisualTheme, focusMode: boolean) {
  if (theme === 'library') {
    return focusMode
      ? 'bg-[radial-gradient(circle_at_25%_20%,rgba(245,158,11,0.22),transparent_30%),linear-gradient(135deg,#2b2118,#120f0c)]'
      : 'bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32%),linear-gradient(135deg,rgba(120,53,15,0.08),rgba(255,255,255,0))]';
  }
  if (theme === 'rainy') {
    return focusMode
      ? 'bg-[radial-gradient(circle_at_75%_10%,rgba(125,211,252,0.22),transparent_30%),linear-gradient(135deg,#0f172a,#111827)]'
      : 'bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_35%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(255,255,255,0))]';
  }
  if (theme === 'cafe') {
    return focusMode
      ? 'bg-[radial-gradient(circle_at_30%_10%,rgba(251,146,60,0.20),transparent_28%),linear-gradient(135deg,#2a1810,#1b1210)]'
      : 'bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.12),transparent_34%),linear-gradient(135deg,rgba(180,83,9,0.08),rgba(255,255,255,0))]';
  }
  return focusMode ? 'bg-warm-900 dark:bg-neutral-950' : '';
}

// ─── Tree System ─────────────────────────────────────────────────────────────

type TreeType = 'oak' | 'pine' | 'cherry' | 'bamboo' | 'cactus';

const TREE_TYPES: { id: TreeType; label: string; emoji: string; desc: string }[] = [
  { id: 'oak',    label: 'Oak',     emoji: '🌳', desc: 'Strong & steady' },
  { id: 'pine',   label: 'Pine',    emoji: '🌲', desc: 'Tall & focused' },
  { id: 'cherry', label: 'Blossom', emoji: '🌸', desc: 'Soft & vibrant' },
  { id: 'bamboo', label: 'Bamboo',  emoji: '🎋', desc: 'Fast & flexible' },
  { id: 'cactus', label: 'Cactus',  emoji: '🌵', desc: 'Tough & persistent' },
];

function GrowingTree({ growth, treeType = 'oak', size = 90 }: { growth: number; treeType?: TreeType; size?: number }) {
  const g = Math.max(0, Math.min(1, growth));
  const stage = g < 0.2 ? '🌱 Seed' : g < 0.5 ? '🌿 Sprout' : g < 0.8 ? '🌳 Growing' : '✨ Flourishing';
  const tr = 'transform 0.7s ease, opacity 0.7s ease';
  const h = Math.round(size * 96 / 90);

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <svg
        width={size} height={h} viewBox="0 0 90 96"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 10px rgba(30,80,30,0.2))' }}
      >
        <defs>
          <radialGradient id="tg-oak" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#5ec45e" />
            <stop offset="100%" stopColor="#236b26" />
          </radialGradient>
          <radialGradient id="tg-cherry" cx="45%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#ffbdd0" />
            <stop offset="100%" stopColor="#d85c7a" />
          </radialGradient>
          <linearGradient id="tg-trunk" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6b4226" />
            <stop offset="50%" stopColor="#a0622a" />
            <stop offset="100%" stopColor="#6b4226" />
          </linearGradient>
        </defs>

        {/* ── OAK ── */}
        {treeType === 'oak' && (
          <>
            <rect x="40" y={88 - 5 - g * 22} width="8" height={5 + g * 22} rx="3.5"
              fill="url(#tg-trunk)" style={{ transition: 'all 0.7s ease' }} />
            <ellipse cx="44" cy="88.5" rx={3 + g * 7} ry="2" fill="#7a4f28" opacity="0.28"
              style={{ transition: 'all 0.7s ease' }} />
            <g style={{
              transformBox: 'fill-box', transformOrigin: 'center bottom',
              transform: `scale(${0.08 + g * 0.92})`,
              opacity: 0.15 + g * 0.85, transition: tr,
            }}>
              <ellipse cx="44" cy="55" rx="24" ry="19" fill="url(#tg-oak)" />
              <ellipse cx="29" cy="64" rx="17" ry="14" fill="#2e8832" />
              <ellipse cx="59" cy="62" rx="16" ry="13" fill="#2c8630" />
              <ellipse cx="44" cy="44" rx="16" ry="13" fill="#4ab84e" />
              <ellipse cx="35" cy="51" rx="11" ry="9" fill="#54c258" opacity="0.65" />
              <ellipse cx="53" cy="53" rx="10" ry="9" fill="#52c056" opacity="0.6" />
            </g>
          </>
        )}

        {/* ── PINE ── */}
        {treeType === 'pine' && (
          <>
            <rect x="41" y={88 - 5 - g * 20} width="6" height={5 + g * 20} rx="2.5"
              fill="url(#tg-trunk)" style={{ transition: 'all 0.7s ease' }} />
            <g style={{
              transformBox: 'fill-box', transformOrigin: 'center bottom',
              transform: `scaleY(${0.08 + g * 0.92})`,
              opacity: 0.12 + g * 0.88, transition: tr,
            }}>
              <path d="M44,80 L67,86 Q44,90 21,86 Z" fill="#1e6620" />
              <path d="M44,67 L64,75 Q44,78 24,75 Z" fill="#247028" />
              <path d="M44,53 L61,63 Q44,66 27,63 Z" fill="#2c7c30" />
              <path d="M44,39 L57,51 Q44,54 31,51 Z" fill="#348a38" />
              <path d="M44,25 L52,39 Q44,42 36,39 Z" fill="#3c9840" />
              <path d="M44,12 L48,25 Q44,27 40,25 Z" fill="#44a648" />
            </g>
          </>
        )}

        {/* ── CHERRY BLOSSOM ── */}
        {treeType === 'cherry' && (
          <>
            <rect x="42" y={88 - 4 - g * 26} width="4" height={4 + g * 26} rx="2"
              fill="#8b5e3c" style={{ transition: 'all 0.7s ease' }} />
            <g style={{
              transformBox: 'fill-box', transformOrigin: 'center bottom',
              transform: `scale(${0.08 + g * 0.92})`,
              opacity: 0.12 + g * 0.88, transition: tr,
            }}>
              <circle cx="44" cy="52" r="21" fill="url(#tg-cherry)" />
              <circle cx="29" cy="61" r="15" fill="#f06e8e" opacity="0.88" />
              <circle cx="59" cy="59" r="14" fill="#ec6888" opacity="0.85" />
              <circle cx="44" cy="38" r="13" fill="#ffc8d6" opacity="0.78" />
              <circle cx="34" cy="45" r="9" fill="#f9aabf" opacity="0.65" />
              <circle cx="54" cy="48" r="8" fill="#f9a8bc" opacity="0.6" />
            </g>
          </>
        )}

        {/* ── BAMBOO ── */}
        {treeType === 'bamboo' && (
          <>
            <rect x="27" y={Math.max(4, 88 - g * 62)} width="8" height={Math.max(0, g * 62)} rx="4"
              fill="#58a028" style={{ transition: 'all 0.7s ease', opacity: 0.1 + g * 0.9 }} />
            <rect x="38" y={Math.max(4, 88 - g * 76)} width="9" height={Math.max(0, g * 76)} rx="4.5"
              fill="#68b830" style={{ transition: 'all 0.7s ease' }} />
            <rect x="51" y={Math.max(4, 88 - g * 55)} width="8" height={Math.max(0, g * 55)} rx="4"
              fill="#55a025" style={{ transition: 'all 0.7s ease', opacity: 0.1 + g * 0.9 }} />
            {g > 0.2 && (
              <>
                <ellipse cx="42.5" cy={88 - g * 26} rx="6" ry="2.8" fill="#3d7a18" opacity="0.8" />
                <ellipse cx="42.5" cy={88 - g * 52} rx="6" ry="2.8" fill="#3d7a18"
                  style={{ opacity: g > 0.45 ? 0.8 : 0, transition: 'opacity 0.5s ease' }} />
              </>
            )}
            <g style={{ opacity: g > 0.35 ? 0.9 : 0, transition: 'opacity 0.6s ease' }}>
              <ellipse cx="42" cy={88 - g * 74} rx={g * 14} ry={g * 4.5}
                fill="#80d040" transform={`rotate(-28 42 ${88 - g * 74})`}
                style={{ transition: 'all 0.7s ease' }} />
              <ellipse cx="27" cy={88 - g * 60} rx={g * 12} ry={g * 4}
                fill="#78cc38" transform={`rotate(-38 27 ${88 - g * 60})`}
                style={{ transition: 'all 0.7s ease' }} />
              <ellipse cx="59" cy={88 - g * 52} rx={g * 11} ry={g * 4}
                fill="#74c834" transform={`rotate(32 59 ${88 - g * 52})`}
                style={{ transition: 'all 0.7s ease' }} />
            </g>
          </>
        )}

        {/* ── CACTUS ── */}
        {treeType === 'cactus' && (
          <>
            <rect x="35" y={88 - 4 - g * 54} width="14" height={4 + g * 54} rx="7"
              fill="#4e9e40" style={{ transition: 'all 0.7s ease' }} />
            {g > 0.15 && [
              [42, 88 - g * 16],
              [42, 88 - g * 32],
              [42, 88 - g * 47],
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1={x - 6} y1={y} x2={x - 2} y2={y} stroke="#2d6c22" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <line x1={x + 2} y1={y} x2={x + 6} y2={y} stroke="#2d6c22" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              </g>
            ))}
            <path
              d={`M35,${88 - g * 32} C${27 - g * 2},${88 - g * 32} ${23 - g},${88 - g * 44} ${28},${88 - g * 44}`}
              stroke="#4e9e40" strokeWidth="10" strokeLinecap="round" fill="none"
              style={{ opacity: g > 0.4 ? 0.15 + g * 0.85 : 0, transition: 'opacity 0.5s ease' }}
            />
            <path
              d={`M49,${88 - g * 24} C${57 + g * 2},${88 - g * 24} ${61 + g},${88 - g * 36} ${56},${88 - g * 36}`}
              stroke="#4e9e40" strokeWidth="10" strokeLinecap="round" fill="none"
              style={{ opacity: g > 0.6 ? 0.15 + g * 0.85 : 0, transition: 'opacity 0.5s ease' }}
            />
            <circle cx="42" cy={88 - 4 - g * 54}
              r={g > 0.85 ? 3 + (g - 0.85) * 18 : 0}
              fill="#ff5252" style={{ transition: 'all 0.7s ease' }} />
          </>
        )}
      </svg>
      <motion.p key={stage} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
        className={`font-medium text-muted-foreground ${size >= 130 ? 'text-xs' : 'text-xs'}`}>
        {stage}
      </motion.p>
    </div>
  );
}

function TreeStorePicker({
  current,
  onChange,
  onClose,
}: {
  current: TreeType;
  onChange: (t: TreeType) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: 6 }}
      transition={{ duration: 0.18 }}
      className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border shadow-2xl rounded-2xl p-4 w-[280px]"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider">🌳 Tree Store</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {TREE_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => { onChange(t.id); onClose(); }}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all',
              current === t.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border/60 hover:border-primary/40 hover:bg-muted/50',
            )}
          >
            <span className="text-xl leading-none">{t.emoji}</span>
            <span className="text-[8px] font-medium leading-tight text-muted-foreground">{t.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/70 text-center mt-2.5 italic">
        {TREE_TYPES.find(t => t.id === current)?.desc}
      </p>
    </motion.div>
  );
}

export function PomodoroScreen({ studentClass }: { studentClass?: string } = {}) {
  // Settings
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(settings.workDuration * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(settings.workDuration * 60);
  const [currentSession, setCurrentSession] = useState(1);
  const [todayStats, setTodayStats] = useState<TodayStats>(loadTodayStats);

  // Focus mode
  const [focusMode, setFocusMode] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  // Subject/label selection (Phase 2)
  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  // Distraction tally (Phase 4)
  const [distractionCount, setDistractionCount] = useState(0);
  const [journalEntries, setJournalEntries] = useState<DistractionJournalEntry[]>([]);
  const [pendingJournal, setPendingJournal] = useState<PendingDistractionJournal | null>(null);
  const [journalReason, setJournalReason] = useState<DistractionReason>('phone');
  const [journalNote, setJournalNote] = useState('');

  // Long session mode (Phase 4): 90 min deep work
  const [isLongSession, setIsLongSession] = useState(false);

  // Auto-break suggestion (Phase 4)
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const breakSuggestions = [
    '💧 Drink a glass of water',
    '🧘 Take 5 deep breaths',
    '👀 Look at something 20 feet away for 20 seconds',
    '🤸 Do 10 jumping jacks',
    '🚶 Walk for 2 minutes',
    '🙆 Stretch your arms and neck',
  ];
  const breakSuggestionIdx = useMemo(() => Math.floor(Math.random() * breakSuggestions.length), []);

  // Ambient sound — restore last used sound from localStorage
  const [ambientSound, setAmbientSound] = useState<AmbientSound>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lastAmbientSound') as AmbientSound) || 'none';
    }
    return 'none';
  });
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [visualTheme, setVisualTheme] = useState<FocusVisualTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nuviora-focus-visual-theme') as FocusVisualTheme) || 'plain';
    }
    return 'plain';
  });

  // Tree type
  const [treeType, setTreeType] = useState<TreeType>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nuviora-tree-type') as TreeType) || 'oak';
    }
    return 'oak';
  });
  const [showTreeStore, setShowTreeStore] = useState(false);

  // Session notes & XP
  const [sessionNotes, setSessionNotes] = useState('');
  const [lastXP, setLastXP] = useState(0);
  const [showXPReward, setShowXPReward] = useState(false);

  // Session history
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Interval refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wall-clock end time for accurate background timing
  const endTimeRef = useRef<number | null>(null);

  // Midnight reset check
  const midnightCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Derived values ──────────────────────────────────────────────────────

  const progress = useMemo(
    () => (totalSeconds > 0 ? remainingSeconds / totalSeconds : 0),
    [remainingSeconds, totalSeconds],
  );

  const dashOffset = useMemo(
    () => RING_CIRCUMFERENCE * (1 - progress),
    [progress],
  );

  const displayMinutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const displaySeconds = String(remainingSeconds % 60).padStart(2, '0');

  const modeDuration = useMemo(() => {
    switch (mode) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
    }
  }, [mode, settings]);

  // ─── Settings update ─────────────────────────────────────────────────────

  const updateSettings = useCallback((partial: Partial<PomodoroSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleVisualThemeChange = useCallback((theme: FocusVisualTheme) => {
    setVisualTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nuviora-focus-visual-theme', theme);
    }
  }, []);

  const saveDistractionJournal = useCallback(() => {
    if (!pendingJournal) return;
    const entry: DistractionJournalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: pendingJournal.date,
      reason: journalReason,
      note: journalNote.trim(),
      subject: pendingJournal.subject,
      count: Math.max(1, pendingJournal.count),
      createdAt: new Date().toISOString(),
    };
    setJournalEntries(prev => {
      const next = [entry, ...prev].slice(0, 80);
      try {
        localStorage.setItem('nuviora-distraction-journal', JSON.stringify(next));
        window.dispatchEvent(new Event('nuviora-distraction-journal-updated'));
      } catch { /* ignore */ }
      return next;
    });
    setPendingJournal(null);
    setJournalNote('');
    setJournalReason('phone');
  }, [journalNote, journalReason, pendingJournal]);

  const skipDistractionJournal = useCallback(() => {
    setPendingJournal(null);
    setJournalNote('');
    setJournalReason('phone');
  }, []);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const focusSuggestions = useMemo(() => {
    if (mode !== 'work') {
      return [
        'Stand up and stretch your back for 30 seconds.',
        'Drink water before starting the next session.',
        'Do not open social apps during break.',
      ];
    }

    if (distractionCount >= 3) {
      return [
        'Put your phone away from your desk.',
        'Write distractions on paper, then return to the task.',
        'Use one tab only until this timer ends.',
      ];
    }

    return [
      'Pick one topic only for this session.',
      'Keep your phone out of reach.',
      'Write doubts after the timer, not during it.',
    ];
  }, [distractionCount, mode]);

  const distractionInsight = useMemo(() => {
    const since = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const recent = journalEntries.filter(entry => new Date(entry.createdAt).getTime() >= since);
    if (recent.length === 0) return null;
    const counts = recent.reduce<Record<DistractionReason, number>>((acc, entry) => {
      acc[entry.reason] = (acc[entry.reason] || 0) + Math.max(1, entry.count);
      return acc;
    }, { phone: 0, noise: 0, thought: 0, other: 0 });
    const top = (Object.entries(counts) as [DistractionReason, number][]).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] === 0) return null;
    const label = DISTRACTION_REASONS.find(reason => reason.id === top[0])?.label || 'Other';
    const tip = top[0] === 'phone'
      ? 'Try keeping your phone across the room before starting.'
      : top[0] === 'noise'
        ? 'Try headphones, white noise, or a quieter seat.'
        : top[0] === 'thought'
          ? 'Keep a scratchpad nearby and park thoughts for later.'
          : 'Add a short pre-focus checklist before your next timer.';
    return { label, count: top[1], sessions: recent.length, tip };
  }, [journalEntries]);

  // ─── Timer actions ───────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (settings.soundEnabled) playClickSound();
    triggerVibration(30);
    requestNotificationPermission();
    setIsRunning(true);
  }, [settings.soundEnabled]);

  const pauseTimer = useCallback(() => {
    if (settings.soundEnabled) playClickSound();
    triggerVibration(30);
    endTimeRef.current = null;
    cancelTimerNotification();
    setIsRunning(false);
  }, [settings.soundEnabled]);

  const resetTimer = useCallback(() => {
    if (settings.soundEnabled) playClickSound();
    triggerVibration(30);
    endTimeRef.current = null;
    cancelTimerNotification();
    setIsRunning(false);
    setRemainingSeconds(modeDuration * 60);
    setTotalSeconds(modeDuration * 60);
  }, [modeDuration, settings.soundEnabled]);

  const switchMode = useCallback((newMode: TimerMode) => {
    const duration = (() => {
      switch (newMode) {
        case 'work': return settings.workDuration;
        case 'shortBreak': return settings.shortBreakDuration;
        case 'longBreak': return settings.longBreakDuration;
      }
    })() * 60;
    setMode(newMode);
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
    setIsRunning(false);
  }, [settings]);

  // ─── Fetch session history ───────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/focus-sessions?limit=10');
      if (res.ok) {
        const data = await res.json();
        setSessionHistory(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setHistoryLoaded(true);
  }, []);

  const skipToNext = useCallback(() => {
    if (settings.soundEnabled) playClickSound();
    triggerVibration(30);

    if (mode === 'work') {
      // Completed work session → increment pomodoro count
      setTodayStats((prev) => {
        const updated = { ...prev, completed: prev.completed + 1, date: getTodayString() };
        saveTodayStats(updated);
        return updated;
      });

      // Determine next mode
      if (currentSession >= settings.sessionsBeforeLongBreak) {
        switchMode('longBreak');
        setCurrentSession(1);
      } else {
        switchMode('shortBreak');
      }
    } else {
      // Break completed → back to work
      setCurrentSession((prev) => prev + 1);
      switchMode('work');
    }
  }, [mode, currentSession, settings, switchMode, settings.soundEnabled]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (settings.soundEnabled) playNotificationBeep();
    triggerVibration([200, 100, 200, 100, 200]);

    if (mode === 'work') {
      const durationMins = isLongSession ? 90 : settings.workDuration;
      const xpEarned = Math.round(durationMins * 2);
      const label = selectedSubject || focusTask || null;
      const completedDistractions = distractionCount;

      // Show auto-break suggestion
      setShowBreakSuggestion(true);
      setTimeout(() => setShowBreakSuggestion(false), 8000);

      if (completedDistractions > 0) {
        setPendingJournal({
          date: getTodayString(),
          subject: label || 'Focus session',
          count: completedDistractions,
        });
      }

      // Save to API
      fetch('/api/focus-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: durationMins, notes: label ? `${label}${sessionNotes ? ' — ' + sessionNotes : ''}` : sessionNotes || null, xpEarned }),
      }).then(() => fetchHistory()).catch(() => {});

      // Show XP reward
      setLastXP(xpEarned);
      setShowXPReward(true);
      setTimeout(() => setShowXPReward(false), 3000);

      // Completed work session
      setTodayStats((prev) => {
        const updated = { ...prev, completed: prev.completed + 1, date: getTodayString() };
        saveTodayStats(updated);
        return updated;
      });

      if (currentSession >= settings.sessionsBeforeLongBreak) {
        switchMode('longBreak');
        setCurrentSession(1);
      } else {
        switchMode('shortBreak');
      }
      setDistractionCount(0);
    } else {
      // Break completed
      setCurrentSession((prev) => prev + 1);
      switchMode('work');
    }
  }, [mode, currentSession, settings, switchMode, sessionNotes, fetchHistory, isLongSession, selectedSubject, focusTask, distractionCount]);

  // ─── Timer tick ──────────────────────────────────────────────────────────
  // Uses wall-clock time so timer stays accurate even when tab is backgrounded

  useEffect(() => {
    if (isRunning) {
      // Record the expected end time based on current remaining seconds
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
      // Schedule background notification
      scheduleTimerNotification(endTimeRef.current, mode);

      intervalRef.current = setInterval(() => {
        if (endTimeRef.current === null) return;
        const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          endTimeRef.current = null;
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => handleTimerComplete(), 0);
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // ─── Detect timer reaching zero (inside interval) ───────────────────────
  // Timer completion is handled inside the setInterval callback below
  // to avoid calling setState directly in an effect body.

  // ─── Auto-start next session ─────────────────────────────────────────────

  useEffect(() => {
    if (settings.autoStartNext && !isRunning && remainingSeconds === totalSeconds && remainingSeconds > 0) {
      // Small delay before auto-starting
      const timeout = setTimeout(() => {
        setIsRunning(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [settings.autoStartNext, isRunning, remainingSeconds, totalSeconds]);

  // ─── Tab visibility — sync wall-clock time when returning (don't pause) ──

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && isRunning && endTimeRef.current !== null) {
        // Sync remaining time from wall clock when tab becomes visible again
        const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
        setRemainingSeconds(remaining);
        if (remaining <= 0) {
          endTimeRef.current = null;
          setTimeout(() => handleTimerComplete(), 0);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, handleTimerComplete]);

  // ─── Register service worker on mount ───────────────────────────────────
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    setJournalEntries(loadDistractionJournal());
    const handler = () => setJournalEntries(loadDistractionJournal());
    window.addEventListener('storage', handler);
    window.addEventListener('nuviora-distraction-journal-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('nuviora-distraction-journal-updated', handler);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!focusMode || document.fullscreenElement) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, [focusMode]);

  // ─── Ambient sound control ───────────────────────────────────────────────

  const handleAmbientChange = useCallback((sound: AmbientSound) => {
    setAmbientSound(sound);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastAmbientSound', sound);
    }
    if (sound === 'none') {
      stopAmbientSound();
    } else {
      startAmbientSound(sound, ambientVolume);
    }
  }, [ambientVolume]);

  const handleVolumeChange = useCallback((vol: number) => {
    setAmbientVolume(vol);
    updateAmbientGainVolume(vol);
  }, []);

  // Sync volume changes to gain node
  useEffect(() => { updateAmbientGainVolume(ambientVolume); }, [ambientVolume]);

  // Stop ambient on unmount
  useEffect(() => { return () => stopAmbientSound(); }, []);

  // ─── Midnight reset check ────────────────────────────────────────────────

  useEffect(() => {
    midnightCheckRef.current = setInterval(() => {
      const today = getTodayString();
      if (todayStats.date !== today) {
        setTodayStats({ date: today, completed: 0 });
        saveTodayStats({ date: today, completed: 0 });
      }
    }, 60000);
    return () => {
      if (midnightCheckRef.current) clearInterval(midnightCheckRef.current);
    };
  }, [todayStats.date]);

  // ─── Browser tab title ───────────────────────────────────────────────────

  useEffect(() => {
    const modeLabel = mode === 'work' ? '🎯' : mode === 'shortBreak' ? '☕' : '🌳';
    document.title = isRunning
      ? `${modeLabel} ${displayMinutes}:${displaySeconds} — Nuviora`
      : 'Nuviora';
    return () => { document.title = 'Nuviora'; };
  }, [isRunning, displayMinutes, displaySeconds, mode]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* ── Focus Mode Overlay ──────────────────────────────────────────── */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'fixed inset-0 z-50 flex flex-col landscape:flex-row md:flex-row items-center justify-center gap-8 md:gap-14 px-6 py-6 overflow-hidden',
              getThemeClasses(visualTheme, true),
            )}
          >
            {visualTheme !== 'plain' && (
              <div className="pointer-events-none absolute inset-0 opacity-45">
                {visualTheme === 'library' && (
                  <>
                    <div className="absolute left-6 top-14 h-40 w-24 rounded-t-3xl bg-amber-900/20 border border-amber-500/10" />
                    <div className="absolute right-12 bottom-16 h-28 w-44 rounded-3xl bg-orange-300/10 blur-xl" />
                  </>
                )}
                {visualTheme === 'rainy' && (
                  <>
                    <div className="absolute right-8 top-16 h-64 w-36 rounded-3xl border border-sky-200/20 bg-sky-200/5" />
                    <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,transparent_45%,rgba(125,211,252,0.12)_46%,transparent_48%,transparent_100%)] bg-[length:38px_38px]" />
                  </>
                )}
                {visualTheme === 'cafe' && (
                  <>
                    <div className="absolute left-10 bottom-14 h-20 w-20 rounded-full bg-amber-200/10 blur-lg" />
                    <div className="absolute right-10 top-20 h-36 w-36 rounded-full bg-orange-300/10 blur-2xl" />
                  </>
                )}
              </div>
            )}
            {/* Exit button */}
            <button
              onClick={exitFocusMode}
              className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-800/80 dark:bg-neutral-900/80 text-warm-300 dark:text-neutral-400 text-sm hover:bg-warm-700/80 dark:hover:bg-neutral-800/80 transition-colors min-h-[44px] min-w-[44px] justify-center"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Back to app</span>
            </button>

            <div className="flex flex-col items-center justify-center">
              {/* Focus task label */}
              <AnimatePresence mode="wait">
                {focusTask && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-warm-400 dark:text-warm-300 text-base md:text-xl font-medium text-center max-w-md truncate mb-4 md:mb-8"
                  >
                    {focusTask}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Growing tree — visible in focus mode for all users */}
              {mode === 'work' && (
                <GrowingTree growth={1 - progress} treeType={treeType} size={150} />
              )}

              {/* Timer display in focus mode */}
              <div className="relative w-56 h-56 landscape:w-64 landscape:h-64 md:w-80 md:h-80">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
                  <circle
                    cx="140" cy="140" r={RING_RADIUS}
                    fill="none"
                    className="stroke-warm-800 dark:stroke-neutral-800"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="140" cy="140" r={RING_RADIUS}
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl font-mono font-bold text-warm-100 dark:text-white tracking-wider">
                    {displayMinutes}:{displaySeconds}
                  </span>
                  <span className="text-sm text-warm-500 dark:text-warm-400 mt-2 font-medium">
                    {MODE_CONFIG[mode].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 min-w-[220px]">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-warm-500 dark:text-warm-400">Horizontal focus</p>
                <p className="text-2xl font-bold text-warm-100 dark:text-white mt-1">
                  Session {currentSession} / {settings.sessionsBeforeLongBreak}
                </p>
              </div>

              {/* Focus mode controls */}
              <div className="flex items-center gap-5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={resetTimer}
                  className="w-12 h-12 rounded-full bg-warm-800/80 dark:bg-neutral-900/80 text-warm-300 dark:text-neutral-300 flex items-center justify-center hover:bg-warm-700/80 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={isRunning ? pauseTimer : startTimer}
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
                >
                  {isRunning ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9 ml-1" />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={skipToNext}
                  className="w-12 h-12 rounded-full bg-warm-800/80 dark:bg-neutral-900/80 text-warm-300 dark:text-neutral-300 flex items-center justify-center hover:bg-warm-700/80 dark:hover:bg-neutral-800/80 transition-colors"
                >
                  <SkipForward className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Session dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-300',
                      i < currentSession
                        ? 'bg-primary'
                        : 'bg-warm-700 dark:bg-neutral-700',
                    )}
                  />
                ))}
              </div>

              {/* Sound toggle in focus mode */}
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className="flex items-center gap-1.5 text-warm-600 dark:text-warm-400 text-sm hover:text-warm-400 dark:hover:text-warm-300 transition-colors min-h-[44px]"
              >
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{settings.soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </button>

              <div className="w-full max-w-xs rounded-2xl bg-warm-800/50 dark:bg-neutral-900/70 border border-warm-700/50 dark:border-neutral-800 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-warm-500 dark:text-warm-400 mb-3">
                  Suggestions
                </p>
                <div className="space-y-2">
                  {focusSuggestions.map((tip, index) => (
                    <p key={tip} className="text-sm text-warm-200 dark:text-neutral-300 leading-snug">
                      {index + 1}. {tip}
                    </p>
                  ))}
                </div>
              </div>

              <button
                onClick={exitFocusMode}
                className="px-4 py-2 rounded-full bg-warm-100 text-warm-900 dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {isBrowserFullscreen ? 'Exit fullscreen' : 'Exit focus mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          <Card className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/90 p-0 shadow-xl shadow-primary/5 backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative flex flex-col items-center justify-center px-4 py-6 md:px-8 md:py-8">
                <div className="mb-5 grid w-full max-w-xl grid-cols-3 gap-1 rounded-2xl border border-border/60 bg-muted/35 p-1">
                  {(Object.entries(MODE_CONFIG) as [TimerMode, typeof MODE_CONFIG.work][]).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = mode === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (settings.soundEnabled) playClickSound();
                          switchMode(key);
                          setCurrentSession(1);
                        }}
                        className={cn(
                          'flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold transition-all duration-200 sm:text-sm',
                          isActive
                            ? cn(config.color, 'shadow-lg shadow-primary/15')
                            : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
                  <div className="absolute inset-4 rounded-full bg-primary/5 blur-2xl" />
                  <svg className="relative h-full w-full -rotate-90 drop-shadow-sm" viewBox="0 0 280 280">
                    <circle
                      cx="140" cy="140" r={RING_RADIUS}
                      fill="none"
                      className="stroke-muted/80"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="140" cy="140" r={RING_RADIUS}
                      fill="none"
                      className="stroke-primary"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE}
                      animate={{ strokeDashoffset: dashOffset }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[4.4rem] font-black leading-none tracking-tighter text-foreground md:text-7xl">
                      {displayMinutes}:{displaySeconds}
                    </span>
                    <span className="mt-3 rounded-full bg-muted/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      {MODE_CONFIG[mode].label}
                    </span>
                    {selectedSubject && (
                      <span className="mt-2 max-w-[210px] truncate text-xs font-semibold text-primary">
                        {selectedSubject}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={false}
                        animate={{ scale: i < currentSession ? 1 : 0.82, opacity: i < currentSession ? 1 : 0.35 }}
                        transition={{ duration: 0.3 }}
                        className={cn('h-2.5 w-2.5 rounded-full', i < currentSession ? 'bg-primary' : 'bg-muted-foreground/30')}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Session {currentSession} of {settings.sessionsBeforeLongBreak}
                  </p>
                </div>

                {mode === 'work' && (
                  <div className="relative mt-2 flex flex-col items-center">
                    <GrowingTree growth={1 - progress} treeType={treeType} size={105} />
                    <AnimatePresence>
                      {showTreeStore && (
                        <TreeStorePicker
                          current={treeType}
                          onChange={(t) => {
                            setTreeType(t);
                            if (typeof window !== 'undefined') localStorage.setItem('nuviora-tree-type', t);
                          }}
                          onClose={() => setShowTreeStore(false)}
                        />
                      )}
                    </AnimatePresence>
                    <button
                      onClick={() => setShowTreeStore(v => !v)}
                      className="mt-1 rounded-full px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      {TREE_TYPES.find(t => t.id === treeType)?.emoji} Change tree
                    </button>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTimer}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition-shadow hover:shadow-primary/40"
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {isRunning ? <Pause className="h-9 w-9" /> : <Play className="ml-1 h-9 w-9" />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={skipToNext}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Skip to next"
                  >
                    <SkipForward className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="mt-4 grid w-full max-w-xl grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFocusMode(true)}
                    className="h-11 rounded-2xl border-primary/25 bg-primary/5 text-sm font-bold text-primary hover:bg-primary/10"
                  >
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Fullscreen
                  </Button>
                  <button
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/70 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                  >
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
                    {settings.soundEnabled ? 'Sound on' : 'Muted'}
                  </button>
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/20 p-4 md:p-5 lg:border-l lg:border-t-0">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">Session setup</p>
                        <p className="text-[11px] text-muted-foreground">Choose one target before starting.</p>
                      </div>
                      {mode === 'work' && (
                        <button
                          onClick={() => {
                            const next = !isLongSession;
                            setIsLongSession(next);
                            const dur = next ? 90 : settings.workDuration;
                            setTotalSeconds(dur * 60);
                            setRemainingSeconds(dur * 60);
                            setIsRunning(false);
                          }}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                            isLongSession ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                          )}
                        >
                          {isLongSession ? '90 min' : '25 min'}
                        </button>
                      )}
                    </div>

                    {mode === 'work' && !isRunning && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {getUserSubjects(studentClass).map(subj => {
                            const colors = getSubjectColors();
                            const dotColor = colors[subj] || '#6366f1';
                            const isActive = selectedSubject === subj;
                            return (
                              <button
                                key={subj}
                                onClick={() => setSelectedSubject(prev => prev === subj ? '' : subj)}
                                className={cn(
                                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                  isActive
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                )}
                              >
                                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: isActive ? 'currentColor' : dotColor }} />
                                {subj}
                              </button>
                            );
                          })}
                        </div>
                        <Input
                          className="h-10 rounded-xl border-border/60 bg-muted/35 text-sm"
                          placeholder="Or type today’s exact topic..."
                          value={customSubjectInput}
                          onChange={e => { setCustomSubjectInput(e.target.value); if (e.target.value) setSelectedSubject(e.target.value); }}
                        />
                        <Input
                          placeholder="Focus intention (optional)"
                          value={focusTask}
                          onChange={(e) => setFocusTask(e.target.value)}
                          className="h-10 rounded-xl border-border/60 bg-muted/35 text-sm"
                          onKeyDown={(e) => { if (e.key === 'Enter') setFocusMode(true); }}
                        />
                      </div>
                    )}

                    {(isRunning || mode !== 'work') && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current target</p>
                          <p className="mt-1 truncate text-sm font-semibold text-foreground">
                            {selectedSubject || focusTask || (mode === 'work' ? 'Focus session' : MODE_CONFIG[mode].label)}
                          </p>
                        </div>
                        {isRunning && mode === 'work' && (
                          <button
                            onClick={() => setDistractionCount(c => c + 1)}
                            className="flex w-full items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50 px-3 py-2 text-left text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/15"
                          >
                            <span>Mark distraction</span>
                            <span>⚡ {distractionCount}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/75 p-4">
                    <p className="mb-3 text-sm font-bold text-foreground">Focus cues</p>
                    <div className="space-y-2">
                      {focusSuggestions.map((tip, index) => (
                        <p key={tip} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-bold text-primary">{index + 1}</span>
                          <span>{tip}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/60 bg-background/75 p-3 text-center">
                      <p className="text-2xl font-black text-foreground">{todayStats.completed}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/75 p-3 text-center">
                      <p className="text-2xl font-black text-foreground">{ambientSound === 'none' ? 'Off' : 'On'}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ambient</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {showBreakSuggestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10"
              >
                <p className="mb-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">Break time!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-300">{breakSuggestions[breakSuggestionIdx]}</p>
                <button onClick={() => setShowBreakSuggestion(false)} className="mt-2 text-[10px] text-muted-foreground hover:underline">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>


        <AnimatePresence>
            {pendingJournal && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15">
                    <MessageSquareWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">What pulled your focus?</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      You marked {pendingJournal.count} distraction{pendingJournal.count !== 1 ? 's' : ''}. Logging the pattern helps reduce repeats.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {DISTRACTION_REASONS.map(reason => (
                        <button
                          key={reason.id}
                          onClick={() => setJournalReason(reason.id)}
                          className={cn(
                            'rounded-xl border p-2 text-left transition-colors',
                            journalReason === reason.id
                              ? 'border-amber-500 bg-amber-100 dark:bg-amber-500/20'
                              : 'border-border/50 bg-background/70 hover:bg-background',
                          )}
                        >
                          <p className="text-xs font-bold">{reason.label}</p>
                          <p className="text-[9px] leading-snug text-muted-foreground">{reason.hint}</p>
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={journalNote}
                      onChange={e => setJournalNote(e.target.value)}
                      placeholder="Optional note: what happened?"
                      className="mt-3 min-h-[64px] w-full resize-none rounded-xl border border-border/50 bg-background/80 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={saveDistractionJournal} className="h-8 rounded-xl bg-amber-600 text-xs text-white hover:bg-amber-700">
                        Save pattern
                      </Button>
                      <Button size="sm" variant="ghost" onClick={skipDistractionJournal} className="h-8 rounded-xl text-xs">
                        Skip
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        <AnimatePresence>
          {showXPReward && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 text-white shadow-xl"
              >
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-bold">Session Complete!</p>
                  <p className="text-xs text-white/80">+{lastXP} XP earned</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Volume2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">Ambient Sounds</p>
                  {ambientSound !== 'none' && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Playing
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {AMBIENT_SOUNDS.map(sound => (
                    <motion.button
                      key={sound.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleAmbientChange(sound.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl py-2.5 text-center transition-all',
                        ambientSound === sound.id
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <span className="text-xl">{sound.emoji}</span>
                      <span className="text-[10px] font-semibold">{sound.label}</span>
                    </motion.button>
                  ))}
                </div>
                {ambientSound !== 'none' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Volume</span>
                      <span>{Math.round(ambientVolume * 100)}%</span>
                    </div>
                    <Slider value={[ambientVolume * 100]} onValueChange={([v]) => handleVolumeChange(v / 100)} min={0} max={100} step={5} className="w-full" />
                  </motion.div>
                )}
              </div>
            </Card>

            <Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <LampDesk className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Visual Theme</p>
                    <p className="text-[10px] text-muted-foreground">Change the room, not the workflow.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {VISUAL_THEMES.map(theme => {
                    const Icon = theme.icon;
                    return (
                      <motion.button
                        key={theme.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleVisualThemeChange(theme.id)}
                        className={cn(
                          'relative overflow-hidden rounded-xl border p-3 text-left transition-colors',
                          visualTheme === theme.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/50 bg-muted/40 text-muted-foreground hover:bg-muted',
                        )}
                      >
                        <div className={cn('absolute inset-0 opacity-40', getThemeClasses(theme.id, false))} />
                        <div className="relative flex items-start gap-2">
                          <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold">{theme.label}</p>
                            <p className="text-[9px] leading-snug opacity-80">{theme.description}</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {distractionInsight && (
            <Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/15">
                  <MessageSquareWarning className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">14-Day Distraction Pattern</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Main blocker: <span className="font-semibold text-foreground">{distractionInsight.label}</span> ({distractionInsight.count} marks across {distractionInsight.sessions} logged sessions).
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{distractionInsight.tip}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-bold">Session Notes</p>
                <textarea
                  placeholder="Capture what you studied, doubts, or quick reflections..."
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  className="min-h-[100px] w-full resize-none rounded-xl border-0 bg-muted/50 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground">Notes are saved when a focus session completes.</p>
              </div>
            </Card>

            {(historyLoaded && sessionHistory.length > 0) ? (
              <Card className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-bold">Recent Sessions</p>
                </div>
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 border-b border-border/30 py-2 last:border-0"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{session.duration} min focus session</p>
                        {session.notes && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{session.notes}</p>}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400">+{session.xpEarned} XP</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 p-4 text-center shadow-sm">
                <div>
                  <Target className="mx-auto h-6 w-6 text-muted-foreground/60" />
                  <p className="mt-2 text-sm font-bold text-foreground">No sessions yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Complete a focus timer to build your history.</p>
                </div>
              </Card>
            )}
          </div>

          <SubjectFocusChart />

      {/* ── Settings Dialog ─────────────────────────────────────────────── */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Timer Settings
            </DialogTitle>
            <DialogDescription>
              Customize your Pomodoro timer durations and behavior
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Work Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Work Duration
                </label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {settings.workDuration} min
                </span>
              </div>
              <Slider
                value={[settings.workDuration]}
                onValueChange={([val]) => updateSettings({ workDuration: val })}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Short Break */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-emerald-500" />
                  Short Break
                </label>
                <span className="text-sm font-semibold text-emerald-500 tabular-nums">
                  {settings.shortBreakDuration} min
                </span>
              </div>
              <Slider
                value={[settings.shortBreakDuration]}
                onValueChange={([val]) => updateSettings({ shortBreakDuration: val })}
                min={1}
                max={15}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>15 min</span>
              </div>
            </div>

            {/* Long Break */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-amber-500" />
                  Long Break
                </label>
                <span className="text-sm font-semibold text-amber-500 tabular-nums">
                  {settings.longBreakDuration} min
                </span>
              </div>
              <Slider
                value={[settings.longBreakDuration]}
                onValueChange={([val]) => updateSettings({ longBreakDuration: val })}
                min={5}
                max={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>30 min</span>
              </div>
            </div>

            {/* Sessions before long break */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Sessions before long break
                </label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {settings.sessionsBeforeLongBreak}
                </span>
              </div>
              <Slider
                value={[settings.sessionsBeforeLongBreak]}
                onValueChange={([val]) => updateSettings({ sessionsBeforeLongBreak: val })}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span>8</span>
              </div>
            </div>

            {/* Auto-start next */}
            <div className="flex items-center justify-between py-1">
              <label className="text-sm font-medium text-foreground">
                Auto-start next session
              </label>
              <Switch
                checked={settings.autoStartNext}
                onCheckedChange={(checked) => updateSettings({ autoStartNext: checked })}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
