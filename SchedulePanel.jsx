/* FabOS — Right Schedule / Orchestration Panel (Notion-style calendar) */

const CAT_COLORS = {
  defect: { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B', dot: '#EF4444' },
  recipe: { bg: '#FFEDD5', border: '#FED7AA', text: '#9A3412', dot: '#F97316' },
  equipment: { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF', dot: '#3B82F6' },
  wip: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E', dot: '#F59E0B' },
  quality: { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46', dot: '#10B981' },
  ai: { bg: '#EDE9FE', border: '#C4B5FD', text: '#5B21B6', dot: '#7C3AED' }
};

// Initial scheduled events (pre-populated for demo)
const INITIAL_EVENTS = [
{ id: 'ev-1', wfId: 'wf-03', name: 'Equipment Health Check', category: 'equipment', target: 'EQ-08 · EQ-17', day: 0, hour: 8, duration: 1.5, priority: 'high', status: 'scheduled' },
{ id: 'ev-2', wfId: 'wf-01', name: 'Defect Analysis Agent', category: 'ai', target: 'All Equipment', day: 0, hour: 10, duration: 1, priority: 'high', status: 'running' },
{ id: 'ev-3', wfId: 'wf-04', name: 'WIP Delay Prediction', category: 'wip', target: 'All Active Lots', day: 0, hour: 13, duration: 0.5, priority: 'medium', status: 'scheduled' },
{ id: 'ev-4', wfId: 'wf-07', name: 'Quality Inspection Summary', category: 'quality', target: 'QC Station', day: 0, hour: 16, duration: 0.75, priority: 'low', status: 'scheduled' },
{ id: 'ev-5', wfId: 'wf-02', name: 'Recipe Validation', category: 'recipe', target: 'CVD-01', day: 1, hour: 9, duration: 1, priority: 'high', status: 'scheduled' },
{ id: 'ev-6', wfId: 'wf-06', name: 'Abnormal Trend Detection', category: 'ai', target: 'Litho · Etch', day: 1, hour: 11, duration: 1, priority: 'medium', status: 'scheduled' },
{ id: 'ev-7', wfId: 'wf-09', name: 'Preventive Maintenance', category: 'equipment', target: 'PVD-01', day: 2, hour: 7, duration: 2, priority: 'medium', status: 'scheduled' },
{ id: 'ev-8', wfId: 'wf-05', name: 'Lot Hold Release Review', category: 'wip', target: 'LOT-A042', day: 2, hour: 14, duration: 1, priority: 'urgent', status: 'scheduled' }];


const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const CELL_HEIGHT = 58; // px per hour
const HEADER_H = 38;

function formatHour(h) {
  return h < 12 ? `${h}:00` : h === 12 ? '12:00' : `${h - 12}:00`;
}
function formatAmPm(h) {
  return h < 12 ? 'AM' : 'PM';
}

function EventBlock({ event, onDelete, onSelect, selected }) {
  const cat = CAT_COLORS[event.category] || CAT_COLORS.ai;
  const topPct = (event.hour - HOURS[0]) * CELL_HEIGHT;
  const heightPct = event.duration * CELL_HEIGHT;
  const isSel = selected === event.id;

  return (
    <div
      onClick={(e) => {e.stopPropagation();onSelect(event.id);}}
      style={{
        position: 'absolute',
        top: topPct + HEADER_H,
        left: 2, right: 2,
        height: Math.max(heightPct - 3, 20),
        background: isSel ? cat.dot : cat.bg,
        border: `1.5px solid ${isSel ? cat.dot : cat.border}`,
        borderRadius: 7,
        padding: '5px 8px',
        cursor: 'pointer',
        zIndex: isSel ? 10 : 1,
        transition: 'all 150ms ease',
        overflow: 'hidden',
        boxShadow: isSel ? `0 2px 8px ${cat.dot}44` : '0 1px 3px rgba(0,0,0,0.06)'
      }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: isSel ? '#fff' : cat.text,
            lineHeight: 1.3,
            overflow: 'hidden',
            wordBreak: 'break-word',
            textWrap: 'pretty'
          }}>{event.name}</div>
          {heightPct > 38 &&
          <div style={{
            fontSize: 9, color: isSel ? 'rgba(255,255,255,0.8)' : cat.text,
            opacity: 0.8, marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>{event.target}</div>
          }
        </div>
        {isSel &&
        <button
          onClick={(e) => {e.stopPropagation();onDelete(event.id);}}
          style={{
            background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer',
            width: 14, height: 14, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', flexShrink: 0, padding: 0, lineHeight: 1
          }}>
          ×</button>
        }
      </div>
      {heightPct > 52 && event.status === 'running' &&
      <div style={{ marginTop: 3 }}>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 999 }}>
            <div style={{ width: '65%', height: '100%', background: isSel ? '#fff' : cat.dot, borderRadius: 999 }} />
          </div>
        </div>
      }
    </div>);

}

function DropZone({ day, hour, onDrop, isDraggingOver, onClick }) {
  return (
    <div
      onDragOver={(e) => {e.preventDefault();e.dataTransfer.dropEffect = 'copy';}}
      onDragEnter={(e) => e.currentTarget.setAttribute('data-over', 'true')}
      onDragLeave={(e) => e.currentTarget.removeAttribute('data-over')}
      onDrop={(e) => {
        e.preventDefault();
        try {
          const data = JSON.parse(e.dataTransfer.getData('application/json'));
          onDrop(data, day, hour);
        } catch (_) {}
      }}
      onClick={() => onClick && onClick(day, hour)}
      style={{
        position: 'absolute',
        top: (hour - HOURS[0]) * CELL_HEIGHT + HEADER_H,
        left: 0, right: 0,
        height: CELL_HEIGHT,
        background: isDraggingOver ? 'rgba(124,58,237,0.06)' : 'transparent',
        transition: 'background 100ms',
        zIndex: 0
      }} />);


}

function DayColumn({ dayLabel, dayIndex, dayDate, events, onDrop, onEventDelete, onEventSelect, selectedEvent, isToday }) {
  const [dragOver, setDragOver] = React.useState(false);

  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', borderRight: `1px solid ${C.border}` }}>
      {/* Day header */}
      <div style={{
        height: HEADER_H, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        borderBottom: `1px solid ${C.border}`,
        background: isToday ? C.inset : C.cardBg,
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{ fontSize: 9, color: isToday ? C.blue700 : C.fg3, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{dayLabel}</div>
        <div style={{
          fontSize: 18, fontWeight: isToday ? 600 : 300, color: isToday ? C.blue700 : C.fg1,
          lineHeight: 1.1, marginTop: 1
        }}>{dayDate}</div>
      </div>

      {/* Hour cells */}
      <div style={{ position: 'relative', height: HOURS.length * CELL_HEIGHT }}>
        {HOURS.map((h) =>
        <DropZone
          key={h}
          day={dayIndex}
          hour={h}
          onDrop={(wf, d, hr) => onDrop(wf, d, hr)}
          onClick={() => {}} />

        )}

        {/* Grid lines */}
        {HOURS.map((h, i) =>
        <div key={h} style={{
          position: 'absolute',
          top: i * CELL_HEIGHT,
          left: 0, right: 0,
          height: CELL_HEIGHT,
          borderBottom: `0.5px solid ${C.border}`,
          pointerEvents: 'none'
        }} />
        )}

        {/* Events */}
        {events.map((ev) =>
        <EventBlock
          key={ev.id}
          event={ev}
          onDelete={onEventDelete}
          onSelect={onEventSelect}
          selected={selectedEvent} />

        )}

        {/* Now line (on today, hour ~14) */}
        {isToday &&
        <div style={{
          position: 'absolute',
          top: (14 - HOURS[0]) * CELL_HEIGHT + HEADER_H + 22,
          left: 0, right: 0, height: 1.5,
          background: C.red500, zIndex: 15, pointerEvents: 'none'
        }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red500, marginTop: -2, marginLeft: -3 }} />
          </div>
        }
      </div>
    </div>);

}

function SchedulePanel({ onScheduleUpdate }) {
  const [events, setEvents] = React.useState(INITIAL_EVENTS);
  const [viewMode, setViewMode] = React.useState('week'); // 'day' | 'week'
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [dropHint, setDropHint] = React.useState(null);

  // Days for week view
  const today = new Date('2026-05-03');
  const weekDays = Array.from({ length: viewMode === 'week' ? 5 : 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + weekOffset * (viewMode === 'week' ? 5 : 1));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      index: i + weekOffset * (viewMode === 'week' ? 5 : 1),
      isToday: i === 0 && weekOffset === 0
    };
  });

  function handleDrop(wf, dayIndex, hour) {
    const newId = `ev-${Date.now()}`;
    const newEvent = {
      id: newId,
      wfId: wf.id,
      name: wf.name,
      category: wf.category,
      target: wf.target,
      day: dayIndex,
      hour: hour,
      duration: parseFloat(wf.duration?.replace('~', '').replace(' min', '') || '60') / 60,
      priority: wf.priority,
      status: 'scheduled'
    };
    setEvents((prev) => [...prev, newEvent]);
    if (onScheduleUpdate) onScheduleUpdate(newEvent);
    setDropHint(newId);
    setTimeout(() => setDropHint(null), 2000);
  }

  function handleDelete(evId) {
    setEvents((prev) => prev.filter((e) => e.id !== evId));
    if (selectedEvent === evId) setSelectedEvent(null);
  }

  const scheduledWfIds = events.map((e) => e.wfId);

  const selectedEvData = events.find((e) => e.id === selectedEvent);

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Week date range label
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() + weekOffset * 5);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeStart.getDate() + 4);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 14, overflow: 'hidden'
    }}>
      {/* Panel header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, background: C.cardBg
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.fg3 }}>Orchestration</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.fg1, marginTop: 2 }}>Schedule</div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* View toggles */}
            <div style={{ display: 'flex', background: C.subtle, borderRadius: 999, padding: 2, gap: 1 }}>
              {['day', 'week'].map((v) =>
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '3px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: viewMode === v ? C.fg1 : 'transparent',
                color: viewMode === v ? '#fff' : C.fg3,
                fontSize: 10, fontWeight: 500, fontFamily: "'Inter',sans-serif",
                transition: 'all 150ms ease',
                textTransform: 'capitalize'
              }}>{v}</button>
              )}
            </div>
          </div>
        </div>

        {/* Nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setWeekOffset((w) => w - 1)} style={{ background: C.subtle, border: 'none', cursor: 'pointer', width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.fg2 }}>‹</button>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.fg1 }}>
              {rangeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {rangeEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekOffset((w) => w + 1)} style={{ background: C.subtle, border: 'none', cursor: 'pointer', width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: C.fg2 }}>›</button>
          </div>
          <button onClick={() => setWeekOffset(0)} style={{
            padding: '3px 8px', border: `1px solid ${C.border}`, borderRadius: 5,
            background: C.cardBg, fontSize: 10, color: C.fg3, cursor: 'pointer',
            fontFamily: "'Inter',sans-serif"
          }}>Today</button>
        </div>
      </div>

      {/* Event count summary */}
      <div style={{ padding: '6px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, flexShrink: 0, background: C.inset }}>
        {[
        { label: 'Scheduled', count: events.filter((e) => e.status === 'scheduled').length, color: C.blue700, bg: C.blue100 },
        { label: 'Running', count: events.filter((e) => e.status === 'running').length, color: C.green700, bg: C.green100 },
        { label: 'AI Jobs', count: events.filter((e) => e.category === 'ai').length, color: C.violet700, bg: C.violet100 }].
        map((s) =>
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 500, color: s.color, background: s.bg, padding: '1px 6px', borderRadius: 4 }}>{s.count}</span>
            <span style={{ fontSize: 10, color: C.fg3 }}>{s.label}</span>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex' }}>
          {/* Time gutter */}
          <div style={{ width: 38, flexShrink: 0, position: 'relative', paddingTop: HEADER_H }}>
            {HOURS.map((h, i) =>
            <div key={h} style={{
              height: CELL_HEIGHT,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
              paddingRight: 6, paddingTop: 4,
              borderBottom: `0.5px solid ${C.border}`
            }}>
                <span style={{ fontSize: 8, color: C.fg3, fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
                  {formatHour(h)}<span style={{ fontSize: 7, opacity: 0.7 }}>{formatAmPm(h)}</span>
                </span>
              </div>
            )}
          </div>

          {/* Day columns */}
          <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
            {weekDays.map((day) =>
            <DayColumn
              key={day.index}
              dayLabel={day.label}
              dayDate={day.date}
              dayIndex={day.index}
              events={events.filter((e) => e.day === day.index)}
              onDrop={handleDrop}
              onEventDelete={handleDelete}
              onEventSelect={setSelectedEvent}
              selectedEvent={selectedEvent}
              isToday={day.isToday} />

            )}
          </div>
        </div>
      </div>

      {/* Selected event detail strip */}
      {selectedEvData &&
      <div style={{
        padding: '10px 14px', borderTop: `1px solid ${C.border}`,
        background: CAT_COLORS[selectedEvData.category]?.bg || C.inset,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: CAT_COLORS[selectedEvData.category]?.text || C.fg1 }}>{selectedEvData.name}</div>
            <div style={{ fontSize: 9, color: CAT_COLORS[selectedEvData.category]?.text || C.fg3, opacity: 0.8, marginTop: 1 }}>
              {selectedEvData.target} · {weekDays.find((d) => d.index === selectedEvData.day)?.label || ''} {formatHour(selectedEvData.hour)}{formatAmPm(selectedEvData.hour)} · {Math.round(selectedEvData.duration * 60)} min
            </div>
          </div>
          <Chip status={selectedEvData.status === 'running' ? 'running' : 'scheduled'} label={selectedEvData.status === 'running' ? 'Running' : 'Scheduled'} size="xs" />
          <FabButton size="xs" variant="ghost" onClick={() => handleDelete(selectedEvData.id)}>Remove</FabButton>
          <FabButton size="xs" variant="secondary" onClick={() => setSelectedEvent(null)}>Dismiss</FabButton>
        </div>
      }

      {/* Category legend */}
      <div style={{ padding: '6px 14px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        {Object.entries(CAT_COLORS).map(([cat, s]) =>
        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
            <span style={{ fontSize: 8, color: C.fg3, textTransform: 'capitalize' }}>{cat}</span>
          </div>
        )}
      </div>
    </div>);

}

Object.assign(window, { SchedulePanel, INITIAL_EVENTS, CAT_COLORS });