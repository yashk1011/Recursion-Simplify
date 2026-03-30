'use client';

import { ExecutionProvider } from '@/context/ExecutionContext';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Visualization from '@/components/Visualization';
import Controls from '@/components/Controls';
import InfoPanel from '@/components/InfoPanel';

export default function Home() {
  return (
    <ExecutionProvider>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <Header />

        {/* Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Left panel - Code editor */}
          <div className="w-[420px] shrink-0 border-r border-gray-700">
            <CodeEditor />
          </div>

          {/* Center - Visualization */}
          <div className="flex-1 min-w-0">
            <Visualization />
          </div>

          {/* Right panel - Info */}
          <div className="w-[280px] shrink-0">
            <InfoPanel />
          </div>
        </div>

        {/* Bottom controls */}
        <Controls />
      </div>
    </ExecutionProvider>
  );
}
