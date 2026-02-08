import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Lead, STATUS_LABELS, LeadStatus } from "@/lib/leads-data";
import { formatCurrency } from "@/lib/clients-data";

interface Props {
  leads: Lead[];
}

const PIPELINE_COLORS: Record<LeadStatus, string> = {
  novo: "hsl(210, 70%, 55%)",
  em_contato: "hsl(45, 80%, 55%)",
  proposta_enviada: "hsl(270, 60%, 55%)",
  negociacao: "hsl(30, 80%, 55%)",
  ganho: "hsl(150, 60%, 45%)",
  perdido: "hsl(0, 70%, 55%)",
};

export default function LeadsPipeline({ leads }: Props) {
  const { pipelineData, recentLeads } = useMemo(() => {
    const statuses: LeadStatus[] = ['novo', 'em_contato', 'proposta_enviada', 'negociacao', 'ganho', 'perdido'];
    const pipelineData = statuses.map(status => ({
      name: STATUS_LABELS[status],
      status,
      count: leads.filter(l => l.status === status).length,
      value: leads.filter(l => l.status === status).reduce((s, l) => s + l.estimatedValue, 0),
      color: PIPELINE_COLORS[status],
    }));

    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
      .slice(0, 4);

    return { pipelineData, recentLeads };
  }, [leads]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-2 text-xs shadow-xl">
        <p className="text-foreground font-semibold">{d.name}</p>
        <p className="text-muted-foreground">{d.count} leads · {formatCurrency(d.value)}</p>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Funil de Leads</h3>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pipelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'hsl(200, 10%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(200, 10%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {pipelineData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent leads */}
      {recentLeads.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Leads Recentes</p>
          {recentLeads.map(l => (
            <div key={l.id} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
              <div className="truncate max-w-[55%]">
                <span className="text-foreground">{l.name}</span>
                {l.company && <span className="text-muted-foreground ml-1">· {l.company}</span>}
              </div>
              <span className="text-muted-foreground">{formatCurrency(l.estimatedValue)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
