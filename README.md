
It is a web app that helps you understand recursion by watching it execute. Paste (or pick) a recursive function, run it step-by-step, and see a live call tree and execution trace so you can debug mental models around stack frames, base cases, and branching recursion.

> Built to make “what is the call stack doing right now?” visual and intuitive.

## What you can do

- Run recursion step-by-step: play/pause, step, and scrub through execution.
- Visualize a call tree: see how recursive calls expand and return over time.
- Edit code in the browser: Monaco-based editor for a fast, IDE-like feel.
- Try built-in presets: classic recursive algorithms (factorial, fibonacci, merge sort, tower of hanoi, etc.).

## Tech stack

- Framework: Next.js (App Router) + React + TypeScript
- Visualization: D3 (call-tree rendering)
- Editor: `@monaco-editor/react`
- Styling: Tailwind CSS

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Project structure (high-level)

- `src/app/`: Next.js routes/layout and global styling
- `src/components/`: UI components (editor, controls, visualization, panels)
- `src/engine/`: execution + call-tree generation logic
- `src/context/`: shared state for execution/playback
- `src/presets/`: sample recursive algorithms you can load instantly

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint

