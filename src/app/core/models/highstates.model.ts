export interface HighstateSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalStatesRun: number;
  totalStatesChanged: number;
  totalStatesFailed: number;
  averageDuration: number;
  uniqueMinions: number;
}

export interface HighstateExecution {
  id: string;
  jobId: string;
  minionId: string;
  timestamp: string;
  duration: number;
  success: boolean;
  totalStates: number;
  changedStates: number;
  failedStates: number;
  succeededStates: number;
  totalPropertyChanges: number;
  states: HighstateState[];
}

export interface HighstateState {
  id: string;
  name: string;
  state: string;
  function: string;
  result: boolean;
  changes: any;
  comment: string;
  duration: number;
  startTime: string;
  runNum: number;
  sls: string;
}

export interface HighstateStats {
  minionId: string;
  executionCount: number;
  lastExecution: string;
  successRate: number;
  averageDuration: number;
  totalStates: number;
  changedStates: number;
  failedStates: number;
}
