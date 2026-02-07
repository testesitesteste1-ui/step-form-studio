import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-57px)] md:min-h-screen p-6">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Em breve — métricas e visão geral do seu negócio.</p>
      </div>
    </div>
  );
}
