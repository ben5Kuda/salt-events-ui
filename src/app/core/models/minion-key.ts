export interface MinionKey {
  minionId: string;
  keyState: KeyState;
  publicKey: string;
  timestamp: string;
  cluster?: string;
}

export enum KeyState {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Denied = 'denied'
}

export interface MinionKeySummary {
  pending: number;
  accepted: number;
  rejected: number;
  denied: number;
  total: number;
}

export interface MinionKeyAction {
  minionIds: string[];
  action: 'accept' | 'reject' | 'delete';
}
