export interface MinionVersionSummary {
  osVersions: { [key: string]: number };
  saltVersions: { [key: string]: number };
  totalMinions: number;
}

export interface ProvisioningEventsSummary {
  totalLast24Hours: number;
  totalLast7Days: number;
  successfulLast24Hours: number;
  failedLast24Hours: number;
  successfulLast7Days: number;
  failedLast7Days: number;
  eventTypeBreakdown: ProvisioningEventTypeCount[];
}

export interface ProvisioningEventTypeCount {
  eventType: string;
  count: number;
  last24Hours: number;
  last7Days: number;
}
