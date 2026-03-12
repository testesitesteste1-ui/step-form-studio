import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useClients } from "@/hooks/useClients";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useAuth } from "@/hooks/useAuth";
import { Client, Condominio, formatCurrency, newId } from "@/lib/clients-data";
import { ORCAMENTO_CATALOG, Orcamento, OrcamentoItem, ORCAMENTO_STATUS_LABELS } from "@/lib/orcamentos-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Building2, Building, Calendar, Clock, Package, FileText, Plus, Minus,
  CheckCircle2, Eye, ArrowLeft, Loader2, Send
} from "lucide-react";

export default function GeradorOrcamento() {
  const { user } = useAuth();
  const { clients, loading: loadingClients } = useClients();
  const { addOrcamento } = useOrcamentos();

  const [step, setStep] = useState<'select' | 'items' | 'preview'>('select');
  const [saving, setSaving] = useState(false);

  // Step 1 - Client selection
  const [clientId, setClientId] = useState('');
  const [condominioId, setCondominioId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assemblyDate, setAssemblyDate] = useState('');
  const [assemblyTime, setAssemblyTime] = useState('');
  const [observations, setObservations] = useState('');

  // Step 2 - Items
  const [items, setItems] = useState<Record<string, { qty: number; price: number }>>({});

  const administradoras = useMemo(() => clients.filter(c => c.type === 'administradora'), [clients]);
  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);
  const condominios = selectedClient?.condominios || [];
  const selectedCondominio = condominios.find(c => c.id === condominioId);

  const activeItems = useMemo(() => {
    return Object.entries(items)
      .filter(([, v]) => v.qty > 0)
      .map(([id, v]) => {
        const cat = ORCAMENTO_CATALOG.find(c => c.id === id);
        return { id, name: cat?.name || id, quantity: v.qty, unitPrice: v.price };
      });
  }, [items]);

  const totalValue = activeItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const updateItem = (id: string, field: 'qty' | 'price', value: number) => {
    setItems(prev => ({
      ...prev,
      [id]: { qty: prev[id]?.qty || 0, price: prev[id]?.price || 0, [field]: Math.max(0, value) }
    }));
  };

  const canProceedToItems = clientId && condominioId && date && assemblyDate;
  const canPreview = activeItems.length > 0;

  const handleSave = async (status: 'rascunho' | 'enviado') => {
    setSaving(true);
    try {
      const orcamento: Omit<Orcamento, 'id'> = {
        clientId,
        clientName: selectedClient?.name || '',
        condominioId,
        condominioName: selectedCondominio?.name || '',
        date,
        assemblyDate,
        assemblyTime,
        items: activeItems.map(i => ({ ...i, id: newId() })),
        totalValue,
        status,
        observations,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || '',
      };
      await addOrcamento(orcamento);
      toast.success(status === 'enviado' ? 'Orçamento gerado e enviado!' : 'Rascunho salvo!');
      // Reset
      setStep('select');
      setClientId('');
      setCondominioId('');
      setAssemblyDate('');
      setAssemblyTime('');
      setObservations('');
      setItems({});
    } catch {
      toast.error('Erro ao salvar orçamento');
    }
    setSaving(false);
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR'); } catch { return d; }
  };

  if (loadingClients) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerador de Orçamento</h1>
        <p className="text-sm text-muted-foreground">Selecione o cliente, adicione itens e gere o modelo</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: 'select', label: '1. Cliente', icon: Building2 },
          { key: 'items', label: '2. Itens', icon: Package },
          { key: 'preview', label: '3. Modelo', icon: Eye },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
              step === s.key ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground border-border"
            )}>
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Step 1: Select Client ── */}
      {step === 'select' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Dados do Orçamento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Administradora / Cliente</Label>
              <Select value={clientId} onValueChange={(v) => { setClientId(v); setCondominioId(''); }}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {administradoras.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  {clients.filter(c => c.type === 'sindico').map(c => (
                    <SelectItem key={c.id} value={c.id}>🏢 {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condomínio</Label>
              <Select value={condominioId} onValueChange={setCondominioId} disabled={!clientId || condominios.length === 0}>
                <SelectTrigger><SelectValue placeholder={condominios.length === 0 ? "Nenhum condomínio" : "Selecione..."} /></SelectTrigger>
                <SelectContent>
                  {condominios.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data do Orçamento</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Data da Assembleia</Label>
              <Input type="date" value={assemblyDate} onChange={e => setAssemblyDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Horário da Assembleia</Label>
              <Input type="time" value={assemblyTime} onChange={e => setAssemblyTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observações adicionais..." rows={3} />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep('items')} disabled={!canProceedToItems}>
              Próximo: Itens <Package className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Items ── */}
      {step === 'items' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Itens Contratados
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setStep('select')} className="gap-1 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Button>
          </div>

          <div className="space-y-2">
            {ITEMS_CATALOG.map(item => {
              const current = items[item.id] || { qty: 0, price: 0 };
              const isActive = current.qty > 0;
              return (
                <div key={item.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  isActive ? "border-primary/30 bg-primary/5" : "border-border"
                )}>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateItem(item.id, 'qty', current.qty - 1)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">{current.qty}</span>
                    <button
                      onClick={() => updateItem(item.id, 'qty', current.qty + 1)}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-28 shrink-0">
                    <Input
                      type="number"
                      placeholder="R$ valor"
                      value={current.price || ''}
                      onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                      className="text-right text-sm h-8"
                    />
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-primary w-24 text-right shrink-0">
                      {formatCurrency(current.qty * current.price)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">{activeItems.length} itens selecionados</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            </div>
            <Button onClick={() => setStep('preview')} disabled={!canPreview}>
              Ver Modelo <Eye className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview / Template ── */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep('items')} className="gap-1 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar aos itens
            </Button>
          </div>

          {/* ── MODELO DE ORÇAMENTO ── */}
          <div className="bg-card border-2 border-border rounded-xl overflow-hidden" id="orcamento-modelo">
            {/* Header */}
            <div className="bg-primary/10 border-b border-border px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">ORÇAMENTO</h2>
                  <p className="text-sm text-muted-foreground mt-1">Ex Eventos — Inteligência Condominial</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Data: <span className="text-foreground font-medium">{formatDate(date)}</span></p>
                </div>
              </div>
            </div>

            {/* Client info */}
            <div className="px-8 py-5 border-b border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Administradora</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" /> {selectedClient?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Condomínio</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-primary" /> {selectedCondominio?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Data da Assembleia</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" /> {formatDate(assemblyDate)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Horário</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" /> {assemblyTime || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="px-8 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">Item</th>
                    <th className="text-center py-2 text-xs font-medium text-muted-foreground">Qtd</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Valor Un.</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {activeItems.map((item, i) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-foreground font-medium">{item.name}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{item.quantity}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-semibold text-foreground">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mx-8 mb-6 mt-2 bg-primary/10 rounded-lg px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">VALOR TOTAL</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</span>
            </div>

            {/* Observations */}
            {observations && (
              <div className="px-8 pb-6">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{observations}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={() => handleSave('rascunho')} disabled={saving} className="gap-2">
              <FileText className="w-4 h-4" /> Salvar como Rascunho
            </Button>
            <Button onClick={() => handleSave('enviado')} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gerar Orçamento
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
