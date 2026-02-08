// ═══════════════════════════════════════════════════════════
// Kanban View - Projects organized by status columns with drag & drop
// ═══════════════════════════════════════════════════════════

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { EnrichedProject } from "@/lib/projects-data";
import {
  ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  CLIENT_SERVICE_LABELS, formatCurrency,
} from "@/lib/clients-data";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  projects: EnrichedProject[];
  onOpenProject: (project: EnrichedProject) => void;
  onChangeStatus: (projectId: string, clientId: string, newStatus: ProjectStatus) => void;
}

const COLUMNS: { status: ProjectStatus; color: string }[] = [
  { status: 'negociando', color: 'border-t-blue-500' },
  { status: 'ativo', color: 'border-t-emerald-500' },
  { status: 'pausado', color: 'border-t-yellow-500' },
  { status: 'concluido', color: 'border-t-purple-500' },
];

export default function ProjectKanbanView({ projects, onOpenProject, onChangeStatus }: Props) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const projectId = result.draggableId;
    const newStatus = result.destination.droppableId as ProjectStatus;
    const project = projects.find(p => p.id === projectId);
    if (project && project.status !== newStatus) {
      onChangeStatus(projectId, project.clientId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {COLUMNS.map(col => {
          const colProjects = projects.filter(p => p.status === col.status);
          return (
            <Droppable droppableId={col.status} key={col.status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "bg-secondary/30 rounded-xl border-t-2 p-2.5 min-w-[280px] flex-shrink-0 flex-1 transition-colors",
                    col.color,
                    snapshot.isDraggingOver && "bg-primary/5 border-primary/30"
                  )}
                  style={{ minHeight: 200 }}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-bold text-foreground">{PROJECT_STATUS_LABELS[col.status]}</h4>
                    <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{colProjects.length}</span>
                  </div>

                  <div className="space-y-2">
                    {colProjects.map((project, index) => (
                      <Draggable key={project.id} draggableId={project.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "bg-card border border-border rounded-lg p-3 group transition-shadow cursor-pointer",
                              snapshot.isDragging && "shadow-lg shadow-primary/10 border-primary/40 rotate-1"
                            )}
                            onClick={() => onOpenProject(project)}
                          >
                            <div className="flex items-start gap-1.5">
                              <div {...provided.dragHandleProps} className="pt-0.5 cursor-grab active:cursor-grabbing shrink-0 touch-none">
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-foreground text-xs font-semibold truncate">{project.name}</p>
                                <p className="text-muted-foreground text-[10px] truncate">{project.clientName}</p>

                                {/* Progress */}
                                {project.totalTasks > 0 && (
                                  <div className="mt-2">
                                    <Progress value={project.progress} className="h-1" />
                                    <div className="flex items-center justify-between mt-0.5">
                                      <span className="text-[9px] text-muted-foreground">{project.progress}%</span>
                                      <span className="text-[9px] text-muted-foreground">{project.completedTasks}/{project.totalTasks}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Financial mini */}
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] text-primary font-bold">{formatCurrency(project.value)}</span>
                                  {project.clientService && (
                                    <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary">
                                      {CLIENT_SERVICE_LABELS[project.clientService]}
                                    </span>
                                  )}
                                </div>

                                {/* Urgent indicator */}
                                {project.urgentTasks > 0 && (
                                  <div className="flex items-center gap-1 mt-1 text-red-400 text-[9px]">
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    {project.urgentTasks} urgente(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
