// ═══════════════════════════════════════════════════════════
// Projects Data - Independent project types (NOT tied to clients)
// ═══════════════════════════════════════════════════════════

export type ProjectStatus = 'negociando' | 'esperando' | 'ativo' | 'pausado' | 'concluido' | 'cancelado';
export type ProjectPriority = 'congelado' | 'baixa' | 'media' | 'alta' | 'urgente';
export type ProjectService = 'marketing_digital' | 'social_media' | 'dev_web' | 'dev_mobile' | 'design' | 'consultoria' | 'manutencao' | 'outros';
export type ProjectRecurrence = 'unico' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
export type TaskColumn = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  column: TaskColumn;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  pinned?: boolean;
  createdAt: string;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export interface ProjectPayment {
  id: string;
  description: string;
  value: number;
  date: string;
}

export interface ProjectCost {
  id: string;
  description: string;
  value: number;
  date: string;
  category: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  service: ProjectService;
  recurrence: ProjectRecurrence;
  value: number;
  cost: number;
  startDate: string;
  endDate?: string;
  tags: string[];
  favorite: boolean;
  tasks: ProjectTask[];
  notes: ProjectNote[];
  links: ProjectLink[];
  payments: ProjectPayment[];
  costs: ProjectCost[];
  createdAt: string;
}

