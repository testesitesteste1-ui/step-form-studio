import { useState } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  ArrowLeft, Plus, Trash2, AlertTriangle, GripVertical,
  Link as LinkIcon, DollarSign, Calendar, Edit2, CheckCircle2,
} from "lucide-react";
import {
  Project, ProjectTask, ProjectNote, ProjectLink, ProjectPayment,
  TaskColumn, TaskPriority,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  TASK_COLUMN_LABELS, TASK_COLUMN_COLORS,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS,
  formatCurrency, newId,
} from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Props {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => Promise<void>;
}

const COLUMNS: TaskColumn[] = ['backlog', 'todo', 'doing', 'review', 'done'];

export default function ProjectDetail({ project, onBack, onUpdate }: Props) {
  const { toast } = useToast();
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);
  const [linkModal, setLinkModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', column: 'todo' as TaskColumn, priority: 'media' as TaskPriority, dueDate: '',
  });
  const [noteContent, setNoteContent] = useState('');
  const [linkForm, setLinkForm] = useState({ title: '', url: '' });
  const [paymentForm, setPaymentForm] = useState({ description: '', value: '', date: new Date().toISOString().split('T')[0] });

  const totalPaid = (project.payments || []).reduce((sum, p) => sum + p.value, 0);
  const remaining = project.value - totalPaid;
  const completedTasks = project.tasks.filter(t => t.column === 'done').length;
  const urgentTasks = project.tasks.filter(t => t.priority === 'urgente' && t.column !== 'done');
  const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;

  // ─── Drag and Drop ───
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newColumn = result.destination.droppableId as TaskColumn;
    const tasks = project.tasks.map(t =>
      t.id === taskId ? { ...t, column: newColumn, completed: newColumn === 'done' } : t
    );
    await onUpdate({ ...project, tasks });
  };

  // ─── Task CRUD ───
  const openNewTask = (column: TaskColumn = 'todo') => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', column, priority: 'media', dueDate: '' });
    setTaskModal(true);
  };

  const openEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      column: task.column, priority: task.priority, dueDate: task.dueDate || '',
    });
    setTaskModal(true);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) { toast({ title: "Título obrigatório", variant: "destructive" }); return; }
    let tasks: ProjectTask[];
    if (editingTask) {
      tasks = project.tasks.map(t => t.id === editingTask.id ? {
        ...t, ...taskForm, completed: taskForm.column === 'done',
      } : t);
    } else {
      tasks = [...project.tasks, {
        id: newId(), ...taskForm, completed: taskForm.column === 'done', createdAt: new Date().toISOString(),
      }];
    }
    await onUpdate({ ...project, tasks });
    toast({ title: editingTask ? "Tarefa atualizada!" : "Tarefa criada!" });
    setTaskModal(false);
  };

  const deleteTask = async (taskId: string) => {
    await onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== taskId) });
  };

  // ─── Notes CRUD ───
  const openNewNote = () => { setEditingNote(null); setNoteContent(''); setNoteModal(true); };
  const openEditNote = (note: ProjectNote) => { setEditingNote(note); setNoteContent(note.content); setNoteModal(true); };
  const saveNote = async () => {
    if (!noteContent.trim()) return;
    const notes = editingNote
      ? project.notes.map(n => n.id === editingNote.id ? { ...n, content: noteContent } : n)
      : [...project.notes, { id: newId(), content: noteContent, createdAt: new Date().toISOString() }];
    await onUpdate({ ...project, notes });
    toast({ title: editingNote ? "Nota atualizada!" : "Nota criada!" });
    setNoteModal(false);
  };
  const deleteNote = async (id: string) => {
    await onUpdate({ ...project, notes: project.notes.filter(n => n.id !== id) });
  };

  // ─── Links CRUD ───
  const saveLink = async () => {
    if (!linkForm.url.trim()) return;
    await onUpdate({ ...project, links: [...project.links, { id: newId(), title: linkForm.title || linkForm.url, url: linkForm.url }] });
    setLinkForm({ title: '', url: '' }); setLinkModal(false);
  };
  const deleteLink = async (id: string) => {
    await onUpdate({ ...project, links: project.links.filter(l => l.id !== id) });
  };

  // ─── Payments CRUD ───
  const savePayment = async () => {
    const val = parseFloat(paymentForm.value);
    if (!val || !paymentForm.description.trim()) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }
    const payments = [...(project.payments || []), { id: newId(), description: paymentForm.description, value: val, date: paymentForm.date }];
    await onUpdate({ ...project, payments, paidAmount: totalPaid + val });
    toast({ title: "Pagamento registrado!" });
    setPaymentForm({ description: '', value: '', date: new Date().toISOString().split('T')[0] }); setPaymentModal(false);
  };
  const deletePayment = async (id: string) => {
    const payments = (project.payments || []).filter(p => p.id !== id);
    await onUpdate({ ...project, payments, paidAmount: payments.reduce((s, p) => s + p.value, 0) });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{project.name}</h2>
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
      </div>

      {/* Financial + Progress Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Valor Total', value: formatCurrency(project.value), color: 'text-primary' },
          { label: 'Pago', value: formatCurrency(totalPaid), color: 'text-emerald-400' },
          { label: 'Falta Pagar', value: formatCurrency(Math.max(0, remaining)), color: remaining > 0 ? 'text-orange-400' : 'text-emerald-400' },
          { label: 'Tarefas', value: `${completedTasks}/${project.tasks.length}`, color: 'text-violet-400' },
        ].map((m, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-2.5 sm:p-3 text-center">
            <p className={cn("font-bold text-xs sm:text-sm", m.color)}>{m.value}</p>
            <p className="text-muted-foreground text-[9px] sm:text-[10px]">{m.label}</p>
          </div>
        ))}
      </div>

      {project.tasks.length > 0 && <Progress value={progress} className="h-1.5 sm:h-2" />}

      {/* Urgent alerts */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs font-bold">{urgentTasks.length} urgente(s)</span>
          </div>
          {urgentTasks.map(t => (
            <p key={t.id} className="text-red-300 text-xs">• {t.title}</p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="kanban" className="text-xs sm:text-sm">Kanban</TabsTrigger>
          <TabsTrigger value="notas" className="text-xs sm:text-sm">Notas ({project.notes.length})</TabsTrigger>
          <TabsTrigger value="links" className="text-xs sm:text-sm">Links ({project.links.length})</TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs sm:text-sm">Financeiro</TabsTrigger>
        </TabsList>

        {/* ─── KANBAN TAB with Drag & Drop ─── */}
        <TabsContent value="kanban" className="mt-3">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => openNewTask()} className="gap-1 text-xs">
              <Plus className="w-4 h-4" /> Nova Tarefa
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible">
              {COLUMNS.map(col => {
                const colTasks = project.tasks.filter(t => t.column === col);
                return (
                  <Droppable droppableId={col} key={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "bg-secondary/30 rounded-xl border-t-2 p-2 min-w-[260px] sm:min-w-0 snap-center flex-shrink-0 transition-colors",
                          TASK_COLUMN_COLORS[col],
                          snapshot.isDraggingOver && "bg-primary/5 border-primary/30"
                        )}
                        style={{ minHeight: 120 }}
                      >
                        <div className="flex items-center justify-between mb-2 px-1">
                          <h4 className="text-xs font-bold text-foreground">{TASK_COLUMN_LABELS[col]}</h4>
                          <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5">{colTasks.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "bg-card border border-border rounded-lg p-2.5 group transition-shadow",
                                    snapshot.isDragging && "shadow-lg shadow-primary/10 border-primary/40 rotate-1"
                                  )}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <div {...provided.dragHandleProps} className="pt-0.5 cursor-grab active:cursor-grabbing shrink-0 touch-none">
                                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                                    </div>
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditTask(task)}>
                                      <p className="text-foreground text-xs font-medium leading-tight">{task.title}</p>
                                      {task.description && (
                                        <p className="text-muted-foreground text-[10px] mt-1 line-clamp-2">{task.description}</p>
                                      )}
                                      <div className="flex items-center justify-between mt-1.5">
                                        <span className={cn("text-[10px]", TASK_PRIORITY_COLORS[task.priority])}>
                                          {TASK_PRIORITY_LABELS[task.priority]}
                                        </span>
                                        {task.dueDate && (
                                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => deleteTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <button
                            onClick={() => openNewTask(col)}
                            className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
                          >
                            + Adicionar
                          </button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        </TabsContent>

        {/* ─── NOTES TAB ─── */}
        <TabsContent value="notas" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openNewNote} className="gap-1 text-xs"><Plus className="w-4 h-4" /> Nova Nota</Button>
          </div>
          {project.notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma nota</p>
          ) : (
            <div className="space-y-2">
              {[...project.notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(note => (
                <div key={note.id} className="bg-secondary/50 rounded-lg p-3 group">
                  <p className="text-foreground text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-muted-foreground text-[10px]">
                      {new Date(note.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditNote(note)}><Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
                      <button onClick={() => deleteNote(note.id)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── LINKS TAB ─── */}
        <TabsContent value="links" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setLinkModal(true)} className="gap-1 text-xs"><Plus className="w-4 h-4" /> Novo Link</Button>
          </div>
          {project.links.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum link</p>
          ) : (
            <div className="space-y-2">
              {project.links.map(link => (
                <div key={link.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 group">
                  <LinkIcon className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium truncate">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs truncate block hover:underline">{link.url}</a>
                  </div>
                  <button onClick={() => deleteLink(link.id)} className="shrink-0">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── FINANCIAL TAB ─── */}
        <TabsContent value="financeiro" className="mt-3 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setPaymentModal(true)} className="gap-1 text-xs"><Plus className="w-4 h-4" /> Novo Pagamento</Button>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso</span>
              <span className="text-foreground font-medium">{project.value > 0 ? Math.round((totalPaid / project.value) * 100) : 0}%</span>
            </div>
            <Progress value={project.value > 0 ? (totalPaid / project.value) * 100 : 0} className="h-2.5" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Pago: <span className="text-emerald-400 font-medium">{formatCurrency(totalPaid)}</span></span>
              <span>Falta: <span className="text-orange-400 font-medium">{formatCurrency(Math.max(0, remaining))}</span></span>
            </div>
          </div>
          {(project.payments || []).length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhum pagamento registrado</p>
          ) : (
            <div className="space-y-2">
              {[...(project.payments || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => (
                <div key={payment.id} className="flex items-center gap-2 sm:gap-3 bg-secondary/50 rounded-lg p-3 group">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs sm:text-sm font-medium truncate">{payment.description}</p>
                    <p className="text-muted-foreground text-[10px]">{new Date(payment.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm shrink-0">{formatCurrency(payment.value)}</span>
                  <button onClick={() => deletePayment(payment.id)} className="shrink-0">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── MODALS ─── */}
      <Dialog open={taskModal} onOpenChange={setTaskModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título *</Label><Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Título da tarefa" /></div>
            <div><Label>Descrição</Label><Textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} placeholder="Detalhes..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Coluna</Label>
                <Select value={taskForm.column} onValueChange={v => setTaskForm({ ...taskForm, column: v as TaskColumn })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COLUMNS.map(c => <SelectItem key={c} value={c}>{TASK_COLUMN_LABELS[c]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({ ...taskForm, priority: v as TaskPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Data Limite</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            <Button onClick={saveTask} className="w-full">{editingTask ? 'Salvar' : 'Criar Tarefa'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={noteModal} onOpenChange={setNoteModal}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle></DialogHeader>
          <Textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={6} placeholder="Escreva sua nota..." />
          <Button onClick={saveNote} className="w-full">Salvar Nota</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={linkModal} onOpenChange={setLinkModal}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Novo Link</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título</Label><Input value={linkForm.title} onChange={e => setLinkForm({ ...linkForm, title: e.target.value })} placeholder="Nome do link" /></div>
            <div><Label>URL *</Label><Input value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="https://..." /></div>
            <Button onClick={saveLink} className="w-full">Salvar Link</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Novo Pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição *</Label><Input value={paymentForm.description} onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })} placeholder="Ex: Primeira parcela" /></div>
            <div><Label>Valor (R$) *</Label><Input type="number" value={paymentForm.value} onChange={e => setPaymentForm({ ...paymentForm, value: e.target.value })} placeholder="0,00" /></div>
            <div><Label>Data</Label><Input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} /></div>
            <Button onClick={savePayment} className="w-full">Registrar Pagamento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
