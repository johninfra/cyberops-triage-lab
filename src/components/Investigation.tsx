import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Clock3,
  FileSearch,
  Lightbulb,
  ListOrdered,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import type { Attempt, Classification, Scenario, Settings } from '../types';
import { classifications, principles } from '../scenarios/catalog';
import { scoreDecision } from '../utils/engine';
import { Badge, Modal, ProgressBar, SeverityBadge } from './UI';
import LogTable from './LogTable';
import AccessExplorer from './AccessExplorer';

const tabs = [
  'Overview',
  'Sign-ins',
  'Audit Logs',
  'Devices',
  'Permissions',
  'Applications',
  'Timeline',
  'Notes',
];
export default function Investigation({
  scenario: s,
  settings,
  onClose,
  onComplete,
  onNext,
}: {
  scenario: Scenario;
  settings: Settings;
  onClose: () => void;
  onComplete: (a: Attempt) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState('Overview');
  const [classification, setClassification] = useState<Classification | ''>('');
  const [actions, setActions] = useState<string[]>([]);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [principle, setPrinciple] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<Attempt | null>(null);
  const [ticketOrder, setTicketOrder] = useState(s.tickets?.map((t) => t.id) ?? []);
  const [start] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [runId] = useState(() => `NS-${String(Math.floor(10000 + Math.random() * 90000))}`);
  useEffect(() => {
    if (!settings.timer || result) return;
    const timer = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [settings.timer, result, start]);
  const minimumEvidence = s.category === 'Investigation' ? 3 : 1;
  const gathered = s.requiredEvidence.filter((id) => evidence.includes(id)).length;
  const ready =
    gathered >= minimumEvidence &&
    !!principle &&
    (s.tickets || (!!classification && actions.length > 0));
  const toggleAction = (a: string) =>
    setActions((previous) =>
      previous.includes(a) ? previous.filter((x) => x !== a) : [...previous, a],
    );
  const move = (
    items: string[],
    index: number,
    delta: number,
    setter: (items: string[]) => void,
  ) => {
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setter(next);
  };
  const submit = () => {
    if (!ready || result) return;
    const attempt = scoreDecision(s, {
      classification: classification || 'Escalate',
      actions,
      evidence,
      principle,
      ticketOrder,
      duration: Math.floor((Date.now() - start) / 1000),
      notes,
    });
    setResult(attempt);
    onComplete(attempt);
  };
  return (
    <Modal
      title={result ? 'Investigation debrief' : 'Investigation workspace'}
      onClose={onClose}
      wide
    >
      <div className="case-heading">
        <div>
          <div className="eyebrow">
            <span className="mono">{runId}</span> / {s.category} / {s.difficulty}
          </div>
          <h2>{s.title}</h2>
          <p>{s.description}</p>
        </div>
        <div className="case-badges">
          <SeverityBadge severity={s.severity} />
          <Badge tone="info">{settings.mode} mode</Badge>
          {settings.timer && (
            <span className="duration">
              <Clock3 size={14} />
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
      {result ? (
        <div className="debrief">
          <div className="result-banner">
            <div className={`score-ring ${result.score < 70 ? 'warning' : ''}`}>
              <strong>{result.score}</strong>
              <small>/ 100</small>
            </div>
            <div>
              <div className="eyebrow">
                {result.score >= 90
                  ? 'Excellent investigation'
                  : result.score >= 70
                    ? 'Case completed'
                    : 'Keep building your skills'}
              </div>
              <h2>+{result.xp} XP earned</h2>
              <p>
                Saved to your local training history · {Math.floor(result.duration / 60)}m{' '}
                {result.duration % 60}s
              </p>
            </div>
            <Trophy size={40} />
          </div>
          <div className="score-breakdown">
            {Object.entries(result.breakdown).map(([key, value], i) => (
              <div key={key}>
                <small>{key === 'classification' && s.tickets ? 'Priority order' : key}</small>
                <strong>
                  {value}
                  <span> / {[30, 25, 25, 10, 10][i]}</span>
                </strong>
              </div>
            ))}
          </div>
          <div className="debrief-grid">
            <section>
              <h3>Correct Decision</h3>
              <p>
                {s.tickets
                  ? 'Prioritize containment, then urgent business recovery.'
                  : s.correctClassification}
              </p>
              <h3>Explanation</h3>
              <p>{s.explanation}</p>
              <h3>Security Principle</h3>
              <p>{s.principle}</p>
              <h3>Recommended Response</h3>
              <ol>
                {(s.ticketOrder
                  ? s.ticketOrder.map((id) => s.tickets!.find((t) => t.id === id)!.title)
                  : s.correctActions
                ).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
              <h3>Recommended investigation process</h3>
              <ol>
                {s.evidence
                  .filter((e) => s.requiredEvidence.includes(e.id))
                  .map((e) => (
                    <li key={e.id}>
                      {e.title}: {e.detail}
                    </li>
                  ))}
              </ol>
              <h3>Why Other Choices Were Wrong</h3>
              <p>{s.otherChoices}</p>
              <h3>Real-World Takeaway</h3>
              <p>{s.takeaway}</p>
            </section>
            <aside className="your-decision">
              <h3>Your decision</h3>
              <p>
                <strong>Classification</strong>
                <br />
                {s.tickets ? 'Ticket prioritization submitted' : result.classification}
              </p>
              <p>
                <strong>Security principle</strong>
                <br />
                {result.principle}
              </p>
              <strong>{s.tickets ? 'Your ticket order' : 'Your response'}</strong>
              <ol>
                {(s.tickets
                  ? ticketOrder.map((id) => s.tickets!.find((t) => t.id === id)!.title)
                  : result.actions
                ).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
              <p>
                <strong>Evidence cited</strong>
                <br />
                {gathered} / {s.requiredEvidence.length} core sources
              </p>
              {result.notes && (
                <>
                  <strong>Your notes</strong>
                  <p className="preserve-text">{result.notes}</p>
                </>
              )}
              <div className="callout small">
                Efficiency rewards precise responses, not speed. Investigation time does not reduce
                your score.
              </div>
            </aside>
          </div>
          <div className="debrief-actions">
            <button className="button button-ghost" onClick={onClose}>
              Back to lab
            </button>
            <button className="button button-primary" onClick={onNext}>
              Next case <ArrowUp size={16} className="rotate-right" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="investigation-layout">
            <div className="evidence-workspace">
              <div className="tabs" role="tablist" aria-label="Investigation data sources">
                {tabs.map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    aria-controls="evidence-panel"
                    onClick={() => setTab(t)}
                    className={tab === t ? 'active' : ''}
                  >
                    {t}
                    {t === 'Notes' && notes && <span className="tiny-dot" />}
                  </button>
                ))}
              </div>
              <div
                className="evidence-content"
                id="evidence-panel"
                role="tabpanel"
                aria-label={tab}
              >
                {tab === 'Overview' && (
                  <>
                    <div className="section-label">IDENTITY & ALERT DETAILS</div>
                    <div className="metadata-grid">
                      {[
                        ['User', s.user],
                        ['Department', s.department],
                        ['Status', 'Under investigation'],
                        ['Detection source', s.source],
                        ['Application', s.application],
                        ['Alert ID', runId],
                        ['Device', s.logs[2].device],
                        ['Source IP', s.logs[0].source_ip],
                        ['Location', s.logs[0].location],
                        ['Risk level', s.severity],
                        ['Authentication method', s.logs[0].authentication_method],
                        ['Timestamp (UTC)', s.logs[0].timestamp],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <small>{label}</small>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="callout">
                      <FileSearch size={20} />
                      <div>
                        <strong>Build an evidence-backed conclusion</strong>
                        <p>
                          Open the data tabs and cite relevant evidence. Review authentication,
                          authorization, and endpoint context before making a decision.
                        </p>
                      </div>
                    </div>
                    <div className="section-label">INVESTIGATION CHECKLIST</div>
                    <div className="checklist">
                      {s.evidence
                        .filter((e) => s.requiredEvidence.includes(e.id))
                        .map((e) => (
                          <button onClick={() => setTab(e.tab)} key={e.id}>
                            <span
                              className={
                                evidence.includes(e.id) ? 'check-circle checked' : 'check-circle'
                              }
                            >
                              {evidence.includes(e.id) ? <Check size={13} /> : null}
                            </span>
                            <span>{e.title}</span>
                            <span className="muted small">{e.tab} ↗</span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
                {s.evidence
                  .filter((e) => e.tab === tab)
                  .map((e) => (
                    <article className="evidence-card" key={e.id}>
                      <div className="evidence-card-heading">
                        <h3>{e.title}</h3>
                        <Badge tone="neutral">Fictional evidence</Badge>
                      </div>
                      <p>{e.detail}</p>
                      <button
                        className={`button ${evidence.includes(e.id) ? 'button-cited' : 'button-secondary'}`}
                        onClick={() =>
                          setEvidence((previous) =>
                            previous.includes(e.id)
                              ? previous.filter((x) => x !== e.id)
                              : [...previous, e.id],
                          )
                        }
                      >
                        {evidence.includes(e.id) ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <FileSearch size={15} />
                        )}
                        {evidence.includes(e.id) ? 'Evidence cited · remove' : 'Cite this evidence'}
                      </button>
                    </article>
                  ))}
                {['Sign-ins', 'Audit Logs', 'Devices', 'Applications'].includes(tab) && (
                  <>
                    <h3 className="subheading">Related event records</h3>
                    <LogTable
                      logs={
                        tab === 'Sign-ins'
                          ? s.logs.filter((l) => l.event_type === 'Sign-in context')
                          : tab === 'Audit Logs'
                            ? s.logs.filter((l) => l.event_type === 'Audit event')
                            : tab === 'Devices'
                              ? s.logs.filter((l) => l.event_type === 'Endpoint context')
                              : s.logs
                      }
                    />
                  </>
                )}
                {tab === 'Permissions' && s.category === 'Azure' && <AccessExplorer />}
                {tab === 'Timeline' && (
                  <>
                    <h3>Correlated activity timeline</h3>
                    <div className="timeline">
                      {[...s.logs]
                        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                        .map((l) => (
                          <article key={l.event_id}>
                            <span className="timeline-dot" />
                            <small className="mono">
                              {new Date(l.timestamp).toLocaleString()} · {l.event_type}
                            </small>
                            <h4>
                              {l.application} / {l.result}
                            </h4>
                            <p>{l.details}</p>
                          </article>
                        ))}
                    </div>
                  </>
                )}
                {tab === 'Notes' && (
                  <>
                    <h3>Investigation notes</h3>
                    <p className="muted">
                      Record your working hypothesis, evidence, and planned response. Notes are
                      saved with the completed case.
                    </p>
                    <textarea
                      className="notes-input"
                      aria-label="Investigation notes"
                      placeholder="What happened? Which evidence supports your conclusion?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={12000}
                    />
                    <span className="muted small">{notes.length} / 12,000 characters</span>
                  </>
                )}
                {s.tickets && tab === 'Overview' && (
                  <div className="ticket-list">
                    <h3>
                      <ListOrdered size={18} /> Prioritize the queue
                    </h3>
                    <p className="muted">
                      Move tickets up or down. Position 1 is your first response.
                    </p>
                    {ticketOrder.map((id, index) => {
                      const ticket = s.tickets!.find((t) => t.id === id)!;
                      return (
                        <div className="ticket-card" key={id}>
                          <span className="ticket-number">{index + 1}</span>
                          <div>
                            <strong>{ticket.title}</strong>
                            <div className="ticket-meta">
                              <SeverityBadge severity={ticket.severity} />
                              <span>
                                {ticket.affected} affected · {ticket.urgency}
                              </span>
                            </div>
                            <p>{ticket.detail}</p>
                            <small className="muted">Impact: {ticket.impact}</small>
                          </div>
                          <div className="reorder">
                            <button
                              className="icon-button"
                              aria-label={`Move ${ticket.title} up`}
                              disabled={index === 0}
                              onClick={() => move(ticketOrder, index, -1, setTicketOrder)}
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              className="icon-button"
                              aria-label={`Move ${ticket.title} down`}
                              disabled={index === ticketOrder.length - 1}
                              onClick={() => move(ticketOrder, index, 1, setTicketOrder)}
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <aside className="decision-panel">
              <div className="decision-heading">
                <ShieldCheck size={18} />
                <h3>Your assessment</h3>
              </div>
              <div className="evidence-progress">
                <div>
                  <span>Core evidence cited</span>
                  <strong>
                    {gathered} / {s.requiredEvidence.length}
                  </strong>
                </div>
                <ProgressBar value={gathered} max={s.requiredEvidence.length} />
              </div>
              {settings.mode === 'Training' && (
                <details className="hint">
                  <summary>
                    <Lightbulb size={16} />
                    Training hint
                  </summary>
                  <p>{s.hint}</p>
                </details>
              )}
              {!s.tickets && (
                <>
                  <label className="field-label" htmlFor="classification">
                    01 · Classification
                  </label>
                  <select
                    id="classification"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as Classification)}
                  >
                    <option value="">Choose a classification</option>
                    {classifications.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <div className="field-label">
                    02 · Response actions {s.ordered && <Badge tone="info">Ordered</Badge>}
                  </div>
                  <p className="muted small">
                    {s.ordered
                      ? 'Select actions, then arrange the response sequence below.'
                      : 'Select all appropriate actions. Extra actions can reduce your score.'}
                  </p>
                  <div className="action-options">
                    {s.possibleActions.map((a) => (
                      <label className={actions.includes(a) ? 'selected' : ''} key={a}>
                        <input
                          type="checkbox"
                          checked={actions.includes(a)}
                          onChange={() => toggleAction(a)}
                        />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                  {s.ordered && actions.length > 0 && (
                    <div className="selected-sequence">
                      <strong className="small">Containment sequence</strong>
                      {actions.map((a, i) => (
                        <div key={a}>
                          <span>
                            {i + 1}. {a}
                          </span>
                          <button
                            className="icon-button"
                            aria-label={`Move ${a} up`}
                            disabled={i === 0}
                            onClick={() => move(actions, i, -1, setActions)}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`Move ${a} down`}
                            disabled={i === actions.length - 1}
                            onClick={() => move(actions, i, 1, setActions)}
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {s.tickets && (
                <div className="callout small">
                  Rank the tickets in Overview. Your score measures relative priority and exact
                  position. Review all three core evidence sources.
                </div>
              )}
              <label className="field-label" htmlFor="principle">
                {s.tickets ? '02' : '03'} · Security principle
              </label>
              <select
                id="principle"
                value={principle}
                onChange={(e) => setPrinciple(e.target.value)}
              >
                <option value="">Choose the primary principle</option>
                {principles.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="quick-notes">
                Investigation notes
              </label>
              <textarea
                id="quick-notes"
                rows={3}
                placeholder="Evidence, hypothesis, response…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={12000}
              />
              <div className="submit-area">
                <button className="button button-primary" onClick={submit} disabled={!ready}>
                  Submit investigation <Check size={16} />
                </button>
                <p className="muted small">
                  {gathered < minimumEvidence
                    ? `Cite at least ${minimumEvidence} core evidence source${minimumEvidence > 1 ? 's' : ''} before submitting.`
                    : !ready
                      ? 'Choose your classification, response, and principle.'
                      : 'Submit to receive your score and case debrief.'}
                </p>
              </div>
            </aside>
          </div>
          <div className="case-footer">
            <span>
              <span className="tiny-dot green" />
              Local simulation · no live systems connected
            </span>
            <span>
              {settings.mode === 'Assessment'
                ? 'Hints are hidden until submission'
                : 'Learn by investigating'}
            </span>
          </div>
        </>
      )}
    </Modal>
  );
}
