import {
  ArrowRight,
  Activity,
  CheckCheck,
  Crosshair,
  Flame,
  ShieldCheck,
  Target,
  Zap,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import type { Attempt, Scenario, Settings, Category } from '../types';
import { categoryLabels, scenarios } from '../scenarios/catalog';
import { statistics } from '../utils/engine';
import { achievements } from '../utils/achievements';
import { Badge, PageHeading, Panel, ProgressBar, StatCard, TextLink } from '../components/UI';
import ScenarioTable from '../components/ScenarioTable';
import History from '../components/History';

export default function Dashboard({
  attempts,
  settings,
  onStart,
  onNavigate,
  onHistory,
}: {
  attempts: Attempt[];
  settings: Settings;
  onStart: (s: Scenario) => void;
  onNavigate: (page: string) => void;
  onHistory: (a: Attempt) => void;
}) {
  const stats = statistics(attempts);
  const eligible = scenarios.filter(
    (s) => settings.difficulty === 'All levels' || s.difficulty === settings.difficulty,
  );
  const next = eligible.find((s) => !attempts.some((a) => a.scenarioId === s.id)) ?? eligible[0];
  const unlocked = achievements(attempts).filter((a) => a.unlocked).length;
  const completed = new Set(attempts.map((a) => a.scenarioId)).size;
  return (
    <>
      <PageHeading
        eyebrow="YOUR OPERATIONS OVERVIEW"
        title="Welcome to the lab."
        description="Sharpen your instincts. Investigate the evidence. Make the right call."
        actions={
          <>
            <Badge tone="success">Local environment</Badge>
            <button className="button button-secondary" onClick={() => onNavigate('Progress')}>
              <Activity size={15} />
              View progress
            </button>
          </>
        }
      />
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow">
            <span className="tiny-dot green" />
            TRAINING ENVIRONMENT / ONLINE
          </span>
          <h2>
            Real scenarios.
            <br />
            Better security decisions.
          </h2>
          <p>
            A hands-on workspace for SOC triage, identity response,
            <br className="desktop-break" /> and cloud access management. Your next case is ready.
          </p>
          <button className="button button-primary" onClick={() => onStart(next)}>
            Start investigation <ArrowRight size={17} />
          </button>
          <span className="hero-caption">
            {scenarios.length} scenarios · 6 practice areas · 100% local
          </span>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="radar-grid" />
          <div className="radar-ring ring-one" />
          <div className="radar-ring ring-two" />
          <div className="radar-ring ring-three" />
          <div className="radar-cross horizontal" />
          <div className="radar-cross vertical" />
          <div className="shield-emblem">
            <ShieldCheck size={65} strokeWidth={1.3} />
          </div>
          <span className="radar-label label-one">IDENTITY.PROTECTED</span>
          <span className="radar-label label-two">ACCESS.VERIFIED</span>
          <span className="radar-point point-one" />
          <span className="radar-point point-two" />
          <span className="radar-point point-three" />
          <div className="scan-label">
            <span className="tiny-dot green" />
            LAB SYSTEMS READY
          </div>
        </div>
      </section>
      <div className="stat-grid">
        <StatCard
          label="Total XP"
          value={stats.xp.toLocaleString()}
          detail={
            stats.nextRank
              ? `${stats.nextRank.xp - stats.xp} XP to your next rank`
              : 'Highest rank achieved'
          }
          icon={<Zap size={17} />}
          accent
        />
        <StatCard
          label="Overall accuracy"
          value={
            <>
              {stats.accuracy}
              <span>%</span>
            </>
          }
          detail={
            attempts.length
              ? 'Classification and ticket priority accuracy'
              : 'Complete a case to establish your baseline'
          }
          icon={<Target size={17} />}
        />
        <StatCard
          label="Cases completed"
          value={attempts.length}
          detail={`${completed} of ${scenarios.length} unique scenarios explored`}
          icon={<CheckCheck size={17} />}
        />
        <StatCard
          label="Training streak"
          value={
            <>
              {stats.streak}
              <span> days</span>
            </>
          }
          detail={
            stats.streak ? 'Keep your momentum going' : 'Your first investigation starts the streak'
          }
          icon={<Flame size={17} />}
        />
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <Panel
            title="Investigation queue"
            meta={<TextLink onClick={() => onNavigate('All Cases')}>View all cases</TextLink>}
          >
            <div className="panel-subtitle">
              <span className="tiny-dot green" />
              Ready for investigation<span className="muted">{settings.difficulty}</span>
            </div>
            <ScenarioTable
              scenarios={eligible.slice(0, 4)}
              attempts={attempts}
              onStart={onStart}
              compact
            />
          </Panel>
          <Panel
            title="Practice areas"
            meta={<span className="muted small">Build skill across the stack</span>}
          >
            <div className="practice-grid">
              {(['SOC', 'IAM', 'Identity', 'Azure'] as Category[]).map((c, index) => (
                <button onClick={() => onNavigate(categoryLabels[c])} key={c}>
                  <span className={`practice-icon practice-${index}`}>
                    <Crosshair size={19} />
                  </span>
                  <div>
                    <strong>{categoryLabels[c]}</strong>
                    <small>
                      {scenarios.filter((s) => s.category === c).length} scenarios ·{' '}
                      {stats.byCategory[c].count} completed
                    </small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </Panel>
          <Panel
            title="Recent activity"
            meta={<TextLink onClick={() => onNavigate('Progress')}>Training history</TextLink>}
          >
            <History attempts={attempts.slice(-3)} onSelect={onHistory} />
          </Panel>
        </div>
        <aside className="dashboard-aside">
          <Panel title="Your progression" meta={<ShieldCheck size={16} />}>
            <div className="rank-display">
              <div className="rank-symbol">
                <ShieldCheck size={27} />
              </div>
              <Badge tone="success">
                Rank{' '}
                {Math.max(
                  1,
                  Math.floor(
                    [0, 200, 500, 1000, 1800, 2800, 4000, 5500].filter((x) => x <= stats.xp).length,
                  ),
                )}
              </Badge>
              <h3>{stats.rank.name}</h3>
              <p>
                {stats.nextRank ? `Next: ${stats.nextRank.name}` : 'Security Engineer unlocked'}
              </p>
            </div>
            <div className="rank-progress">
              <div>
                <span>{stats.xp.toLocaleString()} XP</span>
                <span>{stats.nextRank?.xp.toLocaleString() ?? stats.xp.toLocaleString()} XP</span>
              </div>
              <ProgressBar
                value={stats.xp - stats.rank.xp}
                max={
                  stats.nextRank
                    ? stats.nextRank.xp - stats.rank.xp
                    : Math.max(1, stats.xp - stats.rank.xp)
                }
              />
            </div>
            <div className="progression-facts">
              <div>
                <span>Average investigation</span>
                <strong>
                  {stats.average}
                  <small> / 100</small>
                </strong>
              </div>
              <div>
                <span>Perfect scores</span>
                <strong>{stats.perfect}</strong>
              </div>
              <div>
                <span>Achievements unlocked</span>
                <strong>
                  {unlocked}
                  <small> / 12</small>
                </strong>
              </div>
            </div>
            <button
              className="button button-ghost full-width"
              onClick={() => onNavigate('Achievements')}
            >
              View achievements <ArrowRight size={14} />
            </button>
          </Panel>
          <Panel title="Next recommended case">
            <div className="recommended">
              <span className="eyebrow">
                {next.category} / {next.difficulty}
              </span>
              <h3>{next.title}</h3>
              <p>{next.description}</p>
              <div className="recommended-meta">
                <span>
                  <Clock3 size={13} />
                  Self-paced
                </span>
                <Badge tone="neutral">Up to 100 XP</Badge>
              </div>
              <button className="button button-secondary full-width" onClick={() => onStart(next)}>
                Open case <ArrowRight size={15} />
              </button>
            </div>
          </Panel>
          <div className="lab-notice">
            <ShieldCheck size={19} />
            <div>
              <strong>A safe place to practice</strong>
              <p>
                Fictional data. Real decision-making.
                <br />
                Your progress stays in this browser.
              </p>
            </div>
          </div>
        </aside>
      </div>
      <div className="dashboard-footer-stats">
        {[
          ['Alerts investigated', stats.byCategory.SOC.count],
          ['IAM cases completed', stats.byCategory.IAM.count],
          ['Incidents resolved', stats.incidents],
          ['Current difficulty', settings.difficulty],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
