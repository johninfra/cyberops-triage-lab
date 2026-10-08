import type { Attempt, Classification, Scenario, SavedState, Settings, Category } from '../types';

export const defaultSettings: Settings = {
  difficulty: 'All levels',
  mode: 'Training',
  sound: false,
  theme: 'Dark',
  timer: true,
};
export const emptyState = (): SavedState => ({
  version: 1,
  attempts: [],
  settings: { ...defaultSettings },
});
export const storageKey = 'cyberops-triage-lab.v1';
const validCategories: Category[] = ['SOC', 'IAM', 'Identity', 'Azure', 'Tickets', 'Investigation'];
const validClassifications = [
  'Benign',
  'False Positive',
  'Suspicious',
  'Confirmed Incident',
  'Escalate',
];
const validDifficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function parseState(raw: string | null): SavedState {
  if (!raw) return emptyState();
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.attempts)) return emptyState();
    const attempts = data.attempts.filter(
      (a: Attempt) =>
        a &&
        typeof a.id === 'string' &&
        typeof a.scenarioId === 'string' &&
        typeof a.title === 'string' &&
        validCategories.includes(a.category) &&
        validDifficulties.includes(a.difficulty) &&
        Number.isFinite(a.score) &&
        a.score >= 0 &&
        a.score <= 100 &&
        Number.isFinite(a.xp) &&
        a.xp === xpForScore(a.score) &&
        typeof a.date === 'string' &&
        !Number.isNaN(Date.parse(a.date)) &&
        validClassifications.includes(a.classification) &&
        validClassifications.includes(a.correctClassification) &&
        Array.isArray(a.actions) &&
        a.actions.every((x) => typeof x === 'string') &&
        Array.isArray(a.evidence) &&
        a.evidence.every((x) => typeof x === 'string') &&
        typeof a.principle === 'string' &&
        typeof a.notes === 'string' &&
        Number.isFinite(a.duration) &&
        a.duration >= 0 &&
        (a.ticketOrder === undefined ||
          (Array.isArray(a.ticketOrder) && a.ticketOrder.every((x) => typeof x === 'string'))) &&
        a.breakdown &&
        ['classification', 'investigation', 'remediation', 'principle', 'efficiency'].every(
          (k, i) =>
            Number.isFinite(a.breakdown[k as keyof Attempt['breakdown']]) &&
            a.breakdown[k as keyof Attempt['breakdown']] >= 0 &&
            a.breakdown[k as keyof Attempt['breakdown']] <= [30, 25, 25, 10, 10][i],
        ) &&
        Object.values(a.breakdown).reduce((sum, value) => sum + value, 0) === a.score,
    );
    const s = data.settings ?? {};
    return {
      version: 1,
      attempts,
      settings: {
        difficulty: [...validDifficulties, 'All levels'].includes(s.difficulty)
          ? s.difficulty
          : defaultSettings.difficulty,
        mode: s.mode === 'Assessment' ? 'Assessment' : 'Training',
        theme: s.theme === 'Light' ? 'Light' : 'Dark',
        sound: s.sound === true,
        timer: s.timer !== false,
      },
    };
  } catch {
    return emptyState();
  }
}

export function xpForScore(score: number) {
  return score >= 90 ? 100 : score >= 80 ? 80 : score >= 70 ? 60 : score >= 60 ? 40 : 20;
}
export function longestCommonSequence(a: string[], b: string[]): number {
  const row = Array(b.length + 1).fill(0);
  for (const item of a) {
    let diagonal = 0;
    for (let j = 1; j <= b.length; j++) {
      const previous = row[j];
      row[j] = item === b[j - 1] ? diagonal + 1 : Math.max(row[j], row[j - 1]);
      diagonal = previous;
    }
  }
  return row[b.length];
}
export function rankAgreement(answer: string[], correct: string[]) {
  let matches = 0,
    pairs = 0;
  for (let i = 0; i < correct.length; i++)
    for (let j = i + 1; j < correct.length; j++) {
      pairs++;
      const a = answer.indexOf(correct[i]),
        b = answer.indexOf(correct[j]);
      if (a >= 0 && b >= 0 && a < b) matches++;
    }
  return pairs ? matches / pairs : 0;
}

