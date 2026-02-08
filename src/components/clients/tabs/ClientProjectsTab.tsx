import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FolderOpen, ArrowRight, CheckCircle2, DollarSign } from "lucide-react";
import {
  Client, Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
  formatCurrency, newId,
} from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ProjectDetail from "./ProjectDetail";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

export default function ClientProjectsTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [newModal, setNewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', value: '', cost: '', status: 'ativo' as ProjectStatus,
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleAddProject = async () => {
    if (!form.name.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    const project: Project = {
      id: newId(), name: form.name, description: form.description,
      value: parseFloat(form.value) || 0, cost: parseFloat(form.cost) || 0,
      paidAmount: 0, status: form.status,
      startDate: form.startDate, tasks: [], notes: [], links: [], payments: [], costs: [],
    };
    await onUpdate({ ...client, projects: [...client.projects, project] });
    toast({ title: "Projeto criado!" });
    setForm({ name: '', description: '', value: '', cost: '', status: 'ativo', startDate: new Date().toISOString().split('T')[0] });
    setNewModal(false);
  };

  const handleUpdateProject = async (updated: Project) => {
    const projects = client.projects.map(p => p.id === updated.id ? updated : p);
    await onUpdate({ ...client, projects });
  };

  if (selectedProject) {
    const current = client.projects.find(p => p.id === selectedProject.id) || selectedProject;
    return <ProjectDetail project={current} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject} />;
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">{client.projects.length} projetos</h3>
        <Button size="sm" onClick={() => setNewModal(true)} className="gap-1">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {client.projects.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-foreground font-medium mb-1">Nenhum projeto ainda</p>
          <p className="text-muted-foreground text-sm mb-4">Crie o primeiro projeto deste cliente</p>
          <Button variant="outline" size="sm" onClick={() => setNewModal(true)}>Criar Primeiro Projeto</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {client.projects.map(project => {
              const completedTasks = project.tasks.filter(t => t.column === 'done').length;
              const totalTasks = project.tasks.length;
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const totalPaid = (project.payments || []).reduce((sum, p) => sum + p.value, 0);
              const remaining = project.value - totalPaid;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-border rounded-xl p-4 bg-card hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-foreground font-semibold text-sm">{project.name}</h4>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  {/* Financial info */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center bg-secondary/50 rounded-lg p-1.5">
                      <p className="text-emerald-400 font-bold text-xs">{formatCurrency(totalPaid)}</p>
                      <p className="text-muted-foreground text-[9px]">Pago</p>
                    </div>
                    <div className="text-center bg-secondary/50 rounded-lg p-1.5">
                      <p className={cn("font-bold text-xs", remaining > 0 ? "text-orange-400" : "text-emerald-400")}>{formatCurrency(Math.max(0, remaining))}</p>
                      <p className="text-muted-foreground text-[9px]">Falta</p>
                    </div>
                  </div>

                  {totalTasks > 0 && (
                    <div className="space-y-1.5">
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{completedTasks}/{totalTasks} tarefas</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New Project Modal */}
      <Dialog open={newModal} onOpenChange={setNewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do projeto" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição do projeto..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor do Projeto (R$)</Label>
                <Input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Valor cobrado" />
              </div>
              <div>
                <Label>Custo Estimado (R$)</Label>
                <Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="Custo do projeto" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as ProjectStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Data de Início</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <Button onClick={handleAddProject} className="w-full">Criar Projeto</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
