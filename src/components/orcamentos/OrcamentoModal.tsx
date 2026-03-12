import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, Condominio, formatCurrency, newId } from "@/lib/clients-data";
import { Orcamento, OrcamentoItem, OrcamentoStatus, ORCAMENTO_CATALOG, ORCAMENTO_STATUS_LABELS } from "@/lib/orcamentos-data";
import { Plus, Minus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  onSave: (data: Omit<Orcamento, 'id'>) => Promise<void>;
  existing?: Orcamento;
}

export default function OrcamentoModal({ open, onClose, clients, onSave, existing }: Props) {
  const administradoras = useMemo(() => clients.filter(c => c.type === 'administradora'), [clients]);

  const [clientId, setClientId] = useState(existing?.clientId || '');
  const [condominioId, setCondominioId] = useState(existing?.condominioId || '');
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split('T')[0]);
  const [assemblyDate, setAssemblyDate] = useState(existing?.assemblyDate || '');
  const [assemblyTime, setAssemblyTime] = useState(existing?.assemblyTime || '');
  const [status, setStatus] = useState<OrcamentoStatus>(existing?.status || 'rascunho');
  const [observations, setObservations] = useState(existing?.observations || '');
  const [items, setItems] = useState<OrcamentoItem[]>(
    existing?.items?.length
      ? existing.items
      : ORCAMENTO_CATALOG.map(c => ({ id: c.id, name: c.name, quantity: 0, unitPrice: c.defaultPrice }))
  );

  const selectedClient = administradoras.find(c => c.id === clientId);
  const condominios: Condominio[] = selectedClient?.condominios || [];

  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const activeItems = items.filter(i => i.quantity > 0);

  const updateItem = (id: string, field: 'quantity' | 'unitPrice', value: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: Math.max(0, value) } : i));
  };

  const handleSave = async () => {
    if (!clientId || !condominioId || !date || !assemblyDate) return;
    const client = administradoras.find(c => c.id === clientId)!;
    const condo = condominios.find(c => c.id === condominioId);

    await onSave({
      clientId,
      clientName: client.name,
      condominioId,
      condominioName: condo?.name || '',
      date,
      assemblyDate,
      assemblyTime,
      items: items.filter(i => i.quantity > 0),
      totalValue,
      status,
      observations,
      createdAt: existing?.createdAt || new Date().toISOString(),
      createdBy: existing?.createdBy || '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {existing ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Client & Condo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Administradora *</Label>
              <Select value={clientId} onValueChange={(v) => { setClientId(v); setCondominioId(''); }}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {administradoras.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Condomínio *</Label>
              <Select value={condominioId} onValueChange={setCondominioId} disabled={!clientId}>
                <SelectTrigger><SelectValue placeholder={clientId ? "Selecione" : "Selecione a administradora primeiro"} /></SelectTrigger>
                <SelectContent>
                  {condominios.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Data do Orçamento *</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data da Assembleia *</Label>
              <Input type="date" value={assemblyDate} onChange={e => setAssemblyDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Horário da Assembleia</Label>
              <Input type="time" value={assemblyTime} onChange={e => setAssemblyTime(e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Itens Contratados</Label>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_120px_100px] gap-2 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
                <span>Item</span>
                <span className="text-center">Qtd</span>
                <span className="text-center">Valor Unit.</span>
                <span className="text-right">Subtotal</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className={cn(
                  "grid grid-cols-[1fr_100px_120px_100px] gap-2 px-4 py-2.5 border-t border-border items-center",
                  item.quantity > 0 && "bg-primary/5"
                )}>
                  <span className="text-sm text-foreground">{item.name}</span>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateItem(item.id, 'quantity', item.quantity - 1)}
                      className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-12 h-7 text-center text-xs p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                      className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice || ''}
                    onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    placeholder="R$ 0,00"
                    className="h-7 text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className={cn("text-xs text-right font-medium", item.quantity > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
              {/* Total */}
              <div className="grid grid-cols-[1fr_100px_120px_100px] gap-2 px-4 py-3 border-t-2 border-primary/30 bg-primary/5">
                <span className="text-sm font-bold text-foreground">
                  Total ({activeItems.length} {activeItems.length === 1 ? 'item' : 'itens'})
                </span>
                <span />
                <span />
                <span className="text-sm text-right font-bold text-primary">{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>

          {/* Status & Obs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as OrcamentoStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ORCAMENTO_STATUS_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={observations} onChange={e => setObservations(e.target.value)} rows={2} placeholder="Observações adicionais..." />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!clientId || !condominioId || !date || !assemblyDate}>
              {existing ? 'Salvar Alterações' : 'Criar Orçamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
