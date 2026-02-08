import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Users, FolderKanban, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Briefcase
} from "lucide-react";
import { Project, enrichProject } from "@/lib/projects-data";
import { Client, formatCurrency } from "@/lib/clients-data";
import { Lead } from "@/lib/leads-data";
import { Transaction, isInPeriod } from "@/lib/finance-data";
import { cn } from "@/lib/utils";

interface Props {
  projects: Project[];
  clients: Client[];
  leads: Lead[];
  transactions: Transaction[];
}

export default function DashboardMetrics({ projects, clients, leads, transactions }: Props) {
  const metrics = useMemo(() => {
    const enriched = projects.map(enrichProject);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Revenue
    const totalRevenue = enriched.reduce((s, p) => s + p.totalPaid, 0);
    const monthRevenue = enriched.reduce((s, p) => {
      return s + (p.payments || [])
        .filter(pay => isInPeriod(pay.date, monthStart, monthEnd))
        .reduce((ss, pay) => ss + pay.value, 0);
    }, 0);
    const txMonthRevenue = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, monthStart, monthEnd))
      .reduce((s, t) => s + t.value, 0);

    // Expenses
    const txMonthExpenses = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago' && isInPeriod(t.date, monthStart, monthEnd))
      .reduce((s, t) => s + t.value, 0);
    const projMonthCosts = enriched.reduce((s, p) => {
      return s + (p.costs || [])
        .filter(c => isInPeriod(c.date, monthStart, monthEnd))
        .reduce((ss, c) => ss + c.value, 0);
    }, 0);

    const monthBalance = (monthRevenue + txMonthRevenue) - (txMonthExpenses + projMonthCosts);

    // Projects
    const activeProjects = enriched.filter(p => p.status === 'ativo').length;
    const overdueProjects = enriched.filter(p => p.isOverdue).length;
    const completedProjects = enriched.filter(p => p.status === 'concluido').length;

    // Pending to receive
    const pendingReceive = enriched
      .filter(p => p.status === 'ativo')
      .reduce((s, p) => s + p.remaining, 0);

    // Leads
    const activeLeads = leads.filter(l => !['ganho', 'perdido'].includes(l.status)).length;
    const wonLeads = leads.filter(l => l.status === 'ganho').length;
    const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;
    const pipelineValue = leads
      .filter(l => !['ganho', 'perdido'].includes(l.status))
      .reduce((s, l) => s + l.estimatedValue, 0);

    // Clients
    const activeClients = clients.filter(c => c.status === 'ativo').length;

    return {
      monthBalance, monthRevenue: monthRevenue + txMonthRevenue,
      monthExpenses: txMonthExpenses + projMonthCosts,
      activeProjects, overdueProjects, completedProjects, pendingReceive,
      activeLeads, conversionRate, pipelineValue, activeClients, totalRevenue,
    };
  }, [projects, clients, leads, transactions]);

  const cards = [
    {
      icon: DollarSign, label: "Saldo do Mês",
      value: formatCurrency(metrics.monthBalance),
      sub: `Receita: ${formatCurrency(metrics.monthRevenue)}`,
      gradient: metrics.monthBalance >= 0 ? "from-emerald-500/20 to-emerald-500/5" : "from-red-500/20 to-red-500/5",
      iconColor: metrics.monthBalance >= 0 ? "text-emerald-400" : "text-red-400",
      border: metrics.monthBalance >= 0 ? "border-emerald-500/20" : "border-red-500/20",
    },
    {
      icon: AlertTriangle, label: "Falta Receber",
      value: formatCurrency(metrics.pendingReceive),
      sub: `${metrics.activeProjects} projetos ativos`,
      gradient: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-400", border: "border-orange-500/20",
    },
    {
      icon: FolderKanban, label: "Projetos Ativos",
      value: metrics.activeProjects.toString(),
      sub: `${metrics.overdueProjects} atrasados · ${metrics.completedProjects} concluídos`,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-400", border: "border-blue-500/20",
    },
    {
      icon: Briefcase, label: "Pipeline de Leads",
      value: formatCurrency(metrics.pipelineValue),
      sub: `${metrics.activeLeads} leads ativos · ${metrics.conversionRate}% conversão`,
      gradient: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-400", border: "border-violet-500/20",
    },
    {
      icon: Users, label: "Clientes Ativos",
      value: metrics.activeClients.toString(),
      sub: `Total: ${clients.length} clientes`,
      gradient: "from-cyan-500/20 to-cyan-500/5",
      iconColor: "text-cyan-400", border: "border-cyan-500/20",
    },
    {
      icon: TrendingUp, label: "Receita Total",
      value: formatCurrency(metrics.totalRevenue),
      sub: "Todos os pagamentos recebidos",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400", border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className={cn(
            "bg-gradient-to-br rounded-xl border p-3 sm:p-4",
            card.gradient, card.border
          )}
        >
          <card.icon className={cn("w-5 h-5 mb-2", card.iconColor)} />
          <p className="text-foreground font-bold text-sm sm:text-lg truncate">{card.value}</p>
          <p className="text-foreground/80 text-[10px] sm:text-xs font-medium">{card.label}</p>
          <p className="text-foreground/60 text-[10px] sm:text-xs mt-1 truncate">{card.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
