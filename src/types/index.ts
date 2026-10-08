export type Category = 'SOC' | 'IAM' | 'Identity' | 'Azure' | 'Tickets' | 'Investigation';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type Classification =
  | 'Benign'
  | 'False Positive'
  | 'Suspicious'
  | 'Confirmed Incident'
  | 'Escalate';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export interface LogEntry {
  timestamp: string;
  event_id: string;
  user: string;
  source_ip: string;
  device: string;
  application: string;
  result: string;
  authentication_method: string;
  risk_level: string;
  location: string;
  severity: Severity;
  event_type: string;
  details: string;
}
export interface Evidence {
  id: string;
  tab: string;
  title: string;
  detail: string;
}
export interface Ticket {
  id: string;
  title: string;
  impact: string;
  urgency: string;
  severity: Severity;
  affected: number;
  detail: string;
}
export interface Scenario {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  severity: Severity;
  description: string;
  user: string;
  department: string;
  source: string;
  application: string;
  evidence: Evidence[];
  logs: LogEntry[];
  possibleActions: string[];
  correctClassification: Classification;
  correctActions: string[];
  requiredEvidence: string[];
  principle: string;
  securityConcepts: string[];
  hint: string;
  explanation: string;
  takeaway: string;
  otherChoices: string;
  ordered?: boolean;
  tickets?: Ticket[];
  ticketOrder?: string[];
}
export interface Attempt {
  id: string;
  scenarioId: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  date: string;
  score: number;
  xp: number;
  classification: Classification;
  correctClassification: Classification;
  actions: string[];
  evidence: string[];
  principle: string;
  duration: number;
  notes: string;
  ticketOrder?: string[];
  breakdown: {
    classification: number;
    investigation: number;
    remediation: number;
    principle: number;
    efficiency: number;
  };
}
export interface Settings {
  difficulty: Difficulty | 'All levels';
  mode: 'Training' | 'Assessment';
  sound: boolean;
  theme: 'Dark' | 'Light';
  timer: boolean;
}
export interface SavedState {
  version: 1;
  attempts: Attempt[];
  settings: Settings;
}
export interface AccessIdentity {
  name: string;
  role: string;
  department: string;
  paths: { label: string; type: string; nodes: string[]; explanation: string }[];
}
