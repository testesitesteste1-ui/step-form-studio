import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/lib/clients-data";
import ClientsList from "@/components/clients/ClientsList";
import ClientDetail from "@/components/clients/ClientDetail";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [initialTab, setInitialTab] = useState('projetos');
  const location = useLocation();

  // Handle navigation from Projects page
  useEffect(() => {
    const state = location.state as { openClientId?: string; openProjectId?: string } | null;
    if (state?.openClientId && clients.length > 0) {
      const client = clients.find(c => c.id === state.openClientId);
      if (client) {
        setSelectedClient(client);
        setInitialTab('projetos');
        // Clear the state so it doesn't re-trigger
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, clients]);

  const liveClient = selectedClient ? clients.find(c => c.id === selectedClient.id) || null : null;

  const handleOpenClient = (client: Client, tab?: string) => {
    setSelectedClient(client);
    setInitialTab(tab || 'projetos');
  };

  if (liveClient) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <ClientDetail
          client={liveClient}
          initialTab={initialTab}
          onBack={() => setSelectedClient(null)}
          onUpdate={updateClient}
          onDelete={deleteClient}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <ClientsList
        clients={clients}
        loading={loading}
        onOpenClient={handleOpenClient}
        onAddClient={addClient}
        onUpdateClient={updateClient}
      />
    </div>
  );
}
