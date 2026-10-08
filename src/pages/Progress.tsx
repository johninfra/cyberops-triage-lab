import { Activity, Target, Trophy, Zap } from 'lucide-react';
import type { Attempt, Category } from '../types';
import { categoryLabels, categories } from '../scenarios/catalog';
import { average, dayKey, statistics } from '../utils/engine';
import { Empty, PageHeading, Panel, ProgressBar, StatCard } from '../components/UI';
import History from '../components/History';

export default function Progress({
  attempts,
  onHistory,
}: {
  attempts: Attempt[];
  onHistory: (a: Attempt) => void;
}) {
  const stats = statistics(attempts);
  const trained = categories
    .filter((c) => stats.byCategory[c].count > 0)
    .sort((a, b) => stats.byCategory[b].average - stats.byCategory[a].average);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - 6 + index);
    const a = attempts.filter((x) => dayKey(new Date(x.date)) === dayKey(day));
    return {
      label: day.toLocaleDateString(undefined, { weekday: 'short' }),
      xp: a.reduce((sum, a) => sum + a.xp, 0),
      score: average(a.map((x) => x.score)),
    };
  });
  const maxXP = Math.max(100, ...days.map((d) => d.xp));
  return (
    <>
      <PageHeading
        eyebrow="LEARN / PERFORMANCE"
        title="Your training progress"
        description="Track decision quality, find gaps, and see how your practice adds up."
      />
      <div className="stat-grid">
        <StatCard
          label="Total XP"
          value={stats.xp}
          detail={stats.rank.name}
          icon={<Zap size={17} />}
          accent
        />
        <StatCard
          label="Average score"
          value={`${stats.average}/100`}
          detail={`${attempts.length} completed attempts`}
          icon={<Activity size={17} />}
        />
        <StatCard
          label="Decision accuracy"
          value={`${stats.accuracy}%`}
          detail="Classification and ticket priority"
          icon={<Target size={17} />}
        />
        <StatCard
          label="Perfect investigations"
          value={stats.perfect}
          detail="A score of 100 out of 100"
          icon={<Trophy size={17} />}
        />
      </div>
      <div className="progress-columns">
        <Panel
          title="Training activity"
          meta={<span className="muted small">XP earned · last 7 local days</span>}
        >
          <div
            className="chart"
            role="img"
            aria-label={`XP by day: ${days.map((d) => `${d.label} ${d.xp}`).join(', ')}`}
          >
            <div className="chart-grid" />
            {days.map((d, i) => (
              <div className="chart-column" key={i}>
                <span>{d.xp}</span>
                <div
                  className="chart-bar"
                  style={{
                    height: `${Math.max(2, (d.xp / maxXP) * 150)}px`,
                    opacity: d.xp ? 1 : 0.25,
                  }}
                />
                <small>{d.label}</small>
              </div>
            ))}
          </div>
          {!attempts.length && (
            <p className="chart-caption">Complete a case to start your training timeline.</p>
          )}
        </Panel>
        <Panel title="Accuracy by practice area">
          <div className="topic-bars">
            {categories.map((category: Category) => (
              <div key={category}>
                <div>
                  <span>{categoryLabels[category]}</span>
                  <strong>
                    {stats.byCategory[category].count
                      ? `${stats.byCategory[category].accuracy}%`
                      : '—'}
                  </strong>
                </div>
                <ProgressBar value={stats.byCategory[category].accuracy} />
                <small>
                  {stats.byCategory[category].count} attempts · average score{' '}
                  {stats.byCategory[category].average}
                </small>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="insight-grid">
        {[
          ['Strongest practice area', trained[0] ? categoryLabels[trained[0]] : 'No baseline yet'],
          [
            'Most difficult practice area',
            trained.length > 1
              ? categoryLabels[trained[trained.length - 1]]
              : 'Train in two areas to compare',
          ],
          ['Missed incidents', stats.missed],
          ['Incorrect escalations', stats.incorrectEscalations],
          ['False positives identified', stats.falsePositives],
          ['Unique scenarios completed', new Set(attempts.map((a) => a.scenarioId)).size],
        ].map(([label, value]) => (
          <div className="panel insight" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <Panel
        title="Training history"
        meta={<span className="muted small">Select a case to review your debrief</span>}
      >
        <History attempts={attempts} onSelect={onHistory} />
      </Panel>
      {!trained.length && (
        <Empty
          title="Start with any practice area"
          detail="Your strengths and development areas will appear as you complete cases."
        />
      )}
    </>
  );
}
