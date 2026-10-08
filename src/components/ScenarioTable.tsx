import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Attempt, Scenario } from '../types';
import { categoryLabels } from '../scenarios/catalog';
import { Badge, Empty, SeverityBadge } from './UI';
export default function ScenarioTable({
  scenarios,
  attempts,
  onStart,
  compact = false,
}: {
  scenarios: Scenario[];
  attempts: Attempt[];
  onStart: (s: Scenario) => void;
  compact?: boolean;
}) {
  return scenarios.length ? (
    <div className="table-scroll">
      <table className="scenario-table">
        <thead>
          <tr>
            <th>Case / detection</th>
            <th>Severity</th>
            <th>Difficulty</th>
            {!compact && <th>Practice area</th>}
            <th>Status</th>
            <th>
              <span className="sr-only">Open case</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => {
            const done = attempts.filter((a) => a.scenarioId === s.id);
            return (
              <tr key={s.id}>
                <td>
                  <button className="case-title-button" onClick={() => onStart(s)}>
                    <span className={`table-marker marker-${s.category.toLowerCase()}`}>
                      {s.category === 'SOC'
                        ? '!'
                        : s.category === 'IAM'
                          ? '↗'
                          : s.category === 'Azure'
                            ? '◇'
                            : '◎'}
                    </span>
                    <span>
                      <strong>{s.title}</strong>
                      <small className="mono">
                        {s.id.toUpperCase()} · {s.source}
                      </small>
                    </span>
                  </button>
                </td>
                <td>
                  <SeverityBadge severity={s.severity} />
                </td>
                <td>
                  <span className="difficulty">{s.difficulty}</span>
                </td>
                {!compact && <td className="muted">{categoryLabels[s.category]}</td>}
                <td>
                  {done.length ? (
                    <span className="completed">
                      <CheckCircle2 size={13} />
                      {Math.max(...done.map((a) => a.score))}% best
                    </span>
                  ) : (
                    <Badge tone="neutral">Ready</Badge>
                  )}
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`Investigate ${s.title}`}
                    onClick={() => onStart(s)}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No cases match these filters"
      detail="Try another difficulty or search term, or clear the filters."
    />
  );
}
