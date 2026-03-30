'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { CallNode, CallStatus } from '@/types';
import { useExecutionContext } from '@/context/ExecutionContext';

const STATUS_COLORS: Record<CallStatus, string> = {
  executing: '#6366f1', // indigo
  waiting: '#6b7280', // gray
  returned: '#22c55e', // green
  error: '#ef4444', // red
};

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (Array.isArray(a)) {
        if (a.length > 5) return `[${a.slice(0, 5).join(',')}...]`;
        return `[${a.join(',')}]`;
      }
      if (typeof a === 'string') return `"${a}"`;
      return String(a);
    })
    .join(', ');
}

function formatReturnValue(val: unknown): string {
  if (val === undefined) return '';
  if (Array.isArray(val)) {
    if (val.length > 5) return `→ [${val.slice(0, 5).join(',')}...]`;
    return `→ [${val.join(',')}]`;
  }
  return `→ ${String(val)}`;
}

export default function Visualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useExecutionContext();

  const renderTree = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!state.tree) {
      // Empty state
      svg
        .append('text')
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6b7280')
        .attr('font-size', '16px')
        .text('Run a function to see the call tree');
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();

    // Convert CallNode to d3 hierarchy
    const root = d3.hierarchy(state.tree, (d) => d.children);

    // Create tree layout
    const nodeCount = root.descendants().length;
    const treeWidth = Math.max(width - 80, nodeCount * 60);
    const treeHeight = Math.max(height - 80, (root.height + 1) * 100);

    const treeLayout = d3.tree<CallNode>().size([treeWidth, treeHeight]);

    treeLayout(root);

    // Create a group for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Center the tree
    const initialTransform = d3.zoomIdentity
      .translate(40, 40)
      .scale(Math.min(1, width / (treeWidth + 80), height / (treeHeight + 80)));

    svg.call(zoom.transform, initialTransform);

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .join('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        return `M${d.source.x},${d.source.y! + 20}
                C${d.source.x},${(d.source.y! + d.target.y!) / 2}
                 ${d.target.x},${(d.source.y! + d.target.y!) / 2}
                 ${d.target.x},${d.target.y! - 20}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Draw nodes
    const nodes = g
      .selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Node background
    nodes
      .append('rect')
      .attr('x', -60)
      .attr('y', -20)
      .attr('width', 120)
      .attr('height', 40)
      .attr('rx', 8)
      .attr('fill', (d) => {
        const color = STATUS_COLORS[d.data.status];
        return d.data.status === 'executing' ? color : `${color}22`;
      })
      .attr('stroke', (d) => STATUS_COLORS[d.data.status])
      .attr('stroke-width', 2);

    // Function name + args
    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -2)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d) => {
        const args = formatArgs(d.data.args);
        const label = `${d.data.functionName}(${args})`;
        return label.length > 18 ? label.slice(0, 17) + '…' : label;
      });

    // Return value
    nodes
      .filter((d) => d.data.status === 'returned' && d.data.returnValue !== undefined)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 14)
      .attr('fill', '#86efac')
      .attr('font-size', '10px')
      .text((d) => {
        const rv = formatReturnValue(d.data.returnValue);
        return rv.length > 18 ? rv.slice(0, 17) + '…' : rv;
      });

    // Tooltip on hover
    nodes.append('title').text((d) => {
      let text = `${d.data.functionName}(${formatArgs(d.data.args)})`;
      text += `\nStatus: ${d.data.status}`;
      text += `\nDepth: ${d.data.depth}`;
      if (d.data.returnValue !== undefined) {
        text += `\nReturn: ${JSON.stringify(d.data.returnValue)}`;
      }
      return text;
    });
  }, [state.tree]);

  useEffect(() => {
    renderTree();
  }, [renderTree]);

  // Resize handler
  useEffect(() => {
    const observer = new ResizeObserver(() => renderTree());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [renderTree]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-950 overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
    </div>
  );
}