// Computed fields added for display
export interface EnrichedProject extends Project {
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

// ── View/filter types ──

export type ProjectViewMode = 'lista' | 'kanban' | 'quadro';
export type ProjectSortBy = 'recentes' | 'alfabetico' | 'prazo' | 'valor' | 'progresso' | 'prioridade';
export type ProjectGroupBy = 'nenhum' | 'status' | 'servico' | 'prioridade' | 'recorrencia';

export interface ProjectFilters {
  search: string;
  status: ProjectStatus[];
  services: ProjectService[];
  priorities: ProjectPriority[];
  tags: string[];
  recurrence: ProjectRecurrence[];
  valueMin: number;
  valueMax: number;
  overdue: boolean;
  dueSoon: boolean;
  favorite: boolean;
}

export const DEFAULT_FILTERS: ProjectFilters = {
  search: '',
  status: [],
  services: [],
  priorities: [],
  tags: [],
  recurrence: [],
  valueMin: 0,
  valueMax: 0,
  overdue: false,
  dueSoon: false,
  favorite: false,
};

// ── Labels & options ──

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: string; color: string }[] = [
  { value: 'negociando', label: 'Negociando', icon: '🤝', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'esperando', label: 'Esperando', icon: '⏳', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'ativo', label: 'Ativo', icon: '✅', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'pausado', label: 'Pausado', icon: '⏸️', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'concluido', label: 'Concluído', icon: '🎉', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'cancelado', label: 'Cancelado', icon: '❌', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = Object.fromEntries(
  PROJECT_STATUS_OPTIONS.map(o => [o.value, o.color])
) as Record<ProjectStatus, string>;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = Object.fromEntries(
  PROJECT_STATUS_OPTIONS.map(o => [o.value, o.label])
) as Record<ProjectStatus, string>;

export const SERVICE_OPTIONS: { value: ProjectService; label: string }[] = [
  { value: 'marketing_digital', label: 'Marketing Digital' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'dev_web', label: 'Desenvolvimento Web' },
  { value: 'dev_mobile', label: 'Desenvolvimento Mobile' },
  { value: 'design', label: 'Design' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' },
];

export const SERVICE_LABELS: Record<ProjectService, string> = Object.fromEntries(
  SERVICE_OPTIONS.map(o => [o.value, o.label])
) as Record<ProjectService, string>;

export const PRIORITY_OPTIONS: { value: ProjectPriority; label: string; icon: string }[] = [
  { value: 'urgente', label: 'Urgente', icon: '🔥' },
  { value: 'alta', label: 'Alta', icon: '⚡' },
  { value: 'media', label: 'Média', icon: '📌' },
  { value: 'baixa', label: 'Baixa', icon: '📋' },
  { value: 'congelado', label: 'Congelado', icon: '❄️' },
];

export const PRIORITY_LABELS: Record<ProjectPriority, string> = Object.fromEntries(
  PRIORITY_OPTIONS.map(o => [o.value, o.label])
) as Record<ProjectPriority, string>;

export const RECURRENCE_OPTIONS: { value: ProjectRecurrence; label: string }[] = [
  { value: 'unico', label: 'Único' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

export const RECURRENCE_LABELS: Record<ProjectRecurrence, string> = Object.fromEntries(
  RECURRENCE_OPTIONS.map(o => [o.value, o.label])
) as Record<ProjectRecurrence, string>;

export const COST_CATEGORIES: Record<string, string> = {
  freelancer: 'Freelancer',
  software: 'Software/Ferramenta',
  ads: 'Anúncios/Ads',
  infraestrutura: 'Infraestrutura',
  material: 'Material',
  outros: 'Outros',
};

export const KANBAN_COLUMNS: { status: ProjectStatus; borderColor: string }[] = [
  { status: 'negociando', borderColor: 'border-t-blue-500' },
  { status: 'esperando', borderColor: 'border-t-cyan-500' },
  { status: 'ativo', borderColor: 'border-t-emerald-500' },
  { status: 'pausado', borderColor: 'border-t-yellow-500' },
  { status: 'concluido', borderColor: 'border-t-purple-500' },
  { status: 'cancelado', borderColor: 'border-t-red-500' },
];

// ── Helpers ──

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function enrichProject(project: Project): EnrichedProject {
  const totalPaid = (project.payments || []).reduce((s, p) => s + p.value, 0);
  const totalCosts = (project.costs || []).reduce((s, c) => s + c.value, 0);
  const remaining = Math.max(0, project.value - totalPaid);
  const profit = project.value - totalCosts;
  const completedTasks = (project.tasks || []).filter(t => t.column === 'done').length;
  const totalTasks = (project.tasks || []).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const urgentTasks = (project.tasks || []).filter(t => t.priority === 'urgente' && t.column !== 'done').length;

  let daysRemaining: number | null = null;
  let isOverdue = false;
  if (project.endDate) {
    const end = new Date(project.endDate);
    const now = new Date();
    daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    isOverdue = daysRemaining < 0 && project.status !== 'concluido' && project.status !== 'cancelado';
  }

  return {
    ...project,
    totalPaid, totalCosts, remaining, profit,
    progress, completedTasks, totalTasks, urgentTasks,
    daysRemaining, isOverdue,
  };
}

export function enrichAllProjects(projects: Project[]): EnrichedProject[] {
  return projects.map(enrichProject);
}

// ── Filtering ──

export function applyFilters(projects: EnrichedProject[], filters: ProjectFilters): EnrichedProject[] {
  let result = [...projects];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }
  if (filters.status.length > 0) result = result.filter(p => filters.status.includes(p.status));
  if (filters.services.length > 0) result = result.filter(p => filters.services.includes(p.service));
  if (filters.priorities.length > 0) result = result.filter(p => filters.priorities.includes(p.priority));
  if (filters.recurrence.length > 0) result = result.filter(p => filters.recurrence.includes(p.recurrence));
  if (filters.tags.length > 0) result = result.filter(p => filters.tags.some(t => (p.tags || []).includes(t)));
  if (filters.valueMin > 0) result = result.filter(p => p.value >= filters.valueMin);
  if (filters.valueMax > 0) result = result.filter(p => p.value <= filters.valueMax);
  if (filters.overdue) result = result.filter(p => p.isOverdue);
  if (filters.dueSoon) result = result.filter(p => p.daysRemaining !== null && p.daysRemaining >= 0 && p.daysRemaining <= 7);
  if (filters.favorite) result = result.filter(p => p.favorite);

  return result;
}

// ── Sorting ──

const PRIORITY_ORDER: ProjectPriority[] = ['urgente', 'alta', 'media', 'baixa', 'congelado'];

export function applySorting(projects: EnrichedProject[], sortBy: ProjectSortBy): EnrichedProject[] {
  const sorted = [...projects];
  switch (sortBy) {
    case 'alfabetico': return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'valor': return sorted.sort((a, b) => b.value - a.value);
    case 'progresso': return sorted.sort((a, b) => b.progress - a.progress);
    case 'prioridade': return sorted.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
    case 'prazo': return sorted.sort((a, b) => {
      if (!a.endDate && !b.endDate) return 0;
      if (!a.endDate) return 1;
      if (!b.endDate) return -1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });
    case 'recentes':
    default: return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// ── Grouping ──

export function groupProjects(projects: EnrichedProject[], groupBy: ProjectGroupBy): { label: string; projects: EnrichedProject[] }[] {
  if (groupBy === 'nenhum') return [{ label: '', projects }];

  const groups = new Map<string, EnrichedProject[]>();
  projects.forEach(p => {
    let key: string;
    switch (groupBy) {
      case 'status': key = p.status; break;
      case 'servico': key = p.service; break;
      case 'prioridade': key = p.priority; break;
      case 'recorrencia': key = p.recurrence; break;
      default: key = '';
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });

  return Array.from(groups.entries()).map(([key, projects]) => {
    let label = key;
    if (groupBy === 'status') {
      const opt = PROJECT_STATUS_OPTIONS.find(o => o.value === key);
      label = opt ? `${opt.icon} ${opt.label}` : key;
    } else if (groupBy === 'servico') {
      label = SERVICE_LABELS[key as ProjectService] || key;
    } else if (groupBy === 'prioridade') {
      const opt = PRIORITY_OPTIONS.find(o => o.value === key);
      label = opt ? `${opt.icon} ${opt.label}` : key;
    } else if (groupBy === 'recorrencia') {
      label = RECURRENCE_LABELS[key as ProjectRecurrence] || key;
    }
    return { label, projects };
  });
}

// ── Default empty project ──

export function createEmptyProject(): Omit<Project, 'id'> {
  return {
    name: '',
    description: '',
    status: 'negociando',
    priority: 'media',
    service: 'dev_web',
    recurrence: 'unico',
    value: 0,
    cost: 0,
    startDate: new Date().toISOString().split('T')[0],
    tags: [],
    favorite: false,
    tasks: [],
    notes: [],
    links: [],
    payments: [],
    costs: [],
    createdAt: new Date().toISOString(),
  };
}
