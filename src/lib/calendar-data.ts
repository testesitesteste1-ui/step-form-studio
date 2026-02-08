// ═══════════════════════════════════════════════════════════
// Calendar Data - Types for events and calendar views
// ═══════════════════════════════════════════════════════════

export type CalendarEventType = 'projeto_prazo' | 'tarefa_prazo' | 'pagamento' | 'reuniao' | 'evento' | 'lembrete';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  type: CalendarEventType;
  color: string;
  // Source reference
  sourceType?: 'project' | 'task' | 'payment' | 'custom';
  sourceId?: string;
  sourceName?: string;
}

export interface CustomEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  type: CalendarEventType;
  color: string;
  createdAt: string;
}

export type CalendarView = 'month' | 'week';

export const EVENT_TYPE_OPTIONS: { value: CalendarEventType; label: string; icon: string; defaultColor: string }[] = [
  { value: 'reuniao', label: 'Reunião', icon: '🤝', defaultColor: 'hsl(200, 70%, 50%)' },
  { value: 'evento', label: 'Evento', icon: '📅', defaultColor: 'hsl(260, 60%, 55%)' },
  { value: 'lembrete', label: 'Lembrete', icon: '🔔', defaultColor: 'hsl(40, 80%, 50%)' },
  { value: 'projeto_prazo', label: 'Prazo de Projeto', icon: '📁', defaultColor: 'hsl(150, 60%, 45%)' },
  { value: 'tarefa_prazo', label: 'Prazo de Tarefa', icon: '✅', defaultColor: 'hsl(180, 60%, 45%)' },
  { value: 'pagamento', label: 'Pagamento', icon: '💰', defaultColor: 'hsl(120, 60%, 40%)' },
];

export const EVENT_COLORS = [
  'hsl(200, 70%, 50%)',   // blue
  'hsl(260, 60%, 55%)',   // purple
  'hsl(150, 60%, 45%)',   // green
  'hsl(40, 80%, 50%)',    // yellow
  'hsl(0, 70%, 55%)',     // red
  'hsl(320, 60%, 50%)',   // pink
  'hsl(180, 60%, 45%)',   // teal
  'hsl(30, 80%, 50%)',    // orange
];

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Date helpers ──

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Sunday of the week containing the first day
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  // End on Saturday of the week containing the last day
  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function getMonthName(month: number): string {
  return MONTHS_PT[month];
}

export function getDayName(day: number): string {
  return DAYS_PT[day];
}
