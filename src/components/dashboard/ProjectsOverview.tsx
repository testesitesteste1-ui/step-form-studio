import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Project, enrichProject, PROJECT_STATUS_LABELS, ProjectStatus } from "@/lib/projects-data";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

interface Props {
  projects: Project[];
}

const STATUS_CHART_COLORS: Record<ProjectStatus, string> = {
  negociando: "hsl(210, 70%, 55%)",
  esperando: "hsl(185, 70%, 50%)",
  ativo: "hsl(150, 60%, 45%)",
  pausado: "hsl(45, 80%, 55%)",
  concluido: "hsl(270, 60%, 55%)",
  cancelado: "hsl(0, 70%, 55%)",
};

export default function ProjectsOverview({ projects }: Props) {
  const { statusData, topProjects } = useMemo(() => {
    const enriched = projects.map(enrichProject);
    const counts: Record<string, number> = {};
    enriched.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

    const statusData = Object.entries(counts).map(([status, count]) => ({
      name: PROJECT_STATUS_LABELS[status as ProjectStatus] || status,
      value: count,
      color: STATUS_CHART_COLORS[status as ProjectStatus] || "hsl(200, 15%, 40%)",
    }));

    const topProjects = enriched
      .filter(p => p.status === 'ativo')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { statusData, topProjects };
  }, [projects]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-2 text-xs shadow-xl">
        <p className="text-foreground">{payload[0].name}: <span className="font-bold">{payload[0].value}</span></p>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">Projetos — Visão Geral</h3>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Pie chart */}
        <div className="h-[160px] w-full sm:w-[160px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-1 items-start">
          {statusData.map(s => (
            <div key={s.name} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-muted-foreground">{s.name}</span>
              <span className="text-foreground font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top active projects */}
      {topProjects.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <p className="text-xs text-muted-foreground font-medium">Projetos Ativos (por valor)</p>
          {topProjects.map(p => (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate max-w-[60%]">{p.name}</span>
                <span className="text-muted-foreground">{formatCurrency(p.value)}</span>
              </div>
              <Progress value={p.progress} className="h-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
