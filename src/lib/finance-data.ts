// ═══════════════════════════════════════════════════════════
// Financial Data Types & Utilities for NeuraSys
// Integrates with existing Client/Project data from Firebase
// ═══════════════════════════════════════════════════════════

export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pago' | 'pendente' | 'atrasado';
export type RevenueCategory = 'projeto' | 'renda_paralela';
export type ExpenseCategory = 'custo_projeto' | 'despesa_fixa' | 'despesa_variavel';
export type ExpenseSubcategory = 'software' | 'freelancer' | 'marketing' | 'infraestrutura' | 'contabilidade' | 'salario' | 'aluguel' | 'equipamento' | 'viagem' | 'anuncios' | 'outros';
export type PaymentMethod = 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro' | 'outros';
export type ParallelRevenueCategory = 'investimentos' | 'freela' | 'outros';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  value: number;
  date: string; // ISO string
  dueDate?: string;
  status: TransactionStatus;
  category: RevenueCategory | ExpenseCategory;
  subcategory?: ExpenseSubcategory | ParallelRevenueCategory;
  clientId?: string;
  projectId?: string;
  paymentMethod?: PaymentMethod;
  recurring?: boolean;
  observations?: string;
  createdAt: string;
}

export type PeriodFilter = 'mes_atual' | '3_meses' | '6_meses' | 'ano' | 'custom';

// ─── Labels ───

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pago: '✅ Pago',
  pendente: '⏳ Pendente',
  atrasado: '❌ Atrasado',
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  pago: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  atrasado: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  custo_projeto: 'Custo de Projeto',
  despesa_fixa: 'Despesa Fixa',
  despesa_variavel: 'Despesa Variável',
};

export const EXPENSE_SUBCATEGORY_LABELS: Record<ExpenseSubcategory, string> = {
  software: '💻 Software',
  freelancer: '👤 Freelancer',
  marketing: '📢 Marketing/Ads',
  infraestrutura: '🏢 Infraestrutura',
  contabilidade: '📋 Contabilidade',
  salario: '💰 Salário/Pró-labore',
  aluguel: '🏠 Aluguel/Coworking',
  equipamento: '🖥️ Equipamento',
  viagem: '✈️ Viagem',
  anuncios: '📣 Anúncios',
  outros: '📦 Outros',
};

export const PARALLEL_REVENUE_LABELS: Record<ParallelRevenueCategory, string> = {
  investimentos: '📈 Investimentos',
  freela: '💼 Freela Avulso',
  outros: '📦 Outros',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cartao: 'Cartão',
  transferencia: 'Transferência',
  dinheiro: 'Dinheiro',
  outros: 'Outros',
};

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  mes_atual: 'Mês Atual',
  '3_meses': 'Últimos 3 Meses',
  '6_meses': 'Últimos 6 Meses',
  ano: 'Ano Todo',
  custom: 'Personalizado',
};

// ─── Utility functions ───

export function getPeriodRange(period: PeriodFilter): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start: Date;

  switch (period) {
    case 'mes_atual':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '3_meses':
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case '6_meses':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case 'ano':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

export function isInPeriod(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
}

export function getLast6Months(): { month: string; start: Date; end: Date }[] {
  const result: { month: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    result.push({ month: getMonthLabel(start), start, end });
  }
  return result;
}
