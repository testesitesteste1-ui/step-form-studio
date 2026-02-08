import { useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Zap, TrendingUp, Clock } from "lucide-react";
import { Project, enrichProject } from "@/lib/projects-data";
import { Lead } from "@/lib/leads-data";
import { Client, formatCurrency } from "@/lib/clients-data";
import { Transaction, isInPeriod } from "@/lib/finance-data";
import { cn } from "@/lib/utils";

interface Props {
  projects: Project[];
  leads: Lead[];
  clients: Client[];
  transactions: Transaction[];
}

export default function PerformanceIndicators({ projects, leads, clients, transactions }: Props) {
  const indicators = useMemo(() => {
    const enriched = projects.map(enrichProject);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Avg project value
    const activeEnriched = enriched.filter(p => ['ativo', 'concluido'].includes(p.status));
    const avgProjectValue = activeEnriched.length > 0
      ? activeEnriched.reduce((s, p) => s + p.value, 0) / activeEnriched.length
      : 0;

    // Avg task completion
    const allTasks = enriched.flatMap(p => p.tasks || []);
    const doneTasks = allTasks.filter(t => t.column === 'done').length;
    const taskCompletion = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

    // Revenue growth (current vs last month)
    const currentMonthRev = projects.reduce((s, p) =>
      s + (p.payments || []).filter(pay => isInPeriod(pay.date, monthStart, monthEnd)).reduce((ss, pay) => ss + pay.value, 0), 0)
      + transactions.filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, monthStart, monthEnd)).reduce((s, t) => s + t.value, 0);

    const lastMonthRev = projects.reduce((s, p) =>
      s + (p.payments || []).filter(pay => isInPeriod(pay.date, lastMonthStart, lastMonthEnd)).reduce((ss, pay) => ss + pay.value, 0), 0)
      + transactions.filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, lastMonthStart, lastMonthEnd)).reduce((s, t) => s + t.value, 0);

    const revenueGrowth = lastMonthRev > 0 ? Math.round(((currentMonthRev - lastMonthRev) / lastMonthRev) * 100) : 0;

    // Avg lead response (days from entry to first interaction)
    const leadsWithInteractions = leads.filter(l => l.interactions.length > 0);
    const avgResponseDays = leadsWithInteractions.length > 0
      ? Math.round(leadsWithInteractions.reduce((s, l) => {
          const entry = new Date(l.entryDate).getTime();
          const first = new Date(l.interactions[0].date).getTime();
          return s + Math.max(0, (first - entry) / (1000 * 60 * 60 * 24));
        }, 0) / leadsWithInteractions.length)
      : 0;

    return [
      {
        icon: Target, label: "Ticket Médio",
        value: formatCurrency(avgProjectValue),
        description: `${activeEnriched.length} projetos ativos/concluídos`,
        color: "text-blue-400",
      },
      {
        icon: Zap, label: "Tarefas Concluídas",
        value: `${taskCompletion}%`,
        description: `${doneTasks} de ${allTasks.length} tarefas`,
        color: "text-emerald-400",
      },
      {
        icon: TrendingUp, label: "Crescimento Mensal",
        value: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,
        description: "vs. mês anterior",
        color: revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400",
      },
      {
        icon: Clock, label: "Tempo Resposta Lead",
        value: `${avgResponseDays}d`,
        description: "Média de dias até 1° contato",
        color: avgResponseDays <= 2 ? "text-emerald-400" : "text-orange-400",
      },
    ];
  }, [projects, leads, clients, transactions]);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Indicadores de Desempenho</h3>
      <div className="grid grid-cols-2 gap-3">
        {indicators.map((ind, i) => (
          <motion.div
            key={ind.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-secondary/50 rounded-lg p-3 text-center"
          >
            <ind.icon className={cn("w-5 h-5 mx-auto mb-1.5", ind.color)} />
            <p className="text-foreground font-bold text-lg">{ind.value}</p>
            <p className="text-foreground/70 text-[10px] font-medium">{ind.label}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{ind.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
