import { useState } from 'react'

export const C = {
  pageBg: '#F4F2EC',
  pageBgGradient: 'linear-gradient(180deg, #F6F4EE 0%, #F0EDE6 100%)',
  cardBg: '#FCFBF7',
  subtle: '#EBE8E1',
  inset: '#F5F2EB',
  border: '#E5E1D7',
  borderSub: '#DCD8CC',
  borderStrong: '#C9C4B6',
  fg1: '#171614',
  fg2: '#4A4843',
  fg3: '#8A867D',
  fg4: '#BDB9AE',
  green500: '#16A34A', green100: '#DCFCE7', green700: '#14532D', green50: '#F0FDF4',
  amber500: '#D97706', amber100: '#FEF3C7', amber700: '#78350F', amber50: '#FFFBEB',
  red500: '#DC2626',   red100: '#FEE2E2',   red700: '#7F1D1D',   red50: '#FEF2F2',
  blue500: '#3B82F6',  blue100: '#DBEAFE',  blue700: '#1E3A8A',  blue50: '#EFF6FF',
  violet500: '#6366F1', violet100: '#E0E7FF', violet700: '#3730A3', violet50: '#EEF2FF', violet400: '#818CF8',
}

export const STATUS_MAP = {
  running:    { bg: C.green100,  text: C.green700,  dot: C.green500,  label: 'Running' },
  processing: { bg: C.blue100,   text: C.blue700,   dot: C.blue500,   label: 'Processing' },
  hold:       { bg: C.amber100,  text: C.amber700,  dot: C.amber500,  label: 'On Hold' },
  alarm:      { bg: C.red100,    text: C.red700,    dot: C.red500,    label: 'Alarm' },
  idle:       { bg: C.subtle,    text: '#555',      dot: C.fg3,       label: 'Idle' },
  complete:   { bg: C.green100,  text: C.green700,  dot: C.green500,  label: 'Complete' },
  ai:         { bg: C.violet100, text: C.violet700, dot: C.violet500, label: 'AI Agent' },
  scheduled:  { bg: C.blue100,   text: C.blue700,   dot: C.blue500,   label: 'Scheduled' },
  pending:    { bg: C.amber100,  text: C.amber700,  dot: C.amber500,  label: 'Pending' },
}

export function Chip({ status, label, size = 'sm' }) {
  const s = STATUS_MAP[status] || STATUS_MAP.idle
  const lbl = label !== undefined ? label : s.label
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'xs' ? '2px 7px' : '3px 10px',
      borderRadius: 999,
      background: s.bg, color: s.text,
      fontSize: size === 'xs' ? 10 : 11,
      fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {lbl}
    </span>
  )
}

export function MonoId({ children, size = 13, color, dim }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: size, fontWeight: 500,
      color: dim ? C.fg3 : (color || C.fg1),
      fontVariantNumeric: 'tabular-nums',
    }}>{children}</span>
  )
}

export function MonoTs({ children }) {
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.fg3, fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </span>
  )
}

export function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 500, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: C.fg3, lineHeight: 1, ...style,
    }}>{children}</div>
  )
}

export function FabCard({ children, style, radius = 12, noPad, onClick, hoverable }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background: C.cardBg,
        border: `1px solid ${hov ? C.borderSub : C.border}`,
        borderRadius: radius,
        padding: noPad ? 0 : '14px 16px',
        boxShadow: hov ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >{children}</div>
  )
}

export function FabButton({ children, variant = 'primary', size = 'md', onClick, style }) {
  const sizes = {
    xs: { padding: '3px 8px', fontSize: 10 },
    sm: { padding: '4px 10px', fontSize: 11 },
    md: { padding: '6px 14px', fontSize: 13 },
  }
  const variants = {
    primary:   { background: C.fg1,        color: '#fff',      border: 'none' },
    secondary: { background: 'transparent', color: C.fg1,       border: `1px solid ${C.border}` },
    ghost:     { background: 'transparent', color: C.fg3,       border: 'none' },
    ai:        { background: C.violet50,    color: C.violet700, border: `1px solid ${C.violet100}` },
    danger:    { background: C.red50,       color: C.red700,    border: `1px solid ${C.red100}` },
  }
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Inter', sans-serif", fontWeight: 500, cursor: 'pointer',
      borderRadius: 8, transition: 'opacity 120ms ease',
      ...v, ...s, ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  )
}

export function TopBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'factory', label: 'Factory Map' },
    { id: 'lots', label: 'Lots' },
    { id: 'defects', label: 'Defect Map' },
    { id: 'ai', label: 'AI Agents' },
  ]
  return (
    <div style={{
      height: 50, background: C.pageBg,
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 12,
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: C.fg1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
            <rect x="8" y="1" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="1" y="8" width="5" height="5" rx="1" fill="white" opacity="0.55"/>
            <rect x="8" y="8" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.fg1, letterSpacing: '-0.2px' }}>FabOS</span>
        <span style={{ fontSize: 10, color: C.fg3, letterSpacing: '0.02em' }}>Display Panel MFG</span>
      </div>

      <nav style={{
        display: 'flex', gap: 2, alignItems: 'center',
        background: C.subtle, padding: '3px', borderRadius: 999,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{
            padding: '4px 14px', borderRadius: 999,
            background: activeTab === t.id ? C.fg1 : 'transparent',
            color: activeTab === t.id ? '#fff' : C.fg3,
            fontSize: 12, fontWeight: activeTab === t.id ? 500 : 400,
            border: 'none', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 150ms ease',
          }}>{t.label}</button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green500 }} />
          <span style={{ fontSize: 10, color: C.fg3 }}>Live</span>
        </div>
        <MonoTs>2026-05-03 14:22</MonoTs>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: C.fg1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 600, color: '#fff', marginLeft: 4,
        }}>JL</div>
      </div>
    </div>
  )
}
