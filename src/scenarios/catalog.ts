import type {
  Scenario,
  Category,
  Difficulty,
  Classification,
  Severity,
  Evidence,
  Ticket,
} from '../types';

interface Seed {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  severity: Severity;
  description: string;
  facts: [string, string, string];
  actions: string[];
  distractors: string[];
  classification: Classification;
  principle: string;
  explanation: string;
  takeaway: string;
  wrong: string;
  hint: string;
  ordered?: boolean;
  user?: string;
  department?: string;
  application?: string;
  source?: string;
  tickets?: Ticket[];
  ticketOrder?: string[];
}

function build(seed: Seed): Scenario {
  const user =
    seed.user ??
    (seed.id === 'id-04'
      ? 'svc-report-worker'
      : seed.id === 'iam-06'
        ? 'svc-legacy-reports'
        : seed.id === 'lab-02'
          ? 'sp-legacy-deployer'
          : 'Jordan Lee');
  const department = seed.department ?? 'Engineering';
  const application = seed.application ?? 'Microsoft 365';
  const source =
    seed.source ??
    (seed.category === 'Azure'
      ? 'Azure activity logs'
      : seed.category === 'IAM'
        ? 'Service desk'
        : 'Microsoft Defender');
  const evidence: Evidence[] = seed.facts.map((detail, i) => ({
    id: `${seed.id}-e${i}`,
    tab: ['Sign-ins', 'Audit Logs', 'Devices'][i],
    title: [
      'Authentication & context',
      'Audit trail & authorization',
      'Device & corroborating evidence',
    ][i],
    detail,
  }));
  evidence.push({
    id: `${seed.id}-profile`,
    tab: 'Permissions',
    title: 'Identity profile',
    detail: `${user} • ${department} • Enabled member account. Tenant: Northstar Labs (fictional). Review task-specific permissions and approval evidence before changing access.`,
  });
  evidence.push({
    id: `${seed.id}-app`,
    tab: 'Applications',
    title: 'Application context',
    detail: `${application} • Tenant northstar-labs.test • Source: ${source}. All events and resources in this case are simulated.`,
  });
  const results =
    seed.classification === 'Confirmed Incident'
      ? ['Success', 'Success', 'Alert']
      : ['Success', 'Recorded', 'Review'];
  if (seed.id === 'soc-02') results[0] = 'Failure';
  if (seed.id === 'az-02' || seed.id === 'az-03' || seed.id === 'az-04')
    results[0] = 'Access denied';
  const authentication =
    user.startsWith('svc-') || user.startsWith('sp-')
      ? 'Client credential (workload identity)'
      : seed.id === 'soc-08'
        ? 'Legacy password authentication'
        : seed.id === 'soc-02'
          ? 'Password (failed)'
          : ['id-02', 'id-03'].includes(seed.id)
            ? 'Existing delegated session'
            : 'Password + MFA';
  return {
    id: seed.id,
    title: seed.title,
    category: seed.category,
    difficulty: seed.difficulty,
    severity: seed.severity,
    description: seed.description,
    user,
    department,
    source,
    application,
    evidence,
    logs: seed.facts
      .map((details, i) => ({
        timestamp: `2026-10-08T${['09:12:00', '09:16:00', '09:21:00'][i]}Z`,
        event_id: ['Entra-SignIn-001', 'DirectoryAudit-002', 'DeviceEvents-003'][i],
        user,
        source_ip: ['192.0.2.42', '198.51.100.18', '203.0.113.66'][i],
        device: i === 2 ? 'NS-WKS-042' : 'Identity service',
        application,
        result: results[i],
        authentication_method: i === 0 ? authentication : 'Not applicable',
        risk_level: seed.severity,
        location: ['Seattle, US', 'Cloud control plane', 'Seattle, US'][i],
        severity: seed.severity,
        event_type: ['Sign-in context', 'Audit event', 'Endpoint context'][i],
        details,
      }))
      .concat(
        seed.category === 'Tickets'
          ? []
          : [
              {
                timestamp: '2026-10-08T08:27:00Z',
                event_id: 'Entra-SignIn-History-000',
                user,
                source_ip: '192.0.2.10',
                device: 'NS-WKS-042',
                application,
                result: 'Success',
                authentication_method:
                  user.startsWith('svc-') || user.startsWith('sp-')
                    ? 'Client credential (workload identity)'
                    : 'Phishing-resistant MFA',
                risk_level: 'Low',
                location: 'Seattle, US',
                severity: 'Low' as Severity,
                event_type: 'Sign-in context',
                details:
                  'Historical baseline: an earlier, owner-recognized session from the approved network. This event predates the current case and does not authorize later activity.',
              },
            ],
      ),
    possibleActions: [...seed.actions, ...seed.distractors],
    correctClassification: seed.classification,
    correctActions: seed.actions,
    requiredEvidence: evidence.slice(0, 3).map((e) => e.id),
    principle: seed.principle,
    securityConcepts: [seed.principle],
    hint: seed.hint,
    explanation: seed.explanation,
    takeaway: seed.takeaway,
    otherChoices: seed.wrong,
    ordered: seed.ordered,
    tickets: seed.tickets,
    ticketOrder: seed.ticketOrder,
  };
}

