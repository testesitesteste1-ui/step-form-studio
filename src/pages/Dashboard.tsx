import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useLeads } from "@/hooks/useLeads";
import { useFinance } from "@/hooks/useFinance";
import { useCalendar } from "@/hooks/useCalendar";
import { useAuth } from "@/hooks/useAuth";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickNotes from "@/components/dashboard/QuickNotes";
import LeadsPipeline from "@/components/dashboard/LeadsPipeline";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import PerformanceIndicators from "@/components/dashboard/PerformanceIndicators";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: loadingP } = useProjects();
  const { clients, loading: loadingC } = useClients();
  const { leads, loading: loadingL } = useLeads();
  const { transactions, loading: loadingF } = useFinance();
  const { allEvents, loading: loadingE } = useCalendar();

  const visibleClients = useMemo(() => {
    return clients.filter(c => !c.private || c.createdBy === user?.uid);
  }, [clients, user]);

  const loading = loadingP || loadingC || loadingL || loadingF || loadingE;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Visão geral da empresa em tempo real</p>
      </div>

      {/* Metric cards */}
      <DashboardMetrics projects={projects} clients={visibleClients} leads={leads} transactions={transactions} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart projects={projects} clients={visibleClients} transactions={transactions} />
        <QuickNotes />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LeadsPipeline leads={leads} />
        <UpcomingEvents events={allEvents} projects={projects} />
        <PerformanceIndicators projects={projects} leads={leads} clients={visibleClients} transactions={transactions} />
      </div>
    </div>
  );
}
