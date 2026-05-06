import React, { useState, useCallback, memo, Fragment } from 'react'
import { C, Chip, FabButton } from './Components'
/* FabOS — Premium Isometric Factory Digital Twin
 * Display Panel MFG — connected plant with cleanrooms, towers, utilities,
 * equipment clusters, pipes, conveyors. Drill-down to interior floor plan.
 */

/* ═══ Isometric projection ════════════════════════════════════ */
const ISO_TX = 18;   // half-tile width
const ISO_TY = 9;    // half-tile depth
const ISO_H  = 14;   // unit height

function iso(gx, gy, gz = 0) {
  return {
    x: (gx - gy) * ISO_TX,
    y: (gx + gy) * ISO_TY - gz * ISO_H,
  };
}

/* ═══ Status palette ══════════════════════════════════════════ */
const STATUS = {
  running:    { dot: '#16A34A', soft: '#DCFCE7', deep: '#14532D', label: 'Running' },
  processing: { dot: '#3B82F6', soft: '#DBEAFE', deep: '#1E3A8A', label: 'Processing' },
  hold:       { dot: '#D97706', soft: '#FEF3C7', deep: '#78350F', label: 'On Hold' },
  alarm:      { dot: '#DC2626', soft: '#FEE2E2', deep: '#7F1D1D', label: 'Alarm' },
  idle:       { dot: '#BDB9AE', soft: '#EBE8E1', deep: '#5C5950', label: 'Idle' },
  complete:   { dot: '#16A34A', soft: '#DCFCE7', deep: '#14532D', label: 'Complete' },
};

/* ═══ Plant master data ═══════════════════════════════════════
 * Coordinates use a unified tile grid. Buildings are joined by a
 * shared corridor plinth so the factory reads as ONE plant.
 * Origin (0,0) at top-left of plant footprint.                  */

