export type LeadStatus = 'novo' | 'em_contato' | 'proposta_enviada' | 'negociacao' | 'ganho' | 'perdido';
export type LeadOrigin = 'getninjas' | 'trafego_pago' | 'indicacao' | 'site';
export type LeadService = 'Marketing' | 'Desenvolvimento' | 'Social Media' | 'Design' | 'Consultoria';

export interface Interaction {
  id: string;
  date: string;
  type: 'ligacao' | 'email' | 'reuniao' | 'whatsapp' | 'nota';
  description: string;
}

export interface Proposal {
  title: string;
  description: string;
  value: number;
  deadline: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada';
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
  services: LeadService[];
  estimatedValue: number;
  origin: LeadOrigin;
  status: LeadStatus;
  entryDate: string;
  nextFollowUp: string;
  interactions: Interaction[];
  proposal: Proposal | null;
  notes: string;
  files: string[];
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo Lead',
  em_contato: 'Em Contato',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  novo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  em_contato: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  proposta_enviada: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  negociacao: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ganho: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  perdido: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const SERVICE_COLORS: Record<LeadService, string> = {
  Marketing: 'bg-pink-500/20 text-pink-400',
  Desenvolvimento: 'bg-cyan-500/20 text-cyan-400',
  'Social Media': 'bg-violet-500/20 text-violet-400',
  Design: 'bg-amber-500/20 text-amber-400',
  Consultoria: 'bg-lime-500/20 text-lime-400',
};

export const ORIGIN_LABELS: Record<LeadOrigin, string> = {
  getninjas: 'GetNinjas',
  trafego_pago: 'Tráfego Pago',
  indicacao: 'Indicação',
  site: 'Site',
};

export const ORIGIN_ICONS: Record<LeadOrigin, string> = {
  getninjas: 'Briefcase',
  trafego_pago: 'Megaphone',
  site: 'Globe',
  indicacao: 'UserPlus',
};

const today = new Date();
const daysAgo = (d: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - d);
  return date.toISOString().split('T')[0];
};
const daysFromNow = (d: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + d);
  return date.toISOString().split('T')[0];
};

