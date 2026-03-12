import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { Orcamento, ORCAMENTO_STATUS_LABELS, ORCAMENTO_STATUS_COLORS } from "@/lib/orcamentos-data";
import { formatCurrency } from "@/lib/clients-data";
import OrcamentoModal from "@/components/orcamentos/OrcamentoModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package, Plus, Search, Calendar, Building2, Building, DollarSign, FileText, Eye,
  Pencil, Trash2, Clock, CheckCircle2, XCircle, Send
} from "lucide-react";

const STATUS_ICONS: Record<string, React.ElementType> = {
  rascunho: FileText,
  enviado: Send,
  aprovado: CheckCircle2,
  recusado: XCircle,
};

export default function Orcamentos() {
  const { user } = useAuth();
  const { orcamentos, loading, addOrcamento, updateOrcamento, deleteOrcamento } = useOrcamentos();
  const { clients } = useClients();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Orcamento | undefined>();
  const [viewing, setViewing] = useState<Orcamento | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orcamentos
      .filter(o => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (search) {
          const s = search.toLowerCase();
          return o.clientName.toLowerCase().includes(s) || o.condominioName.toLowerCase().includes(s);
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orcamentos, search, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = orcamentos.length;
    const approved = orcamentos.filter(o => o.status === 'aprovado');
    const pending = orcamentos.filter(o => o.status === 'enviado');
    const totalValue = orcamentos.reduce((s, o) => s + o.totalValue, 0);
    const approvedValue = approved.reduce((s, o) => s + o.totalValue, 0);
    return { total, approved: approved.length, pending: pending.length, totalValue, approvedValue };
  }, [orcamentos]);

  const handleSave = async (data: Omit<Orcamento, 'id'>) => {
    if (editing) {
      await updateOrcamento({ ...data, id: editing.id } as Orcamento);
    } else {
      await addOrcamento({ ...data, createdBy: user?.uid || '' });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOrcamento(deleteId);
      setDeleteId(null);
      if (viewing?.id === deleteId) setViewing(null);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR'); } catch { return d; }
  };

  // ─── Detail View ───
  if (viewing) {
    const StatusIcon = STATUS_ICONS[viewing.status] || FileText;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setViewing(null)} className="gap-1 text-muted-foreground">
            ← Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setEditing(viewing); setModal(true); }} className="gap-1">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(viewing.id)} className="gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">{viewing.condominioName}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5" /> {viewing.clientName}
              </p>
            </div>
            <span className={cn("text-xs px-3 py-1.5 rounded-lg font-medium border flex items-center gap-1.5", ORCAMENTO_STATUS_COLORS[viewing.status])}>
              <StatusIcon className="w-3.5 h-3.5" />
              {ORCAMENTO_STATUS_LABELS[viewing.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Orçamento</p>
              <p className="text-sm font-medium text-foreground">{formatDate(viewing.date)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Data Assembleia</p>
              <p className="text-sm font-medium text-foreground">{formatDate(viewing.assemblyDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Horário</p>
              <p className="text-sm font-medium text-foreground">{viewing.assemblyTime || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor Total</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(viewing.totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Itens Contratados</h2>
          </div>
          <div className="divide-y divide-border">
            {viewing.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.quantity}x · {formatCurrency(item.unitPrice)} /un
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(item.quantity * item.unitPrice)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t-2 border-primary/20 bg-primary/5 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-base font-bold text-primary">{formatCurrency(viewing.totalValue)}</span>
          </div>
        </div>

        {viewing.observations && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Observações</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewing.observations}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // ─── List View ───
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus orçamentos para assembleias</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: kpis.total, icon: FileText, color: 'text-foreground' },
          { label: 'Aprovados', value: kpis.approved, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Pendentes', value: kpis.pending, icon: Clock, color: 'text-blue-400' },
          { label: 'Valor Aprovado', value: formatCurrency(kpis.approvedValue), icon: DollarSign, color: 'text-primary' },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
            <k.icon className={cn("w-4 h-4 mb-2", k.color)} />
            <p className={cn("text-lg font-bold", k.color)}>{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por administradora ou condomínio..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(ORCAMENTO_STATUS_LABELS).map(([k, l]) => (
              <SelectItem key={k} value={k}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
          <Button variant="outline" size="sm" onClick={() => { setEditing(undefined); setModal(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Criar primeiro orçamento
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Administradora</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Condomínio</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Assembleia</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Itens</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(o => {
                  const StatusIcon = STATUS_ICONS[o.status] || FileText;
                  return (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setViewing(o)}>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{formatDate(o.date)}</td>
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{o.clientName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[160px]">{o.condominioName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(o.assemblyDate)} {o.assemblyTime && `às ${o.assemblyTime}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.items.length}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{formatCurrency(o.totalValue)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[10px] px-2 py-1 rounded-md font-medium border inline-flex items-center gap-1", ORCAMENTO_STATUS_COLORS[o.status])}>
                          <StatusIcon className="w-3 h-3" />
                          {ORCAMENTO_STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(o)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(o); setModal(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(o.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <OrcamentoModal
          open={modal}
          onClose={() => { setModal(false); setEditing(undefined); }}
          clients={clients}
          onSave={handleSave}
          existing={editing}
        />
      )}

      {/* Confirm Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