export interface Decision {
  classification: Classification;
  actions: string[];
  evidence: string[];
  principle: string;
  ticketOrder: string[];
  duration: number;
  notes: string;
}
export function scoreDecision(scenario: Scenario, decision: Decision, now = new Date()): Attempt {
  const actions = [...new Set(decision.actions)].filter((x) =>
    scenario.possibleActions.includes(x),
  );
  const evidence = [...new Set(decision.evidence)].filter((x) =>
    scenario.evidence.some((e) => e.id === x),
  );
  const trueActions = actions.filter((a) => scenario.correctActions.includes(a));
  const wrongActions = actions.length - trueActions.length;
  const recall = trueActions.length / scenario.correctActions.length;
  const precision = actions.length ? trueActions.length / actions.length : 0;
  const ticketMode = !!scenario.ticketOrder;
  const agreement = ticketMode ? rankAgreement(decision.ticketOrder, scenario.ticketOrder!) : 0;
  const actionQuality = scenario.ordered
    ? (longestCommonSequence(actions, scenario.correctActions) / scenario.correctActions.length) *
      precision
    : Math.max(0, recall - wrongActions / scenario.correctActions.length);
  const breakdown = {
    classification: ticketMode
      ? Math.round(30 * agreement)
      : decision.classification === scenario.correctClassification
        ? 30
        : 0,
    investigation: Math.round(
      (25 * scenario.requiredEvidence.filter((id) => evidence.includes(id)).length) /
        scenario.requiredEvidence.length,
    ),
    remediation: ticketMode
      ? Math.round(
          (25 * scenario.ticketOrder!.filter((id, i) => decision.ticketOrder[i] === id).length) /
            scenario.ticketOrder!.length,
        )
      : Math.round(25 * actionQuality),
    principle: decision.principle === scenario.principle ? 10 : 0,
    efficiency: ticketMode ? Math.round(10 * agreement) : Math.round(10 * precision * recall),
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return {
    id: crypto.randomUUID(),
    scenarioId: scenario.id,
    title: scenario.title,
    category: scenario.category,
    difficulty: scenario.difficulty,
    date: now.toISOString(),
    score,
    xp: xpForScore(score),
    classification: decision.classification,
    correctClassification: scenario.correctClassification,
    actions,
    evidence,
    principle: decision.principle,
    duration: decision.duration,
    notes: decision.notes,
    ...(ticketMode ? { ticketOrder: [...decision.ticketOrder] } : {}),
    breakdown,
  };
}

export const ranks = [
  { name: 'Help Desk Technician', xp: 0 },
  { name: 'Junior Security Analyst', xp: 200 },
  { name: 'IAM Analyst', xp: 500 },
  { name: 'SOC Analyst', xp: 1000 },
  { name: 'Security Administrator', xp: 1800 },
  { name: 'Cloud Security Analyst', xp: 2800 },
  { name: 'Senior Security Analyst', xp: 4000 },
  { name: 'Security Engineer', xp: 5500 },
];
export const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function streak(attempts: Attempt[], now = new Date()) {
  const days = new Set(attempts.map((a) => dayKey(new Date(a.date))));
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
export function statistics(attempts: Attempt[]) {
  const xp = attempts.reduce((a, b) => a + b.xp, 0);
  const rank = [...ranks].reverse().find((r) => xp >= r.xp)!;
  const nextRank = ranks[ranks.indexOf(rank) + 1];
  const accuracy = average(
    attempts.map((a) =>
      a.category === 'Tickets'
        ? (a.breakdown.classification / 30) * 100
        : a.classification === a.correctClassification
          ? 100
          : 0,
    ),
  );
  const byCategory = Object.fromEntries(
    validCategories.map((c) => {
      const a = attempts.filter((x) => x.category === c);
      return [
        c,
        {
          count: a.length,
          average: average(a.map((x) => x.score)),
          accuracy: average(
            a.map((x) =>
              x.category === 'Tickets'
                ? (x.breakdown.classification / 30) * 100
                : x.classification === x.correctClassification
                  ? 100
                  : 0,
            ),
          ),
        },
      ];
    }),
  ) as Record<Category, { count: number; average: number; accuracy: number }>;
  return {
    xp,
    rank,
    nextRank,
    accuracy,
    byCategory,
    average: average(attempts.map((a) => a.score)),
    streak: streak(attempts),
    perfect: attempts.filter((a) => a.score === 100).length,
    missed: attempts.filter(
      (a) =>
        a.correctClassification === 'Confirmed Incident' &&
        a.classification !== 'Confirmed Incident',
    ).length,
    incorrectEscalations: attempts.filter(
      (a) =>
        a.classification === 'Escalate' &&
        ['Benign', 'False Positive'].includes(a.correctClassification),
    ).length,
    falsePositives: attempts.filter(
      (a) => a.correctClassification === 'False Positive' && a.classification === 'False Positive',
    ).length,
    incidents: attempts.filter(
      (a) => ['Identity', 'Investigation'].includes(a.category) && a.score >= 70,
    ).length,
  };
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function instantiate(s: Scenario): Scenario {
  const names = ['Jordan Lee', 'Alex Morgan', 'Sam Okafor', 'Taylor Kim', 'Jamie Brooks'];
  const user =
    s.user === 'Michael Chen' || s.user.startsWith('svc-') || s.user.startsWith('sp-')
      ? s.user
      : names[Math.floor(Math.random() * names.length)];
  const device = `NS-WKS-${100 + Math.floor(Math.random() * 800)}`;
  const baseTime = new Date();
  baseTime.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  const department =
    s.department === 'Engineering' && !['IAM', 'Azure', 'Investigation'].includes(s.category)
      ? shuffle(['Engineering', 'IT Operations', 'Customer Support'])[0]
      : s.department;
  const localLocation = shuffle(['Seattle, US', 'Portland, US', 'Vancouver, CA'])[0];
  const replace = (text: string) => text.replaceAll(s.user, user);
  return {
    ...s,
    user,
    department,
    possibleActions: shuffle(s.possibleActions),
    evidence: s.evidence.map((e) => ({
      ...e,
      detail: replace(e.detail).replace(`${s.department} • Enabled`, `${department} • Enabled`),
    })),
    logs: s.logs.map((l, i) => ({
      ...l,
      user,
      device: i === 2 || i === 3 ? device : l.device,
      details: replace(l.details),
      timestamp: new Date(
        baseTime.getTime() +
          new Date(l.timestamp).getTime() -
          new Date(s.logs[0].timestamp).getTime(),
      ).toISOString(),
      source_ip: `${['192.0.2', '198.51.100', '203.0.113'][i % 3]}.${10 + Math.floor(Math.random() * 200)}`,
      location: s.id === 'soc-01' ? l.location : i === 1 ? 'Cloud control plane' : localLocation,
    })),
    tickets: s.tickets ? shuffle(s.tickets) : undefined,
  };
}
export function playCompleteSound() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    /* Sound is optional when a browser disallows audio. */
  }
}
