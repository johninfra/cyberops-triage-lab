export const knowledge = [
  [
    'Identity and Access Management',
    'IAM connects verified identities with approved access, and maintains that access through joining, moving, and leaving an organization.',
    'Governance',
  ],
  [
    'Authentication',
    'Authentication establishes who is signing in. A successful authentication does not by itself authorize a resource operation.',
    'Identity',
  ],
  [
    'Authorization',
    'Authorization evaluates whether an authenticated principal can perform a specific action on a resource at a specific scope.',
    'Identity',
  ],
  [
    'MFA',
    'Multiple authentication factors reduce password-only risk. Phishing-resistant methods improve protection against relay attacks; unsolicited prompts should be denied and reported.',
    'Identity',
  ],
  [
    'Role-Based Access Control',
    'RBAC grants a principal a role at a scope. Trace user and group assignments, inheritance, and activation. Entra directory roles and Azure resource roles serve different purposes.',
    'Cloud',
  ],
  [
    'Least privilege',
    'Grant only the permissions, scope, and duration required for the approved task. Check data-plane permissions separately from resource management.',
    'Governance',
  ],
  [
    'Zero Trust',
    'Verify explicitly, use least privilege, and assume breach. A trusted network or completed MFA does not make every subsequent action safe.',
    'Governance',
  ],
  [
    'Conditional Access',
    'Policies combine identity, application, device, risk, and other signals with grant or session controls. Inspect effective policy results before changing exclusions.',
    'Cloud',
  ],
  [
    'Privileged Identity Management',
    'PIM manages eligible and active privileged assignments. Eligibility allows activation under policy; it does not automatically provide active access.',
    'Cloud',
  ],
  [
    'Just-in-Time access',
    'Activate privilege only for an approved period and task. Require appropriate approval and authentication, and verify the scope and expiration.',
    'Governance',
  ],
  [
    'Access reviews',
    'Owners periodically validate whether entitlements are still needed. Revoke stale, broad, unowned, or conflicting access using a controlled change.',
    'Governance',
  ],
  [
    'Identity lifecycle',
    'Joiners receive a role baseline, movers lose obsolete access, and leavers lose authentication and sessions while retained data and ownership are handled separately.',
    'Governance',
  ],
  [
    'Password spraying',
    'An attacker tries a small number of passwords across many accounts. Correlate broad failures and look for follow-on successes before asserting compromise.',
    'Threats',
  ],
  [
    'Credential stuffing',
    'An attacker reuses previously exposed username/password pairs. Review successful sessions and enforce strong authentication rather than relying only on IP blocks.',
    'Threats',
  ],
  [
    'Impossible travel',
    'Geographic sign-ins appear too close in time for physical travel. VPNs, proxies, and IP geolocation errors can explain the signal; correlate device and audit evidence.',
    'Threats',
  ],
  [
    'MFA fatigue',
    'Repeated prompts pressure a user into approving attacker authentication. Deny unexpected prompts, report them, and investigate any resulting successful session.',
    'Threats',
  ],
  [
    'OAuth consent phishing',
    'An attacker tricks a user into authorizing an application. Block the malicious app and remove its permission grants; a password reset alone may leave authorization intact.',
    'Threats',
  ],
  [
    'Session hijacking',
    'A stolen session or token can let an attacker act after legitimate MFA. Revoke sessions, inspect persistence, and verify resource-side invalidation and endpoint recovery.',
    'Threats',
  ],
  [
    'Phishing',
    'A deceptive message directs users to reveal data, approve access, or open unsafe content. Inspect sender context, destination, identity activity, and downstream changes.',
    'Threats',
  ],
  [
    'Malware',
    'Malicious software can execute, persist, or steal data. Distinguish prevented downloads from actual execution, preserve evidence, and contain affected endpoints.',
    'Threats',
  ],
  [
    'Ransomware',
    'Encryption and related intrusion activity can spread to shared resources. Prioritize containment, preserve evidence, and coordinate recovery through the incident process.',
    'Threats',
  ],
  [
    'SOC alert triage',
    'Validate the detection, collect corroborating evidence, classify the event, and choose a proportionate response. Record why the conclusion follows from the evidence.',
    'Operations',
  ],
  [
    'Incident response',
    'Coordinate investigation, containment, recovery, and improvement. Sequences depend on the playbook, attack type, and available evidence; verify that containment actually took effect.',
    'Operations',
  ],
  [
    'Risk vs severity',
    'Severity describes an event’s seriousness; risk combines likelihood and consequences. Ticket priority also includes business impact, urgency, scope, and workarounds.',
    'Operations',
  ],
  [
    'Evidence-based triage',
    'Correlate multiple independent sources. An approved change is relevant only when its actor, scope, action, and time match the event under review.',
    'Operations',
  ],
  [
    'Proportional response',
    'Choose a response that matches corroborated threat, business impact, and urgency. Avoid broad disruptions when a narrower control meets the need.',
    'Operations',
  ],
  [
    'Containment before recovery',
    'Stop ongoing unauthorized access or damage before restoring service. Preserve relevant evidence and verify sessions, app access, and persistence have been addressed.',
    'Operations',
  ],
  [
    'Separation of duties',
    'Divide conflicting responsibilities such as requesting and approving access. Use independent approvals for privilege and sensitive changes.',
    'Governance',
  ],
];
export const references = [
  {
    title: 'Microsoft: Revoke access in an emergency',
    url: 'https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access',
  },
  {
    title: 'Microsoft: Azure RBAC scope',
    url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview',
  },
  {
    title: 'Microsoft: Azure built-in roles',
    url: 'https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/general',
  },
  {
    title: 'Microsoft: PIM role settings',
    url: 'https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure',
  },
];
