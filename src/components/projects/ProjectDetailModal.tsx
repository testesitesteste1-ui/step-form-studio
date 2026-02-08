// ═══════════════════════════════════════════════════════════
// Project Detail Modal - Full project management view
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Star, CheckCircle2, DollarSign, Calendar, AlertTriangle, Plus, Trash2,
  FileText, Link2, ListTodo, BarChart3, Settings, GripVertical,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  Project, ProjectTask, ProjectNote, ProjectLink, ProjectPayment, ProjectCost,
  ProjectStatus, ProjectPriority, ProjectService, TaskColumn, TaskPriority,
  PROJECT_STATUS_OPTIONS, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS,
  SERVICE_OPTIONS, SERVICE_LABELS, PRIORITY_OPTIONS, PRIORITY_LABELS,
  RECURRENCE_OPTIONS, RECURRENCE_LABELS, COST_CATEGORIES,
  formatCurrency, newId,
} from "@/lib/projects-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TABS = [
  { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { key: 'tasks', label: 'Tarefas', icon: ListTodo },
  { key: 'finance', label: 'Financeiro', icon: DollarSign },
  { key: 'notes', label: 'Notas', icon: FileText },
  { key: 'links', label: 'Links', icon: Link2 },
  { key: 'settings', label: 'Config', icon: Settings },
] as const;

type TabKey = typeof TABS[number]['key'];

const TASK_COLUMNS: { key: TaskColumn; label: string; color: string }[] = [
  { key: 'todo', label: 'A Fazer', color: 'border-t-blue-500' },
  { key: 'doing', label: 'Em Andamento', color: 'border-t-amber-500' },
  { key: 'done', label: 'Concluído', color: 'border-t-emerald-500' },
];

