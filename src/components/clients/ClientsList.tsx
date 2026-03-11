import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Lock, Building2, UserCheck } from "lucide-react";
import { Client, ClientStatus, ClientType, CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS, formatCurrency } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ClientCard from "./ClientCard";
import NewClientModal from "./NewClientModal";

interface Props {
  clients: Client[];
  loading: boolean;
  onOpenClient: (client: Client, tab?: string) => void;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<string>;
  onUpdateClient: (client: Client) => Promise<void>;
}

const STATUS_FILTERS: { label: string; value: ClientStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Proposta', value: 'proposta' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Pausados', value: 'pausado' },
  { label: 'Finalizados', value: 'finalizado' },
  { label: 'Perdidos', value: 'perdido' },
];

const TYPE_FILTERS: { label: string; value: ClientType | 'todos'; icon: React.ReactNode }[] = [
  { label: 'Todos', value: 'todos', icon: null },
  { label: 'Administradoras', value: 'administradora', icon: <Building2 className="w-3 h-3" /> },
  { label: 'Síndicos', value: 'sindico', icon: <UserCheck className="w-3 h-3" /> },
];

export default function ClientsList({ clients, loading, onOpenClient, onAddClient, onUpdateClient }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'todos'>('todos');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'todos'>('todos');
  const [newModalOpen, setNewModalOpen] = useState(false);

  const metrics = useMemo(() => {
    const active = clients.filter(c => c.status === 'ativo');
    const totalRevenue = clients.reduce((sum, c) => sum + c.projects.reduce((s, p) => s + (p.value || 0), 0), 0);
    const admins = clients.filter(c => c.type === 'administradora').length;
    const totalCond = clients.reduce((sum, c) => sum + (c.condominios || []).length, 0);
    return { total: clients.length, active: active.length, totalRevenue, admins, totalCond };
  }, [clients]);

  const { publicClients, privateClients } = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.cnpj.includes(q) ||
        c.phone.includes(q)
      );
    }

    if (statusFilter !== 'todos') result = result.filter(c => c.status === statusFilter);
    if (typeFilter !== 'todos') result = result.filter(c => c.type === typeFilter);

    result.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

    return {
      publicClients: result.filter(c => !c.private),
      privateClients: result.filter(c => c.private),
    };
  }, [clients, search, statusFilter, typeFilter]);

  const toggleFavorite = (client: Client) => {
    onUpdateClient({ ...client, favorite: !client.favorite });
  };

  const totalFiltered = publicClients.length + privateClients.length;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clients.length} clientes cadastrados</p>
        </div>
        <Button onClick={() => setNewModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: metrics.total, sub: `${metrics.active} ativos`, color: 'text-primary' },
          { label: 'Administradoras', value: metrics.admins, sub: `${metrics.total - metrics.admins} síndicos`, color: 'text-amber-400' },
          { label: 'Condomínios', value: metrics.totalCond, sub: 'cadastrados', color: 'text-emerald-400' },
          { label: 'Receita Total', value: formatCurrency(metrics.totalRevenue), sub: 'em projetos', color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/60 rounded-xl p-3"
          >
            <p className={cn("font-bold text-lg", m.color)}>{m.value}</p>
            <p className="text-foreground text-xs font-medium">{m.label}</p>
            <p className="text-muted-foreground text-[10px]">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente, CNPJ, contato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                statusFilter === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >{opt.label}</button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TYPE_FILTERS.map(opt => (
            <button key={opt.value} onClick={() => setTypeFilter(opt.value)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all inline-flex items-center gap-1",
                typeFilter === opt.value ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
              )}
            >{opt.icon} {opt.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : totalFiltered === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-sm">
            {search || statusFilter !== 'todos' || typeFilter !== 'todos'
              ? 'Tente alterar os filtros para encontrar o que procura'
              : 'Cadastre seu primeiro cliente para começar a gerenciar'}
          </p>
          <Button onClick={() => setNewModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {publicClients.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {publicClients.map(client => (
                  <ClientCard key={client.id} client={client}
                    onOpen={() => onOpenClient(client)}
                    onEdit={() => onOpenClient(client, 'informacoes')}
                    onToggleFavorite={() => toggleFavorite(client)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {privateClients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Lock className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Meus Clientes Privados</span>
                  <span className="text-[10px] text-destructive/60">— Visível apenas para você</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {privateClients.map(client => (
                    <ClientCard key={client.id} client={client}
                      onOpen={() => onOpenClient(client)}
                      onEdit={() => onOpenClient(client, 'informacoes')}
                      onToggleFavorite={() => toggleFavorite(client)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      <NewClientModal open={newModalOpen} onClose={() => setNewModalOpen(false)} onSave={onAddClient} />
    </>
  );
}
