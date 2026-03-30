'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { ExecutionState, ExecutionStep, CallNode } from '@/types';
import { executeCode, ExecutionResult } from '@/engine/executor';

// --- Actions ---

type Action =
  | { type: 'RUN'; result: ExecutionResult }
  | { type: 'SET_STEP'; index: number }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACK' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_ERROR'; error: string };

// --- State ---

interface AppState extends ExecutionState {
  snapshots: (CallNode | null)[];
  result: ExecutionResult | null;
}

const initialState: AppState = {
  steps: [],
  currentStepIndex: -1,
  tree: null,
  isPlaying: false,
  speed: 1,
  isRunning: false,
  error: null,
  snapshots: [],
  result: null,
};

// --- Reducer ---

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RUN': {
      const { result } = action;
      return {
        ...state,
        steps: result.steps,
        snapshots: result.snapshots,
        currentStepIndex: 0,
        tree: result.snapshots[0] ?? null,
        isPlaying: false,
        isRunning: true,
        error: result.error,
        result,
      };
    }
    case 'SET_STEP': {
      const index = Math.max(
        0,
        Math.min(action.index, state.steps.length - 1)
      );
      return {
        ...state,
        currentStepIndex: index,
        tree: state.snapshots[index] ?? null,
      };
    }
    case 'STEP_FORWARD': {
      if (state.currentStepIndex >= state.steps.length - 1) {
        return { ...state, isPlaying: false };
      }
      const next = state.currentStepIndex + 1;
      return {
        ...state,
        currentStepIndex: next,
        tree: state.snapshots[next] ?? null,
      };
    }
    case 'STEP_BACK': {
      if (state.currentStepIndex <= 0) return state;
      const prev = state.currentStepIndex - 1;
      return {
        ...state,
        currentStepIndex: prev,
        tree: state.snapshots[prev] ?? null,
      };
    }
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'RESET':
      return {
        ...state,
        currentStepIndex: 0,
        tree: state.snapshots[0] ?? null,
        isPlaying: false,
      };
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_ERROR':
      return { ...state, error: action.error, isPlaying: false };
    default:
      return state;
  }
}

// --- Context ---

interface ExecutionContextType {
  state: AppState;
  run: (code: string, invocation: string) => void;
  stepForward: () => void;
  stepBack: () => void;
  setStep: (index: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

const ExecutionContext = createContext<ExecutionContextType | null>(null);

export function ExecutionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const run = useCallback((code: string, invocation: string) => {
    try {
      const result = executeCode(code, invocation);
      dispatch({ type: 'RUN', result });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const stepForward = useCallback(() => dispatch({ type: 'STEP_FORWARD' }), []);
  const stepBack = useCallback(() => dispatch({ type: 'STEP_BACK' }), []);
  const setStep = useCallback(
    (index: number) => dispatch({ type: 'SET_STEP', index }),
    []
  );
  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setSpeed = useCallback(
    (speed: number) => dispatch({ type: 'SET_SPEED', speed }),
    []
  );

  return (
    <ExecutionContext.Provider
      value={{
        state,
        run,
        stepForward,
        stepBack,
        setStep,
        play,
        pause,
        reset,
        setSpeed,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  );
}

export function useExecutionContext(): ExecutionContextType {
  const ctx = useContext(ExecutionContext);
  if (!ctx) {
    throw new Error('useExecutionContext must be used within ExecutionProvider');
  }
  return ctx;
}
