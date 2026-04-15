import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRequestUserId } from '@/lib/auth-user';

const DEFAULT_REWARDS = [
  { id: 'break-30', name: '30-min Break', cost: 30, emoji: '☕', category: 'break', kind: 'consumable', description: 'A guilt-free 30 minute rest after focused work.' },
  { id: 'break-nap-20', name: 'Nap Time 20min', cost: 25, emoji: '😴', category: 'break', kind: 'consumable', description: 'Recharge with a short power nap.' },
  { id: 'break-music-20', name: 'Music Break', cost: 20, emoji: '🎧', category: 'break', kind: 'consumable', description: 'Listen to music for 20 minutes without guilt.' },
  { id: 'reward-snack', name: 'Snack of Choice', cost: 45, emoji: '🍕', category: 'reward', kind: 'consumable', description: 'Pick a small snack after completing your work block.' },
  { id: 'reward-episode', name: 'Watch 1 Episode', cost: 90, emoji: '📺', category: 'reward', kind: 'consumable', description: 'Enjoy one episode after your study goal is done.', requirement: { type: 'level', value: 2, label: 'Level 2' } },
  { id: 'reward-game-60', name: 'Play Games 1hr', cost: 110, emoji: '🎮', category: 'reward', kind: 'consumable', description: 'One hour of gaming as an earned reward.', requirement: { type: 'streak', value: 3, label: '3-day streak' } },
  { id: 'reward-movie', name: 'Movie Night', cost: 220, emoji: '🎬', category: 'reward', kind: 'consumable', description: 'A bigger weekend reward for consistent progress.', requirement: { type: 'level', value: 4, label: 'Level 4' } },
  { id: 'focus-sakura-tree', name: 'Sakura Focus Tree', cost: 140, emoji: '🌸', category: 'focus', kind: 'collectible', description: 'Unlock a calm Sakura-style focus visual idea for your collection.', requirement: { type: 'streak', value: 5, label: '5-day streak' } },
  { id: 'focus-rain-window', name: 'Rainy Window Focus', cost: 120, emoji: '🌧️', category: 'focus', kind: 'collectible', description: 'A cozy rainy-day focus visual concept to own.' },
  { id: 'theme-ocean', name: 'Ocean Theme Pass', cost: 180, emoji: '🌊', category: 'theme', kind: 'collectible', description: 'Own an ocean-inspired theme reward card. Apply themes from Settings.', requirement: { type: 'level', value: 3, label: 'Level 3' } },
  { id: 'theme-galaxy', name: 'Galaxy Theme Pass', cost: 240, emoji: '🌌', category: 'theme', kind: 'collectible', description: 'Own a rare galaxy theme reward card. Apply themes from Settings.', requirement: { type: 'streak', value: 7, label: '7-day streak' } },
  { id: 'pet-headphones', name: 'Pet Headphones', cost: 130, emoji: '🎧', category: 'cosmetic', kind: 'collectible', description: 'A study cosmetic for your reward collection.' },
  { id: 'pet-crown', name: 'Pet Crown', cost: 260, emoji: '👑', category: 'cosmetic', kind: 'collectible', description: 'A rare cosmetic for top-tier consistency.', requirement: { type: 'level', value: 5, label: 'Level 5' } },
  { id: 'boost-boss-reroll', name: 'Boss Challenge Reroll', cost: 75, emoji: '🎲', category: 'boost', kind: 'consumable', description: 'A one-time permission to reroll your weekly challenge manually.' },
  { id: 'boost-exam-warrior', name: 'Exam Warrior Boost', cost: 160, emoji: '⚡', category: 'boost', kind: 'consumable', description: 'A one-time motivation boost before a hard study session.', requirement: { type: 'achievement', value: 'first_habit', label: 'First Step badge' } },
];

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const [stats, badges, ownedItems] = await Promise.all([
    db.userStats.findUnique({ where: { userId } }).catch(() => null),
    db.earnedBadge.findMany({ where: { userId } }).catch(() => []),
    db.rewardItem.findMany({ where: { userId } }).catch(() => []),
  ]);

  const level = Math.floor((stats?.xp ?? 0) / 100) + 1;
  const currentStreak = stats?.currentStreak ?? 0;
  const badgeTypes = new Set(badges.map(badge => badge.badgeType));
  const ownedNames = new Set(ownedItems.map(item => item.name));

  const rewards = DEFAULT_REWARDS.map(reward => {
    const requirement = reward.requirement;
    let locked = false;
    if (requirement?.type === 'level') locked = level < Number(requirement.value);
    if (requirement?.type === 'streak') locked = currentStreak < Number(requirement.value);
    if (requirement?.type === 'achievement') locked = !badgeTypes.has(String(requirement.value));
    return {
      ...reward,
      locked,
      owned: reward.kind === 'collectible' && ownedNames.has(reward.name),
    };
  });

  return NextResponse.json(rewards);
}
