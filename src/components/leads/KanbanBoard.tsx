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
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh] snap-x snap-mandatory md:snap-none">
        {COLUMNS.map(status => {
          const columnLeads = leads.filter(l => l.status === status);
          return (
            <div key={status} className="min-w-[260px] w-[260px] flex-shrink-0 snap-start">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-md border", STATUS_COLORS[status])}>
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground">{columnLeads.length}</span>
              </div>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "space-y-2 min-h-[200px] rounded-lg p-2 transition-colors",
                      snapshot.isDraggingOver ? "bg-primary/5" : "bg-muted/30"
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
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
