# Recursion Viz — Interactive Recursion & Call-Stack Visualizer

Recursion Viz is a web app that helps you **understand recursion by watching it execute**. Paste (or pick) a recursive function, run it step-by-step, and see a **live call tree** and execution trace so you can debug mental models around stack frames, base cases, and branching recursion.

> Built to make “what is the call stack doing right now?” visual and intuitive.

## What you can do

- **Run recursion step-by-step**: play/pause, step, and scrub through execution.
- **Visualize a call tree**: see how recursive calls expand and return over time.
- **Edit code in the browser**: Monaco-based editor for a fast, IDE-like feel.
- **Try built-in presets**: classic recursive algorithms (factorial, fibonacci, merge sort, tower of hanoi, etc.).

## Tech stack

- **Framework**: Next.js (App Router) + React + TypeScript
- **Visualization**: D3 (call-tree rendering)
- **Editor**: `@monaco-editor/react`
- **Styling**: Tailwind CSS

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

## How it works (conceptually)

1. Your function (or a preset) is executed by the app’s **execution engine**.
2. The engine records a stream of events (call/return/values).
3. Those events are transformed into a **call tree model**.
4. The UI renders the tree with D3 and lets you **play back** the execution timeline.

## Resume-ready highlights (copy/paste)

- Built an **interactive recursion visualizer** that replays execution step-by-step and renders a **dynamic call tree** to teach/debug recursive algorithms.
- Implemented a lightweight **execution + event logging engine** and a **playback controller** to scrub through call-stack state over time.
- Created a responsive UI with **Next.js + React + TypeScript**, an in-browser **Monaco** editor, and **D3** visualizations.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run ESLint

## Optional: add a demo link / screenshot

- **Live demo**: add your deployed URL here (Vercel works great)
- **Screenshot/GIF**: add `public/demo.png` (or a GIF) and embed it here

## Deploy

Deploy on Vercel (recommended for Next.js). See Next.js docs: [Deploying](https://nextjs.org/docs/app/building-your-application/deploying).
