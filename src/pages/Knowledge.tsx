import { useState } from 'react';
import { BookOpen, Search, ExternalLink } from 'lucide-react';
import { knowledge, references } from '../data/knowledge';
import { Badge, Empty, PageHeading } from '../components/UI';
export default function Knowledge() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All concepts');
  const filtered = knowledge.filter(
    ([title, text, category]) =>
      (group === 'All concepts' || category === group) &&
      `${title} ${text}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="LEARN / REFERENCE"
        title="Knowledge Center"
        description="Practical security concepts for the decisions you make in the lab."
      />
      <div className="knowledge-filters">
        <label className="search-field">
          <Search size={17} />
          <input
            placeholder="Find a concept…"
            aria-label="Search knowledge concepts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter knowledge topic"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          {['All concepts', ...new Set(knowledge.map((k) => k[2]))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="knowledge-grid">
        {filtered.map(([title, text, category]) => (
          <article className="panel concept-card" key={title}>
            <div>
              <BookOpen size={18} />
              <Badge tone="neutral">{category}</Badge>
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty title="No matching concepts" detail="Try a broader term or select another topic." />
      )}
      <div className="references">
        <h3>Continue with the official documentation</h3>
        <p className="muted small">
          These optional reference links open online. The lab itself works without external
          services.
        </p>
        {references.map((r) => (
          <a href={r.url} key={r.title} target="_blank" rel="noreferrer">
            {r.title}
            <ExternalLink size={13} />
          </a>
        ))}
      </div>
    </>
  );
}
