import { Award, LockKeyhole, Trophy } from 'lucide-react';
import type { Attempt } from '../types';
import { achievements } from '../utils/achievements';
import { Badge, PageHeading, ProgressBar } from '../components/UI';
export default function Achievements({ attempts }: { attempts: Attempt[] }) {
  const items = achievements(attempts),
    unlocked = items.filter((a) => a.unlocked).length;
  return (
    <>
      <PageHeading
        eyebrow="LEARN / MILESTONES"
        title="Achievements"
        description="Build consistent habits and earn recognition for careful investigations."
        actions={
          <Badge tone="success">
            {unlocked} / {items.length} unlocked
          </Badge>
        }
      />
      <div className="achievement-grid">
        {items.map((a) => (
          <article className={`panel achievement ${a.unlocked ? 'unlocked' : ''}`} key={a.name}>
            <div className="achievement-top">
              <span className="achievement-emblem">
                {a.unlocked ? <Trophy size={28} /> : <Award size={28} />}
              </span>
              {a.unlocked ? <Badge tone="success">Unlocked</Badge> : <LockKeyhole size={16} />}
            </div>
            <h3>{a.name}</h3>
            <p>{a.description}</p>
            <ProgressBar value={Math.min(a.value, a.target)} max={a.target} />
            <small>
              {Math.min(a.value, a.target)} / {a.target}
            </small>
          </article>
        ))}
      </div>
    </>
  );
}
