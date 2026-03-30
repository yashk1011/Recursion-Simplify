import { ExecutionStep, CallNode } from '@/types';
import {
  createCallNode,
  addChildNode,
  updateNodeStatus,
  resetNodeCounter,
  cloneTree,
} from './callTree';

export interface ExecutionResult {
  steps: ExecutionStep[];
  snapshots: (CallNode | null)[];
  finalTree: CallNode | null;
  error: string | null;
  returnValue: unknown;
}

const MAX_CALLS = 500;

/**
 * Executes user code in a sandboxed manner, instrumenting all function
 * declarations to record call/return events and build a call tree.
 *
 * Approach:
 * 1. Parse out function names, params, and bodies from user code
 * 2. For each function, create a tracked wrapper that records call/return events
 *    and rebuilds the call via `new Function` with tracked function names in scope
 * 3. Execute the user's invocation string with tracked functions as arguments
 */
export function executeCode(code: string, invocation: string): ExecutionResult {
  const steps: ExecutionStep[] = [];
  const snapshots: (CallNode | null)[] = [];
  let tree: CallNode | null = null;
  let callCount = 0;
  let stepTimestamp = 0;
  const callStack: string[] = [];

  resetNodeCounter();

  function createTracker(fn: (...args: unknown[]) => unknown, fnName: string) {
    return function tracked(...args: unknown[]): unknown {
      callCount++;
      if (callCount > MAX_CALLS) {
        throw new Error(
          `Maximum call limit (${MAX_CALLS}) exceeded. Possible infinite recursion.`
        );
      }

      const parentId =
        callStack.length > 0 ? callStack[callStack.length - 1] : null;
      const depth = callStack.length;
      const node = createCallNode(fnName, args, depth, parentId);

      if (tree === null) {
        tree = node;
      } else if (parentId) {
        tree = addChildNode(tree, parentId, node);
      }

      steps.push({
        type: 'call',
        nodeId: node.id,
        timestamp: stepTimestamp++,
        args: args.map(cloneArg),
      });
      snapshots.push(tree ? cloneTree(tree) : null);

      callStack.push(node.id);

      try {
        const result = fn(...args);
        callStack.pop();

        if (tree) {
          tree = updateNodeStatus(tree, node.id, 'returned', cloneArg(result));
        }

        steps.push({
          type: 'return',
          nodeId: node.id,
          timestamp: stepTimestamp++,
          returnValue: cloneArg(result),
        });
        snapshots.push(tree ? cloneTree(tree) : null);

        return result;
      } catch (err) {
        callStack.pop();

        if (tree) {
          tree = updateNodeStatus(tree, node.id, 'error');
        }

        steps.push({
          type: 'error',
          nodeId: node.id,
          timestamp: stepTimestamp++,
          errorMessage: err instanceof Error ? err.message : String(err),
        });
        snapshots.push(tree ? cloneTree(tree) : null);

        throw err;
      }
    };
  }

  try {
    const funcNames = extractFunctionNames(code);
    const parsedFunctions = parseFunctionBodies(code, funcNames);

    // Build tracked functions. Each tracked function reconstructs the
    // function body via `new Function`, passing all tracked function names
    // as parameters so recursive calls go through tracking.
    const trackedFns: Record<string, (...args: unknown[]) => unknown> = {};

    for (const name of funcNames) {
      const { params, body } = parsedFunctions[name];

      trackedFns[name] = createTracker((...args: unknown[]) => {
        const fnParamNames = [...funcNames, ...params];
        const fnArgValues = [
          ...funcNames.map((n) => trackedFns[n]),
          ...args,
        ];
        const fn = new Function(...fnParamNames, body);
        return fn(...fnArgValues);
      }, name);
    }

    // Execute the invocation with tracked functions in scope
    const invokeFn = new Function(
      ...funcNames,
      `"use strict"; return ${invocation};`
    );
    const returnValue = invokeFn(...funcNames.map((n) => trackedFns[n]));

    return {
      steps,
      snapshots,
      finalTree: tree,
      error: null,
      returnValue,
    };
  } catch (err) {
    return {
      steps,
      snapshots,
      finalTree: tree,
      error: err instanceof Error ? err.message : String(err),
      returnValue: undefined,
    };
  }
}

// --- Helpers ---

function extractFunctionNames(code: string): string[] {
  const regex = /function\s+(\w+)\s*\(/g;
  const names: string[] = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    names.push(match[1]);
  }
  return names;
}

interface ParsedFunction {
  params: string[];
  body: string;
}

function parseFunctionBodies(
  code: string,
  funcNames: string[]
): Record<string, ParsedFunction> {
  const result: Record<string, ParsedFunction> = {};

  for (const name of funcNames) {
    const regex = new RegExp(`function\\s+${name}\\s*\\(([^)]*)\\)\\s*\\{`);
    const match = regex.exec(code);

    if (!match) {
      result[name] = { params: [], body: 'return undefined;' };
      continue;
    }

    const params = match[1]
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    // Find matching closing brace
    const startIdx = match.index + match[0].length;
    let braceCount = 1;
    let i = startIdx;
    while (i < code.length && braceCount > 0) {
      if (code[i] === '{') braceCount++;
      if (code[i] === '}') braceCount--;
      i++;
    }

    const body = code.substring(startIdx, i - 1);
    result[name] = { params, body };
  }

  return result;
}

function cloneArg(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (
    typeof val === 'number' ||
    typeof val === 'string' ||
    typeof val === 'boolean'
  ) {
    return val;
  }
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return String(val);
  }
}
