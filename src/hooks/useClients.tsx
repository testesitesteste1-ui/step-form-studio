import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Client } from "@/lib/clients-data";

const CLIENTS_PATH = "clients";

function parseClient(firebaseKey: string, value: any): Client {
  return {
    id: firebaseKey,
    name: value.name || '',
    company: value.company || '',
    segment: value.segment || '',
    cpfCnpj: value.cpfCnpj || '',
    email: value.email || '',
    phone: value.phone || '',
    phoneAlt: value.phoneAlt || '',
    whatsapp: value.whatsapp || '',
    site: value.site || '',
    cep: value.cep || '',
    street: value.street || '',
    number: value.number || '',
    complement: value.complement || '',
    neighborhood: value.neighborhood || '',
    city: value.city || '',
    state: value.state || '',
    status: value.status || 'proposta',
    observations: value.observations || '',
    favorite: value.favorite || false,
    createdAt: value.createdAt || new Date().toISOString(),
    lastContact: value.lastContact || value.createdAt || new Date().toISOString(),
    projects: value.projects ? (Array.isArray(value.projects) ? value.projects : Object.values(value.projects)) : [],
    interactions: value.interactions ? (Array.isArray(value.interactions) ? value.interactions : Object.values(value.interactions)) : [],
    notes: value.notes ? (Array.isArray(value.notes) ? value.notes : Object.values(value.notes)) : [],
    documents: value.documents ? (Array.isArray(value.documents) ? value.documents : Object.values(value.documents)) : [],
  };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientsRef = ref(database, CLIENTS_PATH);
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Client[] = Object.entries(data).map(([key, value]: [string, any]) => parseClient(key, value));
        setClients(parsed);
      } else {
        setClients([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addClient = async (client: Omit<Client, 'id'>) => {
    const clientsRef = ref(database, CLIENTS_PATH);
    const newRef = push(clientsRef);
    await set(newRef, client);
    return newRef.key!;
  };

  const updateClient = async (client: Client) => {
    const clientRef = ref(database, `${CLIENTS_PATH}/${client.id}`);
    const { id, ...data } = client;
    await set(clientRef, data);
  };

  const deleteClient = async (id: string) => {
    const clientRef = ref(database, `${CLIENTS_PATH}/${id}`);
    await remove(clientRef);
  };

  return { clients, loading, addClient, updateClient, deleteClient };
}
