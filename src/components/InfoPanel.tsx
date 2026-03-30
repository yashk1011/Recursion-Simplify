'use client';

import React, { useState, useMemo } from 'react';
import { useExecutionContext } from '@/context/ExecutionContext';
import { CallNode } from '@/types';
import { findNode } from '@/engine/callTree';

function formatValue(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string') return `"${val}"`;
  return String(val);
}

function collectCallStack(tree: CallNode, nodeId: string): CallNode[] {
  // Find path from root to the given nodeId
  const path: CallNode[] = [];

  function dfs(node: CallNode): boolean {
    path.push(node);
    if (node.id === nodeId) return true;
    for (const child of node.children) {
      if (dfs(child)) return true;
    }
    path.pop();
    return false;
  }

  dfs(tree);
  return path;
}

export default function InfoPanel() {
  const { state } = useExecutionContext();
  const [isOpen, setIsOpen] = useState(true);

  const currentStep =
    state.steps.length > 0 && state.currentStepIndex >= 0
      ? state.steps[state.currentStepIndex]
      : null;

  const currentNode = useMemo(() => {
    if (!state.tree || !currentStep) return null;
    return findNode(state.tree, currentStep.nodeId);
  }, [state.tree, currentStep]);

  const callStack = useMemo(() => {
    if (!state.tree || !currentStep) return [];
    return collectCallStack(state.tree, currentStep.nodeId);
  }, [state.tree, currentStep]);

  const returnValue = state.result?.returnValue;

  return (
    <div className="bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border-b border-gray-700 transition-colors"
      >
        <span>Info Panel</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Final return value */}
          {state.result && state.result.error === null && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Result
              </h3>
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-green-400">
                {formatValue(returnValue)}
              </div>
            </div>
          )}

          {/* Current call */}
          {currentNode && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Current Call
              </h3>
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Function</span>
                  <span className="text-sm text-white font-mono">
                    {currentNode.functionName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Arguments</span>
                  <span className="text-sm text-indigo-300 font-mono">
                    {currentNode.args.map(formatValue).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Depth</span>
                  <span className="text-sm text-white">{currentNode.depth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Status</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      currentNode.status === 'executing'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : currentNode.status === 'returned'
                        ? 'bg-green-500/20 text-green-300'
                        : currentNode.status === 'waiting'
                        ? 'bg-gray-500/20 text-gray-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {currentNode.status}
                  </span>
                </div>
                {currentNode.returnValue !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Return</span>
                    <span className="text-sm text-green-400 font-mono">
                      {formatValue(currentNode.returnValue)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call stack */}
          {callStack.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Call Stack
              </h3>
              <div className="space-y-1">
                {[...callStack].reverse().map((node, i) => (
                  <div
                    key={node.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono ${
                      i === 0
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <span className="text-xs text-gray-500 w-4">
                      {callStack.length - i - 1}
                    </span>
                    <span>
                      {node.functionName}({node.args.map(formatValue).join(', ')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {state.steps.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Statistics
              </h3>
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total steps</span>
                  <span className="text-sm text-white">{state.steps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total calls</span>
                  <span className="text-sm text-white">
                    {state.steps.filter((s) => s.type === 'call').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Max depth</span>
                  <span className="text-sm text-white">
                    {state.tree
                      ? Math.max(
                          ...getAllNodes(state.tree).map((n) => n.depth)
                        )
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {state.steps.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8">
              Select a preset and click <strong>Run</strong> to start
              visualizing.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getAllNodes(node: CallNode): CallNode[] {
  return [node, ...node.children.flatMap(getAllNodes)];
}
