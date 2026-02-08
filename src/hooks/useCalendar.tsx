// ═══════════════════════════════════════════════════════════
// useCalendar - Custom events CRUD + aggregation from projects
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { useProjects } from "@/hooks/useProjects";
import { CalendarEvent, CustomEvent, CalendarEventType, newId } from "@/lib/calendar-data";
import { toast } from "sonner";

const EVENTS_PATH = "calendar_events";

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function parseEvent(key: string, value: any): CustomEvent {
  return {
    id: key,
    title: value.title || '',
    description: value.description || '',
    date: value.date || '',
    time: value.time || '',
    endTime: value.endTime || '',
    type: value.type || 'evento',
    color: value.color || 'hsl(200, 70%, 50%)',
    createdAt: value.createdAt || new Date().toISOString(),
  };
}

function sanitize(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

export function useCalendar() {
  const { projects } = useProjects();
  const [customEvents, setCustomEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to custom events from Firebase
  useEffect(() => {
    const eventsRef = ref(database, EVENTS_PATH);
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const parsed = Object.entries(data).map(([key, value]: [string, any]) => parseEvent(key, value));
          setCustomEvents(parsed);
        } else {
          setCustomEvents([]);
        }
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      }
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Aggregate all events: from projects + custom
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // Custom events
    customEvents.forEach(e => {
      events.push({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        endTime: e.endTime,
        type: e.type,
        color: e.color,
        sourceType: 'custom',
        sourceId: e.id,
      });
    });

    // Project deadlines
    projects.forEach(project => {
      if (project.endDate) {
        events.push({
          id: `proj-${project.id}`,
          title: `📁 ${project.name}`,
          description: `Prazo do projeto`,
          date: project.endDate,
          type: 'projeto_prazo',
          color: 'hsl(150, 60%, 45%)',
          sourceType: 'project',
          sourceId: project.id,
          sourceName: project.name,
        });
      }

      // Task deadlines
      (project.tasks || []).forEach(task => {
        if (task.dueDate && task.column !== 'done') {
          events.push({
            id: `task-${task.id}`,
            title: `✅ ${task.title}`,
            description: `Tarefa do projeto ${project.name}`,
            date: task.dueDate,
            type: 'tarefa_prazo',
            color: 'hsl(180, 60%, 45%)',
            sourceType: 'task',
            sourceId: task.id,
            sourceName: project.name,
          });
        }
      });

      // Payments
      (project.payments || []).forEach(payment => {
        if (payment.date) {
          const dateStr = payment.date.split('T')[0];
          events.push({
            id: `pay-${payment.id}`,
            title: `💰 ${payment.description}`,
            description: `Pagamento - ${project.name}`,
            date: dateStr,
            type: 'pagamento',
            color: 'hsl(120, 60%, 40%)',
            sourceType: 'payment',
            sourceId: payment.id,
            sourceName: project.name,
          });
        }
      });
    });

    return events;
  }, [projects, customEvents]);

  // CRUD for custom events
  const addEvent = async (event: Omit<CustomEvent, 'id' | 'createdAt'>) => {
    try {
      const eventsRef = ref(database, EVENTS_PATH);
      const newRef = push(eventsRef);
      await set(newRef, sanitize({ ...event, createdAt: new Date().toISOString() }));
      toast.success("Evento criado!");
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      toast.error("Erro ao criar evento");
    }
  };

  const updateEvent = async (event: CustomEvent) => {
    try {
      const eventRef = ref(database, `${EVENTS_PATH}/${event.id}`);
      const { id, ...data } = event;
      await set(eventRef, sanitize(data));
      toast.success("Evento atualizado!");
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      toast.error("Erro ao atualizar evento");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventRef = ref(database, `${EVENTS_PATH}/${id}`);
      await remove(eventRef);
      toast.success("Evento removido");
    } catch (err) {
      console.error("Erro ao remover evento:", err);
      toast.error("Erro ao remover evento");
    }
  };

  return { allEvents, customEvents, loading, addEvent, updateEvent, deleteEvent };
}
