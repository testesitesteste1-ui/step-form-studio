import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { Client } from "@/lib/clients-data";
import ClientsList from "@/components/clients/ClientsList";
import ClientDetail from "@/components/clients/ClientDetail";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [initialTab, setInitialTab] = useState('condominios');
  const location = useLocation();

  const visibleClients = useMemo(() => {
    return clients.filter(c => !c.private || c.createdBy === user?.uid);
  }, [clients, user]);

  useEffect(() => {
    const state = location.state as { openClientId?: string } | null;
    if (state?.openClientId && visibleClients.length > 0) {
      const client = visibleClients.find(c => c.id === state.openClientId);
      if (client) {
        setSelectedClient(client);
        setInitialTab('condominios');
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, visibleClients]);

  const liveClient = selectedClient ? visibleClients.find(c => c.id === selectedClient.id) || null : null;

  const handleOpenClient = (client: Client, tab?: string) => {
    setSelectedClient(client);
    setInitialTab(tab || (client.type === 'administradora' ? 'condominios' : 'informacoes'));
  };

  if (liveClient) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <ClientDetail client={liveClient} initialTab={initialTab} onBack={() => setSelectedClient(null)} onUpdate={updateClient} onDelete={deleteClient} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <ClientsList clients={visibleClients} loading={loading} onOpenClient={handleOpenClient} onAddClient={addClient} onUpdateClient={updateClient} />
    </div>
  );
}
