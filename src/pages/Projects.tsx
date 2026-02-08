// ═══════════════════════════════════════════════════════════
// Projects Page - Consolidated view of ALL projects across ALL clients
// Multiple views: Lista, Kanban, Quadro
// Advanced filters, search, sorting, grouping
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, SlidersHorizontal, List, Columns3, LayoutGrid, FolderOpen, Plus,
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { Client, ProjectStatus } from "@/lib/clients-data";
import {
  EnrichedProject, ProjectViewMode, ProjectSortBy, ProjectGroupBy,
  ProjectFilters, DEFAULT_FILTERS,
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

const VIEW_MODES: { value: ProjectViewMode; icon: typeof List; label: string }[] = [
  { value: 'lista', icon: List, label: 'Lista' },
  { value: 'kanban', icon: Columns3, label: 'Kanban' },
  { value: 'quadro', icon: LayoutGrid, label: 'Quadro' },
];

const SORT_OPTIONS: { value: ProjectSortBy; label: string }[] = [
  { value: 'recentes', label: 'Recentes' },
  { value: 'alfabetico', label: 'Alfabético' },
  { value: 'valor', label: 'Valor' },
  { value: 'progresso', label: 'Progresso' },
  { value: 'cliente', label: 'Cliente' },
];

const GROUP_OPTIONS: { value: ProjectGroupBy; label: string }[] = [
  { value: 'nenhum', label: 'Sem Agrupamento' },
  { value: 'cliente', label: 'Por Cliente' },
  { value: 'status', label: 'Por Status' },
  { value: 'servico', label: 'Por Serviço' },
];

export default function Projects() {
  const { clients, updateClient } = useClients();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ProjectViewMode>('lista');
  const [sortBy, setSortBy] = useState<ProjectSortBy>('recentes');
  const [groupBy, setGroupBy] = useState<ProjectGroupBy>('nenhum');
  const [filters, setFilters] = useState<ProjectFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Enrich all projects from all clients
  const allProjects = useMemo(() => enrichAllProjects(clients), [clients]);

  // Apply filters + search
  const mergedFilters = useMemo(() => ({ ...filters, search }), [filters, search]);
  const filtered = useMemo(() => applyFilters(allProjects, mergedFilters), [allProjects, mergedFilters]);
  const sorted = useMemo(() => applySorting(filtered, sortBy), [filtered, sortBy]);

  // Counts
  const activeCount = allProjects.filter(p => p.status === 'ativo').length;
  const completedCount = allProjects.filter(p => p.status === 'concluido').length;

  // Active filter count
  const activeFilterCount = [
    filters.status.length > 0,
    filters.clients.length > 0,
    filters.services.length > 0,
    filters.priorities.length > 0,
    filters.valueMin > 0,
    filters.valueMax > 0,
  ].filter(Boolean).length;

  // Navigate to client detail with project open
  const handleOpenProject = useCallback((project: EnrichedProject) => {
    // Navigate to clients page - we'll use a state approach
    navigate('/clients', { state: { openClientId: project.clientId, openProjectId: project.id } });
  }, [navigate]);

  // Change project status (for Kanban drag & drop)
  const handleChangeStatus = useCallback(async (projectId: string, clientId: string, newStatus: ProjectStatus) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const projects = client.projects.map(p =>
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    await updateClient({ ...client, projects });
  }, [clients, updateClient]);

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
        <Button onClick={() => navigate('/clients')} className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos, clientes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View mode toggle */}
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

        {/* Sort (only for list and grid views) */}
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

        {/* Group (only for list view) */}
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

        {/* Filter button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className="gap-1.5 relative"
        >
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
          {filters.clients.map(cId => {
            const c = clients.find(x => x.id === cId);
            return c ? (
              <span key={cId} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
                {c.name}
                <button onClick={() => setFilters({ ...filters, clients: filters.clients.filter(x => x !== cId) })} className="hover:text-destructive">×</button>
              </span>
            ) : null;
          })}
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
        <ProjectListView
          projects={sorted}
          groupBy={groupBy}
          onOpenProject={handleOpenProject}
        />
      )}

      {viewMode === 'kanban' && (
        <ProjectKanbanView
          projects={sorted}
          onOpenProject={handleOpenProject}
          onChangeStatus={handleChangeStatus}
        />
      )}

      {viewMode === 'quadro' && (
        <ProjectGridView
          projects={sorted}
          onOpenProject={handleOpenProject}
        />
      )}

      {/* Filter Sidebar */}
      <ProjectFilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        clients={clients}
        resultCount={sorted.length}
      />
    </div>
  );
}
