// ═══════════════════════════════════════════════════════════
// Advanced Filter Sidebar for Projects
// ═══════════════════════════════════════════════════════════

import { X, SlidersHorizontal } from "lucide-react";
import { Client, ProjectStatus, ClientService, TaskPriority } from "@/lib/clients-data";
import {
  ProjectFilters, DEFAULT_FILTERS, PROJECT_STATUS_OPTIONS,
  SERVICE_OPTIONS, PRIORITY_OPTIONS,
} from "@/lib/projects-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: ProjectFilters;
  onChange: (filters: ProjectFilters) => void;
  clients: Client[];
  resultCount: number;
}

export default function ProjectFilterSidebar({ open, onClose, filters, onChange, clients, resultCount }: Props) {
  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const update = (partial: Partial<ProjectFilters>) => onChange({ ...filters, ...partial });

  const activeCount = [
    filters.status.length > 0,
    filters.clients.length > 0,
    filters.services.length > 0,
    filters.priorities.length > 0,
    filters.valueMin > 0,
    filters.valueMax > 0,
    filters.overdue,
    filters.dueSoon,
  ].filter(Boolean).length;

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[320px] max-w-[90vw] bg-card border-l border-border z-50 flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Filtros Avançados</h3>
            {activeCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">{activeCount}</span>
            )}
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
            <div className="mt-2 space-y-1.5">
              {PROJECT_STATUS_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.status.includes(opt.value)}
                    onCheckedChange={() => update({ status: toggle(filters.status, opt.value) })}
                  />
                  <span>{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Clientes */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clientes</Label>
            <div className="mt-2 space-y-1.5 max-h-[140px] overflow-y-auto">
              {clients.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.clients.includes(c.id)}
                    onCheckedChange={() => update({ clients: toggle(filters.clients, c.id) })}
                  />
                  <span className="truncate">{c.name}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Tipo de Serviço */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo de Serviço</Label>
            <div className="mt-2 space-y-1.5">
              {SERVICE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.services.includes(opt.value)}
                    onCheckedChange={() => update({ services: toggle(filters.services, opt.value) })}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Prioridade (tarefas) */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tarefas por Prioridade</Label>
            <div className="mt-2 space-y-1.5">
              {PRIORITY_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.priorities.includes(opt.value)}
                    onCheckedChange={() => update({ priorities: toggle(filters.priorities, opt.value) })}
                  />
                  <span>{opt.icon} {opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Valor */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor do Projeto</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Mínimo (R$)</Label>
                <Input type="number" value={filters.valueMin || ''} onChange={e => update({ valueMin: parseFloat(e.target.value) || 0 })} placeholder="0" />
              </div>
              <div>
                <Label className="text-[10px]">Máximo (R$)</Label>
                <Input type="number" value={filters.valueMax || ''} onChange={e => update({ valueMax: parseFloat(e.target.value) || 0 })} placeholder="∞" />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2 shrink-0">
          <p className="text-xs text-muted-foreground text-center">{resultCount} projetos encontrados</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
              Limpar
            </Button>
            <Button className="flex-1" size="sm" onClick={onClose}>
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
