export type CallStatus = 'executing' | 'waiting' | 'returned' | 'error';

export interface CallNode {
  id: string;
  functionName: string;
  args: unknown[];
  returnValue?: unknown;
  status: CallStatus;
  children: CallNode[];
  depth: number;
  parentId: string | null;
}

export interface ExecutionStep {
  type: 'call' | 'return' | 'error';
  nodeId: string;
  timestamp: number;
  args?: unknown[];
  returnValue?: unknown;
  errorMessage?: string;
}

export interface ExecutionState {
  steps: ExecutionStep[];
  currentStepIndex: number;
  tree: CallNode | null;
  isPlaying: boolean;
  speed: number;
  isRunning: boolean;
  error: string | null;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  code: string;
  defaultInput: string;
  complexity: string;
}
