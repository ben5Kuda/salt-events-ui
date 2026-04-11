export interface MinionConnectivitySummary {
  totalMinions: number;
  onlineMinions: number;
  offlineMinions: number;
  onlinePercentage: number;
  recentPresenceChanges: MinionPresenceStatus[];
  lastUpdated: string;
}

export interface MinionPresenceStatus {
  minionId: string;
  isOnline: boolean;
  lastSeen: string;
  status: 'online' | 'offline' | 'unknown';
}
