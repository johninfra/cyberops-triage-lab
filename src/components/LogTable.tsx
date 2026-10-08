import { useState } from 'react';
import { Search } from 'lucide-react';
import type { LogEntry } from '../types';
import { Badge, Empty, SeverityBadge } from './UI';
export default function LogTable({ logs }: { logs: LogEntry[] }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [date, setDate] = useState('');
  const filtered = logs.filter(
    (l) =>
      (!query ||
        `${l.user} ${l.source_ip} ${l.details} ${l.device} ${l.event_id} ${l.application}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (severity === 'All' || l.severity === severity) &&
      (status === 'All' || l.result === status) &&
      (type === 'All' || l.event_type === type) &&
      (!date || l.timestamp.startsWith(date)),
  );
  return (
    <div>
      <div className="log-filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search logs by user, IP, or event"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, IP, event…"
          />
        </label>
        <select
          aria-label="Filter log severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="All">All severities</option>
          {['Critical', 'High', 'Medium', 'Low'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter log status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All statuses</option>
          {[...new Set(logs.map((l) => l.result))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          aria-label="Filter event type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="All">All event types</option>
          {[...new Set(logs.map((l) => l.event_type))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          aria-label="Filter log date (UTC)"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="button button-ghost"
          onClick={() => {
            setQuery('');
            setSeverity('All');
            setStatus('All');
            setType('All');
            setDate('');
          }}
        >
          Clear
        </button>
      </div>
      <p className="muted small">
        {filtered.length} of {logs.length} events · timestamps in UTC · select an event to view all
        fields
      </p>
      {filtered.length ? (
        <div className="log-entries">
          {filtered.map((l) => (
            <details className="log-event" key={l.event_id}>
              <summary>
                <span className="mono">{l.timestamp.slice(11, 19)}</span>
                <strong>{l.event_type}</strong>
                <span className="mono">{l.source_ip}</span>
                <Badge tone={l.result === 'Alert' ? 'high' : 'neutral'}>{l.result}</Badge>
              </summary>
              <div className="log-detail">
                <div className="metadata-grid">
                  {Object.entries(l)
                    .filter(([key]) => key !== 'details')
                    .map(([key, value]) => (
                      <div key={key}>
                        <small>{key}</small>
                        {key === 'severity' ? (
                          <SeverityBadge severity={l.severity} />
                        ) : (
                          <span>{value}</span>
                        )}
                      </div>
                    ))}
                </div>
                <p>{l.details}</p>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <Empty
          title="No matching events"
          detail="Adjust the log filters or clear them to see all events."
        />
      )}
    </div>
  );
}
