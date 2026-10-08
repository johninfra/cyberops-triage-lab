import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  BookOpen,
  ChevronDown,
  Command,
  Crosshair,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  Menu,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react';
import type { Attempt, Category, SavedState, Scenario } from './types';
import { categoryLabels, scenarios } from './scenarios/catalog';
import { instantiate, parseState, playCompleteSound, statistics, storageKey } from './utils/engine';
import { Badge, Modal } from './components/UI';
import Investigation from './components/Investigation';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Knowledge from './pages/Knowledge';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, section: 'WORKSPACE' },
  { label: 'Alert Triage', icon: ShieldAlert, section: '' },
  { label: 'IAM Administration', icon: UsersRound, section: '' },
  { label: 'Identity Incidents', icon: Shield, section: '' },
  { label: 'Azure / Entra', icon: GitBranch, section: '' },
  { label: 'Ticket Queue', icon: ListTodo, section: '' },
  { label: 'Investigation Lab', icon: FlaskConical, section: '' },
  { label: 'Knowledge Center', icon: BookOpen, section: 'DEVELOPMENT' },
  { label: 'Achievements', icon: Trophy, section: '' },
  { label: 'Progress', icon: Activity, section: '' },
  { label: 'Settings', icon: Settings2, section: 'PREFERENCES' },
];
function initialState() {
  try {
    return parseState(localStorage.getItem(storageKey));
  } catch {
    return parseState(null);
  }
}
export default function App() {
  const [state, setState] = useState<SavedState>(initialState);
  const [page, setPage] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [current, setCurrent] = useState<Scenario | null>(null);
  const [history, setHistory] = useState<Attempt | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme.toLowerCase();
  }, [state.settings.theme]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === storageKey) setState(parseState(event.newValue));
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  const navigate = (target: string) => {
    setPage(target);
    setQuery('');
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };
  const start = (s: Scenario) => setCurrent(instantiate(s));
  const complete = (a: Attempt) => {
    setState((previous) => ({ ...previous, attempts: [...previous.attempts, a] }));
    if (state.settings.sound) playCompleteSound();
  };
  const next = () => {
    if (!current) return;
    const choices = scenarios.filter(
      (s) =>
        s.category === current.category &&
        s.id !== current.id &&
        (state.settings.difficulty === 'All levels' || s.difficulty === state.settings.difficulty),
    );
    const candidate =
      choices.find((s) => !state.attempts.some((a) => a.scenarioId === s.id)) ??
      choices[Math.floor(Math.random() * choices.length)] ??
      current;
    start(candidate);
  };
  const stats = statistics(state.attempts);
  const category = Object.entries(categoryLabels).find(([, label]) => label === page)?.[0] as
    | Category
    | undefined;
  const historyScenario = history ? scenarios.find((s) => s.id === history.scenarioId) : null;
  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          aria-label="Close navigation backdrop"
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <button className="brand" onClick={() => navigate('Dashboard')}>
          <span className="brand-mark">
            <ShieldCheck size={23} />
          </span>
          <span>
            <strong>
              CyberOps<span> Triage Lab</span>
            </strong>
            <small>SECURITY OPERATIONS TRAINING</small>
          </span>
        </button>
        <button
          className="mobile-sidebar-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <span className="workspace-icon">
            <Command size={15} />
          </span>
          <div>
            Personal workspace<small>Local training environment</small>
          </div>
          <ChevronDown size={13} />
        </div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <div key={item.label}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <button
                aria-label={item.label}
                className={`nav-item ${page === item.label ? 'active' : ''}`}
                onClick={() => navigate(item.label)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Alert Triage' && (
                  <small className="nav-count">
                    {
                      scenarios.filter(
                        (s) =>
                          s.category === 'SOC' &&
                          !state.attempts.some((a) => a.scenarioId === s.id),
                      ).length
                    }
                  </small>
                )}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-lab">
            <span className="tiny-dot green" />
            ALL SYSTEMS SIMULATED
          </div>
          <div className="player-profile">
            <div className="avatar">OP</div>
            <div>
              <strong>Local operator</strong>
              <small>{stats.rank.name}</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={20} />
            </button>
            <Crosshair size={17} />
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{page}</strong>
          </div>
          <div className="topbar-right">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                setPage('All Cases');
                setMobileOpen(false);
              }}
            >
              <Search size={15} />
              <input
                aria-label="Search all training cases"
                placeholder="Search the lab…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" aria-label="Run case search">
                <span>↵</span>
              </button>
            </form>
            <span className="top-mode">{state.settings.mode} mode</span>
            <button
              className="icon-button notification-button"
              aria-label="Lab environment information"
              onClick={() => setNoticeOpen(true)}
            >
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="avatar top-avatar">OP</div>
          </div>
        </header>
        <main>
          {storageError && (
            <div className="storage-warning" role="alert">
              This browser could not save progress. Your current session still works; export your
              history in Settings before closing.
            </div>
          )}
          {page === 'Dashboard' && (
            <Dashboard
              attempts={state.attempts}
              settings={state.settings}
              onStart={start}
              onNavigate={navigate}
              onHistory={setHistory}
            />
          )}
          {(category || page === 'All Cases') && (
            <Cases
              key={`${page}-${state.settings.difficulty}`}
              category={category}
              attempts={state.attempts}
              settings={state.settings}
              query={query}
              setQuery={setQuery}
              onStart={start}
            />
          )}
          {page === 'Knowledge Center' && <Knowledge />}
          {page === 'Progress' && <Progress attempts={state.attempts} onHistory={setHistory} />}
          {page === 'Achievements' && <Achievements attempts={state.attempts} />}
          {page === 'Settings' && (
            <Settings
              state={state}
              onChange={(settings) => setState((previous) => ({ ...previous, settings }))}
              onReset={() => setResetOpen(true)}
            />
          )}
          <footer className="app-footer">
            <span>CYBEROPS TRIAGE LAB</span>
            <span>Practice with purpose. Respond with confidence.</span>
            <span>LOCAL / v1.0</span>
          </footer>
        </main>
      </div>
      {current && (
        <Investigation
          key={`${current.id}-${current.logs[0].source_ip}-${current.logs[0].timestamp}`}
          scenario={current}
          settings={state.settings}
          onClose={() => setCurrent(null)}
          onComplete={complete}
          onNext={next}
        />
      )}
      {resetOpen && (
        <Modal title="Reset training progress" onClose={() => setResetOpen(false)}>
          <div className="confirm-body">
            <h2>Start fresh?</h2>
            <p>
              This removes all {state.attempts.length} saved attempts, XP, streaks, and achievements
              from this browser. Your settings stay saved.
            </p>
            <p className="muted small">
              Export your progress from Settings first if you want a backup.
            </p>
            <div className="confirm-actions">
              <button className="button button-ghost" onClick={() => setResetOpen(false)}>
                Keep progress
              </button>
              <button
                className="button button-danger"
                onClick={() => {
                  setState((previous) => ({ ...previous, attempts: [] }));
                  setResetOpen(false);
                }}
              >
                Reset all progress
              </button>
            </div>
          </div>
        </Modal>
      )}
      {noticeOpen && (
        <Modal title="Local lab environment" onClose={() => setNoticeOpen(false)}>
          <div className="confirm-body">
            <Badge tone="success">Ready to train</Badge>
            <h2>All systems are simulated.</h2>
            <p>
              There are {scenarios.length} playable cases across six practice areas. No credentials,
              tenant connections, or external APIs are needed.
            </p>
            <p>
              Your history is stored in this browser. Open Settings to change the play style,
              difficulty, timer, or theme.
            </p>
            <button
              className="button button-primary"
              onClick={() => {
                setNoticeOpen(false);
                navigate('Settings');
              }}
            >
              Open settings
            </button>
          </div>
        </Modal>
      )}
      {history && (
        <Modal title="Saved investigation debrief" onClose={() => setHistory(null)} wide>
          <div className="saved-debrief">
            <Badge tone={history.score >= 70 ? 'success' : 'medium'}>
              {history.score} / 100 · +{history.xp} XP
            </Badge>
            <h2>{history.title}</h2>
            <p className="muted">
              {new Date(history.date).toLocaleString()} · {history.difficulty} · {history.duration}s
            </p>
            <div className="debrief-grid">
              <section>
                <h3>Correct Decision</h3>
                <p>
                  {historyScenario?.tickets
                    ? 'Prioritize containment, then urgent recovery.'
                    : history.correctClassification}
                </p>
                <h3>Explanation</h3>
                <p>
                  {historyScenario?.explanation ??
                    'The scenario is no longer available in this catalog.'}
                </p>
                <h3>Security Principle</h3>
                <p>{historyScenario?.principle}</p>
                <h3>Recommended Response</h3>
                <ol>
                  {(historyScenario?.ticketOrder
                    ? historyScenario.ticketOrder.map(
                        (id) => historyScenario.tickets!.find((t) => t.id === id)!.title,
                      )
                    : (historyScenario?.correctActions ?? [])
                  ).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
                <h3>Why Other Choices Were Wrong</h3>
                <p>{historyScenario?.otherChoices}</p>
                <h3>Real-World Takeaway</h3>
                <p>{historyScenario?.takeaway}</p>
              </section>
              <aside className="your-decision">
                <h3>Your decision</h3>
                <p>
                  {historyScenario?.tickets ? 'Ticket prioritization' : history.classification} ·{' '}
                  {history.principle}
                </p>
                <ol>
                  {(historyScenario?.tickets
                    ? (history.ticketOrder ?? []).map(
                        (id) => historyScenario.tickets!.find((t) => t.id === id)?.title ?? id,
                      )
                    : history.actions
                  ).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
                <h3>Score breakdown</h3>
                {Object.entries(history.breakdown).map(([key, value]) => (
                  <p key={key}>
                    {key}: <strong>{value}</strong>
                  </p>
                ))}
                <h3>Your notes</h3>
                <p className="preserve-text">{history.notes || 'No notes recorded.'}</p>
              </aside>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
