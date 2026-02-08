// ═══════════════════════════════════════════════════════════
// New Transaction Modal - Add receita or despesa
// ═══════════════════════════════════════════════════════════

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Transaction, TransactionType, TransactionStatus,
  ExpenseCategory, EXPENSE_CATEGORY_LABELS,
  ExpenseSubcategory, EXPENSE_SUBCATEGORY_LABELS,
  ParallelRevenueCategory, PARALLEL_REVENUE_LABELS,
  PaymentMethod, PAYMENT_METHOD_LABELS,
} from "@/lib/finance-data";
import { Client } from "@/lib/clients-data";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => Promise<string>;
  clients: Client[];
  defaultType?: TransactionType;
}

export default function TransactionModal({ open, onClose, onSave, clients, defaultType = 'receita' }: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<TransactionType>(defaultType);
  const [form, setForm] = useState({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'pendente' as TransactionStatus,
    category: (defaultType === 'receita' ? 'renda_paralela' : 'despesa_variavel') as string,
    subcategory: '' as string,
    clientId: '',
    paymentMethod: 'pix' as PaymentMethod,
    recurring: false,
    observations: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.description.trim()) { toast({ title: "Descrição obrigatória", variant: "destructive" }); return; }
    const val = parseFloat(form.value);
    if (!val || val <= 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }

    setSaving(true);
    try {
      await onSave({
        type,
        description: form.description,
        value: val,
        date: form.date,
        dueDate: form.dueDate || undefined,
        status: form.status,
        category: form.category as any,
        subcategory: (form.subcategory || undefined) as any,
        clientId: form.clientId || undefined,
        paymentMethod: form.paymentMethod,
        recurring: form.recurring,
        observations: form.observations,
        createdAt: new Date().toISOString(),
      });
      toast({ title: type === 'receita' ? "Receita adicionada!" : "Despesa adicionada!" });
      // Reset
      setForm({
        description: '', value: '', date: new Date().toISOString().split('T')[0],
        dueDate: '', status: 'pendente', category: type === 'receita' ? 'renda_paralela' : 'despesa_variavel',
        subcategory: '', clientId: '', paymentMethod: 'pix', recurring: false, observations: '',
      });
      onClose();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setType('receita'); update('category', 'renda_paralela'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'receita' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-secondary text-muted-foreground'}`}
            >
              💰 Receita
            </button>
            <button
              onClick={() => { setType('despesa'); update('category', 'despesa_variavel'); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'despesa' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-secondary text-muted-foreground'}`}
            >
              💸 Despesa
            </button>
          </div>

          <div><Label>Descrição *</Label><Input value={form.description} onChange={e => update('description', e.target.value)} placeholder="Ex: Pagamento mensal..." /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Valor (R$) *</Label><Input type="number" value={form.value} onChange={e => update('value', e.target.value)} placeholder="0,00" /></div>
            <div><Label>Data</Label><Input type="date" value={form.date} onChange={e => update('date', e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {type === 'receita' ? (
                    <>
                      <SelectItem value="renda_paralela">Renda Paralela</SelectItem>
                      <SelectItem value="projeto">Projeto</SelectItem>
                    </>
                  ) : (
                    Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subcategoria</Label>
              <Select value={form.subcategory} onValueChange={v => update('subcategory', v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {type === 'receita' ? (
                    Object.entries(PARALLEL_REVENUE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))
                  ) : (
                    Object.entries(EXPENSE_SUBCATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pagamento</Label>
              <Select value={form.paymentMethod} onValueChange={v => update('paymentMethod', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional: Link to client */}
          {clients.length > 0 && (
            <div>
              <Label>Vincular a Cliente (opcional)</Label>
              <Select value={form.clientId} onValueChange={v => update('clientId', v)}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div><Label>Vencimento</Label><Input type="date" value={form.dueDate} onChange={e => update('dueDate', e.target.value)} /></div>

          <div className="flex items-center gap-2">
            <Checkbox checked={form.recurring} onCheckedChange={v => update('recurring', v)} id="recurring" />
            <Label htmlFor="recurring" className="text-sm">Recorrente (mensal)</Label>
          </div>

          <div><Label>Observações</Label><Textarea value={form.observations} onChange={e => update('observations', e.target.value)} rows={2} placeholder="Anotações..." /></div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : type === 'receita' ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
