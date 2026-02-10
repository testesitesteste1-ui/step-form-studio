// ═══════════════════════════════════════════════════════════
// Finance Page - Main financial management dashboard
// Integrates with Clients/Projects data + manual transactions
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useClients } from "@/hooks/useClients";
import { useFinance } from "@/hooks/useFinance";
import { useAuth } from "@/hooks/useAuth";
import { PeriodFilter, PERIOD_LABELS, getPeriodRange } from "@/lib/finance-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import FinanceMetrics from "@/components/finance/FinanceMetrics";
import TransactionModal from "@/components/finance/TransactionModal";
import ReceitasTab from "@/components/finance/ReceitasTab";
import DespesasTab from "@/components/finance/DespesasTab";
import AReceberTab from "@/components/finance/AReceberTab";
import APagarTab from "@/components/finance/APagarTab";
import FluxoCaixaTab from "@/components/finance/FluxoCaixaTab";
import RelatoriosTab from "@/components/finance/RelatoriosTab";

export default function Finance() {
  const { clients } = useClients();
  const { user } = useAuth();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [period, setPeriod] = useState<PeriodFilter>('mes_atual');

  // Filter out private clients that don't belong to the current user
  const visibleClients = useMemo(() => {
    return clients.filter(c => !c.private || c.createdBy === user?.uid);
  }, [clients, user]);
  const [txModal, setTxModal] = useState(false);
  const [txType, setTxType] = useState<'receita' | 'despesa'>('receita');

  const { start, end } = getPeriodRange(period);

  const openModal = (type: 'receita' | 'despesa') => {
    setTxType(type);
    setTxModal(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground text-sm">Gestão financeira integrada</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={v => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PERIOD_LABELS).filter(([k]) => k !== 'custom').map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => openModal('receita')} className="gap-1 text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Transação
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <FinanceMetrics clients={visibleClients} transactions={transactions} period={period} />

      {/* Tabs */}
      <Tabs defaultValue="receitas" className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1">
          <TabsTrigger value="receitas" className="text-xs sm:text-sm flex-1 min-w-[80px]">Receitas</TabsTrigger>
          <TabsTrigger value="despesas" className="text-xs sm:text-sm flex-1 min-w-[80px]">Despesas</TabsTrigger>
          <TabsTrigger value="a_receber" className="text-xs sm:text-sm flex-1 min-w-[80px]">A Receber</TabsTrigger>
          <TabsTrigger value="a_pagar" className="text-xs sm:text-sm flex-1 min-w-[80px]">A Pagar</TabsTrigger>
          <TabsTrigger value="fluxo" className="text-xs sm:text-sm flex-1 min-w-[80px]">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs sm:text-sm flex-1 min-w-[80px]">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="mt-4">
          <ReceitasTab
            clients={visibleClients} transactions={transactions}
            start={start} end={end}
            onAddRevenue={() => openModal('receita')}
            onDelete={deleteTransaction}
          />
        </TabsContent>

        <TabsContent value="despesas" className="mt-4">
          <DespesasTab
            transactions={transactions}
            start={start} end={end}
            onAddExpense={() => openModal('despesa')}
            onDelete={deleteTransaction}
          />
        </TabsContent>

        <TabsContent value="a_receber" className="mt-4">
          <AReceberTab clients={visibleClients} />
        </TabsContent>

        <TabsContent value="a_pagar" className="mt-4">
          <APagarTab
            transactions={transactions}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        </TabsContent>

        <TabsContent value="fluxo" className="mt-4">
          <FluxoCaixaTab clients={visibleClients} transactions={transactions} />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <RelatoriosTab clients={visibleClients} transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <TransactionModal
        open={txModal}
        onClose={() => setTxModal(false)}
        onSave={addTransaction}
        clients={visibleClients}
        defaultType={txType}
      />
    </div>
  );
}
