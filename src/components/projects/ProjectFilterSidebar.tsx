// ═══════════════════════════════════════════════════════════
// Advanced Filter Sidebar for Independent Projects
// ═══════════════════════════════════════════════════════════

import { X, SlidersHorizontal } from "lucide-react";
import {
  ProjectFilters, DEFAULT_FILTERS,
  PROJECT_STATUS_OPTIONS, SERVICE_OPTIONS, PRIORITY_OPTIONS, RECURRENCE_OPTIONS,
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
  allTags: string[];
  resultCount: number;
}

export default function ProjectFilterSidebar({ open, onClose, filters, onChange, allTags, resultCount }: Props) {
  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const update = (partial: Partial<ProjectFilters>) => onChange({ ...filters, ...partial });

  const activeCount = [
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

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}

      <div className={cn(
        "fixed right-0 top-0 h-full w-[320px] max-w-[90vw] bg-card border-l border-border z-50 flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}>
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

          {/* Prioridade */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prioridade</Label>
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

          {/* Recorrência */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recorrência</Label>
            <div className="mt-2 space-y-1.5">
              {RECURRENCE_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={filters.recurrence.includes(opt.value)}
                    onCheckedChange={() => update({ recurrence: toggle(filters.recurrence, opt.value) })}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Tags */}
          {allTags.length > 0 && (
            <section>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => update({ tags: toggle(filters.tags, tag) })}
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full border transition-colors",
                      filters.tags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/40"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          )}

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

          {/* Quick toggles */}
          <section>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Atalhos</Label>
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={filters.overdue} onCheckedChange={() => update({ overdue: !filters.overdue })} />
                <span>⚠️ Atrasados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={filters.dueSoon} onCheckedChange={() => update({ dueSoon: !filters.dueSoon })} />
                <span>⏰ Vencendo esta semana</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={filters.favorite} onCheckedChange={() => update({ favorite: !filters.favorite })} />
                <span>⭐ Favoritos</span>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2 shrink-0">
          <p className="text-xs text-muted-foreground text-center">{resultCount} projetos encontrados</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>Limpar</Button>
            <Button className="flex-1" size="sm" onClick={onClose}>Aplicar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
