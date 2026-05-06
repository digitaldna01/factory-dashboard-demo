import { useState, useEffect } from 'react'
import { C, STATUS_MAP, Chip, FabButton, TopBar } from './components/Components'
import { FactoryMap } from './components/FactoryMap'
import { WorkflowPanel } from './components/WorkflowPanel'
import { SchedulePanel } from './components/SchedulePanel'
import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio } from './components/TweaksPanel'

const TWEAK_DEFAULTS = {
  leftPanelWidth: 240,
  rightPanelWidth: 360,
  mapDensity: 'normal',
  showKpiBar: true,
  calendarView: 'week',
}

function KpiBar() {
  const kpis = [
    { label: 'Yield Rate',    value: '98.7%', sub: 'Last 24h',           status: 'running' },
    { label: 'WIP Panels',    value: '248',   sub: 'In process',          status: 'processing' },
    { label: 'Active Alarms', value: '2',     sub: 'EQ-08 · CVD-01',      status: 'alarm' },
    { label: 'Lots Complete', value: '12',    sub: 'Today · All QC pass',  status: 'complete' },
    { label: 'AI Agents',     value: '3',     sub: 'Running now',          status: 'ai' },
    { label: 'Throughput',    value: '1,842', sub: 'panels / shift',       status: 'idle' },
  ]
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '8px 14px',
      borderBottom: `1px solid ${C.border}`,
      background: C.cardBg, flexShrink: 0,
    }}>
      {kpis.map((k, i) => {
        const s = STATUS_MAP[k.status] || STATUS_MAP.idle
        return (
          <div key={i} style={{
            flex: 1, padding: '6px 10px', borderRadius: 8,
            background: k.status === 'ai' ? C.violet50 : C.inset,
            border: `1px solid ${k.status === 'ai' ? C.violet100 : C.border}`,
            display: 'flex', flexDirection: 'column', gap: 1,
          }}>
            <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: k.status === 'ai' ? C.violet500 : C.fg3 }}>{k.label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, color: k.status === 'ai' ? C.violet700 : C.fg1, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
              <span style={{ fontSize: 9, color: k.status === 'ai' ? C.violet500 : C.fg3 }}>{k.sub}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AlarmTicker() {
  const alarms = [
    { id: 'CVD-01', type: 'On Hold', lot: 'LOT-A042', msg: 'Recipe deviation — pending review',         color: C.amber500 },
    { id: 'ET-02',  type: 'Alarm',   lot: 'LOT-A034', msg: 'Process fault — etch rate out of spec',     color: C.red500 },
  ]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px',
      background: C.red50, borderBottom: `1px solid ${C.red100}`,
      flexShrink: 0, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: C.red500, color: '#fff', borderRadius: 4,
        padding: '1px 7px', fontSize: 9, fontWeight: 600,
        flexShrink: 0, letterSpacing: '0.06em',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
        ALARMS
      </div>
      <div style={{ display: 'flex', gap: 16, flex: 1, overflow: 'hidden' }}>
        {alarms.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fontWeight: 500, color: a.color }}>{a.id}</span>
            <span style={{ fontSize: 9, color: a.color, background: a.color + '22', padding: '1px 5px', borderRadius: 3 }}>{a.type}</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: C.fg3 }}>{a.lot}</span>
            <span style={{ fontSize: 9, color: C.red700 }}>·</span>
            <span style={{ fontSize: 9, color: C.red700 }}>{a.msg}</span>
          </div>
        ))}
      </div>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.red700, flexShrink: 0 }}>
        View all →
      </button>
    </div>
  )
}

