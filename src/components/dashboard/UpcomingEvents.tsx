import { useMemo } from "react";
import { CalendarDays, Clock, AlertTriangle } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar-data";
import { Project, enrichProject } from "@/lib/projects-data";
import { cn } from "@/lib/utils";

interface Props {
  events: CalendarEvent[];
  projects: Project[];
}

export default function UpcomingEvents({ events, projects }: Props) {
  const { upcoming, overdueProjects, urgentTasks } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const upcoming = events
      .filter(e => e.date >= todayStr && e.date <= nextWeek)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);

    const enriched = projects.map(enrichProject);
    const overdueProjects = enriched.filter(p => p.isOverdue);
    const urgentTasks = enriched.flatMap(p =>
      (p.tasks || [])
        .filter(t => t.priority === 'urgente' && t.column !== 'done')
        .map(t => ({ ...t, projectName: p.name }))
    ).slice(0, 4);

    return { upcoming, overdueProjects, urgentTasks };
  }, [events, projects]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Próximos 7 Dias</h3>

      {/* Alerts */}
      {(overdueProjects.length > 0 || urgentTasks.length > 0) && (
        <div className="space-y-1.5">
          {overdueProjects.map(p => (
            <div key={p.id} className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 truncate">Atrasado: <span className="font-medium">{p.name}</span></span>
            </div>
          ))}
          {urgentTasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span className="text-orange-300 truncate">🔥 {t.title} <span className="text-orange-400/60">· {t.projectName}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <div className="space-y-1.5">
          {upcoming.map(e => (
            <div key={e.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
              <span className="text-foreground truncate flex-1">{e.title}</span>
              <span className="text-muted-foreground text-[10px] flex-shrink-0">{formatDate(e.date)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento nos próximos 7 dias</p>
      )}
    </div>
  );
}