export default function ProjectDetailModal({ project, open, onClose, onUpdate, onDelete }: Props) {
  const [tab, setTab] = useState<TabKey>('overview');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(project.name);

  // Sync tempName when project changes
  useEffect(() => {
    setTempName(project.name);
  }, [project.name]);

  // Task creation
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState<TaskColumn>('todo');

  // Note creation
  const [newNote, setNewNote] = useState('');

  // Link creation
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Payment/Cost creation
  const [newPayDesc, setNewPayDesc] = useState('');
  const [newPayValue, setNewPayValue] = useState('');
  const [newCostDesc, setNewCostDesc] = useState('');
  const [newCostValue, setNewCostValue] = useState('');
  const [newCostCategory, setNewCostCategory] = useState('outros');

  // Computed
  const totalPaid = useMemo(() => (project.payments || []).reduce((s, p) => s + p.value, 0), [project.payments]);
  const totalCosts = useMemo(() => (project.costs || []).reduce((s, c) => s + c.value, 0), [project.costs]);
  const remaining = Math.max(0, project.value - totalPaid);
  const profit = project.value - totalCosts;
  const tasks = project.tasks || [];
  const completedTasks = tasks.filter(t => t.column === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const update = async (partial: Partial<Project>) => {
    try {
      await onUpdate({ ...project, ...partial });
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
    }
  };

  // ── Tasks ──
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const task: ProjectTask = {
      id: newId(), title: newTaskTitle.trim(), column: newTaskColumn,
      priority: 'media', completed: false, createdAt: new Date().toISOString(),
    };
    await update({ tasks: [...tasks, task] });
    setNewTaskTitle('');
    toast.success('Tarefa adicionada');
  };

  const deleteTask = async (taskId: string) => {
    await update({ tasks: tasks.filter(t => t.id !== taskId) });
  };

  const onTaskDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newColumn = result.destination.droppableId as TaskColumn;
    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, column: newColumn, completed: newColumn === 'done' } : t
    );
    await update({ tasks: updated });
  };

  // ── Notes ──
  const addNote = async () => {
    if (!newNote.trim()) return;
    const note: ProjectNote = { id: newId(), content: newNote.trim(), createdAt: new Date().toISOString() };
    await update({ notes: [...(project.notes || []), note] });
    setNewNote('');
    toast.success('Nota adicionada');
  };

  const deleteNote = async (noteId: string) => {
    await update({ notes: (project.notes || []).filter(n => n.id !== noteId) });
  };

  // ── Links ──
  const addLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const link: ProjectLink = { id: newId(), title: newLinkTitle.trim(), url: newLinkUrl.trim() };
    await update({ links: [...(project.links || []), link] });
    setNewLinkTitle(''); setNewLinkUrl('');
    toast.success('Link adicionado');
  };

  const deleteLink = async (linkId: string) => {
    await update({ links: (project.links || []).filter(l => l.id !== linkId) });
  };

  // ── Payments ──
  const addPayment = async () => {
    if (!newPayDesc.trim() || !newPayValue) return;
    const payment: ProjectPayment = { id: newId(), description: newPayDesc.trim(), value: parseFloat(newPayValue), date: new Date().toISOString() };
    await update({ payments: [...(project.payments || []), payment] });
    setNewPayDesc(''); setNewPayValue('');
    toast.success('Pagamento registrado');
  };

  const deletePayment = async (id: string) => {
    await update({ payments: (project.payments || []).filter(p => p.id !== id) });
  };

  // ── Costs ──
  const addCost = async () => {
    if (!newCostDesc.trim() || !newCostValue) return;
    const cost: ProjectCost = { id: newId(), description: newCostDesc.trim(), value: parseFloat(newCostValue), date: new Date().toISOString(), category: newCostCategory };
    await update({ costs: [...(project.costs || []), cost] });
    setNewCostDesc(''); setNewCostValue('');
    toast.success('Custo registrado');
  };

  const deleteCost = async (id: string) => {
    await update({ costs: (project.costs || []).filter(c => c.id !== id) });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button onClick={() => update({ favorite: !project.favorite })}>
                <Star className={cn("w-5 h-5", project.favorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
              </button>
              {editingName ? (
                <Input
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  onBlur={() => { update({ name: tempName }); setEditingName(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') { update({ name: tempName }); setEditingName(false); } }}
                  className="text-lg font-bold"
                  autoFocus
                />
              ) : (
                <h2 className="text-lg font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => { setTempName(project.name); setEditingName(true); }}>
                  {project.name}
                </h2>
              )}
              <Select value={project.status} onValueChange={v => update({ status: v as ProjectStatus })}>
                <SelectTrigger className="w-[130px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-2 border-b border-border shrink-0 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-5">
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label="Progresso" value={`${progress}%`} sub={`${completedTasks}/${totalTasks} tarefas`} icon={<CheckCircle2 className="w-4 h-4 text-primary" />} />
                  <MetricCard label="Valor" value={formatCurrency(project.value)} sub={`Pago: ${formatCurrency(totalPaid)}`} icon={<DollarSign className="w-4 h-4 text-emerald-400" />} />
                  <MetricCard label="Custos" value={formatCurrency(totalCosts)} sub={`Lucro: ${formatCurrency(profit)}`} icon={<BarChart3 className="w-4 h-4 text-violet-400" />} />
                  <MetricCard label="A Receber" value={formatCurrency(remaining)} sub={project.endDate ? `Prazo: ${new Date(project.endDate).toLocaleDateString('pt-BR')}` : 'Sem prazo'} icon={<Calendar className="w-4 h-4 text-orange-400" />} />
                </div>

                <Progress value={progress} className="h-2" />

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoItem label="Serviço" value={SERVICE_LABELS[project.service]} />
                  <InfoItem label="Prioridade" value={`${PRIORITY_OPTIONS.find(o => o.value === project.priority)?.icon || ''} ${PRIORITY_LABELS[project.priority]}`} />
                  <InfoItem label="Recorrência" value={RECURRENCE_LABELS[project.recurrence]} />
                  <InfoItem label="Início" value={new Date(project.startDate).toLocaleDateString('pt-BR')} />
                  <InfoItem label="Prazo" value={project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Sem prazo'} />
                  <InfoItem label="Tags" value={project.tags?.length ? project.tags.map(t => `#${t}`).join(', ') : 'Nenhuma'} />
                </div>

                {project.description && (
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                    <p className="text-sm text-foreground">{project.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TASKS ── */}
            {tab === 'tasks' && (
              <div className="space-y-4">
                {/* Add task */}
                <div className="flex gap-2">
                  <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Nova tarefa..."
                    onKeyDown={e => { if (e.key === 'Enter') addTask(); }} className="flex-1" />
                  <Select value={newTaskColumn} onValueChange={v => setNewTaskColumn(v as TaskColumn)}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TASK_COLUMNS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={addTask}><Plus className="w-4 h-4" /></Button>
                </div>

                {/* Task Kanban */}
                <DragDropContext onDragEnd={onTaskDragEnd}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TASK_COLUMNS.map(col => {
                      const colTasks = tasks.filter(t => t.column === col.key);
                      return (
                        <Droppable droppableId={col.key} key={col.key}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={cn("bg-secondary/30 rounded-xl border-t-2 p-2.5 min-h-[150px]", col.color, snapshot.isDraggingOver && "bg-primary/5")}
                            >
                              <div className="flex items-center justify-between mb-2 px-1">
                                <h4 className="text-xs font-bold text-foreground">{col.label}</h4>
                                <span className="text-[10px] text-muted-foreground">{colTasks.length}</span>
                              </div>
                              <div className="space-y-1.5">
                                {colTasks.map((task, i) => (
                                  <Draggable key={task.id} draggableId={task.id} index={i}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn("bg-card border border-border rounded-lg p-2.5 text-xs group", snapshot.isDragging && "shadow-lg rotate-1")}
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <span className={cn("text-foreground", task.column === 'done' && "line-through text-muted-foreground")}>{task.title}</span>
                                          <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                                          </button>
                                        </div>
                                        {task.dueDate && <p className="text-[9px] text-muted-foreground mt-1">📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>}
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
              </div>
            )}

            {/* ── FINANCE ── */}
            {tab === 'finance' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MetricCard label="Valor Total" value={formatCurrency(project.value)} icon={<DollarSign className="w-4 h-4 text-primary" />} />
                  <MetricCard label="Recebido" value={formatCurrency(totalPaid)} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} />
                  <MetricCard label="Custos" value={formatCurrency(totalCosts)} icon={<BarChart3 className="w-4 h-4 text-red-400" />} />
                  <MetricCard label="Lucro" value={formatCurrency(profit)} icon={<DollarSign className="w-4 h-4 text-violet-400" />} />
                </div>

                {/* Payments */}
                <section>
                  <h3 className="text-sm font-bold text-foreground mb-2">💰 Pagamentos Recebidos</h3>
                  <div className="flex gap-2 mb-2">
                    <Input value={newPayDesc} onChange={e => setNewPayDesc(e.target.value)} placeholder="Descrição" className="flex-1" />
                    <Input type="number" value={newPayValue} onChange={e => setNewPayValue(e.target.value)} placeholder="Valor" className="w-28" />
                    <Button size="sm" onClick={addPayment}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-1">
                    {(project.payments || []).map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 text-xs group">
                        <div>
                          <span className="text-foreground">{p.description}</span>
                          <span className="text-muted-foreground ml-2">{new Date(p.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{formatCurrency(p.value)}</span>
                          <button onClick={() => deletePayment(p.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Costs */}
                <section>
                  <h3 className="text-sm font-bold text-foreground mb-2">💸 Custos</h3>
                  <div className="flex gap-2 mb-2">
                    <Input value={newCostDesc} onChange={e => setNewCostDesc(e.target.value)} placeholder="Descrição" className="flex-1" />
                    <Input type="number" value={newCostValue} onChange={e => setNewCostValue(e.target.value)} placeholder="Valor" className="w-28" />
                    <Select value={newCostCategory} onValueChange={setNewCostCategory}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(COST_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={addCost}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-1">
                    {(project.costs || []).map(c => (
                      <div key={c.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 text-xs group">
                        <div>
                          <span className="text-foreground">{c.description}</span>
                          <span className="text-muted-foreground ml-2">{COST_CATEGORIES[c.category] || c.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold">{formatCurrency(c.value)}</span>
                          <button onClick={() => deleteCost(c.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── NOTES ── */}
            {tab === 'notes' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Escreva uma nota..." rows={2} className="flex-1" />
                  <Button size="sm" onClick={addNote} className="self-end"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {(project.notes || []).slice().reverse().map(note => (
                    <div key={note.id} className="bg-secondary/50 rounded-lg p-3 group">
                      <div className="flex justify-between items-start">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                        <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── LINKS ── */}
            {tab === 'links' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Título" className="flex-1" />
                  <Input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                  <Button size="sm" onClick={addLink}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-2">
                  {(project.links || []).map(link => (
                    <div key={link.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 group">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{link.title}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{link.url}</a>
                      </div>
                      <button onClick={() => deleteLink(link.id)} className="opacity-0 group-hover:opacity-100 shrink-0 ml-2">
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Nome do Projeto</Label>
                  <Input value={project.name} onChange={e => update({ name: e.target.value })} />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={project.description} onChange={e => update({ description: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo de Serviço</Label>
                    <Select value={project.service} onValueChange={v => update({ service: v as ProjectService })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SERVICE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Select value={project.priority} onValueChange={v => update({ priority: v as ProjectPriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data Início</Label>
                    <Input type="date" value={project.startDate} onChange={e => update({ startDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Prazo / Data Fim</Label>
                    <Input type="date" value={project.endDate || ''} onChange={e => update({ endDate: e.target.value || undefined })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input type="number" value={project.value} onChange={e => update({ value: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Custo Estimado (R$)</Label>
                    <Input type="number" value={project.cost} onChange={e => update({ cost: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div>
                  <Label>Recorrência</Label>
                  <Select value={project.recurrence} onValueChange={v => update({ recurrence: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RECURRENCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (confirm('Tem certeza que deseja excluir este projeto?')) {
                      await onDelete(project.id);
                      onClose();
                    }
                  }}>
                    <Trash2 className="w-4 h-4 mr-1" /> Excluir Projeto
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Small helper components ──

function MetricCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-foreground font-bold text-sm">{value}</p>
      {sub && <p className="text-muted-foreground text-[10px]">{sub}</p>}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/30 rounded-lg p-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs text-foreground font-medium">{value}</p>
    </div>
  );
}
