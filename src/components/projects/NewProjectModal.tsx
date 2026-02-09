// ═══════════════════════════════════════════════════════════
// New Project Modal - Create independent projects
// ═══════════════════════════════════════════════════════════

import { useState } from "react";
import { X } from "lucide-react";
import {
  Project, ProjectService, ProjectPriority, ProjectRecurrence,
  SERVICE_OPTIONS, PRIORITY_OPTIONS, RECURRENCE_OPTIONS, newId,
} from "@/lib/projects-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => Promise<void>;
}

export default function NewProjectModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [service, setService] = useState<ProjectService>('dev_web');
  const [priority, setPriority] = useState<ProjectPriority>('media');
  const [recurrence, setRecurrence] = useState<ProjectRecurrence>('unico');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [value, setValue] = useState('');
  const [cost, setCost] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const reset = () => {
    setStep(1);
    setName(''); setDescription(''); setService('dev_web');
    setPriority('media'); setRecurrence('unico');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(''); setValue(''); setCost(''); setTagsInput('');
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        status: 'ativo',
        priority,
        service,
        recurrence,
        value: parseFloat(value) || 0,
        cost: parseFloat(cost) || 0,
        startDate,
        endDate: endDate || undefined,
        tags,
        favorite: false,
        tasks: [],
        notes: [],
        links: [],
        payments: [],
        costs: [],
        createdAt: new Date().toISOString(),
      });
      reset();
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">Novo Projeto</h2>
              <p className="text-xs text-muted-foreground">Etapa {step} de 3</p>
            </div>
            <button onClick={() => { reset(); onClose(); }}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          {/* Steps indicator */}
          <div className="flex gap-1 px-5 pt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("h-1 flex-1 rounded-full transition-colors", s <= step ? "bg-primary" : "bg-secondary")} />
            ))}
          </div>

          <div className="p-5 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <Label>Nome do Projeto *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Site Institucional" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição do projeto..." rows={3} />
                </div>
                <div>
                  <Label>Tipo de Serviço</Label>
                  <Select value={service} onValueChange={v => setService(v as ProjectService)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data Início</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Prazo / Data Fim</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={v => setPriority(v as ProjectPriority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="#site, #landing-page, #urgente" />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor do Projeto (R$)</Label>
                    <Input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="0,00" />
                  </div>
                  <div>
                    <Label>Custo Estimado (R$)</Label>
                    <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0,00" />
                  </div>
                </div>
                <div>
                  <Label>Recorrência</Label>
                  <Select value={recurrence} onValueChange={v => setRecurrence(v as ProjectRecurrence)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Anterior</Button>
            ) : <div />}

            {step < 3 ? (
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={step === 1 && !name.trim()}>Próximo</Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? 'Criando...' : 'Criar Projeto'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
