export type IAMRole = 'Administrator' | 'Operator' | 'Security Officer' | 'End User';
export type IAMStatus = 'Active' | 'Deactivated' | 'Banned';
export type KYCStatus = 'Verified' | 'Pending Review' | 'Not Started' | 'Action Required';

export interface IAMUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  role: IAMRole;
  status: IAMStatus;
  kycStatus: KYCStatus;
  mfaEnabled: boolean;
  mfaMethods: string[];
  ssoProvider: 'Google' | 'Apple' | null;
  department: string;
  createdAt: string;
  lastActive: string;
  riskScore: number; // 0-100 scale
  opaqueToken: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface KYCDocument {
  type: 'Passport' | 'Driver License' | 'National ID' | null;
  fileName: string | null;
  fileSize: string | null;
  uploadDate: string | null;
  status: 'Idle' | 'Processing' | 'Approved' | 'Rejected';
  validationMessage?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}