const seeds: Seed[] = [
  {
    id: 'soc-01',
    title: 'Impossible travel, familiar device',
    category: 'SOC',
    difficulty: 'Intermediate',
    severity: 'Medium',
    description:
      'Two successful sign-ins appear 8,000 km apart within six minutes. Decide whether the identity has been compromised.',
    facts: [
      'Seattle and Amsterdam sign-ins occur six minutes apart and share the same managed device ID and phishing-resistant authentication session.',
      'The Amsterdam address is in the approved Northstar corporate VPN egress list. Change ticket NET-114 confirms an egress migration today.',
      'The user confirms using the corporate VPN. Endpoint health is clean; no unfamiliar MFA method, mailbox rule, or application consent is present.',
    ],
    actions: ['Dismiss alert', 'Document VPN correlation'],
    distractors: ['Disable account', 'Reset password', 'Escalate to incident response'],
    classification: 'False Positive',
    principle: 'Evidence-based triage',
    explanation:
      'The geography is explained by approved VPN routing, with independent device and change-record evidence. The detector inferred travel that did not occur.',
    takeaway:
      'Correlate network routing, device identity, and authorization before treating geolocation as proof.',
    wrong:
      'Account suspension and incident-response escalation are disproportionate to the corroborated evidence.',
    hint: 'Compare device IDs and verify the second IP against the approved egress list.',
  },
  {
    id: 'soc-02',
    title: 'A wave of password failures',
    category: 'SOC',
    difficulty: 'Beginner',
    severity: 'High',
    description:
      'An unfamiliar IP generated failures against 38 employee accounts. No successful sign-in has been identified.',
    facts: [
      'The source attempted two common passwords per account over 25 minutes. All 76 attempts failed.',
      'No new sessions, role assignments, or MFA registrations appear in the affected accounts. Legacy authentication is blocked.',
      'The source has no business relationship with Northstar. Existing monitoring covers the affected accounts for follow-on success.',
    ],
    actions: ['Block IP', 'Review authentication logs', 'Continue monitoring'],
    distractors: [
      'Reset every employee password',
      'Dismiss alert',
      'Disable all affected accounts',
    ],
    classification: 'Suspicious',
    principle: 'Proportional response',
    explanation:
      'The broad, shallow failure pattern is a password-spray attempt. Evidence supports an attack attempt, but does not establish account compromise.',
    takeaway:
      'Separate attempted authentication abuse from successful compromise and look for successes after failures.',
    wrong:
      'Mass account changes disrupt users without evidence of compromise; dismissing ignores a real attack pattern.',
    hint: 'Count accounts versus attempts per account and look for successful authentication.',
  },
  {
    id: 'soc-03',
    title: 'PowerShell on a finance workstation',
    category: 'SOC',
    difficulty: 'Advanced',
    severity: 'High',
    department: 'Finance',
    description:
      'Defender detected PowerShell launched by an Office document. An IT maintenance window is also active.',
    facts: [
      'The user opened an external invoice attachment. WINWORD launched PowerShell; the process then contacted a newly observed domain.',
      'The maintenance ticket authorizes a signed management agent on engineering machines only. This finance device and document are out of scope.',
      'Defender reports credential-access behavior and a new persistence entry. The device was online when the alert fired.',
    ],
    actions: ['Isolate endpoint', 'Escalate to incident response', 'Preserve endpoint evidence'],
    distractors: ['Dismiss as maintenance', 'Delete all device logs', 'Notify user only'],
    classification: 'Confirmed Incident',
    principle: 'Containment before recovery',
    explanation:
      'Parent process, network behavior, persistence, and scope mismatch corroborate an intrusion. A coincident maintenance window does not authorize this behavior.',
    takeaway:
      'Validate the actual executable, parent process, device scope, and approval rather than trusting a maintenance label.',
    wrong:
      'Notification alone leaves an active endpoint threat connected; deleting logs destroys evidence.',
    hint: 'Compare the approved maintenance scope to the actual parent process and device.',
  },
  {
    id: 'soc-04',
    title: 'A quarantine that already worked',
    category: 'SOC',
    difficulty: 'Beginner',
    severity: 'Low',
    description:
      'An antivirus alert flags a downloaded file. Determine whether additional containment is needed.',
    facts: [
      'The download was blocked and quarantined before execution. No process was created from the file.',
      'The email message was removed from the inbox. The hash is blocked by the endpoint policy.',
      'The endpoint has no persistence, unusual network connection, or related alert. The user confirms the file never opened.',
    ],
    actions: ['Confirm quarantine', 'Continue monitoring', 'Notify user'],
    distractors: ['Reimage immediately', 'Disable account', 'Escalate to incident response'],
    classification: 'Benign',
    principle: 'Proportional response',
    explanation:
      'This lab uses Benign for a resolved prevention event with no evidence of execution or compromise. The detection itself was accurate; it is not a false positive.',
    takeaway:
      'An accurate malware detection can be fully prevented. Verify execution and remediation status before expanding containment.',
    wrong:
      'Reimaging and identity suspension are unnecessary without execution or identity compromise.',
    hint: 'Check whether the file executed and whether quarantine completed.',
  },
  {
    id: 'soc-05',
    title: 'MFA prompts the user did not request',
    category: 'SOC',
    difficulty: 'Intermediate',
    severity: 'High',
    description:
      'A user reports 19 MFA notifications overnight and says they approved one to stop the prompts.',
    facts: [
      'A correct password was followed by repeated MFA challenges from an unfamiliar network. The final challenge succeeded.',
      'A new mailbox forwarding rule was created after the successful session. The user denies creating it.',
      'The managed laptop is clean, but the new session has no matching device ID. The user is reachable through the verified service desk number.',
    ],
    actions: [
      'Revoke sessions',
      'Reset password',
      'Remove malicious inbox rule',
      'Escalate to Tier 2',
    ],
    distractors: [
      'Require user to approve one more prompt',
      'Dismiss alert',
      'Block corporate VPN',
    ],
    classification: 'Confirmed Incident',
    principle: 'Zero Trust',
    explanation:
      'The user report, approved unexpected challenge, unfamiliar session, and unauthorized rule demonstrate an account takeover following MFA fatigue.',
    takeaway:
      'Recover through a verified channel and review persistence after revoking sessions; enable phishing-resistant MFA where appropriate.',
    wrong:
      'Approving another unrequested prompt aids the attacker. A password change alone would leave persistence unaddressed.',
    hint: 'Look for activity after the successful MFA challenge.',
  },
  {
    id: 'soc-06',
    title: 'A new Global Administrator',
    category: 'SOC',
    difficulty: 'Expert',
    severity: 'Critical',
    description:
      'A new administrator account appeared during a production outage. An emergency-change record exists but names a different identity.',
    facts: [
      'The role assignment came from an unfamiliar IP using an existing administrator session. The new identity has no HR or contractor record.',
      'The emergency change allows temporary Reader access to rg-recovery only; it does not authorize Global Administrator or a new identity.',
      'Audit logs show the new administrator modifying authentication methods for two privileged users. No approver recognizes the action.',
    ],
    actions: [
      'Disable unauthorized account',
      'Revoke compromised administrator sessions',
      'Escalate to incident response',
      'Review role assignments',
    ],
    distractors: [
      'Close as emergency change',
      'Grant additional Owner access',
      'Notify new administrator only',
    ],
    classification: 'Confirmed Incident',
    principle: 'Separation of duties',
    explanation:
      'The change scope does not cover the privileged identity or authentication changes. This is unauthorized administrative activity with persistence potential.',
    takeaway:
      'An emergency ticket is evidence only for its specific approved scope, actors, and time window.',
    wrong: 'Closing based on the unrelated change or adding privileges amplifies the compromise.',
    hint: 'Read the approver, identity, role, and scope on the change record.',
  },
  {
    id: 'soc-07',
    title: 'Bulk download before departure',
    category: 'SOC',
    difficulty: 'Expert',
    severity: 'High',
    department: 'Sales',
    description:
      'A sales employee downloaded 4,000 documents shortly before a scheduled departure. The account uses a compliant device.',
    facts: [
      'Downloads used the employee’s usual IP, valid MFA, and managed device. Authentication is normal.',
      'HR confirms departure tomorrow. A manager approved a handover of 80 sales documents, not the HR and legal folders included in the export.',
      'Endpoint DLP recorded copying the export to an unapproved removable drive. The investigation requires restricted handling and HR coordination.',
    ],
    actions: [
      'Preserve audit and DLP evidence',
      'Escalate to incident response',
      'Coordinate with HR and data owner',
    ],
    distractors: [
      'Dismiss because MFA passed',
      'Publicly accuse employee',
      'Delete downloaded evidence',
    ],
    classification: 'Escalate',
    principle: 'Evidence-based triage',
    explanation:
      'The evidence warrants a sensitive insider-risk investigation. Normal authentication does not establish authorized use, and final attribution needs authorized review.',
    takeaway:
      'Protect evidence and confidentiality when investigating possible misuse by a legitimate identity.',
    wrong:
      'MFA confirms an authentication factor, not business authorization. Public accusation and evidence deletion are inappropriate.',
    hint: 'Compare the approved handover scope with the actual data and DLP event.',
  },
  {
    id: 'soc-08',
    title: 'Legacy mail client sign-in',
    category: 'SOC',
    difficulty: 'Intermediate',
    severity: 'Medium',
    description:
      'A successful legacy authentication event appears for a shared operations account after policy rollout.',
    facts: [
      'A legacy mail protocol authenticated successfully from an approved office IP. The client cannot satisfy modern MFA requirements.',
      'The account is excluded from the block-legacy-auth policy through a forgotten migration group. The migration exception expired last week.',
      'There are no unexpected rules or unfamiliar sessions. A business owner confirms an old reporting workflow is still in use.',
    ],
    actions: [
      'Review Conditional Access exclusions',
      'Coordinate migration to modern authentication',
      'Remove expired exception after validation',
    ],
    distractors: [
      'Dismiss indefinitely',
      'Disable every shared account',
      'Declare ransomware incident',
    ],
    classification: 'Suspicious',
    principle: 'Zero Trust',
    explanation:
      'There is a known control gap and a legitimate dependency, without confirmed compromise. Address the expired exception through a controlled migration.',
    takeaway:
      'Track policy exceptions with owners and expiry; approved locations do not compensate for weak authentication.',
    wrong:
      'Ignoring the gap keeps the attack surface open; broad immediate suspension is unsupported by this case.',
    hint: 'Check effective policy scope and the migration exception expiry.',
  },
  {
    id: 'iam-01',
    title: 'Engineering onboarding',
    category: 'IAM',
    difficulty: 'Beginner',
    severity: 'Low',
    description:
      'A new engineer requests code repositories and read access to staging resources. A colleague suggests subscription Owner for convenience.',
    facts: [
      'HR and the hiring manager verify the start date and Engineering department. Production administration is not part of the job.',
      'The Engineering-Developers group grants repository contribution. Staging-Readers grants Reader at rg-engineering-stage only.',
      'No privileged activation is required for these duties. MFA enrollment must complete before application access is enabled.',
    ],
    actions: [
      'Assign approved engineering groups',
      'Require MFA enrollment',
      'Validate staging access',
    ],
    distractors: [
      'Assign subscription Owner',
      'Clone all manager permissions',
      'Skip manager approval',
    ],
    classification: 'Benign',
    principle: 'Least privilege',
    explanation:
      'Approved group membership and staging-scoped read access satisfy the documented work without production or access-management privileges.',
    takeaway: 'Provision against a role baseline and test both expected access and boundaries.',
    wrong: 'Owner and cloned manager rights are broader than the employee’s needs.',
    hint: 'Match requested tasks to the existing role baseline.',
  },
  {
    id: 'iam-02',
    title: 'Contractor access with an end date',
    category: 'IAM',
    difficulty: 'Intermediate',
    severity: 'Medium',
    description:
      'A contractor needs a single project app for fourteen days. A sponsor asks to add them to the all-staff group.',
    facts: [
      'The sponsor and contract record approve Project Atlas only, ending in fourteen days.',
      'The all-staff group grants multiple apps and internal file libraries. A scoped access package for Atlas supports expiration and review.',
      'The contractor has a verified guest identity. The app requires MFA and external-user Conditional Access.',
    ],
    actions: [
      'Grant time-bound project access',
      'Apply guest MFA policy',
      'Schedule sponsor access review',
    ],
    distractors: [
      'Add to all-staff group',
      'Create permanent member account',
      'Share sponsor credentials',
    ],
    classification: 'Benign',
    principle: 'Identity lifecycle',
    explanation:
      'Time-bound, sponsored access handles the external identity lifecycle while avoiding unrelated internal entitlements.',
    takeaway: 'Every temporary entitlement needs an owner, a scope, and an expiry.',
    wrong:
      'Broad group membership and permanent accounts outlast or exceed the contract; credential sharing destroys accountability.',
    hint: 'Look for scope, sponsor, and automatic expiration.',
  },
  {
    id: 'iam-03',
    title: 'Department transfer leaves old access',
    category: 'IAM',
    difficulty: 'Advanced',
    severity: 'Medium',
    description:
      'A Finance employee transfers to Engineering. Their old Finance access remains and includes payment approval.',
    facts: [
      'HR confirms the transfer is effective today. The new role requests engineering repositories only.',
      'The identity still belongs to Finance-Payments-Approvers and Finance-Reporting. No finance handover exception exists.',
      'The engineering role includes expense request submission; retaining payment approval creates a separation-of-duties concern.',
    ],
    actions: [
      'Remove obsolete finance memberships',
      'Assign approved engineering groups',
      'Validate separation of duties',
    ],
    distractors: [
      'Keep all old access',
      'Assign Global Administrator',
      'Disable account permanently',
    ],
    classification: 'Suspicious',
    principle: 'Separation of duties',
    explanation:
      'The mover workflow must remove stale rights as well as add new ones, especially where payment submission and approval conflict.',
    takeaway:
      'A department change is an access recertification event, not just an additive update.',
    wrong:
      'Retaining all entitlements accumulates privilege; tenant administration is unrelated to the job.',
    hint: 'Compare old and new role permissions for conflicting responsibilities.',
  },
  {
    id: 'iam-04',
    title: 'Offboarding an active employee account',
    category: 'IAM',
    difficulty: 'Beginner',
    severity: 'High',
    description:
      'HR confirms an employee’s departure is effective now. The manager requests mailbox retention and project ownership transfer.',
    facts: [
      'The departure request is verified and effective immediately. The account still has active cloud sessions.',
      'Mailbox and project data are subject to a documented retention policy. Deletion is not authorized in this ticket.',
      'The user has group memberships and SaaS app assignments. An owner is available to receive project ownership.',
    ],
    actions: [
      'Disable account',
      'Revoke sessions',
      'Remove access assignments',
      'Transfer ownership and preserve data',
    ],
    distractors: [
      'Delete mailbox immediately',
      'Wait thirty days to disable',
      'Share password with manager',
    ],
    classification: 'Benign',
    principle: 'Identity lifecycle',
    ordered: true,
    explanation:
      'Disable new authentication, revoke sessions, remove entitlements, and preserve required business data through the offboarding workflow.',
    takeaway:
      'Offboarding separates access removal from retention and ownership requirements. Verify app-specific session termination too.',
    wrong:
      'Immediate deletion violates the supplied retention requirement; delay and credential sharing leave unauthorized access.',
    hint: 'Stop access first, then handle entitlements and retained data.',
  },
  {
    id: 'iam-05',
    title: 'Help desk asks for Global Administrator',
    category: 'IAM',
    difficulty: 'Intermediate',
    severity: 'Medium',
    description:
      'A help desk technician needs to reset passwords for ordinary employees and requests permanent Global Administrator.',
    facts: [
      'The approved job task is password reset for non-privileged users. Privileged users are handled by the escalation team.',
      'Password Administrator covers the stated reset duties. Global Administrator also controls tenant-wide configuration and privileged role assignment.',
      'PIM is available and the operating policy requires eligible, time-bound privileged roles with an approval trail.',
    ],
    actions: [
      'Decline Global Administrator request',
      'Assign eligible Password Administrator',
      'Require approved PIM activation',
    ],
    distractors: [
      'Grant permanent Global Administrator',
      'Share an admin account',
      'Assign Azure subscription Owner',
    ],
    classification: 'Benign',
    principle: 'Just-in-Time access',
    explanation:
      'A narrowly scoped directory role with controlled activation meets the documented task and avoids permanent tenant-wide privilege.',
    takeaway: 'Choose directory roles by task and limit when privilege is active.',
    wrong:
      'Azure Owner does not solve ordinary Entra password-reset needs; Global Administrator and shared admin accounts exceed the request.',
    hint: 'Distinguish the directory task from Azure resource permissions.',
  },
  {
    id: 'iam-06',
    title: 'Dormant service account still owns production',
    category: 'IAM',
    difficulty: 'Expert',
    severity: 'High',
    description:
      'An access review finds an automation identity with subscription Owner. The original app owner has left.',
    facts: [
      'The identity has not signed in for 92 days. A replacement workload uses a managed identity in rg-reports-prod.',
      'The old identity has Owner at subscription scope and an unexpired client secret. No owner can validate a current dependency.',
      'The change board approves a staged disable with rollback, dependency monitoring, then credential and role removal if no breakage occurs.',
    ],
    actions: [
      'Validate dependencies with workload owner',
      'Disable identity under approved change',
      'Remove obsolete credentials and roles',
    ],
    distractors: [
      'Rotate secret and keep Owner forever',
      'Delete without dependency review',
      'Mark access review approved',
    ],
    classification: 'Suspicious',
    principle: 'Access reviews',
    ordered: true,
    explanation:
      'Unowned, dormant broad privilege is a governance risk. The approved staged change removes exposure while managing unknown service dependencies.',
    takeaway:
      'Access reviews need an accountable owner and evidence, not automatic renewal of existing permissions.',
    wrong:
      'Rotation preserves excessive permissions; unreviewed deletion risks breaking production.',
    hint: 'Use the approved staged change and validate the replacement workload.',
  },
  {
    id: 'id-01',
    title: 'Account takeover with MFA persistence',
    category: 'Identity',
    difficulty: 'Intermediate',
    severity: 'Critical',
    ordered: true,
    description:
      'A confirmed attacker session registered a new authenticator and forwarded sensitive mail. The user is verified by the service desk.',
    facts: [
      'An unfamiliar successful sign-in is followed by mailbox access. The user denies the sign-in.',
      'An unauthorized MFA method and external forwarding rule were created in that session. Audit records have been preserved.',
      'No endpoint compromise is evident. Incident policy calls for blocking new sign-ins, session revocation, credential recovery, persistence removal, then response escalation.',
    ],
    actions: [
      'Disable account',
      'Revoke sessions',
      'Reset password',
      'Remove suspicious MFA methods',
      'Remove malicious inbox rule',
      'Escalate incident',
    ],
    distractors: [
      'Restore account before review',
      'Delete audit logs',
      'Notify attacker-controlled mailbox',
    ],
    classification: 'Confirmed Incident',
    principle: 'Containment before recovery',
    explanation:
      'The supplied playbook blocks access, invalidates sessions, recovers credentials, removes identity and mailbox persistence, and escalates for scope review.',
    takeaway:
      'Containment sequences depend on the playbook. Existing access tokens and app-local sessions may persist; verify resource-side termination.',
    wrong:
      'Restoring early or communicating through the compromised mailbox gives the attacker another opportunity.',
    hint: 'Follow the documented order: access, sessions, credentials, persistence, escalation.',
  },
  {
    id: 'id-02',
    title: 'OAuth consent masquerading as a PDF reader',
    category: 'Identity',
    difficulty: 'Advanced',
    severity: 'High',
    application: 'Contoso PDF Helper (unverified)',
    ordered: true,
    description:
      'A user approved a third-party app that now reads mail. The user’s password was not exposed.',
    facts: [
      'A consent event granted Mail.Read and offline_access to an unverified application following a phishing link.',
      'Application activity shows mailbox reads using delegated access. The app is not in the approved catalog.',
      'The user’s endpoint is clean. The identity team has preserved consent and activity records and can block the enterprise application.',
    ],
    actions: [
      'Disable unauthorized application',
      'Remove unauthorized application consent',
      'Revoke sessions',
      'Review mailbox activity',
      'Escalate incident',
    ],
    distractors: [
      'Reset password only',
      'Approve tenant-wide consent',
      'Dismiss because MFA succeeded',
    ],
    classification: 'Confirmed Incident',
    principle: 'Least privilege',
    explanation:
      'The malicious authorization grant must be removed and the app blocked. Password-only remediation does not address delegated consent.',
    takeaway:
      'Consent phishing targets authorization and token access, even when normal authentication succeeds.',
    wrong:
      'A password reset alone leaves the application grant; tenant-wide consent broadens exposure.',
    hint: 'Identify the permission grant and the application identity, not only the user’s password.',
  },
  {
    id: 'id-03',
    title: 'Stolen session after successful MFA',
    category: 'Identity',
    difficulty: 'Expert',
    severity: 'Critical',
    ordered: true,
    description:
      'A privileged user completed MFA, then a matching session appeared on an unmanaged host without a new MFA event.',
    facts: [
      'A session identifier is reused from an unfamiliar network to perform privileged operations. The legitimate user denies them.',
      'Audit logs show an unauthorized role assignment. The administrator’s browser visited a suspicious sign-in relay shortly before the activity.',
      'A clean recovery device is available. The response playbook requires account block, session revocation, endpoint isolation, privilege review, and escalation.',
    ],
    actions: [
      'Disable account',
      'Revoke sessions',
      'Isolate endpoint',
      'Review and remove unauthorized roles',
      'Escalate incident',
    ],
    distractors: [
      'Trust the existing MFA claim',
      'Reset password only',
      'Activate additional PIM role',
    ],
    classification: 'Confirmed Incident',
    principle: 'Zero Trust',
    explanation:
      'Correlated session reuse and denied privileged changes support session theft. Previous MFA does not make a stolen session trustworthy.',
    takeaway:
      'Verify token and application-session invalidation, inspect the endpoint, and recover from a known-clean device.',
    wrong:
      'Trusting the old MFA claim or only resetting a password leaves session and privilege persistence unaddressed.',
    hint: 'Compare the session ID, device, and privileged audit events.',
  },
  {
    id: 'id-04',
    title: 'A service principal key used from a new network',
    category: 'Identity',
    difficulty: 'Advanced',
    severity: 'High',
    ordered: true,
    application: 'Northstar report-worker',
    description:
      'A leaked automation key was found in a public sample repository. Cloud logs show it has been used.',
    facts: [
      'Workload sign-ins use the exposed credential key ID from an unfamiliar source. The workload owner denies those executions.',
      'The principal has excessive subscription Contributor rights; activity logs show an unauthorized storage configuration change.',
      'The app supports credential rotation with a verified deployment owner. Evidence is preserved and a replacement managed identity is available.',
    ],
    actions: [
      'Disable compromised credential',
      'Contain unauthorized resource changes',
      'Deploy replacement managed identity',
      'Scope workload permissions',
      'Escalate incident',
    ],
    distractors: [
      'Reset an unrelated user password',
      'Require user MFA for the principal',
      'Keep exposed key during migration',
    ],
    classification: 'Confirmed Incident',
    principle: 'Least privilege',
    explanation:
      'Contain the compromised workload credential and resource effects, then restore through the approved replacement with narrowly scoped permissions.',
    takeaway:
      'Workload identities need credential and permission governance; interactive user MFA is not a remedy for a leaked application key.',
    wrong:
      'User password resets do not rotate workload credentials; leaving the known-exposed key active preserves attacker access.',
    hint: 'Track the key ID from exposure to workload sign-in and resource activity.',
  },
  {
    id: 'az-01',
    title: 'Why can Michael read the finance VM?',
    category: 'Azure',
    difficulty: 'Beginner',
    severity: 'Low',
    user: 'Michael Chen',
    department: 'Finance',
    application: 'Azure Resource Manager',
    description:
      'Michael can view vm-finance-01 despite having no role assigned directly on the VM. Explain the effective access path.',
    facts: [
      'Michael is a member of Finance Group. His Entra directory role is ordinary User; no privileged directory role is active.',
      'Finance Group has Azure Reader assigned at rg-finance-prod. The VM belongs to that resource group.',
      'Azure Reader permits control-plane inspection inherited from the resource group. It does not grant VM sign-in or general storage data access.',
    ],
    actions: [
      'Identify inherited group Reader assignment',
      'Verify resource group scope',
      'Retain approved read-only access',
    ],
    distractors: [
      'Assign Global Administrator',
      'Assume Reader grants VM login',
      'Remove all finance group memberships',
    ],
    classification: 'Benign',
    principle: 'Role-Based Access Control',
    explanation:
      'Group-based Azure Reader at resource-group scope flows to contained resources. A directory role is separate from this Azure role assignment.',
    takeaway:
      'Explain access using principal, role, and scope; control-plane access is distinct from data-plane and operating-system access.',
    wrong: 'Global Administrator is unnecessary; Reader does not grant VM login.',
    hint: 'Follow group membership to the Azure role assignment and its resource-group scope.',
  },
  {
    id: 'az-02',
    title: 'Reader cannot download a blob',
    category: 'Azure',
    difficulty: 'Intermediate',
    severity: 'Medium',
    application: 'Azure Storage',
    description:
      'An analyst has Reader on the storage account but receives authorization failure when reading a project blob container.',
    facts: [
      'The user authenticates successfully with Entra ID. Reader is assigned at storage-account scope.',
      'The app uses Entra authorization for blob data. No Storage Blob Data Reader role is assigned to the user or their groups.',
      'The data owner approved read-only access to the project-a container, not all containers or resource administration.',
    ],
    actions: [
      'Assign Storage Blob Data Reader at container scope',
      'Validate blob read access',
      'Retain control-plane boundary',
    ],
    distractors: ['Assign subscription Owner', 'Share storage account key', 'Disable MFA'],
    classification: 'Benign',
    principle: 'Least privilege',
    explanation:
      'Reader exposes resource configuration, while blob content requires an appropriate data-plane role. Container-scoped Blob Data Reader matches the approval.',
    takeaway: 'Check the authorization plane and select a role at the smallest practical scope.',
    wrong:
      'Owner and shared account keys grant unnecessary control or broad data access; MFA is unrelated to the missing role.',
    hint: 'Distinguish resource management permissions from blob data permissions.',
  },
  {
    id: 'az-03',
    title: 'Conditional Access blocks an unmanaged laptop',
    category: 'Azure',
    difficulty: 'Advanced',
    severity: 'Medium',
    application: 'Finance enterprise app',
    description:
      'A finance employee authenticates with MFA but cannot open the finance app on a personal laptop.',
    facts: [
      'Sign-in details show authentication success, followed by Conditional Access failure: device must be marked compliant.',
      'The policy applies to Finance Group and the finance enterprise application. The personal laptop is neither enrolled nor compliant.',
      'The employee has a working compliant corporate laptop. No approved personal-device exception exists.',
    ],
    actions: [
      'Review failed Conditional Access grant control',
      'Direct user to compliant device',
      'Validate policy with sign-in logs',
    ],
    distractors: [
      'Exclude entire Finance Group',
      'Grant Global Administrator',
      'Disable compliance requirement globally',
    ],
    classification: 'Benign',
    principle: 'Conditional Access',
    explanation:
      'Authentication success does not satisfy the device-compliance grant control. Using an approved compliant device resolves access without weakening the policy.',
    takeaway:
      'Read effective policy results; successful MFA alone does not mean every access condition is satisfied.',
    wrong:
      'Broad exclusions weaken controls for unrelated users; directory privilege does not solve device compliance.',
    hint: 'Inspect the failed grant control instead of repeating password resets.',
  },
  {
    id: 'az-04',
    title: 'Eligible PIM role is not active',
    category: 'Azure',
    difficulty: 'Intermediate',
    severity: 'Low',
    application: 'Azure Resource Manager',
    description:
      'An administrator is eligible for Virtual Machine Contributor in staging but cannot start a VM.',
    facts: [
      'The identity has an eligible Azure role assignment at rg-engineering-stage. There is no active assignment.',
      'PIM requires justification, MFA, approval, and a one-hour activation. A valid maintenance ticket exists.',
      'The target VM is inside the approved staging resource group. Production access is not needed.',
    ],
    actions: [
      'Activate eligible role through PIM',
      'Complete approval and MFA requirements',
      'Verify active scope and expiry',
    ],
    distractors: [
      'Convert to permanent subscription Owner',
      'Activate Global Administrator',
      'Bypass approver',
    ],
    classification: 'Benign',
    principle: 'Just-in-Time access',
    explanation:
      'Eligibility is permission to request activation, not an active authorization grant. Activate the approved role at the existing scope.',
    takeaway:
      'Check whether privilege is eligible, active, or expired before adding another assignment.',
    wrong:
      'Permanent Owner and unrelated directory roles exceed the approved task; bypassing approval breaks the control.',
    hint: 'Compare eligible versus active assignments and the activation policy.',
  },
  {
    id: 'az-05',
    title: 'Nested membership exposes production',
    category: 'Azure',
    difficulty: 'Expert',
    severity: 'High',
    application: 'Azure Resource Manager',
    description:
      'An engineer has unexpected read access to production through nested security-group membership.',
    facts: [
      'The user belongs to Engineering-Developers, which is a member of All-Technical-Readers. These are security groups, not enterprise app assignments.',
      'All-Technical-Readers has Azure Reader at subscription scope, including finance production. The approved engineering baseline covers staging only.',
      'No direct role or active PIM assignment exists for this user. The data owner confirms the broad parent-group assignment is unintended.',
    ],
    actions: [
      'Identify nested group access path',
      'Replace broad assignment with scoped groups',
      'Review all affected memberships',
    ],
    distractors: [
      'Remove unrelated Entra User role',
      'Ignore inherited permissions',
      'Add explicit Owner to fix access',
    ],
    classification: 'Suspicious',
    principle: 'Access reviews',
    explanation:
      'The unintended Azure grant comes through a parent security group at broad scope. Repair the entitlement design and review every affected member.',
    takeaway:
      'Evaluate transitive membership for Azure RBAC. Nested group support differs by service; enterprise application group assignment has different rules.',
    wrong:
      'The ordinary directory User role is not the Azure access source, and inherited grants cannot be ignored.',
    hint: 'Trace transitive group membership to the subscription-level role.',
  },
  {
    id: 'lab-01',
    title: 'The invoice that became a mailbox incident',
    category: 'Investigation',
    difficulty: 'Advanced',
    severity: 'High',
    department: 'Finance',
    description:
      'Correlate email, identity, and application evidence to determine why customer mail is being redirected.',
    facts: [
      'Email metadata shows a look-alike supplier domain and a link to an unapproved sign-in page. A new successful session followed within four minutes.',
      'A rule named Invoice archive forwards messages to an external address. The creator’s session matches the unfamiliar sign-in.',
      'The user denies authoring the rule; their endpoint is clean. Application activity records mail reads from the unfamiliar session after rule creation.',
    ],
    actions: [
      'Revoke sessions',
      'Reset password',
      'Remove malicious inbox rule',
      'Review mailbox activity',
      'Escalate to incident response',
    ],
    distractors: ['Dismiss as user preference', 'Delete mailbox', 'Block all supplier mail'],
    classification: 'Confirmed Incident',
    principle: 'Evidence-based triage',
    explanation:
      'The email lure, session, rule creation, and user denial form a corroborated account-compromise timeline. Contain identity access and remove mailbox persistence.',
    takeaway:
      'Build a timeline across sources and identify which session performed each persistence action.',
    wrong:
      'A rule name is not proof of authorization. Deleting the mailbox destroys business data and evidence.',
    hint: 'Correlate the unfamiliar session across sign-in and mailbox audit records.',
  },
  {
    id: 'lab-02',
    title: 'Conflicting evidence during a deployment',
    category: 'Investigation',
    difficulty: 'Expert',
    severity: 'High',
    application: 'Azure deployment automation',
    description:
      'An application identity changed a production resource. A successful change ticket exists, but the scope and credential do not match.',
    facts: [
      'The expected managed identity deployed to staging. A separate legacy service principal signed in from an unfamiliar IP during the same window.',
      'The approved change covers rg-engineering-stage. The legacy principal instead altered production network rules and created an additional credential.',
      'Deployment pipeline records show no production job. The application owner denies the new credential and confirms the old principal should be inactive.',
    ],
    actions: [
      'Disable compromised credential',
      'Preserve audit and deployment evidence',
      'Review and remove unauthorized changes',
      'Escalate to incident response',
    ],
    distractors: [
      'Close as approved deployment',
      'Delete pipeline logs',
      'Grant permanent Owner to pipeline',
    ],
    classification: 'Confirmed Incident',
    principle: 'Separation of duties',
    explanation:
      'Different principal, credential, scope, and owner denial show unauthorized activity coinciding with a legitimate deployment.',
    takeaway:
      'Correlate approvals to the exact identity and resource scope; timing alone does not establish legitimacy.',
    wrong:
      'The staging approval does not authorize production changes, and additional privileges increase exposure.',
    hint: 'Compare the principal ID and target scope to the approved pipeline job.',
  },
];

