import { IAMUser, ActiveSession, AuditLog } from '../types/iam';

// Generates simulation of Opaque Access Tokens
export const generateOpaqueToken = (username: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'fol_at_';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

const BASE_USERS: IAMUser[] = [
  {
    id: 'usr_01H2PX9WR8',
    name: 'Clara Oswald',
    username: 'coswald',
    email: 'clara.oswald@folksart.io',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: 'Administrator',
    status: 'Active',
    kycStatus: 'Verified',
    mfaEnabled: true,
    mfaMethods: ['Heuristic Authenticator', 'WebAuthn Security Key'],
    ssoProvider: 'Google',
    department: 'Governance & Identity',
    createdAt: '2025-01-15T08:30:00Z',
    lastActive: 'Just Now',
    riskScore: 8,
    opaqueToken: 'fol_at_3m9K2gH9u8PqX1vW9z7Y4t6C8b2N5m1K9j8H7g6F5d4S3a2'
  },
  {
    id: 'usr_02F8QX9WR9',
    name: 'Marcus Vance',
    username: 'mvance',
    email: 'marcus.vance@folksart.io',
    phone: '+1 (555) 987-6543',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Security Officer',
    status: 'Active',
    kycStatus: 'Verified',
    mfaEnabled: true,
    mfaMethods: ['Hardware YubiKey'],
    ssoProvider: null,
    department: 'SecOps & Compliance',
    createdAt: '2025-02-10T14:15:30Z',
    lastActive: '5 mins ago',
    riskScore: 12,
    opaqueToken: 'fol_at_8k2L4pM1n9b8v7c6x5z4q3w2e1r0t9y8u7i6o5p4a3s2d1'
  },
  {
    id: 'usr_03G4ZX9WR0',
    name: 'Julian Reyes',
    username: 'jreyes',
    email: 'julian.reyes@partners.io',
    phone: '+1 (555) 432-1098',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'Operator',
    status: 'Active',
    kycStatus: 'Pending Review',
    mfaEnabled: true,
    mfaMethods: ['SMS OTP Verification'],
    ssoProvider: 'Apple',
    department: 'External Operations',
    createdAt: '2025-05-18T10:00:00Z',
    lastActive: '34 mins ago',
    riskScore: 28,
    opaqueToken: 'fol_at_9x8z7y6t5r4e3w2q1p0o9n8m7l6k5j4h3g2f1d0s9a8b7'
  },
  {
    id: 'usr_04K9WX9WR1',
    name: 'Elena Rostova',
    username: 'erostova',
    email: 'elena.rostova@gmail.com',
    phone: '+49 172 1234567',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'End User',
    status: 'Active',
    kycStatus: 'Verified',
    mfaEnabled: false,
    mfaMethods: [],
    ssoProvider: null,
    department: 'General Public',
    createdAt: '2025-05-24T19:40:00Z',
    lastActive: '3 hours ago',
    riskScore: 15,
    opaqueToken: 'fol_at_5r4t3y2u1i0o9p8a7s6d5f4g3h2j1k0l9z8x7c6v5b4n3'
  },
  {
    id: 'usr_05M3QX9WR2',
    name: 'Toby Henderson',
    username: 'thenderson',
    email: 'toby.henderson@outlook.com',
    phone: '+44 7700 900077',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    role: 'End User',
    status: 'Deactivated',
    kycStatus: 'Action Required',
    mfaEnabled: true,
    mfaMethods: ['Email Identity Code'],
    ssoProvider: null,
    department: 'General Public',
    createdAt: '2025-03-01T11:22:11Z',
    lastActive: '3 days ago',
    riskScore: 64,
    opaqueToken: 'fol_at_1a2s3d4f5g6h7j8k9l0z9x8c7v6b5n4m3q2w1e0r9t8y7'
  },
  {
    id: 'usr_06L7ZX9WR3',
    name: 'Zara Lin',
    username: 'zlin',
    email: 'zara.lin@secguard.net',
    phone: '+65 9123 4567',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    role: 'End User',
    status: 'Banned',
    kycStatus: 'Not Started',
    mfaEnabled: false,
    mfaMethods: [],
    ssoProvider: null,
    department: 'Suspended Contracts',
    createdAt: '2025-04-12T16:05:00Z',
    lastActive: '12 days ago',
    riskScore: 95,
    opaqueToken: 'fol_at_9p8o7i6u5y4t3r2e1w0q9a8s7d6f5g4h3j2k1l0z9x8c7'
  }
];

const NAMES = [
  "Alexander Wright", "Sophia Castillo", "Liam Nordstrom", "Isabella Moretti",
  "Hiroshi Tanaka", "Emma Watson", "Amir Al-Fayed", "Chloe Dubois",
  "Carlos Santana", "Olivia Chen", "Gabriel Silva", "Nisha Patel",
  "Lucas Meyer", "Zoe Jenkins", "Viktor Ivanov", "Mia Sorensen",
  "Omar Farooq", "Yuki Sato", "Alice Walker", "Benjamin Sterling",
  "Fatima Zahra", "Matteo Rossi", "Elena Fischer", "Ji-Yeon Kim",
  "Ryan McGregor", "Camila Lopez", "Thomas Wright", "Maya Angelou",
  "David Beckham", "Rachel Greene", "James Bond", "Sarah Connor",
  "John Harrison", "Jane Seymour", "Luke Skywalker", "Leia Organa",
  "Bruce Wayne", "Clark Kent", "Diana Prince", "Peter Parker",
  "Tony Stark", "Steve Rogers", "Natasha Romanoff", "Wanda Maximoff",
  "Arthur Dent", "T'Challa King", "Carol Danvers", "Wade Wilson",
  "Logan Howlett", "Charles Xavier", "Jean Grey", "Bruce Banner",
  "Selina Kyle", "Barry Allen", "Hal Jordan", "Arthur Curry", "Oliver Queen",
  "Victor Stone", "Billy Batson", "John Constantine", "Zatanna Zatara",
  "Wally West", "Dick Grayson", "Barbara Gordon", "Tim Drake", "Jason Todd"
];

const DEPARTMENTS = [
  "SecOps & Compliance", "Governance & Identity", "External Operations", 
  "General Public", "Customer Support", "Core Infrastructure", 
  "Risk Management", "Engineering", "Financial Audits", "Creative Design"
];

const ROLES: ('Administrator' | 'Operator' | 'Security Officer' | 'End User')[] = ["Administrator", "Operator", "Security Officer", "End User"];
const STATUSES: ('Active' | 'Deactivated' | 'Banned')[] = ["Active", "Deactivated", "Banned"];
const KYC_STATUSES: ('Verified' | 'Pending Review' | 'Not Started' | 'Action Required')[] = ["Verified", "Pending Review", "Not Started", "Action Required"];
const SSO_PROVIDERS = ["Google", "Apple", null] as const;

const generatedUsers: IAMUser[] = NAMES.map((name, index) => {
  const parts = name.split(" ");
  const first = parts[0].toLowerCase();
  const last = (parts[1] || "user").toLowerCase();
  const username = `${first.slice(0, 4)}${last.slice(0, 3)}${index + 10}`;
  const domain = index % 3 === 0 ? "folksart.io" : (index % 3 === 1 ? "secguard.net" : "gmail.com");
  const email = `${first}.${last}@${domain}`;
  const role = ROLES[index % ROLES.length];
  // 10% Banned, 15% Deactivated, rest Active
  const status = index % 12 === 0 ? ("Banned" as const) : (index % 8 === 0 ? ("Deactivated" as const) : ("Active" as const));
  const kycStatus = KYC_STATUSES[index % KYC_STATUSES.length];
  const ssoProvider = SSO_PROVIDERS[index % SSO_PROVIDERS.length];
  const mfaEnabled = index % 2 === 0;
  const mfaMethods = mfaEnabled ? [(index % 3 === 0 ? "Hardware YubiKey" : "SMS OTP Verification")] : [];
  
  // Custom unique photo indices that are valid unsplash profile photo IDs to look real
  const unsplashPhotoIds = [
    "1506794778202-cad84cf45f1d", "1534528741775-53994a69daeb", "1507003211169-0a1dd7228f2d", "1517841905240-472988babdf9",
    "1500648767791-00dcc994a43e", "1544005313-94ddf0286df2", "1506794778202-cad84cf45f1d", "1519085360753-af0119f7cbe7",
    "1522075469751-3a6694fb2f61", "1580489944761-15a19d654956", "1438761681033-6461ffad8d80", "1494790108377-be9c29b29330",
    "1501196354995-cbb51c65aaea", "1531746020798-e6953c6e8e04", "1552058544-f2b08422138a", "1542103749-8ef59b94f42e",
    "1508214751196-bcfd4ca60f91", "1489980508314-941910ded1f4", "1546961329-78bef0414d7c"
  ];
  const photoId = unsplashPhotoIds[index % unsplashPhotoIds.length];
  const avatar = `https://images.unsplash.com/photo-${photoId}?w=120&auto=format&fit=crop&q=80`;
  
  const riskScore = Math.floor(Math.random() * 65) + (status === "Banned" ? 30 : 5);

  return {
    id: `usr_gen${String(index + 10).padStart(4, '0')}`,
    name,
    username,
    email,
    phone: `+1 (555) ${Math.floor(Math.random() * 800) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    avatar,
    role,
    status,
    kycStatus,
    mfaEnabled,
    mfaMethods,
    ssoProvider,
    department: DEPARTMENTS[index % DEPARTMENTS.length],
    createdAt: new Date(Date.now() - (index * 4 * 24 * 60 * 60 * 1000)).toISOString(),
    lastActive: `${index + 1} hours ago`,
    riskScore: Math.min(100, Math.max(0, riskScore)),
    opaqueToken: generateOpaqueToken(username)
  };
});

export const INITIAL_USERS: IAMUser[] = [...BASE_USERS, ...generatedUsers];

export const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: 'ses_01',
    device: 'Apple MacBook Pro 14"',
    browser: 'Safari v18.1',
    ip: '192.168.1.134 (Local)',
    location: 'Munich, Germany',
    isCurrent: true,
    lastActive: 'Just Now'
  },
  {
    id: 'ses_02',
    device: 'Google Pixel 9 Pro',
    browser: 'Chrome Mobile 131',
    ip: '82.113.99.12 (Cellular)',
    location: 'Munich, Germany',
    isCurrent: false,
    lastActive: '2 hours ago'
  },
  {
    id: 'ses_03',
    device: 'Windows Desktop - Workstation',
    browser: 'Firefox 133',
    ip: '203.0.113.50 (Corporate)',
    location: 'Vienna, Austria',
    isCurrent: false,
    lastActive: '2 days ago'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-06-03T11:45:12Z',
    actor: 'Clara Oswald',
    action: 'USER_ROLE_UPGRADE',
    target: 'Julian Reyes (Operator)',
    ipAddress: '192.168.1.134',
    severity: 'info'
  },
  {
    id: 'log_02',
    timestamp: '2026-06-03T10:12:05Z',
    actor: 'System Firewall',
    action: 'IP_BLOCK_THRESHOLD',
    target: 'Zara Lin (Banned)',
    ipAddress: '195.154.122.9',
    severity: 'critical'
  },
  {
    id: 'log_03',
    timestamp: '2026-06-03T09:30:19Z',
    actor: 'Marcus Vance',
    action: 'KYC_DOC_FLAGGED',
    target: 'Toby Henderson',
    ipAddress: '192.168.1.189',
    severity: 'warning'
  },
  {
    id: 'log_04',
    timestamp: '2026-06-03T07:22:45Z',
    actor: 'Elena Rostova',
    action: 'MFA_ENABLED_EMAIL',
    target: 'Elena Rostova',
    ipAddress: '46.112.83.101',
    severity: 'info'
  },
  {
    id: 'log_05',
    timestamp: '2026-06-02T18:40:11Z',
    actor: 'Audit Engine',
    action: 'OPAQUE_TOKEN_ROTATED',
    target: 'Clara Oswald',
    ipAddress: '127.0.0.1',
    severity: 'info'
  }
];
