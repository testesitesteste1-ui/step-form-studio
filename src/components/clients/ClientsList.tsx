import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Lock } from "lucide-react";
import { Client, ClientStatus, CLIENT_STATUS_LABELS } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClientCard from "./ClientCard";
import NewClientModal from "./NewClientModal";

interface Props {
  clients: Client[];
  loading: boolean;
  onOpenClient: (client: Client, tab?: string) => void;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<string>;
  onUpdateClient: (client: Client) => Promise<void>;
}

const FILTER_OPTIONS: { label: string; value: ClientStatus | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Proposta', value: 'proposta' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Pausados', value: 'pausado' },
  { label: 'Finalizados', value: 'finalizado' },
  { label: 'Perdidos', value: 'perdido' },
];

export default function ClientsList({ clients, loading, onOpenClient, onAddClient, onUpdateClient }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ClientStatus | 'todos'>('todos');
  const [newModalOpen, setNewModalOpen] = useState(false);

  const { publicClients, privateClients } = useMemo(() => {
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    if (filter !== 'todos') {
      result = result.filter(c => c.status === filter);
    }

    result.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

    return {
      publicClients: result.filter(c => !c.private),
      privateClients: result.filter(c => c.private),
    };
  }, [clients, search, filter]);

  const toggleFavorite = (client: Client) => {
    onUpdateClient({ ...client, favorite: !client.favorite });
  };

  const renderGrid = (list: Client[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
      <AnimatePresence>
        {list.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onOpen={() => onOpenClient(client)}
            onEdit={() => onOpenClient(client, 'informacoes')}
            onToggleFavorite={() => toggleFavorite(client)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full max-w-[340px] h-64 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : totalFiltered === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground text-sm mb-4">Cadastre seu primeiro cliente para começar</p>
          <Button onClick={() => setNewModalOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Public clients */}
          {publicClients.length > 0 && renderGrid(publicClients)}

          {/* Private clients section */}
          {privateClients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
                  <Lock className="w-3.5 h-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Meus Clientes Privados</span>
                  <span className="text-[10px] text-destructive/70">— Visível apenas para você</span>
                </div>
              </div>
              {renderGrid(privateClients)}
            </div>
          )}
        </div>
      )}

      <NewClientModal open={newModalOpen} onClose={() => setNewModalOpen(false)} onSave={onAddClient} />
    </>
  );
}
