import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Client } from "@/lib/clients-data";

const CLIENTS_PATH = "clients";

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function parseProject(value: any): any {
  return {
    ...value,
    tasks: toArray(value.tasks),
    links: toArray(value.links),
    notes: toArray(value.notes),
    payments: toArray(value.payments),
    costs: toArray(value.costs),
    value: Number(value.value) || 0,
    cost: Number(value.cost) || 0,
    paidAmount: Number(value.paidAmount) || 0,
  };
}

function parseClient(firebaseKey: string, value: any): Client {
  const projects = toArray(value.projects).map(parseProject);
  return {
    id: firebaseKey,
    service: value.service || 'sistemas',
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
    private: value.private || false,
    createdBy: value.createdBy || '',
    observations: value.observations || '',
    favorite: value.favorite || false,
    createdAt: value.createdAt || new Date().toISOString(),
    lastContact: value.lastContact || value.createdAt || new Date().toISOString(),
    projects,
    interactions: toArray(value.interactions),
    notes: toArray(value.notes),
    documents: toArray(value.documents),
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
