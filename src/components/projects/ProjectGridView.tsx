// ═══════════════════════════════════════════════════════════
// Grid/Board View - Compact cards in a responsive grid
// ═══════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { EnrichedProject } from "@/lib/projects-data";
import {
  PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS,
  CLIENT_SERVICE_LABELS, formatCurrency, getAvatarColor, getInitials,
} from "@/lib/clients-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  projects: EnrichedProject[];
  onOpenProject: (project: EnrichedProject) => void;
}

export default function ProjectGridView({ projects, onOpenProject }: Props) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">Nenhum projeto encontrado</h3>
        <p className="text-muted-foreground text-sm">Ajuste os filtros ou crie um novo projeto</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <AnimatePresence>
        {projects.map(project => {
          const avatarColor = getAvatarColor(project.clientName);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onOpenProject(project)}
              className={cn(
                "border border-border rounded-xl bg-card overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group",
                project.status === 'pausado' && "opacity-70"
              )}
            >
              {/* Gradient header */}
              <div className={cn("h-2 w-full", PROJECT_STATUS_COLORS[project.status].replace('text-', 'bg-').split(' ')[0])} />

              <div className="p-3.5">
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-foreground font-semibold text-sm truncate">{project.name}</h4>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-medium shrink-0", PROJECT_STATUS_COLORS[project.status])}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[8px] font-bold shrink-0", avatarColor)}>
                    {getInitials(project.clientName)}
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{project.clientName}</p>
                </div>

                {/* Progress donut-style bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{project.completedTasks}/{project.totalTasks} tarefas</span>
                    <span className="text-xs font-bold text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                {/* Financial row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{formatCurrency(project.value)}</span>
                  {project.urgentTasks > 0 && (
                    <span className="flex items-center gap-0.5 text-red-400 text-[9px]">
                      <AlertTriangle className="w-2.5 h-2.5" /> {project.urgentTasks}
                    </span>
                  )}
                </div>

                {/* Service tag */}
                {project.clientService && (
                  <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {CLIENT_SERVICE_LABELS[project.clientService]}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
