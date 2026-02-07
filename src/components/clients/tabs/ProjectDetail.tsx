import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Circle, Link as LinkIcon, StickyNote } from "lucide-react";
import { Project, ProjectTask, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, formatCurrency, newId } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Props {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => Promise<void>;
}

export default function ProjectDetail({ project, onBack, onUpdate }: Props) {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState('');
  const [newLink, setNewLink] = useState('');

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const progress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0;

  const addTask = async () => {
    if (!newTask.trim()) return;
    const task: ProjectTask = { id: newId(), title: newTask, completed: false };
    await onUpdate({ ...project, tasks: [...project.tasks, task] });
    setNewTask('');
  };

  const toggleTask = async (taskId: string) => {
    const tasks = project.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    await onUpdate({ ...project, tasks });
  };

  const removeTask = async (taskId: string) => {
    await onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== taskId) });
  };

  const addLink = async () => {
    if (!newLink.trim()) return;
    await onUpdate({ ...project, links: [...project.links, newLink] });
    setNewLink('');
  };

  const removeLink = async (index: number) => {
    const links = project.links.filter((_, i) => i !== index);
    await onUpdate({ ...project, links });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{project.name}</h2>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PROJECT_STATUS_COLORS[project.status])}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            <span className="text-primary font-semibold text-sm">{formatCurrency(project.value)}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      {project.tasks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-foreground font-medium">{completedTasks}/{project.tasks.length} tarefas</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Tabs defaultValue="tarefas">
        <TabsList>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="tarefas" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Nova tarefa..." onKeyDown={e => e.key === 'Enter' && addTask()} />
            <Button size="sm" onClick={addTask}><Plus className="w-4 h-4" /></Button>
          </div>
          {project.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 group">
              <button onClick={() => toggleTask(task.id)}>
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  : <Circle className="w-5 h-5 text-muted-foreground" />}
              </button>
              <span className={cn("flex-1 text-sm", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
              <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="notas" className="mt-3">
          <Textarea
            value={project.notes}
            onChange={e => onUpdate({ ...project, notes: e.target.value })}
            placeholder="Anotações do projeto..."
            rows={8}
            className="resize-none"
          />
        </TabsContent>

        <TabsContent value="links" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://..." onKeyDown={e => e.key === 'Enter' && addLink()} />
            <Button size="sm" onClick={addLink}><Plus className="w-4 h-4" /></Button>
          </div>
          {project.links.map((link, i) => (
            <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 group">
              <LinkIcon className="w-4 h-4 text-primary shrink-0" />
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate flex-1 hover:underline">{link}</a>
              <button onClick={() => removeLink(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
