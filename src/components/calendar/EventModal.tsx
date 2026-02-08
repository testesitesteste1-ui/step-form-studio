// ═══════════════════════════════════════════════════════════
// Event Modal - Create/Edit calendar events
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  CustomEvent, CalendarEventType,
  EVENT_TYPE_OPTIONS, EVENT_COLORS, newId,
} from "@/lib/calendar-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<CustomEvent, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate?: (event: CustomEvent) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editEvent?: CustomEvent | null;
  defaultDate?: string;
}

export default function EventModal({ open, onClose, onSave, onUpdate, onDelete, editEvent, defaultDate }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<CalendarEventType>('reuniao');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setDescription(editEvent.description);
      setDate(editEvent.date);
      setTime(editEvent.time || '09:00');
      setEndTime(editEvent.endTime || '10:00');
      setType(editEvent.type);
      setColor(editEvent.color);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setEndTime('10:00');
      setType('reuniao');
      setColor(EVENT_COLORS[0]);
    }
  }, [editEvent, defaultDate, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editEvent && onUpdate) {
        await onUpdate({ ...editEvent, title: title.trim(), description: description.trim(), date, time, endTime, type, color });
      } else {
        await onSave({ title: title.trim(), description: description.trim(), date, time, endTime, type, color });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{editEvent ? 'Editar Evento' : 'Novo Evento'}</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reunião com cliente" />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do evento..." rows={2} />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={v => {
                setType(v as CalendarEventType);
                const opt = EVENT_TYPE_OPTIONS.find(o => o.value === v);
                if (opt) setColor(opt.defaultColor);
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.filter(o => ['reuniao', 'evento', 'lembrete'].includes(o.value)).map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.icon} {o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            {/* Color picker */}
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-1.5">
                {EVENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-transform",
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 border-t border-border">
            {editEvent && onDelete ? (
              <Button variant="destructive" size="sm" onClick={async () => {
                await onDelete(editEvent.id);
                onClose();
              }}>
                Excluir
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
                {saving ? 'Salvando...' : editEvent ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
