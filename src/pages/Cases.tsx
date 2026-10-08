import { useState } from 'react';
import { GitBranch, Search, SlidersHorizontal } from 'lucide-react';
import type { Attempt, Category, Scenario, Settings } from '../types';
import { categoryLabels, scenarios } from '../scenarios/catalog';
import { Badge, PageHeading, Panel } from '../components/UI';
import ScenarioTable from '../components/ScenarioTable';
import AccessExplorer from '../components/AccessExplorer';

const descriptions: Record<Category, string> = {
  SOC: 'Validate detections, correlate evidence, and choose a proportionate response.',
  IAM: 'Practice identity lifecycle, least privilege, and access governance decisions.',
  Identity: 'Contain account compromise, remove persistence, and sequence your response.',
  Azure: 'Trace effective access, evaluate policies, and select the right role and scope.',
  Tickets: 'Balance active threats, business impact, urgency, and available workarounds.',
  Investigation: 'Build a defensible conclusion from multiple independent evidence sources.',
};
export default function Cases({
  category,
  attempts,
  settings,
  query,
  setQuery,
  onStart,
}: {
  category?: Category;
  attempts: Attempt[];
  settings: Settings;
  query: string;
  setQuery: (s: string) => void;
  onStart: (s: Scenario) => void;
}) {
  const [difficulty, setDifficulty] = useState<string>(settings.difficulty);
  const [status, setStatus] = useState('All cases');
  const [explorer, setExplorer] = useState(false);
  const filtered = scenarios.filter(
    (s) =>
      (!category || s.category === category) &&
      (difficulty === 'All levels' || s.difficulty === difficulty) &&
      `${s.title} ${s.description} ${s.category} ${s.id}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === 'All cases' ||
        (status === 'Completed'
          ? attempts.some((a) => a.scenarioId === s.id)
          : !attempts.some((a) => a.scenarioId === s.id))),
  );
  return (
    <>
      <PageHeading
        eyebrow="OPERATIONS / CASE LIBRARY"
        title={category ? categoryLabels[category] : 'All training cases'}
        description={
          category
            ? descriptions[category]
            : 'Explore every practice area and build your next investigation.'
        }
        actions={
          <>
            <Badge tone="info">{settings.mode} mode</Badge>
            {category === 'Azure' && (
              <button className="button button-secondary" onClick={() => setExplorer(!explorer)}>
                <GitBranch size={16} />
                {explorer ? 'Hide access explorer' : 'Access path explorer'}
              </button>
            )}
          </>
        }
      />
      {explorer && (
        <Panel title="Access Path Explorer" meta={<Badge tone="info">Mock tenant</Badge>}>
          <div className="panel-body">
            <AccessExplorer />
          </div>
        </Panel>
      )}
      {category === 'Tickets' && (
        <div className="callout">
          <SlidersHorizontal size={20} />
          <div>
            <strong>Priority is more than severity</strong>
            <p>
              Each queue presents multiple incoming tickets. Move them into response order using the
              threat evidence, business impact, and urgency described in the case.
            </p>
          </div>
        </div>
      )}
      <Panel
        title={`${filtered.length} available ${filtered.length === 1 ? 'case' : 'cases'}`}
        meta={<span className="muted small">Progress saved locally</span>}
      >
        <div className="case-filters">
          <label className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search scenarios"
              placeholder="Search cases, detections, concepts…"
            />
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Filter scenario difficulty"
          >
            {['All levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter scenario completion"
          >
            {['All cases', 'Not completed', 'Completed'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button
            className="button button-ghost"
            onClick={() => {
              setQuery('');
              setDifficulty('All levels');
              setStatus('All cases');
            }}
          >
            Clear filters
          </button>
        </div>
        <ScenarioTable scenarios={filtered} attempts={attempts} onStart={onStart} />
      </Panel>
      <p className="page-footnote">
        Cases use fictional identities and documentation-only IP ranges. Choices affect your
        training score, never a real tenant.
      </p>
    </>
  );
}
