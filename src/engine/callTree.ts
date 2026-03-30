import { CallNode, CallStatus } from '@/types';

let nodeCounter = 0;

export function resetNodeCounter(): void {
  nodeCounter = 0;
}

export function createCallNode(
  functionName: string,
  args: unknown[],
  depth: number,
  parentId: string | null
): CallNode {
  const id = `node-${nodeCounter++}`;
  return {
    id,
    functionName,
    args,
    status: 'executing',
    children: [],
    depth,
    parentId,
  };
}

export function findNode(tree: CallNode, nodeId: string): CallNode | null {
  if (tree.id === nodeId) return tree;
  for (const child of tree.children) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

export function updateNodeStatus(
  tree: CallNode,
  nodeId: string,
  status: CallStatus,
  returnValue?: unknown
): CallNode {
  if (tree.id === nodeId) {
    return { ...tree, status, returnValue };
  }
  return {
    ...tree,
    children: tree.children.map((child) =>
      updateNodeStatus(child, nodeId, status, returnValue)
    ),
  };
}

export function addChildNode(
  tree: CallNode,
  parentId: string,
  child: CallNode
): CallNode {
  if (tree.id === parentId) {
    return { ...tree, children: [...tree.children, child] };
  }
  return {
    ...tree,
    children: tree.children.map((c) => addChildNode(c, parentId, child)),
  };
}

/** Deep clone a tree up to a given step index for time-travel */
export function cloneTree(tree: CallNode): CallNode {
  return {
    ...tree,
    children: tree.children.map(cloneTree),
  };
}
