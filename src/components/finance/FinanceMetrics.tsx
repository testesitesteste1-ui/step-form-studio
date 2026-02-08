// ═══════════════════════════════════════════════════════════
// Finance Metrics Cards - Top section of the Finance page
// Computes values from clients/projects + manual transactions
// ═══════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertCircle, Sparkles, Wallet, CreditCard } from "lucide-react";
import { Client } from "@/lib/clients-data";
import { Transaction, getPeriodRange, PeriodFilter, isInPeriod, getLast6Months } from "@/lib/finance-data";
import { formatCurrency } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

interface Props {
  clients: Client[];
  transactions: Transaction[];
  period: PeriodFilter;
}

export default function FinanceMetrics({ clients, transactions, period }: Props) {
  const { start, end } = getPeriodRange(period);

  const metrics = useMemo(() => {
    // All projects across all clients
    const allProjects = clients.flatMap(c => c.projects.map(p => ({ ...p, clientName: c.name, clientId: c.id })));

    // ─── CARD 1: Renda Realizada (projetos concluídos) ───
    const completedProjects = allProjects.filter(p => p.status === 'concluido');
    const rendaRealizada = completedProjects.reduce((sum, p) => sum + (p.value || 0), 0);

    // ─── CARD 2: Renda Ativa (projetos ativos) ───
    const activeProjects = allProjects.filter(p => p.status === 'ativo');
    const rendaAtiva = activeProjects.reduce((sum, p) => sum + (p.value || 0), 0);

    // ─── CARD 3: Falta Receber ───
    const faltaReceber = activeProjects.reduce((sum, p) => {
      const paid = (p.payments || []).reduce((s: number, pay: any) => s + (pay.value || 0), 0);
      return sum + Math.max(0, (p.value || 0) - paid);
    }, 0);

    // Top 3 clients with most pending
    const pendingByClient = clients.map(c => {
      const pending = c.projects
        .filter(p => p.status === 'ativo')
        .reduce((sum, p) => {
          const paid = (p.payments || []).reduce((s, pay) => s + (pay.value || 0), 0);
          return sum + Math.max(0, p.value - paid);
        }, 0);
      return { name: c.name, pending };
    }).filter(c => c.pending > 0).sort((a, b) => b.pending - a.pending).slice(0, 3);

    // ─── CARD 4: Renda Paralela ───
    const rendaParalela = transactions
      .filter(t => t.type === 'receita' && t.category === 'renda_paralela')
      .filter(t => isInPeriod(t.date, start, end))
      .reduce((sum, t) => sum + t.value, 0);

    // ─── CARD 5: Saldo Mensal ───
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const receitasMes = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, monthStart, monthEnd))
      .reduce((sum, t) => sum + t.value, 0);
    // Add project payments received this month
    const projectPaymentsMes = allProjects.reduce((sum, p) => {
      return sum + (p.payments || [])
        .filter((pay: any) => isInPeriod(pay.date, monthStart, monthEnd))
        .reduce((s: number, pay: any) => s + (pay.value || 0), 0);
    }, 0);
    const totalReceitasMes = receitasMes + projectPaymentsMes;

    const despesasMes = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago' && isInPeriod(t.date, monthStart, monthEnd))
      .reduce((sum, t) => sum + t.value, 0);

    const saldoMensal = totalReceitasMes - despesasMes;

    // ─── CARD 6: Despesas do mês ───
    const despesasProjeto = transactions.filter(t => t.type === 'despesa' && t.category === 'custo_projeto' && isInPeriod(t.date, monthStart, monthEnd)).reduce((s, t) => s + t.value, 0);
    const despesasFixas = transactions.filter(t => t.type === 'despesa' && t.category === 'despesa_fixa' && isInPeriod(t.date, monthStart, monthEnd)).reduce((s, t) => s + t.value, 0);
    const despesasVariaveis = transactions.filter(t => t.type === 'despesa' && t.category === 'despesa_variavel' && isInPeriod(t.date, monthStart, monthEnd)).reduce((s, t) => s + t.value, 0);

    return {
      rendaRealizada, completedCount: completedProjects.length,
      rendaAtiva, activeCount: activeProjects.length,
      faltaReceber, pendingByClient,
      rendaParalela,
      saldoMensal, totalReceitasMes, despesasMes,
      despesasProjeto, despesasFixas, despesasVariaveis,
      totalDespesasMes: despesasMes,
    };
  }, [clients, transactions, start, end]);

  const cards = [
    {
      icon: Trophy, label: 'Renda Realizada', value: formatCurrency(metrics.rendaRealizada),
      sub: `${metrics.completedCount} projetos concluídos`,
      gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/20',
    },
    {
      icon: TrendingUp, label: 'Renda Ativa', value: formatCurrency(metrics.rendaAtiva),
      sub: `${metrics.activeCount} projetos ativos`,
      gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20',
    },
    {
      icon: AlertCircle, label: 'Falta Receber', value: formatCurrency(metrics.faltaReceber),
      sub: metrics.pendingByClient.length > 0 ? metrics.pendingByClient.map(c => c.name).join(', ') : 'Nenhum pendente',
      gradient: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-400', borderColor: 'border-orange-500/20',
    },
    {
      icon: Sparkles, label: 'Renda Paralela', value: formatCurrency(metrics.rendaParalela),
      sub: 'No período selecionado',
      gradient: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', borderColor: 'border-purple-500/20',
    },
    {
      icon: Wallet, label: 'Saldo Mensal', value: formatCurrency(metrics.saldoMensal),
      sub: `Receitas: ${formatCurrency(metrics.totalReceitasMes)}`,
      gradient: metrics.saldoMensal >= 0 ? 'from-emerald-500/20 to-emerald-500/5' : 'from-red-500/20 to-red-500/5',
      iconColor: metrics.saldoMensal >= 0 ? 'text-emerald-400' : 'text-red-400',
      borderColor: metrics.saldoMensal >= 0 ? 'border-emerald-500/20' : 'border-red-500/20',
    },
    {
      icon: CreditCard, label: 'Despesas do Mês', value: formatCurrency(metrics.totalDespesasMes),
      sub: `Fixas: ${formatCurrency(metrics.despesasFixas)} · Var: ${formatCurrency(metrics.despesasVariaveis)}`,
      gradient: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-400', borderColor: 'border-red-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn("bg-gradient-to-br rounded-xl border p-3 sm:p-4", card.gradient, card.borderColor)}
        >
          <card.icon className={cn("w-5 h-5 mb-2", card.iconColor)} />
          <p className="text-foreground font-bold text-sm sm:text-lg">{card.value}</p>
          <p className="text-foreground/80 text-[10px] sm:text-xs font-medium">{card.label}</p>
          <p className="text-muted-foreground text-[9px] sm:text-[10px] mt-1 truncate">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
