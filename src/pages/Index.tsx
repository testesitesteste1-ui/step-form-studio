import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground tracking-tight">NeuraSys</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 65px)" }}>
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Bem-vindo!</h2>
          <p className="text-muted-foreground">Você está logado como <span className="text-foreground">{user?.email}</span></p>
        </div>
      </main>
    </div>
  );
}
