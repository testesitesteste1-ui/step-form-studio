// ═══════════════════════════════════════════════════════════
// Projects Page - Independent project management
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, List, Columns3, LayoutGrid, Plus,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import {
  EnrichedProject, ProjectViewMode, ProjectSortBy, ProjectGroupBy,
  ProjectFilters, DEFAULT_FILTERS, ProjectStatus,
  enrichAllProjects, applyFilters, applySorting,
} from "@/lib/projects-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ProjectFilterSidebar from "@/components/projects/ProjectFilterSidebar";
import ProjectListView from "@/components/projects/ProjectListView";
import ProjectKanbanView from "@/components/projects/ProjectKanbanView";
import ProjectGridView from "@/components/projects/ProjectGridView";
import NewProjectModal from "@/components/projects/NewProjectModal";

const VIEW_MODES: { value: ProjectViewMode; icon: typeof List; label: string }[] = [
  { value: 'lista', icon: List, label: 'Lista' },
  { value: 'kanban', icon: Columns3, label: 'Kanban' },
  { value: 'quadro', icon: LayoutGrid, label: 'Quadro' },
];

const SORT_OPTIONS: { value: ProjectSortBy; label: string }[] = [
  { value: 'recentes', label: 'Recentes' },
  { value: 'alfabetico', label: 'Alfabético' },
  { value: 'prazo', label: 'Prazo' },
  { value: 'valor', label: 'Valor' },
  { value: 'progresso', label: 'Progresso' },
  { value: 'prioridade', label: 'Prioridade' },
];

const GROUP_OPTIONS: { value: ProjectGroupBy; label: string }[] = [
  { value: 'nenhum', label: 'Sem Agrupamento' },
  { value: 'status', label: 'Por Status' },
  { value: 'servico', label: 'Por Serviço' },
  { value: 'prioridade', label: 'Por Prioridade' },
  { value: 'recorrencia', label: 'Por Recorrência' },
];

export default function Projects() {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();

  const [viewMode, setViewMode] = useState<ProjectViewMode>('lista');
  const [sortBy, setSortBy] = useState<ProjectSortBy>('recentes');
  const [groupBy, setGroupBy] = useState<ProjectGroupBy>('nenhum');
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const allProjects = useMemo(() => enrichAllProjects(projects), [projects]);

  const mergedFilters = useMemo(() => ({ ...filters, search }), [filters, search]);
  const filtered = useMemo(() => applyFilters(allProjects, mergedFilters), [allProjects, mergedFilters]);
  const sorted = useMemo(() => applySorting(filtered, sortBy), [filtered, sortBy]);

  const activeCount = allProjects.filter(p => p.status === 'ativo').length;
  const completedCount = allProjects.filter(p => p.status === 'concluido').length;

  const activeFilterCount = [
    filters.status.length > 0,
    filters.services.length > 0,
    filters.priorities.length > 0,
    filters.recurrence.length > 0,
    filters.tags.length > 0,
    filters.valueMin > 0,
    filters.valueMax > 0,
    filters.overdue,
    filters.dueSoon,
    filters.favorite,
  ].filter(Boolean).length;

  const handleOpenProject = useCallback((project: EnrichedProject) => {
    // TODO: open project detail modal
    console.log('Open project:', project.id);
  }, []);

  const handleChangeStatus = useCallback(async (projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    await updateProject({ ...project, status: newStatus });
  }, [projects, updateProject]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground text-sm">
            {allProjects.length} projetos • {activeCount} ativos • {completedCount} concluídos
          </p>
        </div>
        <Button onClick={() => setNewProjectOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === mode.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <mode.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        {viewMode !== 'kanban' && (
          <Select value={sortBy} onValueChange={v => setSortBy(v as ProjectSortBy)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {viewMode === 'lista' && (
          <Select value={groupBy} onValueChange={v => setGroupBy(v as ProjectGroupBy)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {GROUP_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)} className="gap-1.5 relative">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.status.map(s => (
            <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              {s}
              <button onClick={() => setFilters({ ...filters, status: filters.status.filter(x => x !== s) })} className="hover:text-destructive">×</button>
            </span>
          ))}
          {filters.services.map(s => (
            <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              {s}
              <button onClick={() => setFilters({ ...filters, services: filters.services.filter(x => x !== s) })} className="hover:text-destructive">×</button>
            </span>
          ))}
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium hover:bg-destructive/20"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Views */}
      {viewMode === 'lista' && (
        <ProjectListView projects={sorted} groupBy={groupBy} onOpenProject={handleOpenProject} />
      )}
      {viewMode === 'kanban' && (
        <ProjectKanbanView projects={sorted} onOpenProject={handleOpenProject} onChangeStatus={handleChangeStatus} />
      )}
      {viewMode === 'quadro' && (
        <ProjectGridView projects={sorted} onOpenProject={handleOpenProject} />
      )}

      {/* Filter Sidebar */}
      <ProjectFilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        allTags={[...new Set(projects.flatMap(p => p.tags || []))]}
        resultCount={sorted.length}
      />

      {/* New Project Modal */}
      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        onSave={async (project) => {
          await addProject(project);
          setNewProjectOpen(false);
        }}
      />
    </div>
  );
}
