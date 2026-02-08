// ═══════════════════════════════════════════════════════════
// Calendar Page - Notion-inspired calendar with events
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, Loader2, Clock,
} from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";
import {
  CalendarEvent, CalendarView, CustomEvent,
  getMonthDays, getWeekDays, formatDateKey, isToday, isSameDay,
  getMonthName, getDayName, EVENT_TYPE_OPTIONS,
} from "@/lib/calendar-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EventModal from "@/components/calendar/EventModal";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

export default function Calendar() {
  const { allEvents, customEvents, loading, addEvent, updateEvent, deleteEvent } = useCalendar();

  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CustomEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    allEvents.forEach(e => {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [allEvents]);

  // Navigation
  const goNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const goPrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const goToday = () => setCurrentDate(new Date());

  // Handlers
  const handleDayClick = useCallback((date: Date) => {
    const key = formatDateKey(date);
    const dayEvents = eventsByDate.get(key) || [];
    setSelectedDate(key);
    setSelectedDayEvents(dayEvents);
  }, [eventsByDate]);

  const handleAddEvent = useCallback((date?: string) => {
    setEditingEvent(null);
    setSelectedDate(date || new Date().toISOString().split('T')[0]);
    setModalOpen(true);
    setSelectedDayEvents(null);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    if (event.sourceType !== 'custom') return; // can't edit auto-generated events
    const custom = customEvents.find(e => e.id === event.id);
    if (custom) {
      setEditingEvent(custom);
      setModalOpen(true);
      setSelectedDayEvents(null);
    }
  }, [customEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <span className="text-sm text-muted-foreground">{allEvents.length} eventos</span>
        </div>
        <Button onClick={() => handleAddEvent()} className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo Evento
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev} className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
            {view === 'month'
              ? `${getMonthName(month)} ${year}`
              : `${weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
            }
          </h2>
          <Button variant="outline" size="icon" onClick={goNext} className="w-8 h-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="text-xs ml-1">
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {[
            { value: 'month' as CalendarView, label: 'Mês' },
            { value: 'week' as CalendarView, label: 'Semana' },
          ].map(v => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                view === v.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' ? (
        <MonthView
          days={monthDays}
          month={month}
          eventsByDate={eventsByDate}
          onDayClick={handleDayClick}
          onAddEvent={handleAddEvent}
          onEventClick={handleEditEvent}
        />
      ) : (
        <WeekView
          days={weekDays}
          eventsByDate={eventsByDate}
          onDayClick={handleDayClick}
          onAddEvent={handleAddEvent}
          onEventClick={handleEditEvent}
        />
      )}

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDayEvents !== null && (
          <DayPanel
            date={selectedDate}
            events={selectedDayEvents}
            onClose={() => setSelectedDayEvents(null)}
            onAddEvent={() => handleAddEvent(selectedDate)}
            onEventClick={handleEditEvent}
          />
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <EventModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={addEvent}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
        editEvent={editingEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Month View
// ═══════════════════════════════════════════════════════════

interface MonthViewProps {
  days: Date[];
  month: number;
  eventsByDate: Map<string, CalendarEvent[]>;
  onDayClick: (date: Date) => void;
  onAddEvent: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function MonthView({ days, month, eventsByDate, onDayClick, onAddEvent, onEventClick }: MonthViewProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = formatDateKey(day);
          const dayEvents = eventsByDate.get(key) || [];
          const isCurrentMonth = day.getMonth() === month;
          const today = isToday(day);

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-1 sm:p-1.5 cursor-pointer transition-colors group relative",
                !isCurrentMonth && "bg-secondary/20",
                today && "bg-primary/5",
                "hover:bg-primary/5"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  today ? "bg-primary text-primary-foreground font-bold" : isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {day.getDate()}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onAddEvent(key); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <button
                    key={event.id}
                    onClick={e => { e.stopPropagation(); onEventClick(event); }}
                    className="w-full text-left text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${event.color}20`, color: event.color }}
                  >
                    {event.time && <span className="mr-0.5">{event.time}</span>}
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Week View (time-based)
// ═══════════════════════════════════════════════════════════

interface WeekViewProps {
  days: Date[];
  eventsByDate: Map<string, CalendarEvent[]>;
  onDayClick: (date: Date) => void;
  onAddEvent: (date: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function WeekView({ days, eventsByDate, onDayClick, onAddEvent, onEventClick }: WeekViewProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
        <div className="py-2 text-center text-xs text-muted-foreground" />
        {days.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={i}
              className={cn("py-2 text-center border-l border-border cursor-pointer hover:bg-primary/5", today && "bg-primary/5")}
              onClick={() => onDayClick(day)}
            >
              <p className="text-[10px] text-muted-foreground">{getDayName(day.getDay())}</p>
              <p className={cn(
                "text-sm font-semibold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full",
                today ? "bg-primary text-primary-foreground" : "text-foreground"
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="max-h-[500px] overflow-y-auto">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 min-h-[48px]">
            <div className="text-[10px] text-muted-foreground text-right pr-2 pt-1">{String(hour).padStart(2, '0')}:00</div>
            {days.map((day, di) => {
              const key = formatDateKey(day);
              const dayEvents = eventsByDate.get(key) || [];
              const hourEvents = dayEvents.filter(e => {
                if (!e.time) return false;
                const h = parseInt(e.time.split(':')[0]);
                return h === hour;
              });
              const today = isToday(day);

              return (
                <div
                  key={di}
                  className={cn(
                    "border-l border-border/50 relative cursor-pointer hover:bg-primary/5 transition-colors",
                    today && "bg-primary/3"
                  )}
                  onClick={() => onAddEvent(key)}
                >
                  {hourEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={e => { e.stopPropagation(); onEventClick(event); }}
                      className="absolute inset-x-0.5 top-0.5 text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium text-left z-10 hover:opacity-80"
                      style={{ backgroundColor: `${event.color}30`, color: event.color, borderLeft: `2px solid ${event.color}` }}
                    >
                      {event.time} {event.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* All-day / no-time events */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-t border-border bg-secondary/20">
        <div className="text-[9px] text-muted-foreground text-right pr-2 py-1.5">Dia</div>
        {days.map((day, di) => {
          const key = formatDateKey(day);
          const dayEvents = (eventsByDate.get(key) || []).filter(e => !e.time);
          return (
            <div key={di} className="border-l border-border/50 p-0.5 space-y-0.5">
              {dayEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="w-full text-left text-[9px] px-1 py-0.5 rounded truncate font-medium hover:opacity-80"
                  style={{ backgroundColor: `${event.color}20`, color: event.color }}
                >
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Day Detail Panel (slides in when clicking a day)
// ═══════════════════════════════════════════════════════════

interface DayPanelProps {
  date: string;
  events: CalendarEvent[];
  onClose: () => void;
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

function DayPanel({ date, events, onClose, onAddEvent, onEventClick }: DayPanelProps) {
  const d = new Date(date + 'T12:00:00');
  const dayName = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const fullDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="border border-border rounded-xl bg-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground capitalize">{dayName}</h3>
          <p className="text-xs text-muted-foreground">{fullDate}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onAddEvent} className="gap-1 text-xs">
            <Plus className="w-3 h-3" /> Evento
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">Fechar</Button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Nenhum evento neste dia</p>
      ) : (
        <div className="space-y-1.5">
          {events.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(event => {
            const typeOpt = EVENT_TYPE_OPTIONS.find(o => o.value === event.type);
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2.5 transition-colors",
                  event.sourceType === 'custom' ? "cursor-pointer hover:bg-secondary/50" : "cursor-default"
                )}
                style={{ borderLeft: `3px solid ${event.color}` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  {event.description && <p className="text-xs text-muted-foreground truncate">{event.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {event.time && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                      </span>
                    )}
                    {typeOpt && <span className="text-[10px] text-muted-foreground">{typeOpt.icon} {typeOpt.label}</span>}
                    {event.sourceName && <span className="text-[10px] text-primary">📁 {event.sourceName}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
