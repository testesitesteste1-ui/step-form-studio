import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, CalendarDays } from "lucide-react";
import { Lead, formatCurrency } from "@/lib/leads-data";

interface Props {
  leads: Lead[];
}

export default function MetricsCards({ leads }: Props) {
  const active = leads.filter(l => !['ganho', 'perdido'].includes(l.status)).length;
  const won = leads.filter(l => l.status === 'ganho').length;
  const conversion = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;
  const inNegotiation = leads
    .filter(l => !['ganho', 'perdido'].includes(l.status))
    .reduce((s, l) => s + l.estimatedValue, 0);
  const thisMonth = leads.filter(l => {
    const d = new Date(l.entryDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const cards = [
    { label: "Leads Ativos", value: active.toString(), icon: Users, color: "text-blue-400" },
    { label: "Taxa de Conversão", value: `${conversion}%`, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Em Negociação", value: formatCurrency(inNegotiation), icon: DollarSign, color: "text-amber-400" },
    { label: "Leads este Mês", value: thisMonth.toString(), icon: CalendarDays, color: "text-violet-400" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <p className="text-xl font-bold text-foreground">{c.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
