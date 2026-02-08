import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Project } from "@/lib/projects-data";
import { Client, formatCurrency } from "@/lib/clients-data";
import { Transaction, isInPeriod, getMonthLabel } from "@/lib/finance-data";

interface Props {
  projects: Project[];
  clients: Client[];
  transactions: Transaction[];
}

export default function RevenueChart({ projects, clients, transactions }: Props) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { month: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({ month: getMonthLabel(start), start, end });
    }

    const clientProjects = clients.flatMap(c => c.projects);

    return months.map(({ month, start, end }) => {
      // Standalone project revenue
      const projRevenue = projects.reduce((s, p) =>
        s + (p.payments || []).filter(pay => isInPeriod(pay.date, start, end)).reduce((ss, pay) => ss + pay.value, 0), 0);
      // Client project revenue
      const clientRevenue = clientProjects.reduce((s, p) =>
        s + (p.payments || []).filter(pay => isInPeriod(pay.date, start, end)).reduce((ss, pay) => ss + (pay.value || 0), 0), 0);
      // Transaction revenue
      const txRevenue = transactions
        .filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, start, end))
        .reduce((s, t) => s + t.value, 0);
      // Standalone project costs
      const projCosts = projects.reduce((s, p) =>
        s + (p.costs || []).filter(c => isInPeriod(c.date, start, end)).reduce((ss, c) => ss + c.value, 0), 0);
      // Client project costs
      const clientCosts = clientProjects.reduce((s, p) =>
        s + (p.costs || []).filter(c => isInPeriod(c.date, start, end)).reduce((ss, c) => ss + (c.value || 0), 0), 0);
      // Transaction expenses
      const txExpenses = transactions
        .filter(t => t.type === 'despesa' && t.status === 'pago' && isInPeriod(t.date, start, end))
        .reduce((s, t) => s + t.value, 0);

      const receita = projRevenue + clientRevenue + txRevenue;
      const despesa = projCosts + clientCosts + txExpenses;

      return { month, receita, despesa, lucro: receita - despesa };
    });
  }, [projects, clients, transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-foreground font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey === 'receita' ? 'Receita' : p.dataKey === 'despesa' ? 'Despesa' : 'Lucro'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Fluxo Financeiro — Últimos 6 Meses</h3>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 20%)" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(200, 10%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(200, 10%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="receita" stroke="hsl(150, 60%, 45%)" fill="url(#gReceita)" strokeWidth={2} />
            <Area type="monotone" dataKey="despesa" stroke="hsl(0, 72%, 51%)" fill="url(#gDespesa)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
