import type { AccessIdentity } from '../types';
export const accessIdentities: AccessIdentity[] = [
  {
    name: 'Michael Chen',
    role: 'Financial analyst',
    department: 'Finance',
    paths: [
      {
        label: 'Finance reporting',
        type: 'Group · inherited',
        nodes: [
          'Michael Chen',
          'Finance Group',
          'Entra directory role: User (no Azure grant)',
          'Azure Reader · rg-finance-prod',
          'rg-finance-prod',
          'vm-finance-01',
        ],
        explanation:
          'Finance Group has Reader on the resource group. Michael inherits control-plane read access to the VM. His ordinary directory role does not create this grant. Reader does not permit VM login.',
      },
      {
        label: 'Project document access',
        type: 'Direct assignment',
        nodes: [
          'Michael Chen',
          'No group required',
          'Directory role not involved',
          'Storage Blob Data Reader · container',
          'st-finance-docs / project-a',
          'Project A blobs',
        ],
        explanation:
          'A direct data-plane assignment lets Michael read only the approved container. It is independent of the VM control-plane Reader assignment.',
      },
    ],
  },
  {
    name: 'Aisha Patel',
    role: 'Cloud engineer',
    department: 'Engineering',
    paths: [
      {
        label: 'Temporary staging operations',
        type: 'PIM activation',
        nodes: [
          'Aisha Patel',
          'Engineering-Operators',
          'Entra directory role: User',
          'VM Contributor · active through PIM',
          'rg-engineering-stage · 1 hour',
          'vm-stage-02',
        ],
        explanation:
          'Aisha activated an eligible Azure role after approval and MFA. The role is active at staging scope for one hour. Eligibility without activation would not grant the operation.',
      },
      {
        label: 'Unexpected production visibility',
        type: 'Nested group · inherited',
        nodes: [
          'Aisha Patel',
          'Engineering-Developers → All-Technical-Readers',
          'Directory role not involved',
          'Azure Reader · subscription',
          'rg-finance-prod',
          'vm-finance-01',
        ],
        explanation:
          'Transitive security-group membership reaches a subscription Reader assignment. The scope includes production, exceeding the engineering baseline. This example concerns Azure RBAC; enterprise-app group assignment does not follow the same nested-group rules.',
      },
    ],
  },
  {
    name: 'Elena Rivera',
    role: 'Identity administrator',
    department: 'IT Operations',
    paths: [
      {
        label: 'Directory administration',
        type: 'Privileged directory role',
        nodes: [
          'Elena Rivera',
          'Approved administrative identity',
          'User Administrator · active through PIM',
          'No Azure RBAC assignment',
          'Entra directory scope',
          'Users and groups (role-limited operations)',
        ],
        explanation:
          'The active Entra User Administrator role grants supported directory operations. It does not automatically grant Azure subscription or VM access. Azure RBAC must be evaluated independently.',
      },
    ],
  },
];
