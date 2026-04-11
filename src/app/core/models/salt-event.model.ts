export interface SaltEvent {
  id: string;
  timestamp: string;
  event_id: string;
  salt_master_id: string;
  salt_master_type: string;
  event_type: string;
  tag: string;
  minion_id: string | null;
  job_id: string | null;
  function: string | null;
  original_data: any;
  rawPayload: any;
  createdAt: string;
  success: boolean | null;
  event_action?: string;
  event_arguments?: string[];
}

export interface EventsResponse {
  count: number;
  data: SaltEvent[];
}