const PLANT = {
  // Outer concrete plinth dimensions (tile units)
  plinth: { gx: -1.5, gy: -1.5, gw: 24.5, gd: 14.5, gh: 0.4 },

  // Corridor connecting all buildings (mid-spine, gh small)
  corridors: [
    // Spine connecting building-row-1 to row-2
    { gx: 1, gy: 4.2, gw: 20, gd: 0.8, gh: 0.6, kind: 'spine' },
    // Stub corridors from each building down to spine
    { gx: 2.0, gy: 3.5, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 7.5, gy: 3.5, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 13.0, gy: 3.5, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 17.5, gy: 3.5, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 2.0, gy: 5.0, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 7.5, gy: 5.0, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 13.0, gy: 5.0, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
    { gx: 17.5, gy: 5.0, gw: 1.4, gd: 0.7, gh: 0.6, kind: 'stub' },
  ],

  // Utility infrastructure (small, decorative, no drill-down)
  utilities: [
    // Cooling towers (2 cylinders) at top-right
    { kind: 'tower', gx: 21.0, gy: 0.5, label: 'CW-1' },
    { kind: 'tower', gx: 21.0, gy: 2.0, label: 'CW-2' },
    // Gas yard (low boxes) at top-left
    { kind: 'gasyard', gx: -1.0, gy: 0.5, gw: 1.2, gd: 1.5 },
    // Solvent tanks bottom-left
    { kind: 'tanks',  gx: -1.0, gy: 7.5, gw: 1.2, gd: 1.8 },
    // Rooftop HVAC plant at bottom-right
    { kind: 'hvac',   gx: 21.0, gy: 8.5, gw: 1.5, gd: 2.0 },
  ],

  // Pipe runs (overhead, small height)
  pipes: [
    // From cooling towers across rooftops to dep + etch
    { from: { gx: 21.5, gy: 1.0, gz: 1.6 }, to: { gx: 10.5, gy: 1.0, gz: 3.6 } },
    { from: { gx: 10.5, gy: 1.0, gz: 3.6 }, to: { gx: 10.5, gy: 6.0, gz: 2.8 } },
    // From gas yard to dep
    { from: { gx: -0.4, gy: 1.0, gz: 0.6 }, to: { gx: 6.0, gy: 1.0, gz: 3.6 } },
  ],
};

/* ═══ Buildings ═══════════════════════════════════════════════ */
const BUILDINGS = {
  'B1-INPUT': {
    name: 'Glass Substrate Input', code: 'B1', short: 'Input',
    role: 'Glass Sub. Input · Cleaning',
    gx: 0, gy: 0, gw: 4.5, gd: 3.5, gh: 2.4,
    status: 'running', lots: 4, panels: 32, alarms: 0, util: 78,
    color: { roof: '#EFEDE6', wall: '#F8F6F0', side: '#D6D2C6', accent: '#3B82F6' },
    rooftop: ['ahu', 'vent'],
    interior: {
      label: 'B1 — Glass Input & Cleaning',
      lines: [
        { id: 'L1', label: 'Substrate Line', y: 0.20 },
        { id: 'L2', label: 'Wet Clean Line', y: 0.62 },
      ],
      equipment: [
        { id:'GS-01',name:'Glass Store A',line:'L1',x:0.10,status:'running',lot:'LOT-A044',wip:24,recipe:'GS-STD-2',temp:'22.4 °C',alarm:false },
        { id:'GS-02',name:'Glass Store B',line:'L1',x:0.32,status:'idle',lot:null,wip:0,recipe:'—',temp:'22.1 °C',alarm:false },
        { id:'BUF-01',name:'Buffer Cassette',line:'L1',x:0.54,status:'running',lot:'LOT-A043',wip:18,recipe:'CASS-12',temp:'22.6 °C',alarm:false,kind:'buffer' },
        { id:'CL-01',name:'Ultrasonic Clean',line:'L2',x:0.16,status:'running',lot:'LOT-A043',wip:12,recipe:'CL-US-3',temp:'45.0 °C',alarm:false },
        { id:'CL-02',name:'SC1 Wet Clean',line:'L2',x:0.42,status:'processing',lot:'LOT-A042',wip:8,recipe:'CL-SC1-7',temp:'58.2 °C',alarm:false },
        { id:'INSP-A',name:'Pre-Dep AOI',line:'L2',x:0.72,status:'running',lot:'LOT-A041',wip:6,recipe:'AOI-PRE',temp:'24.0 °C',alarm:false,kind:'inspect' },
      ],
    },
  },
  'B2-DEP': {
    name: 'Thin Film Deposition', code: 'B2', short: 'Deposition',
    role: 'CVD · PVD · Annealing',
    gx: 5.5, gy: 0, gw: 5, gd: 3.5, gh: 3.4,
    status: 'hold', lots: 4, panels: 30, alarms: 1, util: 62,
    color: { roof: '#E5E9EE', wall: '#F1F4F8', side: '#C2C9D2', accent: '#0EA5E9' },
    rooftop: ['stack', 'stack', 'ahu'],
    interior: {
      label: 'B2 — Thin Film Deposition',
      lines: [
        { id: 'L1', label: 'CVD Chambers', y: 0.18 },
        { id: 'L2', label: 'PVD Chambers', y: 0.62 },
      ],
      equipment: [
        { id:'CVD-01',name:'CVD Chamber A',line:'L1',x:0.10,status:'hold',lot:'LOT-A042',wip:6,recipe:'R-007-v3',temp:'342.1 °C',press:'2.18 mTorr',alarm:true,kind:'chamber' },
        { id:'CVD-02',name:'CVD Chamber B',line:'L1',x:0.34,status:'running',lot:'LOT-A041',wip:10,recipe:'R-006-v2',temp:'338.8 °C',press:'2.21 mTorr',alarm:false,kind:'chamber' },
        { id:'CVD-03',name:'CVD Chamber C',line:'L1',x:0.58,status:'running',lot:'LOT-A040',wip:12,recipe:'R-006-v2',temp:'339.5 °C',press:'2.20 mTorr',alarm:false,kind:'chamber' },
        { id:'BUF-D',name:'Dep Buffer',line:'L1',x:0.82,status:'running',lot:'LOT-A040',wip:14,recipe:'CASS-08',temp:'24.0 °C',alarm:false,kind:'buffer' },
        { id:'PVD-01',name:'PVD Unit 1',line:'L2',x:0.14,status:'running',lot:'LOT-A039',wip:14,recipe:'P-103-v1',temp:'285.0 °C',press:'1.92 mTorr',alarm:false,kind:'chamber' },
        { id:'PVD-02',name:'PVD Unit 2',line:'L2',x:0.40,status:'idle',lot:null,wip:0,recipe:'—',temp:'24.5 °C',alarm:false,kind:'chamber' },
        { id:'INSP-D',name:'Post-Dep SEM',line:'L2',x:0.68,status:'processing',lot:'LOT-A039',wip:4,recipe:'SEM-Q1',temp:'24.0 °C',alarm:false,kind:'inspect' },
      ],
    },
  },
  'B3-LITHO': {
    name: 'Photolithography', code: 'B3', short: 'Litho',
    role: 'Coater · Stepper · Develop',
    gx: 11.5, gy: 0, gw: 4.5, gd: 3.5, gh: 2.8,
    status: 'running', lots: 4, panels: 66, alarms: 0, util: 91,
    color: { roof: '#FEF3C7', wall: '#FFFBEB', side: '#FDE68A', accent: '#D97706' },
    rooftop: ['ahu', 'ahu'],
    interior: {
      label: 'B3 — Photolithography (Yellow Room)',
      lines: [
        { id: 'L1', label: 'Coat & Expose', y: 0.18 },
        { id: 'L2', label: 'Develop & Bake', y: 0.62 },
      ],
      equipment: [
        { id:'PR-01',name:'Coater 1',line:'L1',x:0.08,status:'running',lot:'LOT-A039',wip:18,recipe:'PR-95B',temp:'90.0 °C',alarm:false },
        { id:'EX-01',name:'Stepper A',line:'L1',x:0.34,status:'running',lot:'LOT-A038',wip:20,recipe:'EX-220',temp:'23.0 °C',alarm:false },
        { id:'EX-02',name:'Stepper B',line:'L1',x:0.62,status:'processing',lot:'LOT-A037',wip:16,recipe:'EX-220',temp:'23.0 °C',alarm:false },
        { id:'DV-01',name:'Developer 1',line:'L2',x:0.16,status:'running',lot:'LOT-A036',wip:12,recipe:'DV-A',temp:'23.0 °C',alarm:false },
        { id:'BK-01',name:'Hard Bake',line:'L2',x:0.46,status:'running',lot:'LOT-A035',wip:10,recipe:'BK-110',temp:'110.0 °C',alarm:false },
        { id:'AOI-L',name:'Litho AOI',line:'L2',x:0.74,status:'running',lot:'LOT-A035',wip:8,recipe:'AOI-LIT',temp:'23.0 °C',alarm:false,kind:'inspect' },
      ],
    },
  },
  'B4-ETCH': {
    name: 'Etching & Strip', code: 'B4', short: 'Etch',
    role: 'Wet & Dry Etch Chambers',
    gx: 0, gy: 6, gw: 4.5, gd: 3.5, gh: 2.6,
    status: 'alarm', lots: 2, panels: 10, alarms: 1, util: 35,
    color: { roof: '#FEE2E2', wall: '#FEF2F2', side: '#FCA5A5', accent: '#DC2626' },
    rooftop: ['stack', 'ahu'],
    interior: {
      label: 'B4 — Etching & Strip',
      lines: [
        { id: 'L1', label: 'Dry Etch Chambers', y: 0.18 },
        { id: 'L2', label: 'Wet Etch & Strip',  y: 0.62 },
      ],
      equipment: [
        { id:'ET-01',name:'Etch Chamber A',line:'L1',x:0.12,status:'running',lot:'LOT-A035',wip:10,recipe:'ET-DRY-3',temp:'180 °C',press:'25 mTorr',alarm:false,kind:'chamber' },
        { id:'ET-02',name:'Etch Chamber B',line:'L1',x:0.40,status:'alarm',lot:'LOT-A034',wip:0,recipe:'ET-DRY-3',temp:'196 °C',press:'31 mTorr',alarm:true,kind:'chamber' },
        { id:'ET-03',name:'Etch Chamber C',line:'L1',x:0.68,status:'idle',lot:null,wip:0,recipe:'—',temp:'24 °C',alarm:false,kind:'chamber' },
        { id:'WS-01',name:'Wet Strip',line:'L2',x:0.18,status:'running',lot:'LOT-A033',wip:8,recipe:'WS-3',temp:'65 °C',alarm:false },
        { id:'RS-01',name:'Rinse Spin',line:'L2',x:0.50,status:'running',lot:'LOT-A033',wip:8,recipe:'RS-A',temp:'24 °C',alarm:false },
        { id:'AOI-E',name:'Post-Etch AOI',line:'L2',x:0.78,status:'processing',lot:'LOT-A032',wip:6,recipe:'AOI-ET',temp:'24 °C',alarm:false,kind:'inspect' },
      ],
    },
  },
  'B5-CELL': {
    name: 'Cell & Module Assembly', code: 'B5', short: 'Cell · Module',
    role: 'LC Fill · Seal · Driver IC',
    gx: 5.5, gy: 6, gw: 6, gd: 3.5, gh: 2.2,
    status: 'running', lots: 6, panels: 92, alarms: 0, util: 85,
    color: { roof: '#E0E7FF', wall: '#EEF2FF', side: '#C7D2FE', accent: '#6366F1' },
    rooftop: ['ahu', 'ahu', 'vent'],
    interior: {
      label: 'B5 — Cell & Module Assembly',
      lines: [
        { id: 'L1', label: 'Cell Assembly',   y: 0.18 },
        { id: 'L2', label: 'Module Assembly', y: 0.62 },
      ],
      equipment: [
        { id:'CA-01',name:'LC Fill A',line:'L1',x:0.08,status:'running',lot:'LOT-A033',wip:22,recipe:'LC-A1',temp:'24 °C',alarm:false },
        { id:'CA-02',name:'LC Fill B',line:'L1',x:0.28,status:'running',lot:'LOT-A032',wip:18,recipe:'LC-A1',temp:'24 °C',alarm:false },
        { id:'CA-03',name:'Seal Press',line:'L1',x:0.50,status:'processing',lot:'LOT-A031',wip:12,recipe:'SP-220',temp:'90 °C',alarm:false },
        { id:'CA-04',name:'ODF Unit',line:'L1',x:0.72,status:'idle',lot:null,wip:0,recipe:'—',temp:'24 °C',alarm:false },
        { id:'MA-01',name:'Driver IC Bond',line:'L2',x:0.10,status:'running',lot:'LOT-A030',wip:16,recipe:'DIC-A',temp:'180 °C',alarm:false },
        { id:'MA-02',name:'COG Bonder',line:'L2',x:0.34,status:'processing',lot:'LOT-A029',wip:10,recipe:'COG-2',temp:'200 °C',alarm:false },
        { id:'MA-03',name:'FPC Attach',line:'L2',x:0.58,status:'running',lot:'LOT-A028',wip:14,recipe:'FPC-A',temp:'160 °C',alarm:false },
        { id:'AOI-M',name:'Module AOI',line:'L2',x:0.82,status:'running',lot:'LOT-A028',wip:8,recipe:'AOI-MOD',temp:'24 °C',alarm:false,kind:'inspect' },
      ],
    },
  },
  'B6-QC': {
    name: 'Aging & Final QC', code: 'B6', short: 'Aging · QC',
    role: 'Burn-in · Test · Pack',
    gx: 12.5, gy: 6, gw: 4.5, gd: 3.5, gh: 2.0,
    status: 'running', lots: 6, panels: 168, alarms: 0, util: 88,
    color: { roof: '#DCFCE7', wall: '#F0FDF4', side: '#86EFAC', accent: '#16A34A' },
    rooftop: ['ahu'],
    interior: {
      label: 'B6 — Aging & Final QC',
      lines: [
        { id: 'L1', label: 'Aging / Burn-in',   y: 0.16 },
        { id: 'L2', label: 'Test & Inspection', y: 0.46 },
        { id: 'L3', label: 'Pack & Ship',       y: 0.78 },
      ],
      equipment: [
        { id:'AG-01',name:'Burn-in Rack A',line:'L1',x:0.14,status:'running',lot:'LOT-A027',wip:48,recipe:'AG-12H',temp:'60 °C',alarm:false,kind:'rack' },
        { id:'AG-02',name:'Burn-in Rack B',line:'L1',x:0.52,status:'hold',lot:'LOT-A026',wip:24,recipe:'AG-12H',temp:'60 °C',alarm:false,kind:'rack' },
        { id:'QC-01',name:'Visual Inspect',line:'L2',x:0.10,status:'running',lot:'LOT-A025',wip:30,recipe:'QC-VI',temp:'24 °C',alarm:false,kind:'inspect' },
        { id:'QC-02',name:'Electrical Test',line:'L2',x:0.40,status:'running',lot:'LOT-A024',wip:26,recipe:'QC-ET',temp:'24 °C',alarm:false,kind:'inspect' },
        { id:'QC-03',name:'Optical Test',line:'L2',x:0.70,status:'processing',lot:'LOT-A023',wip:20,recipe:'QC-OT',temp:'24 °C',alarm:false,kind:'inspect' },
        { id:'PK-01',name:'Pack & Ship',line:'L3',x:0.42,status:'complete',lot:'LOT-A022',wip:60,recipe:'PK-A',temp:'24 °C',alarm:false },
      ],
    },
  },
};

const FLOW_ORDER = ['B1-INPUT','B2-DEP','B3-LITHO','B4-ETCH','B5-CELL','B6-QC'];

const CONVEYORS = [
  { from: 'B1-INPUT', to: 'B2-DEP' },
  { from: 'B2-DEP',   to: 'B3-LITHO' },
  { from: 'B3-LITHO', to: 'B4-ETCH' },
  { from: 'B4-ETCH',  to: 'B5-CELL' },
  { from: 'B5-CELL',  to: 'B6-QC' },
];

/* ═══ Iso building primitive (MEMOIZED) ═══════════════════════ */
const IsoBuilding = memo(function IsoBuilding({ b, id, hovered, selected, onEnter, onLeave, onClick }) {
  const accent = b.color.accent;
  const stColor = STATUS[b.status]?.dot || '#BBB';

  // Footprint corners at z=0 (slab) and at gh (roof)
  const c0 = iso(b.gx,           b.gy);
  const c1 = iso(b.gx + b.gw,    b.gy);
  const c2 = iso(b.gx + b.gw,    b.gy + b.gd);
  const c3 = iso(b.gx,           b.gy + b.gd);
  const r0 = iso(b.gx,           b.gy,           b.gh);
  const r1 = iso(b.gx + b.gw,    b.gy,           b.gh);
  const r2 = iso(b.gx + b.gw,    b.gy + b.gd,    b.gh);
  const r3 = iso(b.gx,           b.gy + b.gd,    b.gh);

  // Visible faces
  const rightWall = `${c1.x},${c1.y} ${c2.x},${c2.y} ${r2.x},${r2.y} ${r1.x},${r1.y}`;
  const frontWall = `${c2.x},${c2.y} ${c3.x},${c3.y} ${r3.x},${r3.y} ${r2.x},${r2.y}`;
  const roof      = `${r0.x},${r0.y} ${r1.x},${r1.y} ${r2.x},${r2.y} ${r3.x},${r3.y}`;

  // Center of roof for label/pin
  const cx = (r0.x + r2.x) / 2;
  const cy = (r0.y + r2.y) / 2;

  // Window bands: subdivide front wall into horizontal stripes
  const winBands = [];
  const bands = b.gh > 2.5 ? 3 : 2;
  for (let i = 0; i < bands; i++) {
    const z1 = (i + 0.3) * (b.gh / bands);
    const z2 = (i + 0.7) * (b.gh / bands);
    const fA = iso(b.gx + b.gw,        b.gy + b.gd, z1);
    const fB = iso(b.gx,               b.gy + b.gd, z1);
    const fC = iso(b.gx,               b.gy + b.gd, z2);
    const fD = iso(b.gx + b.gw,        b.gy + b.gd, z2);
    winBands.push(`${fA.x},${fA.y} ${fB.x},${fB.y} ${fC.x},${fC.y} ${fD.x},${fD.y}`);
  }

  // Vertical mullions on front wall (panels)
  const mullions = [];
  const cols = Math.max(3, Math.round(b.gw * 1.2));
  for (let i = 1; i < cols; i++) {
    const t = i / cols;
    const gxAt = b.gx + b.gw * t;
    const m0 = iso(gxAt, b.gy + b.gd, 0);
    const m1 = iso(gxAt, b.gy + b.gd, b.gh);
    mullions.push({ x1: m0.x, y1: m0.y, x2: m1.x, y2: m1.y });
  }
  // Right wall mullions
  const rightMull = [];
  const rowsR = Math.max(2, Math.round(b.gd * 1.0));
  for (let i = 1; i < rowsR; i++) {
    const t = i / rowsR;
    const gyAt = b.gy + b.gd * t;
    const m0 = iso(b.gx + b.gw, gyAt, 0);
    const m1 = iso(b.gx + b.gw, gyAt, b.gh);
    rightMull.push({ x1: m0.x, y1: m0.y, x2: m1.x, y2: m1.y });
  }

  // Roof ridge & detail
  const ridgeStart = iso(b.gx + 0.3, b.gy + 0.3, b.gh + 0.05);
  const ridgeEnd   = iso(b.gx + b.gw - 0.3, b.gy + 0.3, b.gh + 0.05);

  // Rooftop equipment positions (sequenced along x at y=mid)
  const rooftopEquip = (b.rooftop || []).map((kind, i) => {
    const t = (i + 0.5) / (b.rooftop.length || 1);
    return { kind, gx: b.gx + b.gw * t, gy: b.gy + b.gd * 0.4, gz: b.gh + 0.08 };
  });

  // Halo for selected
  const showHalo = selected || hovered;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onEnter(id)}
      onMouseLeave={() => onLeave(id)}
      onClick={(e) => { e.stopPropagation(); onClick(id); }}
    >
      {/* Ground shadow */}
      <polygon
        points={`${c0.x + 2},${c0.y + 4} ${c1.x + 2},${c1.y + 4} ${c2.x + 2},${c2.y + 4} ${c3.x + 2},${c3.y + 4}`}
        fill="rgba(0,0,0,0.10)"
      />

      {/* Selection halo - subtle outline around footprint at ground */}
      {showHalo && (
        <polygon
          points={`${c0.x},${c0.y} ${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}`}
          fill="none" stroke={accent} strokeWidth="1.4"
          strokeDasharray="4 3" opacity="0.55"
        />
      )}

      {/* FRONT wall (down-facing) — slightly darker */}
      <polygon points={frontWall}
        fill={b.color.side}
        stroke={accent} strokeWidth={hovered || selected ? 1.0 : 0.5}
        strokeOpacity={hovered || selected ? 0.9 : 0.35}
        strokeLinejoin="round" />

      {/* Window bands on front */}
      {winBands.map((pts, i) => (
        <polygon key={`w${i}`} points={pts}
          fill="rgba(255,255,255,0.45)" opacity="0.75" />
      ))}

      {/* Mullions on front */}
      {mullions.map((m, i) => (
        <line key={`mf${i}`} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke={accent} strokeWidth="0.35" opacity="0.25" />
      ))}

      {/* RIGHT wall — mid */}
      <polygon points={rightWall}
        fill={b.color.wall}
        stroke={accent} strokeWidth={hovered || selected ? 1.0 : 0.5}
        strokeOpacity={hovered || selected ? 0.9 : 0.35}
        strokeLinejoin="round" />

      {rightMull.map((m, i) => (
        <line key={`mr${i}`} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke={accent} strokeWidth="0.3" opacity="0.2" />
      ))}

      {/* ROOF */}
      <polygon points={roof}
        fill={hovered ? '#FFFFFF' : b.color.roof}
        stroke={accent} strokeWidth={hovered || selected ? 1.2 : 0.6}
        strokeOpacity={hovered || selected ? 0.9 : 0.4}
        strokeLinejoin="round" />

      {/* Roof ridge line */}
      <line x1={ridgeStart.x} y1={ridgeStart.y} x2={ridgeEnd.x} y2={ridgeEnd.y}
        stroke={accent} strokeWidth="0.5" opacity="0.3" />

      {/* Roof inset rectangle (suggests skylight or panels) */}
      {(() => {
        const inset = 0.4;
        const i0 = iso(b.gx + inset, b.gy + inset, b.gh + 0.02);
        const i1 = iso(b.gx + b.gw - inset, b.gy + inset, b.gh + 0.02);
        const i2 = iso(b.gx + b.gw - inset, b.gy + b.gd - inset, b.gh + 0.02);
        const i3 = iso(b.gx + inset, b.gy + b.gd - inset, b.gh + 0.02);
        return (
          <polygon
            points={`${i0.x},${i0.y} ${i1.x},${i1.y} ${i2.x},${i2.y} ${i3.x},${i3.y}`}
            fill="none" stroke={accent} strokeWidth="0.3" opacity="0.35"
            strokeDasharray="2 2"
          />
        );
      })()}

      {/* Status accent bar across front-bottom edge of roof */}
      {(() => {
        const e0 = iso(b.gx,        b.gy + b.gd, b.gh + 0.04);
        const e1 = iso(b.gx + b.gw, b.gy + b.gd, b.gh + 0.04);
        return (
          <line x1={e0.x} y1={e0.y} x2={e1.x} y2={e1.y}
            stroke={stColor} strokeWidth="2.2"
            opacity={b.status === 'idle' ? 0.4 : 0.95}
            strokeLinecap="round"
          />
        );
      })()}

      {/* Rooftop equipment (AHUs, vents, stacks) */}
      {rooftopEquip.map((eq, i) => {
        const p = iso(eq.gx, eq.gy, eq.gz);
        if (eq.kind === 'ahu') {
          // Squat box
          return (
            <g key={`re${i}`}>
              <rect x={p.x - 8} y={p.y - 5} width="16" height="6" rx="1.5"
                fill="#E0E0DC" stroke="#888" strokeWidth="0.4" />
              <line x1={p.x - 8} y1={p.y - 1.5} x2={p.x + 8} y2={p.y - 1.5}
                stroke="#888" strokeWidth="0.3" />
            </g>
          );
        }
        if (eq.kind === 'vent') {
          return (
            <g key={`re${i}`}>
              <ellipse cx={p.x} cy={p.y - 1} rx="3.5" ry="1.4" fill="#CCC" stroke="#666" strokeWidth="0.4" />
              <ellipse cx={p.x} cy={p.y - 4} rx="3.5" ry="1.4" fill="#FFF" stroke="#666" strokeWidth="0.4" />
            </g>
          );
        }
        if (eq.kind === 'stack') {
          return (
            <g key={`re${i}`}>
              <rect x={p.x - 1.5} y={p.y - 14} width="3" height="14"
                fill="#888" stroke="#444" strokeWidth="0.3" />
              <rect x={p.x - 2} y={p.y - 16} width="4" height="2.5"
                fill="#666" />
            </g>
          );
        }
        return null;
      })}

      {/* Building code badge on roof */}
      <g transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: 'none' }}>
        <rect x={-15} y={-10} width={30} height={18} rx={4}
          fill="#FFFFFF" stroke={accent} strokeWidth="0.9" />
        <text x={0} y={2}
          fontFamily="'DM Mono', monospace" fontSize="10" fontWeight="500"
          fill="#1A1A1A" textAnchor="middle">{b.code}</text>
      </g>

      {/* Alarm pulse pin on top-right corner */}
      {b.alarms > 0 && (() => {
        const p = iso(b.gx + b.gw - 0.3, b.gy + 0.3, b.gh + 0.3);
        return (
          <g transform={`translate(${p.x}, ${p.y})`} style={{ pointerEvents: 'none' }}>
            <line x1="0" y1="0" x2="0" y2="-10" stroke="#EF4444" strokeWidth="1" />
            <circle cx="0" cy="-13" r="5" fill="#EF4444" />
            <circle cx="0" cy="-13" r="5" fill="none" stroke="#EF4444" strokeWidth="1.2" opacity="0.5">
              <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="-10.5"
              fontFamily="'DM Mono',monospace" fontSize="7" fontWeight="600"
              fill="#FFF" textAnchor="middle">{b.alarms}</text>
          </g>
        );
      })()}

      {/* Status pin on roof centerleft */}
      {(() => {
        const p = iso(b.gx + 0.5, b.gy + 0.5, b.gh + 0.05);
        return (
          <g transform={`translate(${p.x}, ${p.y})`} style={{ pointerEvents: 'none' }}>
            <circle r="3" fill={stColor} stroke="#FFF" strokeWidth="0.8" />
            {b.status !== 'idle' && (
              <circle r="3" fill="none" stroke={stColor} strokeWidth="0.8" opacity="0.6">
                <animate attributeName="r" values="3;6;3" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.6s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })()}
    </g>
  );
});

