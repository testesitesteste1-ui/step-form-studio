export type ClientStatus = 'proposta' | 'ativo' | 'pausado' | 'finalizado' | 'perdido';
export type InteractionType = 'ligacao' | 'email' | 'whatsapp' | 'reuniao' | 'nota';
export type ProjectStatus = 'negociando' | 'ativo' | 'pausado' | 'concluido';
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
}

export interface Project {
  id: string;
  name: string;
  description: string;
  value: number;
  status: ProjectStatus;
  startDate: string;
  tasks: ProjectTask[];
  notes: string;
  links: string[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  segment: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  phoneAlt: string;
  whatsapp: string;
  site: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  status: ClientStatus;
  observations: string;
  favorite: boolean;
  createdAt: string;
  lastContact: string;
  projects: Project[];
  interactions: ClientInteraction[];
  notes: ClientNote[];
  documents: ClientDocument[];
}

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

export const CLIENT_STATUS_ICONS: Record<ClientStatus, string> = {
  proposta: '🤝',
  ativo: '✅',
  pausado: '⏸️',
  finalizado: '🎉',
  perdido: '❌',
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
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
  'from-green-500 to-lime-500',
  'from-fuchsia-500 to-purple-500',
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
