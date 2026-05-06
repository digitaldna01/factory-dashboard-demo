# FabOS — Smart Factory OS

A dashboard for display panel manufacturing operations. Built with Vite + React + Tailwind, deployed to GitHub Pages.

## Getting Started

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/factory-dashboard-demo/`.

## Live Demo

https://digitaldna01.github.io/factory-dashboard-demo/

## Deploy to GitHub Pages

Push to `main`. The GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys automatically.

> **First-time setup:** In your repo settings, go to **Pages → Source** and set it to **GitHub Actions**.

## What's Inside

**Three-panel layout:**

- **Left — Workflows:** Draggable workflow and AI agent cards. Filter by category (Defect, Recipe, Equipment, WIP, Quality, AI) or search by name. Toggle to the Active Agents tab to see live progress.
- **Center — Factory Map:** Isometric digital twin of the display panel fab. Click any building to drill into a top-down floor plan showing individual equipment units. Click a unit to see process conditions (recipe, temp, pressure) and an AI recommendation. A process flow strip runs below the map.
- **Right — Schedule:** Week-view calendar. Drag a workflow card from the left panel and drop it onto a time slot to schedule it. Click a scheduled event to select or remove it.

**Top bar elements:**
- KPI bar: Yield Rate, WIP Panels, Active Alarms, Lots Complete, AI Agents, Throughput
- Alarm ticker: active equipment holds and faults

**Additional views** (top nav tabs):
- **Lots** — WIP lot tracker table
- **Defect Map** — heatmap for LOT-A042
- **AI Agents** — chat console for FabOS Intelligence

## File Structure

```
src/
  App.jsx                        # Root component, layout, KPI bar, alarm ticker
  main.jsx                       # Vite entry point
  index.css                      # Tailwind directives + font-face declarations
  components/
    Components.jsx               # Design tokens (C), shared components (Chip, FabButton, TopBar…)
    FactoryMap.jsx               # Isometric factory map and building interior views
    WorkflowPanel.jsx            # Left panel — workflow cards and active agents
    SchedulePanel.jsx            # Right panel — calendar and drag-drop scheduling
    TweaksPanel.jsx              # Floating tweaks panel (layout sliders, toggles)
  assets/fonts/                  # Inter and DM Mono variable fonts
.github/workflows/deploy.yml     # GitHub Pages deployment
vite.config.js                   # base: '/factory-dashboard-demo/'
tailwind.config.js               # FabOS color tokens extended into Tailwind theme
```

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 3 (custom FabOS color tokens configured in `tailwind.config.js`)
- Inline styles for dynamic/computed values; Tailwind available for new components
- Fonts: Inter (variable), DM Mono
