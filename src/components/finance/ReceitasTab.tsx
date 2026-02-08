// ═══════════════════════════════════════════════════════════
// Receitas Tab - Shows revenue from projects + parallel income
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Client, formatCurrency } from "@/lib/clients-data";
import { Transaction, TransactionStatus, TRANSACTION_STATUS_LABELS, TRANSACTION_STATUS_COLORS, isInPeriod } from "@/lib/finance-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  clients: Client[];
  transactions: Transaction[];
  start: Date;
  end: Date;
  onAddRevenue: () => void;
  onDelete: (id: string) => Promise<void>;
}

interface RevenueRow {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  category: string;
  value: number;
  status: TransactionStatus;
  isManual: boolean;
}

export default function ReceitasTab({ clients, transactions, start, end, onAddRevenue, onDelete }: Props) {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'todos'>('todos');

  const rows = useMemo(() => {
    const result: RevenueRow[] = [];

    // 1. Project-based revenue (from payments in projects)
    clients.forEach(client => {
      client.projects.forEach(project => {
        (project.payments || []).forEach(payment => {
          if (isInPeriod(payment.date, start, end)) {
            result.push({
              id: `proj-${client.id}-${project.id}-${payment.id}`,
              date: payment.date,
              client: client.name,
              project: project.name,
              description: payment.description,
              category: 'Projeto',
              value: payment.value,
              status: 'pago',
              isManual: false,
            });
          }
        });
      });
    });

    // 2. Manual revenue transactions
    transactions
      .filter(t => t.type === 'receita' && isInPeriod(t.date, start, end))
      .forEach(t => {
        const client = t.clientId ? clients.find(c => c.id === t.clientId) : null;
        result.push({
          id: t.id,
          date: t.date,
          client: client?.name || '—',
          project: '—',
          description: t.description,
          category: t.category === 'renda_paralela' ? 'Renda Paralela' : 'Projeto',
          value: t.value,
          status: t.status,
          isManual: true,
        });
      });

    // Filter
    let filtered = result;
    if (statusFilter !== 'todos') filtered = filtered.filter(r => r.status === statusFilter);

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clients, transactions, start, end, statusFilter]);

  const totalPago = rows.filter(r => r.status === 'pago').reduce((s, r) => s + r.value, 0);
  const totalPendente = rows.filter(r => r.status !== 'pago').reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-4">
      {/* Filters + action */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5">
          {(['todos', 'pago', 'pendente', 'atrasado'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}>
              {s === 'todos' ? 'Todos' : TRANSACTION_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onAddRevenue} className="gap-1 text-xs"><Plus className="w-4 h-4" /> Receita Paralela</Button>
      </div>

      {/* Table / Cards */}
      {rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma receita no período selecionado</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Cliente</th>
                  <th className="text-left py-2 px-2">Projeto</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-left py-2 px-2">Categoria</th>
                  <th className="text-right py-2 px-2">Valor</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 px-2 text-muted-foreground text-xs">{new Date(row.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2.5 px-2 text-foreground text-xs font-medium">{row.client}</td>
                    <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.project}</td>
                    <td className="py-2.5 px-2 text-foreground text-xs">{row.description}</td>
                    <td className="py-2.5 px-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{row.category}</span></td>
                    <td className="py-2.5 px-2 text-right text-emerald-400 font-bold text-xs">{formatCurrency(row.value)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", TRANSACTION_STATUS_COLORS[row.status])}>
                        {TRANSACTION_STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      {row.isManual && (
                        <button onClick={() => onDelete(row.id)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {rows.map(row => (
              <div key={row.id} className="bg-card border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="min-w-0">
                    <p className="text-foreground text-xs font-medium truncate">{row.description}</p>
                    <p className="text-muted-foreground text-[10px]">{row.client} · {new Date(row.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-emerald-400 font-bold text-xs shrink-0">{formatCurrency(row.value)}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", TRANSACTION_STATUS_COLORS[row.status])}>
                    {TRANSACTION_STATUS_LABELS[row.status]}
                  </span>
                  {row.isManual && (
                    <button onClick={() => onDelete(row.id)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Totals */}
      <div className="flex gap-4 pt-2 border-t border-border text-xs">
        <span className="text-muted-foreground">Total: <span className="text-foreground font-bold">{formatCurrency(totalPago + totalPendente)}</span></span>
        <span className="text-muted-foreground">Pago: <span className="text-emerald-400 font-bold">{formatCurrency(totalPago)}</span></span>
        <span className="text-muted-foreground">Pendente: <span className="text-orange-400 font-bold">{formatCurrency(totalPendente)}</span></span>
      </div>
    </div>
  );
}