const tickets: Ticket[] = [
  {
    id: 'T-101',
    title: 'Endpoint reports active ransomware',
    severity: 'Critical',
    impact: 'Shared operations workstation',
    urgency: 'Active encryption',
    affected: 42,
    detail:
      'Files are being encrypted and a shared drive is reachable. Immediate isolation can prevent additional damage.',
  },
  {
    id: 'T-102',
    title: 'Administrator impossible travel',
    severity: 'High',
    impact: 'Privileged tenant access',
    urgency: 'Unverified successful session',
    affected: 180,
    detail:
      'A privileged account has a new successful foreign session and an unapproved MFA method. Rapid identity containment is needed.',
  },
  {
    id: 'T-103',
    title: 'User reports suspicious MFA prompts',
    severity: 'High',
    impact: 'One standard account',
    urgency: 'Prompts continue; no success',
    affected: 1,
    detail: 'The user denied every prompt. Check credential exposure and follow-on sign-ins.',
  },
  {
    id: 'T-104',
    title: 'CEO cannot access email',
    severity: 'Medium',
    impact: 'One executive, meeting today',
    urgency: 'Business interruption',
    affected: 1,
    detail:
      'A compliant replacement laptop is available. No security signal accompanies the access issue.',
  },
  {
    id: 'T-105',
    title: 'Printer offline',
    severity: 'Low',
    impact: 'One floor; alternative available',
    urgency: 'Routine support',
    affected: 12,
    detail: 'Another printer is available. No security event or critical dependency exists.',
  },
  {
    id: 'T-106',
    title: 'Software installation request',
    severity: 'Low',
    impact: 'One employee',
    urgency: 'Needed next week',
    affected: 1,
    detail: 'A routine approved software request with no immediate deadline.',
  },
];
seeds.push({
  id: 'ticket-01',
  title: 'Six tickets, one response team',
  category: 'Tickets',
  difficulty: 'Beginner',
  severity: 'Critical',
  description:
    'Order the queue from highest to lowest priority. Use the stated active threat, compromise evidence, business impact, and workarounds.',
  facts: [
    'Ransomware is actively encrypting files and can reach a shared drive. The privileged sign-in has corroborated unauthorized MFA registration.',
    'The standard user denied all MFA prompts. The CEO has a working alternate device; the printer has an alternative.',
    'Software is needed next week. The response team has capacity for one initial action at a time; containment opportunities drive priority.',
  ],
  actions: ['Prioritize active containment'],
  distractors: [],
  classification: 'Escalate',
  principle: 'Proportional response',
  tickets,
  ticketOrder: ['T-101', 'T-102', 'T-103', 'T-104', 'T-105', 'T-106'],
  explanation:
    'Active encryption is first, followed by corroborated privileged compromise, attempted standard-account compromise, then business support with workarounds and routine requests.',
  takeaway:
    'Priority combines urgency, impact, and actionable threat. Job title alone does not outrank active compromise.',
  wrong:
    'Promoting an executive or routine request above active containment increases avoidable harm.',
  hint: 'Start with ongoing damage and privileged compromise; use the documented workarounds to sort routine issues.',
});
seeds.push({
  id: 'ticket-02',
  title: 'Security severity versus business urgency',
  category: 'Tickets',
  difficulty: 'Advanced',
  severity: 'High',
  description:
    'A payroll cutoff and a suspected compromise overlap. Apply the supplied runbook to determine the response order.',
  facts: [
    'Confirmed privileged mailbox compromise requires immediate session revocation under the identity runbook.',
    'Payroll is due in 30 minutes and 300 staff are affected. The service outage has no security signal and a documented recovery action.',
    'The phishing message was quarantined without execution. Provisioning is for tomorrow; the SharePoint request has a workaround.',
  ],
  actions: ['Prioritize active containment'],
  distractors: [],
  classification: 'Escalate',
  principle: 'Proportional response',
  tickets: [
    {
      id: 'T-201',
      title: 'Privileged mailbox takeover',
      severity: 'High',
      impact: 'Administrator and sensitive mail',
      urgency: 'Active attacker session',
      affected: 180,
      detail:
        'Unauthorized forwarding and a live attacker session are confirmed; the runbook requires immediate revocation.',
    },
    {
      id: 'T-202',
      title: 'Payroll service unavailable',
      severity: 'Medium',
      impact: 'Payroll for entire company',
      urgency: 'Cutoff in 30 minutes',
      affected: 300,
      detail:
        'A documented restore is available. No compromise indicator, but the business deadline is imminent.',
    },
    {
      id: 'T-203',
      title: 'Quarantined phishing attachment',
      severity: 'Medium',
      impact: 'One protected endpoint',
      urgency: 'Already prevented',
      affected: 1,
      detail: 'Quarantine completed before execution. Verify prevention and monitor.',
    },
    {
      id: 'T-204',
      title: 'New employee provisioning',
      severity: 'Low',
      impact: 'One new employee',
      urgency: 'Starts tomorrow',
      affected: 1,
      detail: 'The approved access baseline is ready and can be provisioned later today.',
    },
    {
      id: 'T-205',
      title: 'SharePoint access request',
      severity: 'Low',
      impact: 'One user, workaround exists',
      urgency: 'Needed this week',
      affected: 1,
      detail: 'The file owner can supply the document through an approved channel today.',
    },
  ],
  ticketOrder: ['T-201', 'T-202', 'T-203', 'T-204', 'T-205'],
  explanation:
    'First perform the immediate containment required by the runbook, then address the imminent payroll deadline, verify the prevented phishing event, and handle scheduled access work.',
  takeaway:
    'A medium-severity availability issue can outrank a prevented security event when impact and deadline are greater.',
  wrong:
    'Severity alone ignores prevention status, workarounds, and time-critical business impact.',
  hint: 'Use the explicit containment runbook first, then compare deadline and prevention status.',
});

export const scenarios: Scenario[] = seeds.map(build);
export const categories: Category[] = [
  'SOC',
  'IAM',
  'Identity',
  'Azure',
  'Tickets',
  'Investigation',
];
export const categoryLabels: Record<Category, string> = {
  SOC: 'Alert Triage',
  IAM: 'IAM Administration',
  Identity: 'Identity Incidents',
  Azure: 'Azure / Entra',
  Tickets: 'Ticket Queue',
  Investigation: 'Investigation Lab',
};
export const classifications: Classification[] = [
  'Benign',
  'False Positive',
  'Suspicious',
  'Confirmed Incident',
  'Escalate',
];
export const principles = [
  'Evidence-based triage',
  'Proportional response',
  'Containment before recovery',
  'Zero Trust',
  'Separation of duties',
  'Least privilege',
  'Identity lifecycle',
  'Just-in-Time access',
  'Access reviews',
  'Role-Based Access Control',
  'Conditional Access',
];