/* ═══ Plinth + corridor pieces ════════════════════════════════ */
function PlantPlinth() {
  const p = PLANT.plinth;
  const c0 = iso(p.gx,           p.gy);
  const c1 = iso(p.gx + p.gw,    p.gy);
  const c2 = iso(p.gx + p.gw,    p.gy + p.gd);
  const c3 = iso(p.gx,           p.gy + p.gd);
  const t0 = iso(p.gx,           p.gy,           p.gh);
  const t1 = iso(p.gx + p.gw,    p.gy,           p.gh);
  const t2 = iso(p.gx + p.gw,    p.gy + p.gd,    p.gh);
  const t3 = iso(p.gx,           p.gy + p.gd,    p.gh);

  return (
    <g>
      {/* Front wall of plinth */}
      <polygon points={`${c2.x},${c2.y} ${c3.x},${c3.y} ${t3.x},${t3.y} ${t2.x},${t2.y}`}
        fill="#D8D8D2" stroke="#A8A8A4" strokeWidth="0.5" />
      {/* Right wall */}
      <polygon points={`${c1.x},${c1.y} ${c2.x},${c2.y} ${t2.x},${t2.y} ${t1.x},${t1.y}`}
        fill="#C8C8C4" stroke="#A8A8A4" strokeWidth="0.5" />
      {/* Top */}
      <polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`}
        fill="#EAEAE6" stroke="#BBB" strokeWidth="0.5" />
    </g>
  );
}

function Corridor({ c }) {
  const x0 = iso(c.gx,         c.gy);
  const x1 = iso(c.gx + c.gw,  c.gy);
  const x2 = iso(c.gx + c.gw,  c.gy + c.gd);
  const x3 = iso(c.gx,         c.gy + c.gd);
  const y0 = iso(c.gx,         c.gy,         c.gh);
  const y1 = iso(c.gx + c.gw,  c.gy,         c.gh);
  const y2 = iso(c.gx + c.gw,  c.gy + c.gd,  c.gh);
  const y3 = iso(c.gx,         c.gy + c.gd,  c.gh);
  return (
    <g>
      <polygon points={`${x2.x},${x2.y} ${x3.x},${x3.y} ${y3.x},${y3.y} ${y2.x},${y2.y}`}
        fill="#E8E8E4" stroke="#B8B8B4" strokeWidth="0.4" />
      <polygon points={`${x1.x},${x1.y} ${x2.x},${x2.y} ${y2.x},${y2.y} ${y1.x},${y1.y}`}
        fill="#D8D8D4" stroke="#B8B8B4" strokeWidth="0.4" />
      <polygon points={`${y0.x},${y0.y} ${y1.x},${y1.y} ${y2.x},${y2.y} ${y3.x},${y3.y}`}
        fill="#FFFFFF" stroke="#CCCCC8" strokeWidth="0.5" />
    </g>
  );
}

/* ═══ Utility (towers, gas yard, tanks, hvac) ═════════════════ */
function Utility({ u }) {
  if (u.kind === 'tower') {
    // Cooling tower: cylinder
    const baseC = iso(u.gx, u.gy, 0);
    const topC  = iso(u.gx, u.gy, 2.6);
    return (
      <g style={{ pointerEvents: 'none' }}>
        <ellipse cx={baseC.x} cy={baseC.y} rx="9" ry="3.5" fill="#C8C8C4" stroke="#888" strokeWidth="0.4" />
        <rect x={baseC.x - 9} y={topC.y} width="18" height={baseC.y - topC.y} fill="#E0E0DC" stroke="#888" strokeWidth="0.4" />
        <ellipse cx={topC.x} cy={topC.y} rx="9" ry="3.5" fill="#FAFAF7" stroke="#666" strokeWidth="0.4" />
        <ellipse cx={topC.x} cy={topC.y - 1} rx="6" ry="2.2" fill="#FFF" stroke="#888" strokeWidth="0.3" />
        {/* Fan grille */}
        <line x1={topC.x - 5} y1={topC.y - 1} x2={topC.x + 5} y2={topC.y - 1} stroke="#888" strokeWidth="0.4" />
        <line x1={topC.x} y1={topC.y - 3} x2={topC.x} y2={topC.y + 1} stroke="#888" strokeWidth="0.4" />
        <text x={topC.x} y={topC.y - 7}
          fontFamily="'DM Mono',monospace" fontSize="6" fill="#888" textAnchor="middle">{u.label}</text>
      </g>
    );
  }
  if (u.kind === 'gasyard') {
    // Cluster of small box tanks
    const elements = [];
    for (let i = 0; i < 3; i++) {
      const cx = u.gx + (i * 0.4);
      const cy = u.gy + (i % 2 ? 0.5 : 0);
      const a = iso(cx, cy);
      const b = iso(cx + 0.35, cy);
      const c = iso(cx + 0.35, cy + 0.35);
      const d = iso(cx, cy + 0.35);
      const at = iso(cx, cy, 0.7);
      const bt = iso(cx + 0.35, cy, 0.7);
      const ct = iso(cx + 0.35, cy + 0.35, 0.7);
      const dt = iso(cx, cy + 0.35, 0.7);
      elements.push(
        <g key={`gy${i}`}>
          <polygon points={`${c.x},${c.y} ${d.x},${d.y} ${dt.x},${dt.y} ${ct.x},${ct.y}`}
            fill="#DDD" stroke="#888" strokeWidth="0.4" />
          <polygon points={`${b.x},${b.y} ${c.x},${c.y} ${ct.x},${ct.y} ${bt.x},${bt.y}`}
            fill="#CCC" stroke="#888" strokeWidth="0.4" />
          <polygon points={`${at.x},${at.y} ${bt.x},${bt.y} ${ct.x},${ct.y} ${dt.x},${dt.y}`}
            fill="#FAFAF7" stroke="#888" strokeWidth="0.4" />
        </g>
      );
    }
    const lblP = iso(u.gx + 0.4, u.gy + 1.1, 0);
    return (
      <g style={{ pointerEvents: 'none' }}>
        {elements}
        <text x={lblP.x} y={lblP.y + 8}
          fontFamily="'DM Mono',monospace" fontSize="6" fill="#888" textAnchor="middle">GAS YARD</text>
      </g>
    );
  }
  if (u.kind === 'tanks') {
    // 2 horizontal cylinder tanks
    const elements = [];
    for (let i = 0; i < 2; i++) {
      const cx = u.gx, cy = u.gy + i * 0.8;
      const left = iso(cx, cy + 0.2, 0.4);
      const right = iso(cx + 1.0, cy + 0.2, 0.4);
      elements.push(
        <g key={`tk${i}`}>
          <line x1={left.x} y1={left.y} x2={right.x} y2={right.y}
            stroke="#CCC" strokeWidth="9" strokeLinecap="round" />
          <line x1={left.x} y1={left.y} x2={right.x} y2={right.y}
            stroke="#888" strokeWidth="0.4" />
          <ellipse cx={right.x} cy={right.y} rx="1.8" ry="4.5"
            fill="#FAFAF7" stroke="#666" strokeWidth="0.4" />
        </g>
      );
    }
    const lblP = iso(u.gx + 0.5, u.gy + 1.8, 0);
    return (
      <g style={{ pointerEvents: 'none' }}>
        {elements}
        <text x={lblP.x} y={lblP.y + 8}
          fontFamily="'DM Mono',monospace" fontSize="6" fill="#888" textAnchor="middle">SOLVENTS</text>
      </g>
    );
  }
  if (u.kind === 'hvac') {
    // Series of AHU boxes
    const elements = [];
    for (let i = 0; i < 3; i++) {
      const cx = u.gx, cy = u.gy + i * 0.6;
      const a = iso(cx, cy, 0);
      const b = iso(cx + 1.2, cy, 0);
      const c = iso(cx + 1.2, cy + 0.45, 0);
      const d = iso(cx, cy + 0.45, 0);
      const at = iso(cx, cy, 0.7);
      const bt = iso(cx + 1.2, cy, 0.7);
      const ct = iso(cx + 1.2, cy + 0.45, 0.7);
      const dt = iso(cx, cy + 0.45, 0.7);
      elements.push(
        <g key={`hv${i}`}>
          <polygon points={`${c.x},${c.y} ${d.x},${d.y} ${dt.x},${dt.y} ${ct.x},${ct.y}`}
            fill="#D8D8D4" stroke="#888" strokeWidth="0.4" />
          <polygon points={`${b.x},${b.y} ${c.x},${c.y} ${ct.x},${ct.y} ${bt.x},${bt.y}`}
            fill="#C8C8C4" stroke="#888" strokeWidth="0.4" />
          <polygon points={`${at.x},${at.y} ${bt.x},${bt.y} ${ct.x},${ct.y} ${dt.x},${dt.y}`}
            fill="#EAEAE6" stroke="#888" strokeWidth="0.4" />
        </g>
      );
    }
    const lblP = iso(u.gx + 0.6, u.gy + 2.2, 0);
    return (
      <g style={{ pointerEvents: 'none' }}>
        {elements}
        <text x={lblP.x} y={lblP.y + 8}
          fontFamily="'DM Mono',monospace" fontSize="6" fill="#888" textAnchor="middle">HVAC PLANT</text>
      </g>
    );
  }
  return null;
}

/* ═══ Pipe run between two iso points ═════════════════════════ */
function PipeRun({ from, to }) {
  const p0 = iso(from.gx, from.gy, from.gz);
  const p1 = iso(to.gx, to.gy, to.gz);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
        stroke="#A8A8A4" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y}
        stroke="#FFFFFF" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />
      <circle cx={p0.x} cy={p0.y} r="1.6" fill="#888" />
      <circle cx={p1.x} cy={p1.y} r="1.6" fill="#888" />
    </g>
  );
}

/* ═══ Overview SVG ════════════════════════════════════════════ */
function FactoryOverview({ onSelectBuilding, hoveredId, selectedId, onEnter, onLeave }) {
  // Compute viewBox bounds from all visible elements
  const allBuildings = Object.entries(BUILDINGS);
  const pts = [];
  // Plinth corners
  const p = PLANT.plinth;
  [
    iso(p.gx, p.gy), iso(p.gx + p.gw, p.gy),
    iso(p.gx + p.gw, p.gy + p.gd), iso(p.gx, p.gy + p.gd),
  ].forEach(pt => pts.push(pt));
  // Building tops
  allBuildings.forEach(([_, b]) => {
    pts.push(iso(b.gx, b.gy, b.gh));
    pts.push(iso(b.gx + b.gw, b.gy + b.gd, b.gh));
  });
  // Tower tops
  PLANT.utilities.filter(u => u.kind === 'tower').forEach(u => {
    pts.push(iso(u.gx, u.gy, 3.0));
  });

  const minX = Math.min(...pts.map(p => p.x)) - 30;
  const maxX = Math.max(...pts.map(p => p.x)) + 30;
  const minY = Math.min(...pts.map(p => p.y)) - 30;
  const maxY = Math.max(...pts.map(p => p.y)) + 40;

  // Conveyor path generator (overhead between buildings)
  function conveyorPath(fromKey, toKey) {
    const a = BUILDINGS[fromKey], b = BUILDINGS[toKey];
    const ax = a.gx + a.gw, ay = a.gy + a.gd / 2;
    const bx = b.gx,        by = b.gy + b.gd / 2;
    if (Math.abs(ay - by) > 1.5) {
      const midY = 4.6;
      const p0 = iso(ax,            ay,         0.7);
      const p1 = iso(ax + 0.5,      ay,         0.7);
      const p2 = iso(ax + 0.5,      midY,       0.7);
      const p3 = iso(bx - 0.5,      midY,       0.7);
      const p4 = iso(bx - 0.5,      by,         0.7);
      const p5 = iso(bx,            by,         0.7);
      return `M ${p0.x},${p0.y} L ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} L ${p4.x},${p4.y} L ${p5.x},${p5.y}`;
    }
    const p0 = iso(ax, ay, 0.7), p1 = iso(bx, by, 0.7);
    return `M ${p0.x},${p0.y} L ${p1.x},${p1.y}`;
  }

  // Painter order: back (smaller gx+gy) drawn first
  const sortedBuildings = allBuildings.slice().sort((a, b) => (a[1].gx + a[1].gy) - (b[1].gx + b[1].gy));

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Iso ground tile pattern */}
        <pattern id="iso-grid" x="0" y="0" width={ISO_TX * 2} height={ISO_TY * 2} patternUnits="userSpaceOnUse">
          <path d={`M 0 ${ISO_TY} L ${ISO_TX} 0 L ${ISO_TX * 2} ${ISO_TY} L ${ISO_TX} ${ISO_TY * 2} Z`}
            fill="none" stroke="#E0E0DC" strokeWidth="0.35" opacity="0.7" />
        </pattern>
        {/* Soft radial vignette */}
        <radialGradient id="map-vignette" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#E8E8E4" stopOpacity="0.4" />
        </radialGradient>
        {/* Conveyor arrow */}
        <marker id="conv-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#1A1A1A" opacity="0.65" />
        </marker>
        {/* Drop shadow */}
        <filter id="building-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer><feFuncA type="linear" slope="0.15" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background vignette + grid */}
      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#map-vignette)" />

      {/* Outer plot — concrete plinth */}
      <PlantPlinth />

      {/* Iso grid overlay on plinth top */}
      {(() => {
        const p = PLANT.plinth;
        const t0 = iso(p.gx,           p.gy,           p.gh);
        const t1 = iso(p.gx + p.gw,    p.gy,           p.gh);
        const t2 = iso(p.gx + p.gw,    p.gy + p.gd,    p.gh);
        const t3 = iso(p.gx,           p.gy + p.gd,    p.gh);
        return (
          <polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`}
            fill="url(#iso-grid)" />
        );
      })()}

      {/* Plot dashed border */}
      {(() => {
        const p = PLANT.plinth;
        const t0 = iso(p.gx,           p.gy,           p.gh);
        const t1 = iso(p.gx + p.gw,    p.gy,           p.gh);
        const t2 = iso(p.gx + p.gw,    p.gy + p.gd,    p.gh);
        const t3 = iso(p.gx,           p.gy + p.gd,    p.gh);
        return (
          <polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`}
            fill="none" stroke="#A8A8A4" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.6" />
        );
      })()}

      {/* Compass + scale */}
      <g transform={`translate(${minX + 30}, ${minY + 30})`} style={{ pointerEvents: 'none' }}>
        <rect x="-18" y="-13" width="92" height="26" rx="4"
          fill="#FFFFFF" stroke="#E0E0DC" strokeWidth="0.5" opacity="0.95" />
        <circle r="9" cx="-3" fill="none" stroke="#E0E0DC" strokeWidth="0.6" />
        <line x1="-3" y1="-1" x2="-3" y2="-9" stroke="#1A1A1A" strokeWidth="0.9" />
        <line x1="-3" y1="1" x2="-3" y2="9" stroke="#888" strokeWidth="0.5" />
        <text x="-3" y="-3.5" fontFamily="'Inter',sans-serif" fontSize="6" fontWeight="700" fill="#1A1A1A" textAnchor="middle">N</text>
        <text x="11" y="-3" fontFamily="'DM Mono',monospace" fontSize="6.5" fontWeight="500" fill="#1A1A1A">FAB-A</text>
        <text x="11" y="4" fontFamily="'DM Mono',monospace" fontSize="6" fill="#888">FLOOR 1 · OPS</text>
      </g>

      {/* Corridors (drawn before buildings so building walls appear in front) */}
      {PLANT.corridors.map((c, i) => <Corridor key={`cor${i}`} c={c} />)}

      {/* Utilities (towers etc.) — drawn before buildings if they're behind */}
      {PLANT.utilities.filter(u => u.gy < 4).map((u, i) => <Utility key={`u${i}`} u={u} />)}

      {/* Buildings */}
      {sortedBuildings.map(([id, b]) => (
        <IsoBuilding
          key={id} id={id} b={b}
          hovered={hoveredId === id}
          selected={selectedId === id}
          onEnter={onEnter}
          onLeave={onLeave}
          onClick={onSelectBuilding}
        />
      ))}

      {/* Utilities behind/below */}
      {PLANT.utilities.filter(u => u.gy >= 4).map((u, i) => <Utility key={`ub${i}`} u={u} />)}

      {/* Conveyors (overhead) — between buildings */}
      {CONVEYORS.map((c, i) => (
        <g key={`conv${i}`} style={{ pointerEvents: 'none' }}>
          <path d={conveyorPath(c.from, c.to)} fill="none"
            stroke="#1A1A1A" strokeWidth="2.4" strokeLinecap="round"
            strokeLinejoin="round" opacity="0.10" />
          <path d={conveyorPath(c.from, c.to)} fill="none"
            stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round"
            strokeLinejoin="round" opacity="0.9" />
          <path d={conveyorPath(c.from, c.to)} fill="none"
            stroke="#1A1A1A" strokeWidth="0.9" strokeLinecap="round"
            strokeLinejoin="round" strokeDasharray="3 4"
            opacity="0.55" markerEnd="url(#conv-arrow)" />
        </g>
      ))}

      {/* Pipes (overhead crossings) */}
      {PLANT.pipes.map((p, i) => <PipeRun key={`pp${i}`} from={p.from} to={p.to} />)}

      {/* Floating label chips above each building */}
      {sortedBuildings.map(([id, b]) => {
        const top = iso(b.gx + b.gw / 2, b.gy + b.gd / 2, b.gh);
        const labelY = top.y - 28;
        const isHov = hoveredId === id;
        const stColor = STATUS[b.status].dot;
        return (
          <g key={`lbl-${id}`} style={{ pointerEvents: 'none' }}>
            {/* Connector tick */}
            <line x1={top.x} y1={top.y - 6} x2={top.x} y2={labelY + 6}
              stroke={isHov ? b.color.accent : '#BBB'} strokeWidth="0.6" opacity="0.7" />
            <rect x={top.x - 64} y={labelY - 9} width={128} height={18} rx={9}
              fill="#FFFFFF" stroke={isHov ? b.color.accent : '#E0E0DC'}
              strokeWidth={isHov ? 1.0 : 0.6} opacity="0.97" />
            <circle cx={top.x - 54} cy={labelY} r="3.2" fill={stColor} />
            <text x={top.x - 46} y={labelY + 3.5}
              fontFamily="'Inter',sans-serif" fontSize="9" fontWeight="600"
              fill="#1A1A1A" textAnchor="start">{b.short}</text>
            <text x={top.x + 58} y={labelY + 3.5}
              fontFamily="'DM Mono',monospace" fontSize="8.5" fontWeight="500"
              fill="#666" textAnchor="end">{b.lots}L · {b.panels}P</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ═══ Interior view (top-down BIM-style floor plan) ═══════════ */
function BuildingInterior({ buildingId, onSelectEquip, selectedId }) {
  const b = BUILDINGS[buildingId];
  if (!b) return null;
  const interior = b.interior;
  const W = 720, H = 400;
  const PAD = 32;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="floor-grid-sm" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#EEEEEA" strokeWidth="0.4" />
        </pattern>
        <pattern id="floor-grid-lg" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#DCDCD8" strokeWidth="0.6" />
        </pattern>
        <filter id="bldg-shadow-int" x="-5%" y="-5%" width="115%" height="115%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" />
          <feComponentTransfer><feFuncA type="linear" slope="0.12" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer wall: thick double line for cleanroom */}
      <rect x={PAD} y={PAD} width={innerW} height={innerH} rx="14"
        fill="#FAFAF7" stroke="#1A1A1A" strokeWidth="2.5"
        filter="url(#bldg-shadow-int)" />
      <rect x={PAD + 5} y={PAD + 5} width={innerW - 10} height={innerH - 10} rx="10"
        fill="none" stroke="#1A1A1A" strokeWidth="0.6" opacity="0.4" />

      {/* Grid backgrounds */}
      <rect x={PAD} y={PAD} width={innerW} height={innerH} rx="14" fill="url(#floor-grid-sm)" />
      <rect x={PAD} y={PAD} width={innerW} height={innerH} rx="14" fill="url(#floor-grid-lg)" />

      {/* Tinted accent overlay */}
      <rect x={PAD + 2} y={PAD + 2} width={innerW - 4} height={innerH - 4} rx="12"
        fill={b.color.wall} opacity="0.35" />

      {/* Loading docks (left = IN, right = OUT) */}
      {[
        { x: PAD - 8,             y: PAD + innerH * 0.45, label: 'IN' },
        { x: PAD + innerW - 6,    y: PAD + innerH * 0.45, label: 'OUT' },
      ].map((dock, i) => (
        <g key={`dock${i}`}>
          <rect x={dock.x} y={dock.y} width="14" height="40" rx="3"
            fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1.4" />
          <text x={dock.x + 7} y={dock.y + 24}
            fontFamily="'Inter',sans-serif" fontSize="7" fontWeight="700" fill="#888"
            textAnchor="middle"
            transform={`rotate(${i === 0 ? -90 : 90} ${dock.x + 7} ${dock.y + 24})`}>{dock.label}</text>
        </g>
      ))}

      {/* Production lines (aisle stripes) */}
      {interior.lines.map((ln) => {
        const ly = PAD + ln.y * innerH + 16;
        return (
          <g key={ln.id}>
            <rect x={PAD + 12} y={ly + 26} width={innerW - 24} height="5" rx="2.5"
              fill={b.color.accent} opacity="0.18" />
            <rect x={PAD + 12} y={ly + 26} width={innerW - 24} height="5" rx="2.5"
              fill="none" stroke={b.color.accent} opacity="0.35" strokeWidth="0.5" />
            <text x={PAD + 12} y={ly + 8}
              fontFamily="'Inter',sans-serif" fontSize="9" fontWeight="700"
              letterSpacing="0.08em" fill="#666">
              {ln.id} · {ln.label.toUpperCase()}
            </text>
            <line x1={PAD + 12} y1={ly + 13} x2={PAD + innerW - 12} y2={ly + 13}
              stroke="#CCCCCA" strokeWidth="0.5" strokeDasharray="2 3" />
          </g>
        );
      })}

      {/* Equipment modules */}
      {interior.equipment.map((e) => {
        const line = interior.lines.find(l => l.id === e.line);
        const ly = PAD + line.y * innerH + 16;
        const ex = PAD + e.x * innerW;
        const isSel = selectedId === e.id;
        const st = STATUS[e.status] || STATUS.idle;
        const kind = e.kind || 'machine';
        const w = 66, h = 52;

        return (
          <g key={e.id}
            style={{ cursor: 'pointer' }}
            onClick={(ev) => { ev.stopPropagation(); onSelectEquip(e); }}
          >
            {isSel && (
              <rect x={ex - 4} y={ly + 12 - 4} width={w + 8} height={h + 8} rx="10"
                fill="rgba(59,130,246,0.08)" stroke="#3B82F6" strokeWidth="1.4" />
            )}
            {/* Module body */}
            <rect x={ex} y={ly + 12} width={w} height={h} rx="6"
              fill="#FFFFFF" stroke={isSel ? b.color.accent : '#D4D4D0'}
              strokeWidth={isSel ? 1.6 : 1.0}
              filter="url(#bldg-shadow-int)" />
            {/* Status accent strip */}
            <rect x={ex} y={ly + 12} width={w} height="4" rx="2"
              fill={st.dot} opacity={e.status === 'idle' ? 0.4 : 0.95} />
            {/* Inner panel */}
            <rect x={ex + 4} y={ly + 18} width={w - 8} height={h - 22} rx="3"
              fill="#FAFAF7" stroke="#E8E8E4" strokeWidth="0.5" />

            {/* Kind icon (top-right) */}
            <g transform={`translate(${ex + w - 11}, ${ly + 23})`}>
              {kind === 'chamber' && (
                <g><circle r="3.8" fill="none" stroke="#888" strokeWidth="0.8" />
                   <circle r="1.5" fill="#888" /></g>
              )}
              {kind === 'inspect' && (
                <g><circle r="3" fill="none" stroke="#888" strokeWidth="0.8" />
                   <line x1="2.2" y1="2.2" x2="4.5" y2="4.5" stroke="#888" strokeWidth="1" /></g>
              )}
              {kind === 'buffer' && (
                <g><rect x="-3.5" y="-3.5" width="7" height="7" rx="1" fill="none" stroke="#888" strokeWidth="0.8" />
                   <line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#888" strokeWidth="0.6" /></g>
              )}
              {kind === 'rack' && (
                <g><rect x="-4" y="-4" width="8" height="2" rx="0.5" fill="none" stroke="#888" strokeWidth="0.6" />
                   <rect x="-4" y="-1" width="8" height="2" rx="0.5" fill="none" stroke="#888" strokeWidth="0.6" />
                   <rect x="-4" y="2" width="8" height="2" rx="0.5" fill="none" stroke="#888" strokeWidth="0.6" /></g>
              )}
            </g>

            {/* Equipment ID */}
            <text x={ex + 6} y={ly + 27}
              fontFamily="'DM Mono',monospace" fontSize="8" fontWeight="600" fill="#666">
              {e.id}
            </text>
            {/* Equipment name */}
            <text x={ex + 6} y={ly + 39}
              fontFamily="'Inter',sans-serif" fontSize="9" fontWeight="500" fill="#1A1A1A">
              {e.name.length > 12 ? e.name.slice(0, 12) + '…' : e.name}
            </text>

            {/* Lot pill at bottom */}
            {e.lot ? (
              <g>
                <rect x={ex + 6} y={ly + 12 + h - 16} width={w - 30} height="13" rx="3"
                  fill={isSel ? '#1A1A1A' : '#F0F0EC'} />
                <text x={ex + 8} y={ly + 12 + h - 6}
                  fontFamily="'DM Mono',monospace" fontSize="7" fontWeight="600"
                  fill={isSel ? '#FFF' : '#444'}>
                  {e.lot}
                </text>
                <text x={ex + w - 6} y={ly + 12 + h - 6}
                  fontFamily="'DM Mono',monospace" fontSize="8" fontWeight="700"
                  fill={st.dot} textAnchor="end">{e.wip}</text>
              </g>
            ) : (
              <text x={ex + 6} y={ly + 12 + h - 6}
                fontFamily="'DM Mono',monospace" fontSize="7" fill="#BBBBBB">— idle —</text>
            )}

            {/* Alarm pin */}
            {e.alarm && (
              <g style={{ pointerEvents: 'none' }}>
                <circle cx={ex + w - 6} cy={ly + 18} r="4" fill="#EF4444" />
                <circle cx={ex + w - 6} cy={ly + 18} r="6" fill="none"
                  stroke="#EF4444" strokeWidth="0.8" opacity="0.5">
                  <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x={ex + w - 6} y={ly + 20.5}
                  fontFamily="'DM Mono',monospace" fontSize="7" fontWeight="700"
                  fill="#FFF" textAnchor="middle">!</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Building label */}
      <text x={W / 2} y={H - 10}
        fontFamily="'DM Mono',monospace" fontSize="8" fontWeight="500"
        fill="#999" textAnchor="middle" letterSpacing="0.1em">
        {interior.label.toUpperCase()}
      </text>
    </svg>
  );
}

/* ═══ Premium Glass Surface card ═════════════════════════════ */
const glassSurface = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(252,252,250,0.96) 100%)',
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.08), 0 12px 32px -8px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
  backdropFilter: 'blur(12px)',
};

/* ═══ Equipment Detail Panel ══════════════════════════════════ */
function EquipDetailPanel({ eq, onClose }) {
  if (!eq) return null;
  const params = [
    { label: 'Recipe',      val: eq.recipe || '—' },
    { label: 'Temperature', val: eq.temp || '—' },
    eq.press ? { label: 'Pressure', val: eq.press } : null,
    { label: 'Cycle',       val: eq.wip > 0 ? `${Math.floor(eq.wip * 2.4)} min` : '—' },
    { label: 'Yield',       val: eq.status === 'complete' ? '99.1%' : eq.wip > 0 ? '97.8%' : '—' },
    { label: 'Last Calib.', val: '2026-04-28' },
  ].filter(Boolean);

  return (
    <div style={{ ...glassSurface, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, color: C.fg3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            {eq.kind || 'Equipment'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.fg1 }}>{eq.name}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.fg3, marginTop: 1 }}>{eq.id}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Chip status={eq.status} />
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px 4px', color: C.fg3, fontSize: 16, lineHeight: 1,
          }}>×</button>
        </div>
      </div>

      {eq.lot && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, color: C.fg3 }}>Current Lot</span>
          <span style={{ background: C.fg1, color: '#fff', fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 500, padding: '2px 8px', borderRadius: 999 }}>{eq.lot}</span>
          <span style={{ fontSize: 9, color: C.fg3 }}>{eq.wip} panels</span>
        </div>
      )}

      <div>
        <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3, marginBottom: 7 }}>
          Process Conditions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px' }}>
          {params.map(p => (
            <div key={p.label}>
              <div style={{ fontSize: 9, color: C.fg3, marginBottom: 1 }}>{p.label}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500, color: C.fg1 }}>{p.val}</div>
            </div>
          ))}
        </div>
      </div>

      {eq.alarm && (
        <div style={{ background: C.red50, border: `1px solid ${C.red100}`, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: C.red700 }}>Active Alarm</div>
          <div style={{ fontSize: 11, color: C.red700, marginTop: 2, lineHeight: 1.5 }}>
            Process fault — deviation exceeds spec. Engineering review required.
          </div>
        </div>
      )}

      <div style={{ background: C.violet50, border: `1px solid ${C.violet100}`, borderRadius: 8, padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: C.violet500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.violet700 }}>AI Recommendation</span>
        </div>
        <p style={{ fontSize: 10, color: C.violet700, lineHeight: 1.55, margin: 0 }}>
          {eq.alarm
            ? 'Halt and initiate root cause analysis. Estimated resolution: 45 min.'
            : eq.status === 'idle'
            ? 'Unit idle >90 min. Schedule PM or reassign to incoming lot.'
            : 'Performance nominal. Yield trending above baseline.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <FabButton size="sm" variant="primary">Assign Workflow</FabButton>
        {eq.alarm && <FabButton size="sm" variant="danger">Hold Lot</FabButton>}
        <FabButton size="sm" variant="ai">Ask AI</FabButton>
        <FabButton size="sm" variant="ghost">History</FabButton>
      </div>
    </div>
  );
}

/* ═══ Building Preview (right rail) ══════════════════════════ */
function BuildingPreview({ buildingId, onEnter }) {
  const b = BUILDINGS[buildingId];
  if (!b) return null;
  const idx = FLOW_ORDER.indexOf(buildingId);
  const stColor = STATUS[b.status].dot;

  // Equipment status counts
  const eqStatusCounts = {};
  b.interior.equipment.forEach(e => {
    eqStatusCounts[e.status] = (eqStatusCounts[e.status] || 0) + 1;
  });

  return (
    <div style={{ ...glassSurface, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, color: C.fg3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
            display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
              STEP {(idx + 1).toString().padStart(2, '0')}
            </span>
            <span style={{ color: C.fg4 }}>/</span>
            <span style={{ fontFamily: "'DM Mono',monospace" }}>{FLOW_ORDER.length.toString().padStart(2, '0')}</span>
            <span style={{ color: C.fg4 }}>·</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{b.code}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.fg1, lineHeight: 1.25 }}>{b.name}</div>
          <div style={{ fontSize: 10, color: C.fg3, marginTop: 1 }}>{b.role}</div>
        </div>
        <Chip status={b.status} />
      </div>

      {/* Utilization bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: C.fg3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
            Utilization
          </span>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 600, color: C.fg1 }}>
            {b.util}%
          </span>
        </div>
        <div style={{ height: 5, background: C.inset, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${b.util}%`, height: '100%', background: stColor, borderRadius: 999 }} />
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {[
          { label: 'Lots', val: b.lots, danger: false },
          { label: 'WIP', val: b.panels, danger: false },
          { label: 'Alarms', val: b.alarms, danger: b.alarms > 0 },
        ].map(s => (
          <div key={s.label} style={{
            background: '#FAFAF7', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px',
          }}>
            <div style={{ fontSize: 9, color: C.fg3, marginBottom: 1 }}>{s.label}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, fontWeight: 500, color: s.danger ? C.red500 : C.fg1 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Equipment dots — at-a-glance */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3, marginBottom: 5 }}>
          Equipment ({b.interior.equipment.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {b.interior.equipment.map(e => (
            <span key={e.id} style={{
              fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 500,
              padding: '2px 6px', borderRadius: 4,
              background: '#FFFFFF', border: `1px solid ${C.border}`, color: C.fg2,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: STATUS[e.status].dot }} />
              {e.id}
            </span>
          ))}
        </div>
      </div>

      {onEnter && (
        <FabButton size="sm" variant="primary" onClick={onEnter}>
          Enter Building →
        </FabButton>
      )}
    </div>
  );
}

/* ═══ Mini-map ═══════════════════════════════════════════════ */
function MiniMap({ activeId, onJump }) {
  const W = 200, H = 110;
  const allBuildings = Object.entries(BUILDINGS);
  const pts = [];
  allBuildings.forEach(([_, b]) => {
    pts.push(iso(b.gx, b.gy, b.gh));
    pts.push(iso(b.gx + b.gw, b.gy + b.gd, 0));
  });
  const minX = Math.min(...pts.map(p => p.x)) - 8;
  const maxX = Math.max(...pts.map(p => p.x)) + 8;
  const minY = Math.min(...pts.map(p => p.y)) - 8;
  const maxY = Math.max(...pts.map(p => p.y)) + 8;

  return (
    <svg viewBox={`${minX} ${minY} ${maxX-minX} ${maxY-minY}`}
      style={{ width: W, height: H, display: 'block' }}>
      {allBuildings.map(([id, b]) => {
        const c0 = iso(b.gx, b.gy, b.gh);
        const c1 = iso(b.gx + b.gw, b.gy, b.gh);
        const c2 = iso(b.gx + b.gw, b.gy + b.gd, b.gh);
        const c3 = iso(b.gx, b.gy + b.gd, b.gh);
        const isActive = id === activeId;
        return (
          <polygon key={id}
            points={`${c0.x},${c0.y} ${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}`}
            fill={isActive ? '#1A1A1A' : b.color.roof}
            stroke={isActive ? '#1A1A1A' : '#A8A8A4'}
            strokeWidth={isActive ? 1.5 : 0.5}
            style={{ cursor: 'pointer' }}
            onClick={() => onJump(id)}
          />
        );
      })}
    </svg>
  );
}

/* ═══ Main Factory Map ════════════════════════════════════════ */
export function FactoryMap() {
  const [mode, setMode] = useState('overview');
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedEq, setSelectedEq] = useState(null);

  const handleEnter = useCallback((id) => setHoveredId(id), []);
  const handleLeave = useCallback((id) => setHoveredId(prev => prev === id ? null : prev), []);
  const handleSelect = useCallback((id) => {
    setActiveBuilding(id);
    setSelectedEq(null);
    setMode('interior');
  }, []);
  const backToOverview = useCallback(() => {
    setMode('overview');
    setActiveBuilding(null);
    setSelectedEq(null);
  }, []);
  const jumpBuilding = useCallback((id) => {
    setActiveBuilding(id);
    setSelectedEq(null);
  }, []);

  const allBuildings = Object.values(BUILDINGS);
  const runCount   = allBuildings.filter(b => b.status === 'running').length;
  const holdCount  = allBuildings.filter(b => b.status === 'hold').length;
  const alarmCount = allBuildings.reduce((a, b) => a + b.alarms, 0);

  const breadcrumb = [{ label: 'Fab A', onClick: mode === 'interior' ? backToOverview : null }];
  if (activeBuilding) breadcrumb.push({ label: BUILDINGS[activeBuilding].name, onClick: null });
  if (selectedEq) breadcrumb.push({ label: selectedEq.id, onClick: null });

  // Right rail only shows when there's a hover/selection. Otherwise the
  // process-flow strip below the map is the resting-state UI.
  let rightRail = null;
  if (selectedEq) {
    rightRail = <EquipDetailPanel eq={selectedEq} onClose={() => setSelectedEq(null)} />;
  } else if (mode === 'interior' && activeBuilding) {
    rightRail = <BuildingPreview buildingId={activeBuilding} onEnter={null} />;
  } else if (mode === 'overview' && hoveredId) {
    rightRail = <BuildingPreview buildingId={hoveredId} onEnter={() => handleSelect(hoveredId)} />;
  }
  const showRightRail = rightRail !== null;

  // Horizontal Process Flow strip — below the map, full-width
  const processFlowStrip = (
    <div style={{ ...glassSurface, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingRight: 10, borderRight: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>
          Process Flow
        </div>
        <div style={{ fontSize: 9, color: C.fg4, fontFamily: "'DM Mono',monospace" }}>{FLOW_ORDER.length} STEPS</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, flex: 1, minWidth: 0 }}>
        {FLOW_ORDER.map((id, i) => {
          const b = BUILDINGS[id];
          const isHov = hoveredId === id;
          const isLast = i === FLOW_ORDER.length - 1;
          return (
            <Fragment key={id}>
              <div
                onClick={() => handleSelect(id)}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(prev => prev === id ? null : prev)}
                style={{
                  flex: 1, minWidth: 0,
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                  background: isHov ? '#FAFAF7' : 'transparent',
                  border: `1px solid ${isHov ? C.border : 'transparent'}`,
                  transition: 'background 120ms ease',
                }}>
                <span style={{
                  fontFamily: "'DM Mono',monospace", fontSize: 9, fontWeight: 600,
                  color: C.fg3,
                }}>{(i+1).toString().padStart(2,'0')}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS[b.status].dot,
                  boxShadow: `0 0 0 2px ${STATUS[b.status].soft}`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <span style={{ fontSize: 11, color: C.fg1, fontWeight: 500, lineHeight: 1.2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.short}
                  </span>
                  <span style={{ fontSize: 9, color: C.fg3, fontFamily: "'DM Mono',monospace", lineHeight: 1.2 }}>
                    {b.panels}P · {b.lots}L
                  </span>
                </div>
                {b.alarms > 0 && (
                  <span style={{ fontSize: 9, color: C.red500, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>⚠</span>
                )}
              </div>
              {!isLast && (
                <div style={{ display: 'flex', alignItems: 'center', color: C.fg4, fontSize: 12, padding: '0 2px' }}>›</div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>
            Digital Twin · Display Panel Fab
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {breadcrumb.map((bc, i) => (
              <Fragment key={i}>
                {i > 0 && <span style={{ color: C.fg4, fontSize: 12 }}>›</span>}
                <span
                  onClick={bc.onClick || undefined}
                  style={{
                    fontSize: 15, fontWeight: 500,
                    color: i === breadcrumb.length - 1 ? C.fg1 : C.fg3,
                    cursor: bc.onClick ? 'pointer' : 'default',
                  }}
                >{bc.label}</span>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', background: '#FFFFFF', border: `1px solid ${C.border}`,
          borderRadius: 999, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          {[
            { dot: C.green500, label: `${runCount} running` },
            { dot: C.amber500, label: `${holdCount} hold` },
            { dot: C.red500,   label: `${alarmCount} alarm` },
          ].map((s, i) => (
            <Fragment key={i}>
              {i > 0 && <span style={{ width: 1, height: 10, background: C.border }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
                <span style={{ fontSize: 10, color: C.fg2, fontFamily: "'DM Mono',monospace" }}>{s.label}</span>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Main canvas + side panel */}
      <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0, position: 'relative' }}>
        <div style={{
          flex: 1, position: 'relative',
          background: 'radial-gradient(ellipse at top, #FCFBF7 0%, #ECE8DE 90%)',
          border: `1px solid ${C.border}`,
          borderRadius: 14, overflow: 'hidden',
          minWidth: 0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {mode === 'overview' && (
            <FactoryOverview
              onSelectBuilding={handleSelect}
              hoveredId={hoveredId}
              selectedId={null}
              onEnter={handleEnter}
              onLeave={handleLeave}
            />
          )}

          {mode === 'interior' && activeBuilding && (
            <div style={{ padding: 16, height: '100%' }}>
              <BuildingInterior
                buildingId={activeBuilding}
                onSelectEquip={(eq) => setSelectedEq(eq)}
                selectedId={selectedEq?.id}
              />
            </div>
          )}

          {mode === 'interior' && (
            <button
              onClick={backToOverview}
              style={{
                position: 'absolute', top: 14, left: 14,
                background: 'rgba(255,255,255,0.95)',
                border: `1px solid ${C.border}`,
                borderRadius: 999, padding: '6px 14px 6px 10px',
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontFamily: "'Inter',sans-serif", color: C.fg1,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                fontWeight: 500,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>‹</span>
              Back to Factory
            </button>
          )}

          {mode === 'interior' && (
            <div style={{
              position: 'absolute', bottom: 14, right: showRightRail ? 308 : 14,
              background: 'rgba(255,255,255,0.95)',
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '8px 10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column', gap: 4,
              backdropFilter: 'blur(8px)',
              transition: 'right 200ms ease',
              zIndex: 10,
            }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>
                Plant Mini-Map
              </div>
              <MiniMap activeId={activeBuilding} onJump={jumpBuilding} />
              <div style={{ fontSize: 8, color: C.fg3, fontFamily: "'DM Mono',monospace" }}>
                Click a building to jump
              </div>
            </div>
          )}

          {/* View mode badge */}
          <div style={{
            position: 'absolute', top: 14, right: showRightRail ? 308 : 14,
            background: 'rgba(255,255,255,0.95)',
            border: `1px solid ${C.border}`,
            borderRadius: 999, padding: '4px 10px 4px 8px',
            fontSize: 9, fontWeight: 600, color: C.fg2,
            fontFamily: "'DM Mono',monospace",
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            letterSpacing: '0.05em',
            backdropFilter: 'blur(8px)',
            transition: 'right 200ms ease',
            zIndex: 10,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green500 }} />
            {mode === 'interior' ? 'INTERIOR · TOP-DOWN' : 'OVERVIEW · ISOMETRIC'}
          </div>

          {/* Bottom-left legend (overview only) */}
          {mode === 'overview' && (
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              background: 'rgba(255,255,255,0.95)',
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '8px 12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', gap: 4,
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3, marginBottom: 2 }}>
                Legend
              </div>
              {[
                { dot: STATUS.running.dot, label: 'Running' },
                { dot: STATUS.hold.dot, label: 'On Hold' },
                { dot: STATUS.alarm.dot, label: 'Alarm' },
                { dot: STATUS.idle.dot, label: 'Idle' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.dot }} />
                  <span style={{ fontSize: 9, color: C.fg2 }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right rail — overlaid on map so map never shrinks */}
        {showRightRail && (
          <div style={{
            position: 'absolute',
            top: 14, right: 14, bottom: 14,
            width: 280,
            display: 'flex', flexDirection: 'column', gap: 8,
            overflowY: 'auto',
            zIndex: 20,
            pointerEvents: 'none',
          }}>
            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rightRail}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Process Flow strip below the map */}
      {processFlowStrip}
    </div>
  );
}

