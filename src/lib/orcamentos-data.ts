// ═══════════════════════════════════════════════════════════
// Orçamentos (Budgets) — Data Types & Constants
// ═══════════════════════════════════════════════════════════

export interface OrcamentoItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Orcamento {
  id: string;
  clientId: string;        // Administradora ID
  clientName: string;      // denormalized
  condominioId: string;    // Condomínio ID
  condominioName: string;  // denormalized
  date: string;            // Data do Orçamento
  assemblyDate: string;    // Data da Assembleia
  assemblyTime: string;    // Horário da Assembleia
  items: OrcamentoItem[];
  totalValue: number;
  status: OrcamentoStatus;
  observations?: string;
  createdAt: string;
  createdBy?: string;
}

export type OrcamentoStatus = 'rascunho' | 'enviado' | 'aprovado' | 'recusado';

export const ORCAMENTO_STATUS_LABELS: Record<OrcamentoStatus, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
};

export const ORCAMENTO_STATUS_COLORS: Record<OrcamentoStatus, string> = {
  rascunho: 'bg-muted text-muted-foreground border-border',
  enviado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  aprovado: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  recusado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Predefined service items for assemblies
export const ORCAMENTO_CATALOG: { id: string; name: string; defaultPrice: number }[] = [
  { id: 'caixas_som', name: 'Caixas de Som', defaultPrice: 0 },
  { id: 'mic_sem_fio', name: 'Microfones s/ Fio', defaultPrice: 0 },
  { id: 'mic_com_fio', name: 'Microfone c/ Fio (Cortesia)', defaultPrice: 0 },
  { id: 'gravacao_audio', name: 'Gravação de Áudio c/ Transcrição', defaultPrice: 0 },
  { id: 'gravacao_imagem', name: 'Gravação de Imagem', defaultPrice: 0 },
  { id: 'projetores', name: 'Projetores', defaultPrice: 0 },
  { id: 'telas_projecao', name: 'Telas p/ Projeção', defaultPrice: 0 },
  { id: 'votacao_eletronica', name: 'Votação Eletrônica', defaultPrice: 0 },
  { id: 'sorteio_vagas', name: 'Sorteio de Vagas de Garagem', defaultPrice: 0 },
  { id: 'tecnicos', name: 'Técnicos', defaultPrice: 0 },
  { id: 'cadeiras', name: 'Cadeiras', defaultPrice: 0 },
  { id: 'mesas_apoio', name: 'Mesas de Apoio', defaultPrice: 0 },
  { id: 'mesas_pranchao', name: 'Mesas Pranchão', defaultPrice: 0 },
  { id: 'frete', name: 'Frete', defaultPrice: 0 },
];
