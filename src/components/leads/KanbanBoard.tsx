import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Lead, LeadStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/leads-data";
import LeadCard from "./LeadCard";
import { cn } from "@/lib/utils";

const COLUMNS: LeadStatus[] = ['novo', 'em_contato', 'proposta_enviada', 'negociacao', 'ganho', 'perdido'];

interface Props {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onOpenLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export default function KanbanBoard({ leads, onStatusChange, onOpenLead, onDeleteLead }: Props) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    onStatusChange(result.draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {COLUMNS.map(status => {
          const columnLeads = leads.filter(l => l.status === status);
          return (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "bg-muted/20 rounded-xl border border-border p-2.5 min-w-[220px] flex-shrink-0 flex-1 transition-colors",
                    snapshot.isDraggingOver && "bg-primary/5 border-primary/30"
                  )}
                  style={{ minHeight: 200 }}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-md border", STATUS_COLORS[status])}>
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
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
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
