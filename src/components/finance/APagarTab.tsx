// ═══════════════════════════════════════════════════════════
// A Pagar Tab - Pending expenses with due dates
// ═══════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Trash2, AlertTriangle, Check } from "lucide-react";
import { formatCurrency } from "@/lib/clients-data";
import {
  Transaction, EXPENSE_CATEGORY_LABELS, TRANSACTION_STATUS_COLORS,
  TRANSACTION_STATUS_LABELS, ExpenseCategory,
} from "@/lib/finance-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Props {
  transactions: Transaction[];
  onUpdate: (tx: Transaction) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function APagarTab({ transactions, onUpdate, onDelete }: Props) {
  const { toast } = useToast();

  const pending = useMemo(() => {
    return transactions
      .filter(t => t.type === 'despesa' && t.status !== 'pago')
      .sort((a, b) => {
        // Overdue first, then by due date
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aDue - bDue;
      });
  }, [transactions]);

  const totalPending = pending.reduce((s, t) => s + t.value, 0);
  const overdue = pending.filter(t => t.dueDate && new Date(t.dueDate) < new Date());

  const markAsPaid = async (tx: Transaction) => {
    await onUpdate({ ...tx, status: 'pago', date: new Date().toISOString() });
    toast({ title: "Despesa marcada como paga!" });
  };

  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Atrasado ${Math.abs(diffDays)}d`, color: 'text-red-400 bg-red-500/10' };
    if (diffDays <= 3) return { label: `Vence em ${diffDays}d`, color: 'text-yellow-400 bg-yellow-500/10' };
    return { label: `Vence em ${diffDays}d`, color: 'text-muted-foreground bg-secondary' };
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-red-400 font-bold text-sm sm:text-lg">{formatCurrency(totalPending)}</p>
          <p className="text-muted-foreground text-[10px]">Total a Pagar</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          {overdue.length > 0 ? (
            <>
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 font-bold text-sm sm:text-lg">{overdue.length}</p>
              </div>
              <p className="text-muted-foreground text-[10px]">Atrasadas</p>
            </>
          ) : (
            <>
              <p className="text-emerald-400 font-bold text-sm sm:text-lg">0</p>
              <p className="text-muted-foreground text-[10px]">Atrasadas</p>
            </>
          )}
        </div>
      </div>

      {pending.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma conta pendente 🎉</p>
      ) : (
        <div className="space-y-2">
          {pending.map(tx => {
            const dueStatus = getDueStatus(tx.dueDate);
            return (
              <div key={tx.id} className={cn("bg-card border rounded-lg p-3 group",
                dueStatus?.color.includes('red') ? 'border-red-500/30' : 'border-border'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-xs sm:text-sm font-medium">{tx.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        {EXPENSE_CATEGORY_LABELS[tx.category as ExpenseCategory] || tx.category}
                      </span>
                      {dueStatus && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full", dueStatus.color)}>
                          {dueStatus.label}
                        </span>
                      )}
                      {tx.recurring && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">🔄 Recorrente</span>}
                    </div>
                  </div>
                  <p className="text-red-400 font-bold text-xs sm:text-sm shrink-0">{formatCurrency(tx.value)}</p>
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => markAsPaid(tx)}>
                    <Check className="w-3 h-3" /> Pagar
                  </Button>
                  <button onClick={() => onDelete(tx.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
