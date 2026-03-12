import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Orcamento } from "@/lib/orcamentos-data";

const PATH = "orcamentos";

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function parse(key: string, v: any): Orcamento {
  return {
    id: key,
    clientId: v.clientId || '',
    clientName: v.clientName || '',
    condominioId: v.condominioId || '',
    condominioName: v.condominioName || '',
    date: v.date || '',
    assemblyDate: v.assemblyDate || '',
    assemblyTime: v.assemblyTime || '',
    items: toArray(v.items),
    totalValue: Number(v.totalValue) || 0,
    status: v.status || 'rascunho',
    observations: v.observations || '',
    createdAt: v.createdAt || new Date().toISOString(),
    createdBy: v.createdBy || '',
  };
}

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = ref(database, PATH);
    const unsub = onValue(r, (snap) => {
      const data = snap.val();
      if (data) {
        setOrcamentos(Object.entries(data).map(([k, v]: [string, any]) => parse(k, v)));
      } else {
        setOrcamentos([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addOrcamento = async (o: Omit<Orcamento, 'id'>) => {
    const r = ref(database, PATH);
    const newRef = push(r);
    await set(newRef, o);
    return newRef.key!;
  };

  const updateOrcamento = async (o: Orcamento) => {
    const r = ref(database, `${PATH}/${o.id}`);
    const { id, ...data } = o;
    await set(r, data);
  };

  const deleteOrcamento = async (id: string) => {
    await remove(ref(database, `${PATH}/${id}`));
  };

  return { orcamentos, loading, addOrcamento, updateOrcamento, deleteOrcamento };
}
