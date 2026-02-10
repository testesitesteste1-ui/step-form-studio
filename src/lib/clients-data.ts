export type ClientStatus = 'proposta' | 'ativo' | 'pausado' | 'finalizado' | 'perdido';
export type ClientServiceType = 'social_media' | 'trafego_pago' | 'google_meu_negocio' | 'sites' | 'automacoes';
export type InteractionType = 'ligacao' | 'email' | 'whatsapp' | 'reuniao' | 'nota';
export type ProjectStatus = 'negociando' | 'ativo' | 'pausado' | 'concluido';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskColumn = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export type DocumentCategory = 'contratos' | 'propostas' | 'briefings' | 'outros';

// Legacy type kept for backwards compatibility
export type ClientService = 'sistemas' | 'marketing' | 'marketing_sistemas';

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
  software: 'Software/Ferramenta',
  ads: 'Anúncios/Ads',
  infraestrutura: 'Infraestrutura',
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
  tasks: ProjectTask[];
  notes: ProjectNote[];
  links: ProjectLink[];
  payments: ProjectPayment[];
  costs: ProjectCost[];
}

// ═══════════════════════════════════════════════════════════
// Service-specific data interfaces
// ═══════════════════════════════════════════════════════════

export interface SocialMediaData {
  platforms: string[]; // instagram, facebook, tiktok, linkedin, youtube, twitter
  postingFrequency: string; // ex: "3x por semana"
  contentTypes: string[]; // feed, stories, reels, carrossel
  followers: Record<string, number>; // { instagram: 5000, ... }
  observations: string;
}

export interface TrafegoPagoData {
  platforms: string[]; // meta_ads, google_ads, tiktok_ads
  monthlyBudget: number;
  currentROI: number; // percentage
  campaigns: number;
  adAccountIds: Record<string, string>; // { meta: "act_xxx", google: "xxx" }
  objectives: string; // vendas, leads, tráfego, reconhecimento
  observations: string;
}

export interface GoogleMeuNegocioData {
  profileUrl: string;
  businessName: string;
  category: string;
  reviewCount: number;
  averageRating: number;
  postsPerMonth: number;
  observations: string;
}

export interface SitesData {
  domain: string;
  hosting: string;
  platform: string; // wordpress, lovable, custom, wix, shopify
  status: string; // em_desenvolvimento, ativo, manutencao
  launchDate: string;
  pages: number;
  hasSEO: boolean;
  hasAnalytics: boolean;
  observations: string;
}

export interface AutomacoesData {
  tools: string[]; // n8n, make, zapier, custom
  activeFlows: number;
  integrations: string[]; // whatsapp, email, crm, erp
  description: string;
  observations: string;
}

export interface ServiceData {
  social_media?: SocialMediaData;
  trafego_pago?: TrafegoPagoData;
  google_meu_negocio?: GoogleMeuNegocioData;
  sites?: SitesData;
  automacoes?: AutomacoesData;
}

export interface Client {
  service: ClientService; // legacy
  services?: ClientServiceType[]; // new multi-select
  serviceData?: ServiceData; // detailed data per service
  id: string;
  name: string;
  private?: boolean;
  createdBy?: string;
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

export const CLIENT_SERVICE_LABELS: Record<ClientService, string> = {
  sistemas: 'Sistemas',
  marketing: 'Marketing',
  marketing_sistemas: 'Marketing e Sistemas',
};

export const SERVICE_TYPE_LABELS: Record<ClientServiceType, string> = {
  social_media: 'Social Media',
  trafego_pago: 'Tráfego Pago',
  google_meu_negocio: 'Google Meu Negócio',
  sites: 'Sites',
  automacoes: 'Automações',
};

export const SERVICE_TYPE_ICONS: Record<ClientServiceType, string> = {
  social_media: '📱',
  trafego_pago: '🎯',
  google_meu_negocio: '📍',
  sites: '🌐',
  automacoes: '⚙️',
};

export const SERVICE_TYPE_COLORS: Record<ClientServiceType, string> = {
  social_media: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  trafego_pago: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  google_meu_negocio: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  sites: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  automacoes: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
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

// Helper to get display labels for a client's services
export function getClientServiceLabels(client: Client): string[] {
  if (client.services && client.services.length > 0) {
    return client.services.map(s => SERVICE_TYPE_LABELS[s]);
  }
  // Fallback to legacy service field
  if (client.service) {
    return [CLIENT_SERVICE_LABELS[client.service]];
  }
  return [];
}