export const MOCK_LEADS: Lead[] = [
  {
    id: '1', name: 'João Silva', company: 'TechCorp', email: 'joao@techcorp.com',
    phone: '(11) 99999-1111', whatsapp: '5511999991111',
    services: ['Marketing', 'Social Media'], estimatedValue: 8500,
    origin: 'trafego_pago', status: 'novo', entryDate: daysAgo(2), nextFollowUp: daysFromNow(1),
    interactions: [
      { id: '1a', date: daysAgo(2), type: 'whatsapp', description: 'Primeiro contato via DM do Instagram' }
    ],
    proposal: null, notes: '', files: [],
  },
  {
    id: '2', name: 'Maria Oliveira', company: 'StartUp XYZ', email: 'maria@startup.xyz',
    phone: '(21) 98888-2222', whatsapp: '5521988882222',
    services: ['Desenvolvimento'], estimatedValue: 25000,
    origin: 'site', status: 'em_contato', entryDate: daysAgo(5), nextFollowUp: daysFromNow(2),
    interactions: [
      { id: '2a', date: daysAgo(5), type: 'email', description: 'Enviou formulário no site' },
      { id: '2b', date: daysAgo(3), type: 'ligacao', description: 'Ligação para entender o projeto' }
    ],
    proposal: null, notes: 'Projeto de app mobile', files: [],
  },
  {
    id: '3', name: 'Carlos Mendes', company: 'Mendes & Associados', email: 'carlos@mendes.adv',
    phone: '(31) 97777-3333', whatsapp: '5531977773333',
    services: ['Marketing', 'Design'], estimatedValue: 12000,
    origin: 'indicacao', status: 'proposta_enviada', entryDate: daysAgo(10), nextFollowUp: daysAgo(1),
    interactions: [
      { id: '3a', date: daysAgo(10), type: 'whatsapp', description: 'Indicação do Pedro' },
      { id: '3b', date: daysAgo(7), type: 'reuniao', description: 'Reunião presencial' },
      { id: '3c', date: daysAgo(4), type: 'email', description: 'Proposta enviada por email' }
    ],
    proposal: { title: 'Rebranding Completo', description: 'Redesign da marca e materiais', value: 12000, deadline: '30 dias', status: 'enviada' },
    notes: 'Follow-up atrasado!', files: [],
  },
  {
    id: '4', name: 'Ana Beatriz', company: 'Loja Virtual AB', email: 'ana@lojaab.com',
    phone: '(41) 96666-4444', whatsapp: '5541966664444',
    services: ['Desenvolvimento', 'Design'], estimatedValue: 35000,
    origin: 'getninjas', status: 'negociacao', entryDate: daysAgo(15), nextFollowUp: daysFromNow(3),
    interactions: [
      { id: '4a', date: daysAgo(15), type: 'whatsapp', description: 'Contato via WhatsApp' },
      { id: '4b', date: daysAgo(12), type: 'reuniao', description: 'Reunião online - Zoom' },
      { id: '4c', date: daysAgo(8), type: 'email', description: 'Proposta V1 enviada' },
      { id: '4d', date: daysAgo(3), type: 'ligacao', description: 'Negociação de valores' }
    ],
    proposal: { title: 'E-commerce Completo', description: 'Loja virtual com painel admin', value: 35000, deadline: '60 dias', status: 'enviada' },
    notes: 'Quer parcelar em 3x', files: [],
  },
  {
    id: '5', name: 'Roberto Costa', company: 'Costa Imóveis', email: 'roberto@costaimoveis.com',
    phone: '(11) 95555-5555', whatsapp: '5511955555555',
    services: ['Social Media', 'Marketing'], estimatedValue: 5000,
    origin: 'trafego_pago', status: 'ganho', entryDate: daysAgo(20), nextFollowUp: '',
    interactions: [
      { id: '5a', date: daysAgo(20), type: 'whatsapp', description: 'DM Instagram' },
      { id: '5b', date: daysAgo(15), type: 'reuniao', description: 'Apresentação de portfólio' },
      { id: '5c', date: daysAgo(10), type: 'email', description: 'Contrato enviado' },
      { id: '5d', date: daysAgo(8), type: 'nota', description: 'Contrato assinado!' }
    ],
    proposal: { title: 'Social Media Management', description: 'Gestão de redes sociais mensal', value: 5000, deadline: 'Mensal', status: 'aprovada' },
    notes: 'Cliente fechado. Início mês que vem.', files: [],
  },
  {
    id: '6', name: 'Fernanda Lima', company: 'FL Consultoria', email: 'fernanda@flconsult.com',
    phone: '(51) 94444-6666', whatsapp: '5551944446666',
    services: ['Consultoria'], estimatedValue: 3000,
    origin: 'site', status: 'perdido', entryDate: daysAgo(25), nextFollowUp: '',
    interactions: [
      { id: '6a', date: daysAgo(25), type: 'email', description: 'Formulário no site' },
      { id: '6b', date: daysAgo(22), type: 'ligacao', description: 'Ligação - não atendeu' },
      { id: '6c', date: daysAgo(18), type: 'email', description: 'Sem resposta ao follow-up' }
    ],
    proposal: null, notes: 'Sem retorno após 3 tentativas', files: [],
  },
  {
    id: '7', name: 'Lucas Pereira', company: 'Pereira Tech', email: 'lucas@pereiratech.io',
    phone: '(11) 93333-7777', whatsapp: '5511933337777',
    services: ['Desenvolvimento', 'Consultoria'], estimatedValue: 18000,
    origin: 'indicacao', status: 'novo', entryDate: daysAgo(1), nextFollowUp: daysFromNow(2),
    interactions: [
      { id: '7a', date: daysAgo(1), type: 'whatsapp', description: 'Indicação do Roberto Costa' }
    ],
    proposal: null, notes: '', files: [],
  },
  {
    id: '8', name: 'Patricia Santos', company: 'PS Marketing', email: 'patricia@psmarket.com',
    phone: '(21) 92222-8888', whatsapp: '5521922228888',
    services: ['Marketing'], estimatedValue: 7500,
    origin: 'getninjas', status: 'em_contato', entryDate: daysAgo(4), nextFollowUp: daysFromNow(1),
    interactions: [
      { id: '8a', date: daysAgo(4), type: 'whatsapp', description: 'Contato via WhatsApp Business' },
      { id: '8b', date: daysAgo(2), type: 'reuniao', description: 'Call de briefing' }
    ],
    proposal: null, notes: 'Interessada em tráfego pago', files: [],
  },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
