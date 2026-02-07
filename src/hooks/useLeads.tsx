import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Lead, LeadStatus } from "@/lib/leads-data";

const LEADS_PATH = "leads";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leadsRef = ref(database, LEADS_PATH);
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Lead[] = Object.entries(data).map(([firebaseKey, value]: [string, any]) => ({
          id: firebaseKey,
          name: value.name || '',
          company: value.company || '',
          email: value.email || '',
          phone: value.phone || '',
          whatsapp: value.whatsapp || '',
          services: value.services || [],
          estimatedValue: value.estimatedValue || 0,
          origin: value.origin || 'site',
          status: value.status || 'novo',
          entryDate: value.entryDate || new Date().toISOString().split('T')[0],
          nextFollowUp: value.nextFollowUp || '',
          interactions: value.interactions ? Object.values(value.interactions) : [],
          proposal: value.proposal || null,
          notes: value.notes || '',
          files: value.files || [],
        }));
        setLeads(parsed);
      } else {
        setLeads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    const leadsRef = ref(database, LEADS_PATH);
    const newRef = push(leadsRef);
    await set(newRef, lead);
    return newRef.key!;
  };

  const updateLead = async (lead: Lead) => {
    const leadRef = ref(database, `${LEADS_PATH}/${lead.id}`);
    const { id, ...data } = lead;
    await set(leadRef, data);
  };

  const deleteLead = async (id: string) => {
    const leadRef = ref(database, `${LEADS_PATH}/${id}`);
    await remove(leadRef);
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      await updateLead({ ...lead, status });
    }
  };

  return { leads, loading, addLead, updateLead, deleteLead, updateStatus };
}
