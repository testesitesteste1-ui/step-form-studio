import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

export default function Index() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NeuraSys" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-foreground tracking-tight">NeuraSys</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 57px)" }}>
        <div className="text-center animate-fade-in px-4">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Bem-vindo!</h2>
          <p className="text-muted-foreground">
            Logado como <span className="text-primary">{user?.email}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
