import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Client, ClientInteraction, InteractionType, INTERACTION_LABELS, newId } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

export default function ClientHistoryTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'nota' as InteractionType,
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
  });

  const sorted = [...client.interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = async () => {
    if (!form.title.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    const interaction: ClientInteraction = {
      id: newId(), type: form.type, title: form.title,
      description: form.description, date: form.date,
    };
    await onUpdate({ ...client, interactions: [...client.interactions, interaction], lastContact: new Date().toISOString() });
    toast({ title: "Interação salva!" });
    setForm({ type: 'nota', title: '', description: '', date: new Date().toISOString().slice(0, 16) });
    setModalOpen(false);
  };

  const handleRemove = async (id: string) => {
    await onUpdate({ ...client, interactions: client.interactions.filter(i => i.id !== id) });
  };

  const typeIcons: Record<InteractionType, string> = {
    ligacao: '📞', email: '📧', whatsapp: '💬', reuniao: '🤝', nota: '📝',
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">{sorted.length} interações</h3>
        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-1">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma interação registrada</p>
      ) : (
        <div className="relative pl-6 border-l-2 border-border space-y-4">
          {sorted.map(item => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-[29px] top-1 w-5 h-5 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-xs">
                {typeIcons[item.type]}
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">{item.title}</p>
                    {item.description && <p className="text-muted-foreground text-xs mt-1">{item.description}</p>}
                    <p className="text-muted-foreground text-[10px] mt-1.5">
                      {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Interação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as InteractionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERACTION_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título da interação" /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div><Label>Data e Hora</Label><Input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <Button onClick={handleAdd} className="w-full">Salvar Interação</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