function LotsView() {
  const lots = [
    { id: 'LOT-A044', step: '2/7', stage: 'Cleaning',      eq: 'CL-01',  status: 'running',    yield: '—',    age: '1h 12m' },
    { id: 'LOT-A043', step: '3/7', stage: 'Deposition',    eq: 'CVD-02', status: 'running',    yield: '—',    age: '3h 05m' },
    { id: 'LOT-A042', step: '3/7', stage: 'Deposition',    eq: 'CVD-01', status: 'hold',       yield: '—',    age: '4h 22m' },
    { id: 'LOT-A041', step: '4/7', stage: 'Litho',         eq: 'EX-01',  status: 'running',    yield: '—',    age: '6h 10m' },
    { id: 'LOT-A040', step: '5/7', stage: 'Etching',       eq: 'ET-01',  status: 'running',    yield: '—',    age: '7h 44m' },
    { id: 'LOT-A039', step: '6/7', stage: 'Cell Assembly', eq: 'CA-01',  status: 'running',    yield: '98.4%', age: '9h 20m' },
    { id: 'LOT-A038', step: '7/7', stage: 'QC',            eq: 'QC-01',  status: 'processing', yield: '97.9%', age: '11h 03m' },
    { id: 'LOT-A037', step: '7/7', stage: 'QC',            eq: 'QC-02',  status: 'complete',   yield: '99.1%', age: '12h 50m' },
  ]
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>Smart Factory OS · Display Panel MFG</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.fg1 }}>WIP Lot Tracker</div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Lot ID', 'Step', 'Stage', 'Equipment', 'Status', 'Yield', 'Age'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lots.map((lot, i) => (
              <tr key={lot.id} style={{ borderBottom: `0.5px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.inset }}>
                <td style={{ padding: '9px 14px' }}><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500, color: C.fg1 }}>{lot.id}</span></td>
                <td style={{ padding: '9px 14px' }}><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.fg3 }}>{lot.step}</span></td>
                <td style={{ padding: '9px 14px', fontSize: 12, color: C.fg2 }}>{lot.stage}</td>
                <td style={{ padding: '9px 14px' }}><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.fg3 }}>{lot.eq}</span></td>
                <td style={{ padding: '9px 14px' }}><Chip status={lot.status} /></td>
                <td style={{ padding: '9px 14px', fontFamily: "'DM Mono',monospace", fontSize: 11, color: lot.yield === '—' ? C.fg3 : C.green700 }}>{lot.yield}</td>
                <td style={{ padding: '9px 14px', fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.fg3 }}>{lot.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DefectsView() {
  const [zones] = useState(() =>
    Array.from({ length: 10 }, () =>
      Array.from({ length: 16 }, () => {
        const v = Math.random()
        return v > 0.92 ? 'high' : v > 0.82 ? 'med' : v > 0.72 ? 'low' : 'none'
      })
    )
  )
  const defectColors = { high: C.red500, med: C.amber500, low: '#FCD34D', none: C.border }
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>Smart Factory OS · Display Panel MFG</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.fg1 }}>Defect Heatmap — LOT-A042</div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          {[{ label: 'High density', c: C.red500 }, { label: 'Medium', c: C.amber500 }, { label: 'Low', c: '#FCD34D' }, { label: 'Pass', c: C.border }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.c }} />
              <span style={{ fontSize: 10, color: C.fg3 }}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(10, 1fr)', gridTemplateColumns: 'repeat(16, 1fr)', gap: 3, flex: 1 }}>
          {zones.flat().map((level, i) => (
            <div key={i}
              style={{ background: defectColors[level], borderRadius: 3, opacity: level === 'none' ? 0.3 : 0.85, transition: 'opacity 150ms', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = level === 'none' ? '0.3' : '0.85'}
            />
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.fg3 }}>AI detected cluster defect in Zone B4 — CVD recipe R-007 edge non-uniformity suspected.</div>
      </div>
    </div>
  )
}

function AIView() {
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([
    { role: 'agent', text: 'FabOS Intelligence — active. 3 agents running. 2 alerts pending.', ts: '14:00' },
    { role: 'user',  text: 'What is causing the hold on LOT-A042?', ts: '14:08' },
    { role: 'agent', text: 'LOT-A042 hold triggered by CVD-01 recipe deviation. R-007 edge exclusion zone drift detected at step 3/7. Recommend: increase edge exclusion by +2mm and re-qualify before resuming. Estimated resolution: 45 min if approved now.', ts: '14:08' },
  ])

  function send(text) {
    if (!text.trim()) return
    const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    setMsgs(m => [...m,
      { role: 'user',  text, ts },
      { role: 'agent', text: 'Analyzing… (connect FabOS Intelligence API for live responses)', ts },
    ])
    setInput('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>Smart Factory OS · Display Panel MFG</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: C.fg1 }}>AI Intelligence Console</div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'agent' ? 'flex-start' : 'flex-end', gap: 3 }}>
              <div style={{ fontSize: 9, color: C.fg3, fontFamily: "'DM Mono',monospace" }}>{m.role === 'agent' ? 'FabOS AI' : 'You'} · {m.ts}</div>
              <div style={{ maxWidth: '80%', background: m.role === 'agent' ? C.violet50 : C.inset, border: `1px solid ${m.role === 'agent' ? C.violet100 : C.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: m.role === 'agent' ? C.violet700 : C.fg2, lineHeight: 1.6 }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input) }}
            placeholder="Ask FabOS Intelligence…"
            style={{ flex: 1, padding: '7px 12px', fontSize: 12, background: C.inset, border: `1px solid ${C.border}`, borderRadius: 7, outline: 'none', color: C.fg1 }}
          />
          <FabButton size="sm" variant="ai" onClick={() => send(input)}>Send</FabButton>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [activeTab, setActiveTab] = useState('factory')
  const [scheduledIds, setScheduledIds] = useState(['wf-01', 'wf-03', 'wf-04', 'wf-07'])
  const [isDragging, setIsDragging] = useState(false)

  function handleScheduleUpdate(event) {
    setScheduledIds(prev => [...new Set([...prev, event.wfId])])
  }

  function handleDragStart() {
    setIsDragging(true)
  }

  useEffect(() => {
    function onDragEnd() { setIsDragging(false) }
    window.addEventListener('dragend', onDragEnd)
    return () => window.removeEventListener('dragend', onDragEnd)
  }, [])

  const leftW = tweaks.leftPanelWidth
  const rightW = tweaks.rightPanelWidth

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

      {tweaks.showKpiBar && <KpiBar />}

      <AlarmTicker />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: C.pageBg }}>
        {/* Left: Workflow Panel */}
        <div style={{
          width: leftW, flexShrink: 0,
          padding: '12px 8px 12px 12px',
          overflowY: 'auto',
          borderRight: `1px solid ${C.border}`,
          background: C.pageBg,
        }}>
          <WorkflowPanel scheduledIds={scheduledIds} onDragStart={handleDragStart} />
        </div>

        {/* Center */}
        <div style={{
          flex: 1, padding: '12px 8px',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0,
          position: 'relative',
        }}>
          {isDragging && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              background: C.violet700, color: '#fff',
              padding: '6px 14px', borderRadius: 999,
              fontSize: 11, fontWeight: 500, zIndex: 100,
              pointerEvents: 'none',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}>
              Drop on the calendar to schedule →
            </div>
          )}
          {activeTab === 'factory'  && <div style={{ flex: 1, overflow: 'hidden' }}><FactoryMap /></div>}
          {activeTab === 'lots'     && <LotsView />}
          {activeTab === 'defects'  && <DefectsView />}
          {activeTab === 'ai'       && <AIView />}
        </div>

        {/* Right: Schedule Panel */}
        <div style={{
          width: rightW, flexShrink: 0,
          padding: '12px 12px 12px 8px',
          borderLeft: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: C.pageBg,
        }}>
          <SchedulePanel onScheduleUpdate={handleScheduleUpdate} />
        </div>
      </div>

      <TweaksPanel title="FabOS Tweaks">
        <TweakSection label="Layout">
          <TweakSlider label="Left panel width"  value={leftW}  min={180} max={320} step={10} unit="px" onChange={v => setTweak('leftPanelWidth', v)} />
          <TweakSlider label="Right panel width" value={rightW} min={260} max={420} step={10} unit="px" onChange={v => setTweak('rightPanelWidth', v)} />
          <TweakToggle label="Show KPI bar" value={tweaks.showKpiBar} onChange={v => setTweak('showKpiBar', v)} />
        </TweakSection>
        <TweakSection label="Map Density">
          <TweakRadio label="Density" value={tweaks.mapDensity} options={['compact', 'normal', 'expanded']} onChange={v => setTweak('mapDensity', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  )
}
