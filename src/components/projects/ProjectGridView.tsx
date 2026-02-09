// ═══════════════════════════════════════════════════════════
// Grid/Board View - Independent project cards
// ═══════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, AlertTriangle, Star } from "lucide-react";
import {
  EnrichedProject,
  PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS,
  SERVICE_LABELS, PRIORITY_OPTIONS, formatCurrency,
} from "@/lib/projects-data";
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
          const priorityOpt = PRIORITY_OPTIONS.find(o => o.value === project.priority);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onOpenProject(project)}
              className={cn(
                "border border-border rounded-xl bg-card overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group",
                project.status === 'pausado' && "opacity-70",
                project.isOverdue && "border-red-500/50"
              )}
            >
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4 className="text-foreground font-semibold text-sm truncate">{project.name}</h4>
                    {project.favorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                  </div>
                </div>

                {/* Service + Priority */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    {SERVICE_LABELS[project.service]}
                  </span>
                  {priorityOpt && (
                    <span className="text-[10px] text-muted-foreground">{priorityOpt.icon} {priorityOpt.label}</span>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{project.completedTasks}/{project.totalTasks} tarefas</span>
                    <span className="text-xs font-bold text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                {/* Financial + indicators */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{formatCurrency(project.value)}</span>
                  {project.urgentTasks > 0 && (
                    <span className="flex items-center gap-0.5 text-red-400 text-[9px]">
                      <AlertTriangle className="w-2.5 h-2.5" /> {project.urgentTasks}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
