// ═══════════════════════════════════════════════════════════
// Firebase hook for financial transactions
// Manages manual transactions (receitas paralelas, despesas)
// Project-based revenue is computed from useClients data
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Transaction } from "@/lib/finance-data";

const TRANSACTIONS_PATH = "transactions";

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function parseTransaction(key: string, value: any): Transaction {
  return {
    id: key,
    type: value.type || 'receita',
    description: value.description || '',
    value: Number(value.value) || 0,
    date: value.date || new Date().toISOString(),
    dueDate: value.dueDate || undefined,
    status: value.status || 'pendente',
    category: value.category || 'projeto',
    subcategory: value.subcategory || undefined,
    clientId: value.clientId || undefined,
    projectId: value.projectId || undefined,
    paymentMethod: value.paymentMethod || undefined,
    recurring: value.recurring || false,
    observations: value.observations || '',
    createdAt: value.createdAt || new Date().toISOString(),
  };
}

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const txRef = ref(database, TRANSACTIONS_PATH);
    const unsubscribe = onValue(txRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: [string, any]) =>
          parseTransaction(key, value)
        );
        setTransactions(parsed);
      } else {
        setTransactions([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const txRef = ref(database, TRANSACTIONS_PATH);
    const newRef = push(txRef);
    await set(newRef, tx);
    return newRef.key!;
  };

  const updateTransaction = async (tx: Transaction) => {
    const txRef = ref(database, `${TRANSACTIONS_PATH}/${tx.id}`);
    const { id, ...data } = tx;
    await set(txRef, data);
  };

  const deleteTransaction = async (id: string) => {
    const txRef = ref(database, `${TRANSACTIONS_PATH}/${id}`);
    await remove(txRef);
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}
