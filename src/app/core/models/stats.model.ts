export interface Stats {
  totalEventsLast24Hours: number;
  eventsByType: EventTypeCount[];
  eventsByFunction: FunctionCount[];
  uniqueMinions: number;
  uniqueJobs: number;
}

export interface EventTypeCount {
  eventType: string;
  count: number;
}

export interface FunctionCount {
  function: string;
  count: number;
}
