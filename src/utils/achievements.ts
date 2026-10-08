import type { Attempt } from '../types';
import { statistics, streak, dayKey } from './engine';
export function achievements(attempts: Attempt[]) {
  const stats = statistics(attempts);
  const count = (category: string) =>
    attempts.filter((a) => a.category === category && a.score >= 70).length;
  const bestStreak = Math.max(
    0,
    ...[...new Set(attempts.map((a) => dayKey(new Date(a.date))))].map((day) =>
      streak(attempts, new Date(`${day}T12:00:00`)),
    ),
  );
  const items: [string, string, number, number][] = [
    ['First Investigation', 'Complete your first training case.', attempts.length, 1],
    [
      'Perfect Triage',
      'Earn 100 on a SOC case.',
      attempts.filter((a) => a.category === 'SOC' && a.score === 100).length,
      1,
    ],
    ['Identity Defender', 'Score at least 70 on 3 identity incidents.', count('Identity'), 3],
    [
      'Least Privilege Expert',
      'Score at least 90 on 5 least privilege cases.',
      attempts.filter((a) => a.principle === 'Least privilege' && a.score >= 90).length,
      5,
    ],
    ['IAM Specialist', 'Complete 5 IAM cases with 70 or more.', count('IAM'), 5],
    ['SOC Analyst', 'Complete 10 SOC cases with 70 or more.', count('SOC'), 10],
    [
      'Incident Responder',
      'Complete 5 identity or investigation cases with 70 or more.',
      count('Identity') + count('Investigation'),
      5,
    ],
    [
      'Zero Trust Practitioner',
      'Score at least 90 on 3 Zero Trust cases.',
      attempts.filter((a) => a.principle === 'Zero Trust' && a.score >= 90).length,
      3,
    ],
    ['Azure Access Expert', 'Complete 5 Azure cases with 70 or more.', count('Azure'), 5],
    ['100 Alerts Investigated', 'Complete 100 SOC case attempts.', stats.byCategory.SOC.count, 100],
    ['10 Perfect Scores', 'Earn a perfect score 10 times.', stats.perfect, 10],
    ['7 Day Training Streak', 'Train on 7 consecutive local calendar days.', bestStreak, 7],
  ];
  return items.map(([name, description, value, target]) => ({
    name,
    description,
    value,
    target,
    unlocked: value >= target,
  }));
}
