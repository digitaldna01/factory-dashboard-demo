# FabOS — Smart Factory OS

A dashboard for display panel manufacturing operations. Built as a single-page React app using Babel standalone (no build step required).

## Getting Started

Open `index.html` directly in a browser. No server or install needed.

> **Note:** The fonts load from the local `fonts/` folder, so keep `index.html` and `fonts/` in the same directory.

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
index.html          # Self-contained app (all JSX inlined)
Components.jsx      # Shared design tokens, colors, and base components
FactoryMap.jsx      # Isometric factory map and building interior views
WorkflowPanel.jsx   # Left panel — workflow cards and active agents
SchedulePanel.jsx   # Right panel — calendar and drag-drop scheduling
tweaks-panel.jsx    # Floating tweaks panel (layout sliders, toggles)
fonts/              # Inter and DM Mono variable fonts
```

> `index.html` is fully self-contained — all JSX from the component files is inlined into it. The `.jsx` files are the source of truth for editing.

## Making Changes

Edit the `.jsx` source files, then regenerate `index.html` by running:

```bash
python3 -c "
import re

def read(p):
    with open(p) as f: return f.read()

parts = [
    read('Components.jsx'),
    read('tweaks-panel.jsx'),
    read('WorkflowPanel.jsx'),
    read('SchedulePanel.jsx'),
    read('FactoryMap.jsx'),
]

with open('index.html') as f:
    html = f.read()

app = re.findall(r'<script type=\"text/babel\">(.*?)</script>', html, re.DOTALL)[-1]
parts.append(app)

template = open('index.html').read()
combined = '\n'.join(parts)

# Replace all individual script tags with one combined block
result = re.sub(
    r'(<script type=\"text/babel\">).*?(</script>)',
    lambda m, done=[False]: (m.group(0) if done[0] else (done.__setitem__(0, True) or f'{m.group(1)}\n{combined}\n{m.group(2)}')),
    template, flags=re.DOTALL
)
print('Use the build script in the README instead — this snippet is illustrative.')
"
```

For quick edits, you can also edit the single `<script type="text/babel">` block inside `index.html` directly.

## Tech Stack

- React 18 + ReactDOM (CDN)
- Babel Standalone (in-browser JSX compilation, no build step)
- Pure inline styles (no CSS framework)
- Fonts: Inter (variable), DM Mono
