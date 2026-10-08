import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, categories, principles } from '../src/scenarios/catalog.ts';
import {
  scoreDecision,
  xpForScore,
  parseState,
  emptyState,
  streak,
  instantiate,
  rankAgreement,
  statistics,
} from '../src/utils/engine.ts';
import type { Decision } from '../src/utils/engine.ts';
import type { Attempt, Scenario } from '../src/types/index.ts';

const perfect = (s: Scenario): Decision => ({
  classification: s.correctClassification,
  actions: [...s.correctActions],
  evidence: [...s.requiredEvidence],
  principle: s.principle,
  ticketOrder: s.ticketOrder ?? [],
  duration: 120,
  notes: 'Correlated all three sources.',
});
test('Catalog covers every mode and difficulty with valid evidence and answer references', () => {
  assert.ok(scenarios.length >= 20);
  assert.equal(new Set(scenarios.map((s) => s.id)).size, scenarios.length);
  for (const c of categories) assert.ok(scenarios.some((s) => s.category === c));
  for (const d of ['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    assert.ok(scenarios.some((s) => s.difficulty === d));
  for (const s of scenarios) {
    assert.ok(principles.includes(s.principle));
    assert.ok(s.correctActions.every((a) => s.possibleActions.includes(a)));
    assert.ok(s.requiredEvidence.every((id) => s.evidence.some((e) => e.id === id)));
    assert.ok(s.explanation && s.takeaway && s.otherChoices && s.hint);
    if (s.ticketOrder)
      assert.deepEqual([...s.ticketOrder].sort(), s.tickets!.map((t) => t.id).sort());
  }
});
test('Every scenario has an attainable perfect score and XP award', () => {
  for (const s of scenarios) {
    const a = scoreDecision(s, perfect(s));
    assert.equal(a.score, 100, s.id);
    assert.equal(a.xp, 100);
  }
});
test('No correct selections earns zero; time is never penalized', () => {
  const s = scenarios[0];
  const p = perfect(s);
  assert.equal(
    scoreDecision(s, {
      ...p,
      classification: 'Confirmed Incident',
      actions: [],
      evidence: [],
      principle: '',
    }).score,
    0,
  );
  assert.equal(scoreDecision(s, { ...p, duration: 99999 }).score, 100);
});
test('Selecting every action cannot earn a perfect score and duplicate evidence cannot inflate points', () => {
  const s = scenarios[0];
  const p = perfect(s);
  const all = scoreDecision(s, { ...p, actions: s.possibleActions });
  assert.ok(all.score < 100);
  assert.ok(all.breakdown.remediation < 25);
  const repeated = scoreDecision(s, {
    ...p,
    evidence: [s.requiredEvidence[0], s.requiredEvidence[0], 'forged-source'],
  });
  assert.equal(repeated.breakdown.investigation, 8);
});
test('Containment order matters independently of action membership', () => {
  const s = scenarios.find((s) => s.id === 'id-01')!;
  const p = perfect(s);
  const reversed = scoreDecision(s, { ...p, actions: [...p.actions].reverse() });
  assert.ok(reversed.score < 100);
  assert.equal(reversed.breakdown.classification, 30);
});
test('Ticket scoring distinguishes perfect, partial, and reversed order and stores the player ranking', () => {
  const s = scenarios.find((s) => s.id === 'ticket-01')!;
  const p = perfect(s);
  assert.equal(rankAgreement(p.ticketOrder, p.ticketOrder), 1);
  assert.equal(rankAgreement([...p.ticketOrder].reverse(), p.ticketOrder), 0);
  const reverse = scoreDecision(s, { ...p, ticketOrder: [...p.ticketOrder].reverse() });
  assert.equal(reverse.score, 35);
  assert.deepEqual(reverse.ticketOrder, [...p.ticketOrder].reverse());
});
test('XP boundaries and rank thresholds match the progression system', () => {
  assert.deepEqual(
    [0, 59, 60, 69, 70, 79, 80, 89, 90, 100].map(xpForScore),
    [20, 20, 40, 40, 60, 60, 80, 80, 100, 100],
  );
  const a = scoreDecision(scenarios[0], perfect(scenarios[0]));
  assert.equal(statistics([a, a]).rank.name, 'Junior Security Analyst');
});
test('Storage restores completed cases, rejects corrupt records, and repairs invalid settings', () => {
  assert.deepEqual(parseState('{broken'), emptyState());
  const a = scoreDecision(scenarios[0], perfect(scenarios[0]));
  const state = { ...emptyState(), attempts: [a] };
  assert.deepEqual(parseState(JSON.stringify(state)), state);
  assert.equal(
    parseState(JSON.stringify({ ...state, attempts: [null, { score: 100 }, { ...a, score: 999 }] }))
      .attempts.length,
    0,
  );
  const restored = parseState(
    JSON.stringify({ ...state, settings: { difficulty: 'Impossible', theme: 'invalid' } }),
  );
  assert.equal(restored.settings.difficulty, 'All levels');
  assert.equal(restored.settings.theme, 'Dark');
});
test('Streak uses distinct local days, permits yesterday, and expires after a gap', () => {
  const s = scenarios[0];
  const a = scoreDecision(s, perfect(s));
  const dates = [8, 7, 6].map(
    (day) => ({ ...a, date: new Date(2026, 9, day, 12).toISOString() }) as Attempt,
  );
  assert.equal(streak([...dates, dates[0]], new Date(2026, 9, 8, 16)), 3);
  assert.equal(streak(dates, new Date(2026, 9, 9, 16)), 3);
  assert.equal(streak(dates, new Date(2026, 9, 10, 16)), 0);
});
test('Randomization preserves underlying security answers and changes only safe context', () => {
  for (const s of scenarios) {
    const instance = instantiate(s);
    assert.deepEqual(instance.correctActions, s.correctActions);
    assert.equal(instance.correctClassification, s.correctClassification);
    assert.equal(scoreDecision(instance, perfect(instance)).score, 100);
    assert.equal(new Set(instance.logs.map((l) => l.user)).size, 1);
    assert.ok(
      instance.logs.every((l) => /^(192\.0\.2|198\.51\.100|203\.0\.113)\./.test(l.source_ip)),
    );
  }
});
