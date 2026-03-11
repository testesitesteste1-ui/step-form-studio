// ═══════════════════════════════════════════════════════════
// Client Data Types & Utilities for Ex Eventos
// ═══════════════════════════════════════════════════════════

export type ClientType = 'administradora' | 'sindico';
export type ClientStatus = 'proposta' | 'ativo' | 'pausado' | 'finalizado' | 'perdido';
export type InteractionType = 'ligacao' | 'email' | 'whatsapp' | 'reuniao' | 'nota';
export type ProjectStatus = 'negociando' | 'ativo' | 'pausado' | 'concluido';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskColumn = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export type DocumentCategory = 'contratos' | 'propostas' | 'briefings' | 'outros';

export interface ClientInteraction {
  id: string;
  type: InteractionType;
  title: string;
  description: string;
  date: string;
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  size: string;
  uploadedAt: string;
  url: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  column: TaskColumn;
  priority: TaskPriority;
  description?: string;
  dueDate?: string;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
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

export const PROJECT_COST_CATEGORIES: Record<string, string> = {
  freelancer: 'Freelancer',
  equipamento: 'Equipamento',
  locacao: 'Locação',
  transporte: 'Transporte',
  material: 'Material',
  outros: 'Outros',
};

export interface Project {
  id: string;
  name: string;
  description: string;
  value: number;
  cost: number;
  paidAmount: number;
  status: ProjectStatus;
  startDate: string;
  condominioId?: string; // linked to a condomínio
  tasks: ProjectTask[];
  notes: ProjectNote[];
  links: ProjectLink[];
  payments: ProjectPayment[];
  costs: ProjectCost[];
}

// ═══════════════════════════════════════════════════════════
// Condomínio — nested inside Administradora clients
// ═══════════════════════════════════════════════════════════

export interface Condominio {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  contactName: string;
  email: string;
  observations?: string;
}

// ═══════════════════════════════════════════════════════════
// Client (Administradora or Síndico Profissional)
// ═══════════════════════════════════════════════════════════

export interface Client {
  id: string;
  type: ClientType;
  name: string; // Nome da Administradora / Nome da Empresa
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string; // uploaded logo
  contactName: string; // Nome do Contato / Responsável / Síndico
  status: ClientStatus;
  observations: string;
  favorite: boolean;
  private?: boolean;
  createdBy?: string;
  createdAt: string;
  lastContact: string;
  condominios: Condominio[]; // only used for administradoras
  projects: Project[];
  interactions: ClientInteraction[];
  notes: ClientNote[];
  documents: ClientDocument[];
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  administradora: 'Administradora',
  sindico: 'Síndico Profissional',
};

export const CLIENT_TYPE_ICONS: Record<ClientType, string> = {
  administradora: '🏢',
  sindico: '👤',
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  proposta: 'Proposta',
  ativo: 'Ativo',
  pausado: 'Pausado',
  finalizado: 'Finalizado',
  perdido: 'Perdido',
};

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  proposta: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pausado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  finalizado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  perdido: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  negociando: 'Negociando',
  ativo: 'Ativo',
  pausado: 'Pausado',
  concluido: 'Concluído',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  negociando: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ativo: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pausado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  concluido: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const TASK_COLUMN_LABELS: Record<TaskColumn, string> = {
  backlog: 'Backlog',
  todo: 'A Fazer',
  doing: 'Em Andamento',
  review: 'Revisão',
  done: 'Concluído',
};

export const TASK_COLUMN_COLORS: Record<TaskColumn, string> = {
  backlog: 'border-t-slate-500',
  todo: 'border-t-blue-500',
  doing: 'border-t-amber-500',
  review: 'border-t-purple-500',
  done: 'border-t-emerald-500',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: '🔥 Urgente',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  baixa: 'text-slate-400',
  media: 'text-blue-400',
  alta: 'text-orange-400',
  urgente: 'text-red-400 font-bold',
};

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  ligacao: '📞 Ligação',
  email: '📧 Email',
  whatsapp: '💬 WhatsApp',
  reuniao: '🤝 Reunião',
  nota: '📝 Nota Geral',
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contratos: 'Contratos',
  propostas: 'Propostas',
  briefings: 'Briefings',
  outros: 'Outros',
};

export const AVATAR_COLORS = [
  'from-red-600 to-orange-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
  'from-orange-500 to-amber-500',
  'from-slate-600 to-slate-500',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMonthsSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.max(1, Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
