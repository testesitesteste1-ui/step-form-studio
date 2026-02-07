import { useState } from "react";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/lib/clients-data";
import ClientsList from "@/components/clients/ClientsList";
import ClientDetail from "@/components/clients/ClientDetail";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Keep selected client in sync with live data
  const liveClient = selectedClient ? clients.find(c => c.id === selectedClient.id) || null : null;

  if (liveClient) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <ClientDetail
          client={liveClient}
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
        onOpenClient={setSelectedClient}
        onAddClient={addClient}
        onUpdateClient={updateClient}
      />
    </div>
  );
}
