// ═══════════════════════════════════════════════════════════
// Despesas Tab - Fixed, variable, and project costs
// ═══════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/clients-data";
import {
  Transaction, ExpenseCategory, EXPENSE_CATEGORY_LABELS,
  EXPENSE_SUBCATEGORY_LABELS, TRANSACTION_STATUS_LABELS,
  TRANSACTION_STATUS_COLORS, isInPeriod,
} from "@/lib/finance-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
  start: Date;
  end: Date;
  onAddExpense: () => void;
  onDelete: (id: string) => Promise<void>;
}

export default function DespesasTab({ transactions, start, end, onAddExpense, onDelete }: Props) {
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'todas'>('todas');

  const expenses = useMemo(() => {
    let result = transactions
      .filter(t => t.type === 'despesa' && isInPeriod(t.date, start, end));
    if (catFilter !== 'todas') result = result.filter(t => t.category === catFilter);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, start, end, catFilter]);

  const totalByCategory = useMemo(() => {
    const all = transactions.filter(t => t.type === 'despesa' && isInPeriod(t.date, start, end));
    return {
      custo_projeto: all.filter(t => t.category === 'custo_projeto').reduce((s, t) => s + t.value, 0),
      despesa_fixa: all.filter(t => t.category === 'despesa_fixa').reduce((s, t) => s + t.value, 0),
      despesa_variavel: all.filter(t => t.category === 'despesa_variavel').reduce((s, t) => s + t.value, 0),
    };
  }, [transactions, start, end]);

  const total = expenses.reduce((s, t) => s + t.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCatFilter('todas')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              catFilter === 'todas' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
            Todas
          </button>
          {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setCatFilter(k as ExpenseCategory)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                catFilter === k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>
              {v}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={onAddExpense} className="gap-1 text-xs shrink-0"><Plus className="w-4 h-4" /> Nova Despesa</Button>
      </div>

      {/* Category summary */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
          <div key={k} className="bg-card border border-border rounded-lg p-2.5 text-center">
            <p className="text-red-400 font-bold text-xs sm:text-sm">{formatCurrency(totalByCategory[k as keyof typeof totalByCategory])}</p>
            <p className="text-muted-foreground text-[9px] sm:text-[10px]">{v}</p>
          </div>
        ))}
      </div>

      {expenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma despesa no período</p>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Categoria</th>
                  <th className="text-left py-2 px-2">Descrição</th>
                  <th className="text-right py-2 px-2">Valor</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-2.5 px-2 text-muted-foreground text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        {EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory] || t.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-foreground text-xs">
                      {t.description}
                      {t.subcategory && <span className="text-muted-foreground ml-1">({EXPENSE_SUBCATEGORY_LABELS[t.subcategory as keyof typeof EXPENSE_SUBCATEGORY_LABELS] || t.subcategory})</span>}
                    </td>
                    <td className="py-2.5 px-2 text-right text-red-400 font-bold text-xs">{formatCurrency(t.value)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", TRANSACTION_STATUS_COLORS[t.status])}>
                        {TRANSACTION_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <button onClick={() => onDelete(t.id)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {expenses.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-foreground text-xs font-medium truncate">{t.description}</p>
                    <p className="text-muted-foreground text-[10px]">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="text-red-400 font-bold text-xs shrink-0">{formatCurrency(t.value)}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", TRANSACTION_STATUS_COLORS[t.status])}>
                    {TRANSACTION_STATUS_LABELS[t.status]}
                  </span>
                  <button onClick={() => onDelete(t.id)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="pt-2 border-t border-border text-xs text-muted-foreground">
        Total: <span className="text-red-400 font-bold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
