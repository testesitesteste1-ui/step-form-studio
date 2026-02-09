// ═══════════════════════════════════════════════════════════
// List View - Independent project cards
// ═══════════════════════════════════════════════════════════

import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, CheckCircle2, DollarSign, Clock, AlertTriangle, ArrowRight, Star, Calendar } from "lucide-react";
import {
  EnrichedProject, ProjectGroupBy, groupProjects,
  PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS, SERVICE_LABELS,
  PRIORITY_LABELS, PRIORITY_OPTIONS, formatCurrency,
} from "@/lib/projects-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  projects: EnrichedProject[];
  groupBy: ProjectGroupBy;
  onOpenProject: (project: EnrichedProject) => void;
}

export default function ProjectListView({ projects, groupBy, onOpenProject }: Props) {
  const groups = groupProjects(projects, groupBy);

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
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{group.projects.length}</span>
            </div>
          )}
          <div className="space-y-3">
            <AnimatePresence>
              {group.projects.map(project => {
                const priorityOpt = PRIORITY_OPTIONS.find(o => o.value === project.priority);
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onOpenProject(project)}
                    className={cn(
                      "border border-border rounded-xl bg-card p-4 cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group",
                      project.status === 'pausado' && "opacity-70",
                      project.isOverdue && "border-red-500/50"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-foreground font-semibold text-sm sm:text-base truncate">{project.name}</h4>
                          {project.favorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {SERVICE_LABELS[project.service]}
                          </span>
                          {priorityOpt && (
                            <span className="text-[10px] text-muted-foreground">
                              {priorityOpt.icon} {priorityOpt.label}
                            </span>
                          )}
                          {project.tags?.map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span className="text-[10px] text-muted-foreground">Progresso</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5 mb-1" />
                        <p className="text-foreground font-bold text-xs">{project.progress}%</p>
                        <p className="text-muted-foreground text-[9px]">{project.completedTasks}/{project.totalTasks} tarefas</p>
                      </div>

                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-muted-foreground">Financeiro</span>
                        </div>
                        <p className="text-foreground font-bold text-xs">{formatCurrency(project.value)}</p>
                        <p className="text-emerald-400 text-[9px]">Pago: {formatCurrency(project.totalPaid)}</p>
                        <p className="text-orange-400 text-[9px]">Falta: {formatCurrency(project.remaining)}</p>
                      </div>

                      <div className="bg-secondary/50 rounded-lg p-2 sm:p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3 text-violet-400" />
                          <span className="text-[10px] text-muted-foreground">Prazo</span>
                        </div>
                        {project.daysRemaining !== null ? (
                          <>
                            <p className={cn("font-bold text-xs", project.isOverdue ? "text-red-400" : "text-foreground")}>
                              {project.isOverdue ? `${Math.abs(project.daysRemaining)}d atrasado` : `${project.daysRemaining}d restantes`}
                            </p>
                            <p className="text-muted-foreground text-[9px]">
                              {project.endDate && new Date(project.endDate).toLocaleDateString('pt-BR')}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-muted-foreground text-xs">Sem prazo</p>
                            <p className="text-muted-foreground text-[9px]">
                              Início: {new Date(project.startDate).toLocaleDateString('pt-BR')}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                        {project.urgentTasks > 0 && (
                          <span className="flex items-center gap-0.5 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> {project.urgentTasks} urgente(s)
                          </span>
                        )}
                        <span>📅 {new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
