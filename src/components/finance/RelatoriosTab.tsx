// ═══════════════════════════════════════════════════════════
// Relatórios Tab - Financial reports with charts
// ═══════════════════════════════════════════════════════════

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Client, formatCurrency, CLIENT_SERVICE_LABELS, SERVICE_TYPE_LABELS, ClientServiceType } from "@/lib/clients-data";
import { Transaction, isInPeriod, getLast6Months } from "@/lib/finance-data";
import { FileText, Users, Briefcase, TrendingUp } from "lucide-react";

interface Props {
  clients: Client[];
  transactions: Transaction[];
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export default function RelatoriosTab({ clients, transactions }: Props) {
  // ─── Report 1: Revenue by client ───
  const clientRevenue = useMemo(() => {
    return clients
      .map(c => {
        const projectRevenue = c.projects.reduce((sum, p) => sum + (p.value || 0), 0);
        const payments = c.projects.reduce((sum, p) => sum + (p.payments || []).reduce((s, pay) => s + pay.value, 0), 0);
        return { name: c.name.split(' ')[0], total: projectRevenue, received: payments };
      })
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [clients]);

  // ─── Report 2: Revenue by service type ───
  const serviceRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach(c => {
      const total = c.projects.reduce((sum, p) => sum + (p.value || 0), 0);
      if (c.services && c.services.length > 0) {
        // Distribute evenly across services
        const perService = total / c.services.length;
        c.services.forEach(s => {
          const label = SERVICE_TYPE_LABELS[s];
          map[label] = (map[label] || 0) + perService;
        });
      } else {
        const label = CLIENT_SERVICE_LABELS[c.service] || 'Outros';
        map[label] = (map[label] || 0) + total;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clients]);

  // ─── Report 3: Monthly trend ───
  const monthlyTrend = useMemo(() => {
    const months = getLast6Months();
    const allProjects = clients.flatMap(c => c.projects);
    return months.map(({ month, start, end }) => {
      const revenue = allProjects.reduce((sum, p) =>
        sum + (p.payments || []).filter((pay: any) => isInPeriod(pay.date, start, end))
          .reduce((s: number, pay: any) => s + (pay.value || 0), 0), 0)
        + transactions.filter(t => t.type === 'receita' && t.status === 'pago' && isInPeriod(t.date, start, end))
          .reduce((s, t) => s + t.value, 0);
      const expenses = transactions.filter(t => t.type === 'despesa' && t.status === 'pago' && isInPeriod(t.date, start, end))
        .reduce((s, t) => s + t.value, 0);
      return { month, receitas: revenue, despesas: expenses, lucro: revenue - expenses };
    });
  }, [clients, transactions]);

  // ─── Report 4: Profitability by project ───
  const projectProfitability = useMemo(() => {
    const allProjects = clients.flatMap(c => c.projects.map(p => ({
      name: p.name,
      client: c.name,
      value: p.value,
      received: (p.payments || []).reduce((s, pay) => s + pay.value, 0),
      margin: p.value > 0 ? Math.round(((p.payments || []).reduce((s, pay) => s + pay.value, 0) / p.value) * 100) : 0,
    })));
    return allProjects.filter(p => p.value > 0).sort((a, b) => b.margin - a.margin).slice(0, 10);
  }, [clients]);

  const formatTooltip = (value: number) => formatCurrency(value);

  return (
    <div className="space-y-6">
      {/* Report 1: By Client */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Faturamento por Cliente</h3>
        </div>
        {clientRevenue.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Sem dados</p>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientRevenue} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={formatTooltip} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" name="Recebido" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Report 2: By Service + Report 4: Profitability side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Service */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-foreground">Receita por Serviço</h3>
          </div>
          {serviceRevenue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Sem dados</p>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {serviceRevenue.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={formatTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Profitability */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Lucratividade por Projeto</h3>
          </div>
          {projectProfitability.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Sem dados</p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {projectProfitability.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-medium truncate">{p.name}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{p.client}</p>
                  </div>
                  <div className="w-16 bg-secondary rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${p.margin >= 100 ? 'bg-emerald-400' : p.margin >= 50 ? 'bg-blue-400' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, p.margin)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-foreground w-10 text-right">{p.margin}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report 3: Monthly Trend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-foreground">Tendência Mensal</h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={formatTooltip} />
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
