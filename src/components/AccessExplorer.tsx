import { useState } from 'react';
import { ArrowDown, UserRound, ShieldCheck, GitBranch } from 'lucide-react';
import { accessIdentities } from '../data/access';
import { Badge } from './UI';
export default function AccessExplorer() {
  const [identityIndex, setIdentityIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  const identity = accessIdentities[identityIndex],
    accessPath = identity.paths[pathIndex];
  return (
    <div className="access-explorer">
      <div className="explorer-controls">
        <label>
          Inspect identity
          <select
            aria-label="Inspect identity"
            value={identityIndex}
            onChange={(e) => {
              setIdentityIndex(Number(e.target.value));
              setPathIndex(0);
            }}
          >
            {accessIdentities.map((i, index) => (
              <option key={i.name} value={index}>
                {i.name} · {i.department}
              </option>
            ))}
          </select>
        </label>
        <label>
          Access path
          <select
            aria-label="Access path"
            value={pathIndex}
            onChange={(e) => setPathIndex(Number(e.target.value))}
          >
            {identity.paths.map((p, index) => (
              <option key={p.label} value={index}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="access-heading">
        <UserRound size={21} />
        <div>
          <strong>{identity.name}</strong>
          <p>{identity.role}</p>
        </div>
        <Badge tone="info">{accessPath.type}</Badge>
      </div>
      <div className="access-flow">
        {accessPath.nodes.map((node, i) => (
          <div key={node}>
            <div className="access-node">
              <span className="node-index">{i + 1}</span>
              <div>
                <small>
                  {
                    [
                      'Identity',
                      'Membership',
                      'Directory role',
                      'Azure role assignment',
                      'Scope',
                      'Resource / operation',
                    ][i]
                  }
                </small>
                <strong>{node}</strong>
              </div>
              {i === 3 ? <ShieldCheck size={18} /> : <GitBranch size={16} />}
            </div>
            {i < accessPath.nodes.length - 1 && <ArrowDown size={17} className="flow-arrow" />}
          </div>
        ))}
      </div>
      <div className="callout">
        <strong>Why this access exists</strong>
        <p>{accessPath.explanation}</p>
      </div>
    </div>
  );
}
