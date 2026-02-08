// ═══════════════════════════════════════════════════════════
// A Receber Tab - Pending payments from active projects
// ═══════════════════════════════════════════════════════════

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Client, formatCurrency } from "@/lib/clients-data";
import { cn } from "@/lib/utils";

interface Props {
  clients: Client[];
}

interface ReceivableRow {
  clientName: string;
  projectName: string;
  totalValue: number;
  received: number;
  pending: number;
  clientId: string;
  projectId: string;
}

export default function AReceberTab({ clients }: Props) {
  const rows = useMemo(() => {
    const result: ReceivableRow[] = [];
    clients.forEach(client => {
      client.projects
        .filter(p => p.status === 'ativo' || p.status === 'negociando')
        .forEach(project => {
          const received = (project.payments || []).reduce((s, p) => s + p.value, 0);
          const pending = Math.max(0, project.value - received);
          if (project.value > 0) {
            result.push({
              clientName: client.name,
              projectName: project.name,
              totalValue: project.value,
              received,
              pending,
              clientId: client.id,
              projectId: project.id,
            });
          }
        });
    });
    return result.sort((a, b) => b.pending - a.pending);
  }, [clients]);

  const totalPending = rows.reduce((s, r) => s + r.pending, 0);
  const totalReceived = rows.reduce((s, r) => s + r.received, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-orange-400 font-bold text-sm sm:text-lg">{formatCurrency(totalPending)}</p>
          <p className="text-muted-foreground text-[10px]">Total a Receber</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-emerald-400 font-bold text-sm sm:text-lg">{formatCurrency(totalReceived)}</p>
          <p className="text-muted-foreground text-[10px]">Já Recebido</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-foreground font-bold text-sm sm:text-lg">{rows.length}</p>
          <p className="text-muted-foreground text-[10px]">Projetos Pendentes</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhum valor pendente</p>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-2">Cliente</th>
                  <th className="text-left py-2 px-2">Projeto</th>
                  <th className="text-right py-2 px-2">Valor Total</th>
                  <th className="text-right py-2 px-2">Recebido</th>
                  <th className="text-right py-2 px-2">Falta</th>
                  <th className="text-center py-2 px-2">%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const pct = row.totalValue > 0 ? Math.round((row.received / row.totalValue) * 100) : 0;
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-2.5 px-2 text-foreground text-xs font-medium">{row.clientName}</td>
                      <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.projectName}</td>
                      <td className="py-2.5 px-2 text-right text-foreground text-xs">{formatCurrency(row.totalValue)}</td>
                      <td className="py-2.5 px-2 text-right text-emerald-400 text-xs">{formatCurrency(row.received)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-xs">
                        <span className={row.pending > 0 ? 'text-orange-400' : 'text-emerald-400'}>
                          {formatCurrency(row.pending)}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {rows.map((row, i) => {
              const pct = row.totalValue > 0 ? Math.round((row.received / row.totalValue) * 100) : 0;
              return (
                <div key={i} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-foreground text-xs font-medium">{row.clientName}</p>
                      <p className="text-muted-foreground text-[10px]">{row.projectName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold text-xs">{formatCurrency(row.pending)}</p>
                      <p className="text-muted-foreground text-[10px]">falta</p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% recebido · {formatCurrency(row.received)} de {formatCurrency(row.totalValue)}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
