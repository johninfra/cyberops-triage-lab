import type { Attempt } from '../types';
import { Badge, Empty } from './UI';
import { categoryLabels } from '../scenarios/catalog';
export default function History({
  attempts,
  onSelect,
}: {
  attempts: Attempt[];
  onSelect: (a: Attempt) => void;
}) {
  return attempts.length ? (
    <div className="history-list">
      {[...attempts].reverse().map((a) => (
        <button key={a.id} onClick={() => onSelect(a)}>
          <div className={`history-icon ${a.score < 70 ? 'warning' : ''}`}>{a.score}</div>
          <div>
            <strong>{a.title}</strong>
            <small>
              {categoryLabels[a.category]} · {new Date(a.date).toLocaleString()}
            </small>
          </div>
          <Badge tone="success">+{a.xp} XP</Badge>
        </button>
      ))}
    </div>
  ) : (
    <Empty
      title="Your first case starts here"
      detail="Complete an investigation to see your scores and activity history."
    />
  );
}
