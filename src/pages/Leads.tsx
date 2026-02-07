import { useState, useMemo } from "react";
import { Lead, LeadStatus, LeadService, LeadOrigin, MOCK_LEADS, STATUS_LABELS } from "@/lib/leads-data";
import MetricsCards from "@/components/leads/MetricsCards";
import KanbanBoard from "@/components/leads/KanbanBoard";
import LeadsList from "@/components/leads/LeadsList";
import LeadModal from "@/components/leads/LeadModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
      const matchService = filterService === 'all' || l.services.includes(filterService as LeadService);
      const matchOrigin = filterOrigin === 'all' || l.origin === filterOrigin;
      return matchSearch && matchService && matchOrigin;
    });
  }, [leads, search, filterService, filterOrigin]);

  const handleStatusChange = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast({ title: `Lead movido para ${STATUS_LABELS[status]}` });
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleSaveLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    toast({ title: "Lead removido" });
  };

  const handleNewLead = () => {
    const newLead: Lead = {
      id: Date.now().toString(),
      name: 'Novo Lead',
      company: '',
      email: '',
      phone: '',
      whatsapp: '',
      services: [],
      estimatedValue: 0,
      origin: 'site',
      status: 'novo',
      entryDate: new Date().toISOString().split('T')[0],
      nextFollowUp: '',
      interactions: [],
      proposal: null,
      notes: '',
      files: [],
    };
    setLeads(prev => [newLead, ...prev]);
    setSelectedLead(newLead);
    setModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 className="text-xl font-bold text-foreground flex-1">Leads & Propostas</h1>
        <Button onClick={handleNewLead} size="sm" className="shrink-0">
          <Plus className="w-4 h-4 mr-1" />Novo Lead
        </Button>
      </div>

      {/* Metrics */}
      <MetricsCards leads={leads} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterService} onValueChange={setFilterService}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Serviço" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Serviços</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Consultoria">Consultoria</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterOrigin} onValueChange={setFilterOrigin}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Origens</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="site">Site</SelectItem>
            <SelectItem value="indicacao">Indicação</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setView('kanban')}
            className={cn("p-2 transition-colors", view === 'kanban' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn("p-2 transition-colors", view === 'list' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? (
        <KanbanBoard leads={filtered} onStatusChange={handleStatusChange} onOpenLead={handleOpenLead} onDeleteLead={handleDeleteLead} />
      ) : (
        <LeadsList leads={filtered} onOpenLead={handleOpenLead} onDeleteLead={handleDeleteLead} />
      )}

      {/* Modal */}
      <LeadModal lead={selectedLead} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveLead} />
    </div>
  );
}
