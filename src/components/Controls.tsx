'use client';

import React from 'react';
import { useExecutionContext } from '@/context/ExecutionContext';
import { usePlayback } from '@/hooks/usePlayback';

export default function Controls() {
  usePlayback();

  const {
    state,
    stepForward,
    stepBack,
    play,
    pause,
    reset,
    setStep,
    setSpeed,
  } = useExecutionContext();

  const hasSteps = state.steps.length > 0;
  const isAtEnd = state.currentStepIndex >= state.steps.length - 1;
  const isAtStart = state.currentStepIndex <= 0;
  const currentStep = hasSteps ? state.steps[state.currentStepIndex] : null;

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-gray-900 border-t border-gray-700">
      {/* Transport controls */}
      <div className="flex items-center gap-1">
        {/* Reset */}
        <button
          onClick={reset}
          disabled={!hasSteps}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Reset"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Step back */}
        <button
          onClick={stepBack}
          disabled={!hasSteps || isAtStart}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step back"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={state.isPlaying ? pause : play}
          disabled={!hasSteps || (isAtEnd && !state.isPlaying)}
          className="p-2 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={state.isPlaying ? 'Pause' : 'Play'}
        >
          {state.isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Step forward */}
        <button
          onClick={stepForward}
          disabled={!hasSteps || isAtEnd}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Step forward"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
          </svg>
        </button>
      </div>

      {/* Progress bar / scrubber */}
      <div className="flex-1 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(0, state.steps.length - 1)}
          value={state.currentStepIndex >= 0 ? state.currentStepIndex : 0}
          onChange={(e) => setStep(Number(e.target.value))}
          disabled={!hasSteps}
          className="flex-1 h-1.5 accent-indigo-500 bg-gray-700 rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
        />
        <span className="text-xs text-gray-400 tabular-nums w-20 text-right">
          {hasSteps
            ? `${state.currentStepIndex + 1} / ${state.steps.length}`
            : '— / —'}
        </span>
      </div>

      {/* Current step info */}
      {currentStep && (
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              currentStep.type === 'call'
                ? 'bg-indigo-500/20 text-indigo-300'
                : currentStep.type === 'return'
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {currentStep.type.toUpperCase()}
          </span>
        </div>
      )}

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Speed:</label>
        <select
          value={state.speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bg-gray-800 text-white text-xs rounded-md px-2 py-1 border border-gray-600 focus:outline-none focus:border-indigo-500"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={5}>5x</option>
        </select>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="text-xs text-red-400 max-w-xs truncate" title={state.error}>
          {state.error}
        </div>
      )}
    </div>
  );
}
