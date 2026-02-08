// ═══════════════════════════════════════════════════════════
// Projects Data - Types and utilities for consolidated project views
// ═══════════════════════════════════════════════════════════

import { Client, Project, ProjectStatus, ClientService, TaskPriority, formatCurrency } from './clients-data';

// Enriched project with client info for the consolidated view
export interface EnrichedProject extends Project {
  clientId: string;
  clientName: string;
  clientService: ClientService;
  totalPaid: number;
  totalCosts: number;
  remaining: number;
  profit: number;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  urgentTasks: number;
  daysRemaining: number | null;
  isOverdue: boolean;
}

export type ProjectViewMode = 'lista' | 'kanban' | 'quadro';
export type ProjectSortBy = 'recentes' | 'alfabetico' | 'prazo' | 'valor' | 'progresso' | 'cliente';
export type ProjectGroupBy = 'nenhum' | 'cliente' | 'status' | 'servico';

export interface ProjectFilters {
  search: string;
  status: ProjectStatus[];
  clients: string[];
  services: ClientService[];
  priorities: TaskPriority[];
  valueMin: number;
  valueMax: number;
  overdue: boolean;
  dueSoon: boolean;
}

export const DEFAULT_FILTERS: ProjectFilters = {
  search: '',
  status: [],
  clients: [],
  services: [],
  priorities: [],
  valueMin: 0,
  valueMax: 0,
  overdue: false,
  dueSoon: false,
};

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: string }[] = [
  { value: 'negociando', label: 'Negociando', icon: '🤝' },
  { value: 'ativo', label: 'Ativo', icon: '✅' },
  { value: 'pausado', label: 'Pausado', icon: '⏸️' },
  { value: 'concluido', label: 'Concluído', icon: '🎉' },
];

export const SERVICE_OPTIONS: { value: ClientService; label: string }[] = [
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'marketing_sistemas', label: 'Marketing e Sistemas' },
];

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string; icon: string }[] = [
  { value: 'urgente', label: 'Urgente', icon: '🔥' },
  { value: 'alta', label: 'Alta', icon: '⚡' },
  { value: 'media', label: 'Média', icon: '📌' },
  { value: 'baixa', label: 'Baixa', icon: '📋' },
];

// Enrich a project with computed data from its client
export function enrichProject(project: Project, client: Client): EnrichedProject {
  const totalPaid = (project.payments || []).reduce((s, p) => s + p.value, 0);
  const totalCosts = (project.costs || []).reduce((s, c) => s + c.value, 0);
  const remaining = Math.max(0, project.value - totalPaid);
  const profit = project.value - totalCosts;
  const completedTasks = project.tasks.filter(t => t.column === 'done').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentTasks = project.tasks.filter(t => t.priority === 'urgente' && t.column !== 'done').length;

  // Days remaining (if project has an end date or deadline - use startDate + estimate)
  let daysRemaining: number | null = null;
  let isOverdue = false;

  return {
    ...project,
    clientId: client.id,
    clientName: client.name,
    clientService: client.service,
    totalPaid,
    totalCosts,
    remaining,
    profit,
    progress,
    completedTasks,
    totalTasks,
    urgentTasks,
    daysRemaining,
    isOverdue,
  };
}

// Enrich all projects from all clients
export function enrichAllProjects(clients: Client[]): EnrichedProject[] {
  return clients.flatMap(client =>
    client.projects.map(project => enrichProject(project, client))
  );
}

// Apply filters
export function applyFilters(projects: EnrichedProject[], filters: ProjectFilters): EnrichedProject[] {
  let result = [...projects];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }

  if (filters.status.length > 0) {
    result = result.filter(p => filters.status.includes(p.status));
  }

  if (filters.clients.length > 0) {
    result = result.filter(p => filters.clients.includes(p.clientId));
  }

  if (filters.services.length > 0) {
    result = result.filter(p => filters.services.includes(p.clientService));
  }

  if (filters.valueMin > 0) {
    result = result.filter(p => p.value >= filters.valueMin);
  }

  if (filters.valueMax > 0) {
    result = result.filter(p => p.value <= filters.valueMax);
  }

  return result;
}

// Apply sorting
export function applySorting(projects: EnrichedProject[], sortBy: ProjectSortBy): EnrichedProject[] {
  const sorted = [...projects];
  switch (sortBy) {
    case 'alfabetico':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'valor':
      return sorted.sort((a, b) => b.value - a.value);
    case 'progresso':
      return sorted.sort((a, b) => b.progress - a.progress);
    case 'cliente':
      return sorted.sort((a, b) => a.clientName.localeCompare(b.clientName));
    case 'prazo':
      return sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    case 'recentes':
    default:
      return sorted.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }
}

// Group projects
export function groupProjects(projects: EnrichedProject[], groupBy: ProjectGroupBy): { label: string; projects: EnrichedProject[] }[] {
  if (groupBy === 'nenhum') {
    return [{ label: '', projects }];
  }

  const groups = new Map<string, EnrichedProject[]>();

  projects.forEach(p => {
    let key: string;
    switch (groupBy) {
      case 'cliente':
        key = p.clientName;
        break;
      case 'status':
        key = p.status;
        break;
      case 'servico':
        key = p.clientService;
        break;
      default:
        key = '';
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });

  const STATUS_ORDER = ['negociando', 'ativo', 'pausado', 'concluido'];
  const entries = Array.from(groups.entries());

  if (groupBy === 'status') {
    entries.sort((a, b) => STATUS_ORDER.indexOf(a[0]) - STATUS_ORDER.indexOf(b[0]));
  }

  return entries.map(([key, projects]) => {
    let label = key;
    if (groupBy === 'status') {
      const opt = PROJECT_STATUS_OPTIONS.find(o => o.value === key);
      label = opt ? `${opt.icon} ${opt.label}` : key;
    }
    if (groupBy === 'servico') {
      const opt = SERVICE_OPTIONS.find(o => o.value === key);
      label = opt?.label || key;
    }
    return { label, projects };
  });
}
