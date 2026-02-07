import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Lead, LeadStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/leads-data";
import LeadCard from "./LeadCard";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const COLUMNS: LeadStatus[] = ['novo', 'em_contato', 'proposta_enviada', 'negociacao', 'ganho', 'perdido'];

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onOpenLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export default function KanbanBoard({ leads, onStatusChange, onOpenLead, onDeleteLead }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    onStatusChange(result.draggableId, newStatus);
  };

  const toggle = (status: string) => {
    setCollapsed(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        {COLUMNS.map(status => {
          const columnLeads = leads.filter(l => l.status === status);
          const isCollapsed = collapsed[status];

          return (
            <div key={status} className="bg-muted/20 rounded-xl border border-border overflow-hidden">
              {/* Column header */}
              <button
                onClick={() => toggle(status)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")} />
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-md border", STATUS_COLORS[status])}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground">{columnLeads.length}</span>
              </button>

              {/* Cards */}
              {!isCollapsed && (
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 min-h-[60px] transition-colors",
                        snapshot.isDraggingOver && "bg-primary/5"
                      )}
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(snapshot.isDragging && "opacity-80 rotate-1")}
                            >
                              <LeadCard
                                lead={lead}
                                onClick={() => onOpenLead(lead)}
                                onDelete={onDeleteLead}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
