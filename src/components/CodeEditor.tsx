'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { presets } from '@/presets';
import { Preset } from '@/types';
import { useExecutionContext } from '@/context/ExecutionContext';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-800 text-gray-400">
      Loading editor...
    </div>
  ),
});

export default function CodeEditor() {
  const { run } = useExecutionContext();
  const [selectedPreset, setSelectedPreset] = useState<Preset>(presets[0]);
  const [code, setCode] = useState(presets[0].code);
  const [invocation, setInvocation] = useState(presets[0].defaultInput);

  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const preset = presets.find((p) => p.id === e.target.value);
      if (preset) {
        setSelectedPreset(preset);
        setCode(preset.code);
        setInvocation(preset.defaultInput);
      }
    },
    []
  );

  const handleRun = useCallback(() => {
    run(code, invocation);
  }, [code, invocation, run]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
        <label className="text-sm text-gray-400 shrink-0">Preset:</label>
        <select
          value={selectedPreset.id}
          onChange={handlePresetChange}
          className="flex-1 bg-gray-800 text-white text-sm rounded-md px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-indigo-500"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.complexity}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700/50">
        {selectedPreset.description}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12 },
          }}
        />
      </div>

      {/* Invocation input + Run button */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-700">
        <label className="text-sm text-gray-400 shrink-0">Call:</label>
        <input
          type="text"
          value={invocation}
          onChange={(e) => setInvocation(e.target.value)}
          className="flex-1 bg-gray-800 text-white text-sm font-mono rounded-md px-3 py-1.5 border border-gray-600 focus:outline-none focus:border-indigo-500"
          placeholder="e.g. fibonacci(5)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRun();
          }}
        />
        <button
          onClick={handleRun}
          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
        </button>
      </div>
    </div>
  );
}
