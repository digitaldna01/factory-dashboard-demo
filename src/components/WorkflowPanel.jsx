import { C, STATUS_MAP, Chip, FabButton } from './Components'
import React, { useState } from 'react'
/* FabOS — Left Workflow / AI Agent Panel */

export const WORKFLOW_CATEGORIES = {
  defect: { label: 'Defect Analysis', color: C.red500, bg: C.red50, border: C.red100, text: C.red700 },
  recipe: { label: 'Recipe', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  equipment: { label: 'Equipment', color: C.blue500, bg: C.blue50, border: C.blue100, text: C.blue700 },
  wip: { label: 'WIP / Lot', color: C.amber500, bg: C.amber50, border: C.amber100, text: C.amber700 },
  quality: { label: 'Quality', color: C.green500, bg: C.green50, border: C.green100, text: C.green700 },
  ai: { label: 'AI Agent', color: C.violet500, bg: C.violet50, border: C.violet100, text: C.violet700 },
};

export const INITIAL_WORKFLOWS = [
  {
    id: 'wf-01',
    name: 'Defect Analysis Agent',
    category: 'ai',
    target: 'All Equipment',
    duration: '~15 min',
    priority: 'high',
    status: 'ready',
    description: 'Automated AI cluster defect detection and root cause analysis across all active lots.',
  },
  {
    id: 'wf-02',
    name: 'Recipe Validation',
    category: 'recipe',
    target: 'CVD-01 · CVD-02',
    duration: '~8 min',
    priority: 'high',
    status: 'ready',
    description: 'Validates recipe parameters against golden baseline. Flags deviations >2σ.',
  },
  {
    id: 'wf-03',
    name: 'Equipment Health Check',
    category: 'equipment',
    target: 'EQ-08 · EQ-17',
    duration: '~20 min',
    priority: 'medium',
    status: 'ready',
    description: 'Full sensor sweep, calibration drift check, and maintenance scheduling review.',
  },
  {
    id: 'wf-04',
    name: 'WIP Delay Prediction',
    category: 'wip',
    target: 'All Active Lots',
    duration: '~5 min',
    priority: 'medium',
    status: 'ready',
    description: 'ML model predicts WIP bottlenecks and estimated lot completion times.',
  },
  {
    id: 'wf-05',
    name: 'Lot Hold Release Review',
    category: 'wip',
    target: 'LOT-A042',
    duration: '~10 min',
    priority: 'urgent',
    status: 'ready',
    description: 'Engineering review checklist for releasing held lots. Requires approval gate.',
  },
  {
    id: 'wf-06',
    name: 'Abnormal Trend Detection',
    category: 'ai',
    target: 'Litho · Etch Zones',
    duration: '~12 min',
    priority: 'medium',
    status: 'ready',
    description: 'Continuous SPC monitoring with AI anomaly detection on critical process parameters.',
  },
  {
    id: 'wf-07',
    name: 'Quality Inspection Summary',
    category: 'quality',
    target: 'QC Station',
    duration: '~6 min',
    priority: 'low',
    status: 'ready',
    description: 'Aggregates QC pass/fail data and generates shift-level quality report.',
  },
  {
    id: 'wf-08',
    name: 'Yield Improvement Analysis',
    category: 'ai',
    target: 'Deposition Zone',
    duration: '~25 min',
    priority: 'low',
    status: 'ready',
    description: 'AI-driven yield factor correlation and process parameter optimization suggestions.',
  },
  {
    id: 'wf-09',
    name: 'Preventive Maintenance',
    category: 'equipment',
    target: 'PVD-01',
    duration: '~45 min',
    priority: 'medium',
    status: 'ready',
    description: 'Scheduled PM based on equipment run-hours. Includes parts checklist and calibration.',
  },
  {
    id: 'wf-10',
    name: 'Photomask Inspection',
    category: 'quality',
    target: 'Litho Station',
    duration: '~18 min',
    priority: 'low',
    status: 'ready',
    description: 'Automated mask defect scan and CD measurement verification.',
  },
];

const PRIORITY_STYLES = {
  urgent: { bg: C.red100, text: C.red700, label: 'Urgent' },
  high:   { bg: C.amber100, text: C.amber700, label: 'High' },
  medium: { bg: C.blue100, text: C.blue700, label: 'Medium' },
  low:    { bg: C.subtle, text: C.fg3, label: 'Low' },
};

function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  return (
    <span style={{
      fontSize: 9, fontWeight: 600,
      background: p.bg, color: p.text,
      padding: '1px 6px', borderRadius: 999,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{p.label}</span>
  );
}

function WorkflowCard({ wf, onDragStart, isScheduled }) {
  const cat = WORKFLOW_CATEGORIES[wf.category] || WORKFLOW_CATEGORIES.ai;
  const [hov, setHov] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(wf));
        if (onDragStart) onDragStart(wf);
      }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: dragging ? C.subtle : (hov ? C.cardBg : C.cardBg),
        border: `1px solid ${hov ? C.borderSub : C.border}`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'grab',
        opacity: dragging ? 0.4 : isScheduled ? 0.55 : 1,
        transition: 'all 150ms ease',
        boxShadow: hov ? '0 2px 8px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.05)',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Drag handle hint */}
      <div style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 2, opacity: hov ? 0.35 : 0,
        transition: 'opacity 150ms',
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ display: 'flex', gap: 2 }}>
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: C.fg3 }} />
            <div style={{ width: 2, height: 2, borderRadius: '50%', background: C.fg3 }} />
          </div>
        ))}
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5, paddingRight: 16 }}>
        {/* Category dot */}
        <div style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          background: cat.bg, border: `1px solid ${cat.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.fg1, lineHeight: 1.3, marginBottom: 2 }}>{wf.name}</div>
          <div style={{ fontSize: 10, color: C.fg3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wf.target}</div>
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 9, color: cat.text, background: cat.bg,
          border: `1px solid ${cat.border}`, borderRadius: 4,
          padding: '1px 5px', fontWeight: 500,
        }}>{cat.label}</span>
        <PriorityBadge priority={wf.priority} />
        <span style={{ fontSize: 9, color: C.fg3, fontFamily: "'DM Mono',monospace", marginLeft: 'auto' }}>{wf.duration}</span>
      </div>

      {isScheduled && (
        <div style={{
          position: 'absolute', top: 6, right: 24,
          fontSize: 8, background: C.green100, color: C.green700,
          borderRadius: 3, padding: '1px 5px', fontWeight: 600,
        }}>SCHEDULED</div>
      )}
    </div>
  );
}

export function WorkflowPanel({ scheduledIds = [], onDragStart }) {
  const [activeTab, setActiveTab] = useState('workflows');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = INITIAL_WORKFLOWS.filter(wf => {
    const matchCat = filterCat === 'all' || wf.category === filterCat;
    const matchSearch = !search || wf.name.toLowerCase().includes(search.toLowerCase()) || wf.target.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeAgents = [
    { name: 'Defect Analyst', status: 'alarm', target: 'LOT-A042', progress: 68 },
    { name: 'Process Monitor', status: 'running', target: 'All Equipment', progress: 100 },
    { name: 'Recipe Advisor', status: 'processing', target: 'CVD-01', progress: 42 },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{ padding: '14px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>Jobs & Agents</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.fg1, marginTop: 2 }}>Workflows</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet500 }} />
            <span style={{ fontSize: 10, color: C.violet700 }}>3 active</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 1, background: C.subtle, borderRadius: 999, padding: 3, marginBottom: 10 }}>
          {[
            { id: 'workflows', label: 'Available' },
            { id: 'agents', label: 'Active Agents' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: '4px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: activeTab === t.id ? C.fg1 : 'transparent',
              color: activeTab === t.id ? '#fff' : C.fg3,
              fontSize: 11, fontWeight: 500,
              fontFamily: "'Inter',sans-serif",
              transition: 'all 150ms ease',
            }}>{t.label}</button>
          ))}
        </div>

        {activeTab === 'workflows' && (
          <>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search workflows…"
                style={{
                  width: '100%', padding: '6px 10px 6px 28px',
                  fontSize: 11, fontFamily: "'Inter',sans-serif",
                  background: C.inset, border: `1px solid ${C.border}`,
                  borderRadius: 7, outline: 'none', color: C.fg1,
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.borderStrong}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.fg3} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>

            {/* Category filters */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {[{ id: 'all', label: 'All' }, ...Object.entries(WORKFLOW_CATEGORIES).map(([id, cat]) => ({ id, label: cat.label }))].map(f => (
                <button key={f.id} onClick={() => setFilterCat(f.id)} style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: filterCat === f.id ? C.fg1 : C.subtle,
                  color: filterCat === f.id ? '#fff' : C.fg3,
                  border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 500,
                  fontFamily: "'Inter',sans-serif",
                  transition: 'all 120ms ease',
                }}>{f.label}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activeTab === 'workflows' ? (
          <>
            <div style={{ fontSize: 9, color: C.fg3, marginBottom: 2 }}>
              {filtered.length} workflows · drag to schedule →
            </div>
            {filtered.map(wf => (
              <WorkflowCard
                key={wf.id}
                wf={wf}
                onDragStart={onDragStart}
                isScheduled={scheduledIds.includes(wf.id)}
              />
            ))}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeAgents.map((ag, i) => (
              <div key={i} style={{
                background: C.violet50, border: `1px solid ${C.violet100}`,
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.violet700 }}>{ag.name}</div>
                  <Chip status={ag.status} label={ag.status === 'running' ? 'Active' : ag.status === 'alarm' ? 'Alert' : 'Working'} size="xs" />
                </div>
                <div style={{ fontSize: 10, color: C.violet500, marginBottom: 8 }}>{ag.target}</div>
                {/* Progress bar */}
                <div style={{ height: 3, background: C.violet100, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${ag.progress}%`,
                    background: ag.status === 'alarm' ? C.red500 : C.violet500,
                    borderRadius: 999,
                    transition: 'width 500ms ease',
                  }} />
                </div>
                <div style={{ fontSize: 9, color: C.violet400, marginTop: 3, textAlign: 'right', fontFamily: "'DM Mono',monospace" }}>{ag.progress}%</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                  <FabButton size="xs" variant="ai">View</FabButton>
                  <FabButton size="xs" variant="ghost">Pause</FabButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

