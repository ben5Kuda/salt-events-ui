export interface EventSummary {
  totalEvents: number;
  totalEventsLast24Hours: number;
  totalEventsLast7Days: number;
  uniqueJobs: number;
  uniqueMinions: number;
  successfulEvents: number;
  failedEvents: number;
  successRate: number;
  eventsByType: EventTypeCount[];
  eventsByFunction: FunctionCount[];
  oldestEvent?: string;
  newestEvent?: string;
}

export interface EventTypeCount {
  eventType: string;
  count: number;
}

export interface FunctionCount {
  function: string;
  count: number;
}
