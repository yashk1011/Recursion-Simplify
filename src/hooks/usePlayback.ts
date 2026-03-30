'use client';

import { useEffect, useRef } from 'react';
import { useExecutionContext } from '@/context/ExecutionContext';

/**
 * Manages the auto-play interval. When isPlaying is true, automatically
 * steps forward at the configured speed.
 */
export function usePlayback() {
  const { state, stepForward, pause } = useExecutionContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.isPlaying && state.steps.length > 0) {
      const ms = Math.max(50, 800 / state.speed);
      intervalRef.current = setInterval(() => {
        if (state.currentStepIndex >= state.steps.length - 1) {
          pause();
        } else {
          stepForward();
        }
      }, ms);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying, state.speed, state.currentStepIndex, state.steps.length, stepForward, pause]);
}
