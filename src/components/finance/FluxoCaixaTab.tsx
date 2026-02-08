// ═══════════════════════════════════════════════════════════
// Fluxo de Caixa Tab - Cash flow chart with Recharts
// Shows revenue vs expenses over time
// ═══════════════════════════════════════════════════════════

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Client, formatCurrency } from "@/lib/clients-data";
import { Transaction, getLast6Months, isInPeriod } from "@/lib/finance-data";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  clients: Client[];
  transactions: Transaction[];
}

export default function FluxoCaixaTab({ clients, transactions }: Props) {
  const chartData = useMemo(() => {
    const months = getLast6Months();
    const allProjects = clients.flatMap(c => c.projects.map(p => ({ ...p, clientId: c.id })));

    return months.map(({ month, start, end }) => {
      // Revenue: project payments + manual revenue
      const projectRevenue = allProjects.reduce((sum, p) => {
        return sum + (p.payments || [])
          .filter((pay: any) => isInPeriod(pay.date, start, end))
          .reduce((s: number, pay: any) => s + (pay.value || 0), 0);
      }, 0);

      const manualRevenue = transactions
        .filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, start, end))
        .reduce((s, t) => s + t.value, 0);

      const receitas = projectRevenue + manualRevenue;

      // Expenses
      const despesas = transactions
        .filter(t => t.type === 'despesa' && t.status === 'pago' && isInPeriod(t.date, start, end))
        .reduce((s, t) => s + t.value, 0);

      return { month, receitas, despesas, saldo: receitas - despesas };
    });
  }, [clients, transactions]);

  const lastMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];
  const trend = lastMonth && prevMonth ? lastMonth.saldo - prevMonth.saldo : 0;

  const totalReceitas = chartData.reduce((s, d) => s + d.receitas, 0);
  const totalDespesas = chartData.reduce((s, d) => s + d.despesas, 0);

  const formatTooltip = (value: number) => formatCurrency(value);

  return (
    <div className="space-y-4">
      {/* Mini summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-bold text-xs sm:text-sm">{formatCurrency(totalReceitas)}</p>
          <p className="text-muted-foreground text-[9px] sm:text-[10px]">Total Receitas (6m)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-red-400 font-bold text-xs sm:text-sm">{formatCurrency(totalDespesas)}</p>
          <p className="text-muted-foreground text-[9px] sm:text-[10px]">Total Despesas (6m)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className={`font-bold text-xs sm:text-sm ${totalReceitas - totalDespesas >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(totalReceitas - totalDespesas)}
          </p>
          <p className="text-muted-foreground text-[9px] sm:text-[10px]">Lucro (6m)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            {trend >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            <p className={`font-bold text-xs sm:text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(trend))}
            </p>
          </div>
          <p className="text-muted-foreground text-[9px] sm:text-[10px]">Tendência Mensal</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Fluxo de Caixa — Últimos 6 Meses</h3>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={formatTooltip}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" fill="url(#greenGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" fill="url(#redGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-3">Mês</th>
              <th className="text-right py-2 px-3">Receitas</th>
              <th className="text-right py-2 px-3">Despesas</th>
              <th className="text-right py-2 px-3">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 px-3 text-foreground font-medium">{d.month}</td>
                <td className="py-2 px-3 text-right text-emerald-400">{formatCurrency(d.receitas)}</td>
                <td className="py-2 px-3 text-right text-red-400">{formatCurrency(d.despesas)}</td>
                <td className={`py-2 px-3 text-right font-bold ${d.saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(d.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
