import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, FolderOpen, DollarSign, Target, Megaphone, MapPin, Globe, Zap, MessageCircle, Mail, ExternalLink, Copy, Lock, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { Client, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, ClientServiceType, SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS, getAvatarColor, getInitials, formatCurrency, getDaysSince } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ClientProjectsTab from "./tabs/ClientProjectsTab";
import ClientInfoTab from "./tabs/ClientInfoTab";
import ClientHistoryTab from "./tabs/ClientHistoryTab";
import ClientNotesTab from "./tabs/ClientNotesTab";
import ClientServicesTab from "./tabs/ClientServicesTab";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  client: Client;
  initialTab?: string;
  onBack: () => void;
  onUpdate: (client: Client) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SERVICE_DETAIL_ICONS: Record<ClientServiceType, React.ReactNode> = {
  trafego_pago: <Target className="w-4 h-4" />,
  social_media: <Megaphone className="w-4 h-4" />,
  google_meu_negocio: <MapPin className="w-4 h-4" />,
  sites: <Globe className="w-4 h-4" />,
  automacoes: <Zap className="w-4 h-4" />,
};

export default function ClientDetail({ client, initialTab = 'servicos', onBack, onUpdate, onDelete }: Props) {
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const avatarColor = getAvatarColor(client.name);

  const financials = useMemo(() => {
    const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
    const totalPaid = client.projects.reduce((sum, p) => sum + ((p.payments || []).reduce((s, pay) => s + pay.value, 0)), 0);
    const totalCosts = client.projects.reduce((sum, p) => sum + ((p.costs || []).reduce((s, c) => s + c.value, 0)), 0);
    const activeProjects = client.projects.filter(p => p.status === 'ativo').length;
    const totalTasks = client.projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = client.projects.reduce((sum, p) => sum + p.tasks.filter(t => t.column === 'done').length, 0);
    return { totalValue, totalPaid, totalRemaining: totalValue - totalPaid, totalCosts, profit: totalPaid - totalCosts, activeProjects, totalTasks, completedTasks };
  }, [client]);

  const daysSinceContact = getDaysSince(client.lastContact);
  const services = client.services || [];

  const handleDelete = async () => {
    await onDelete(client.id);
    toast({ title: "Cliente excluído" });
    onBack();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} className="gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Excluir
        </Button>
      </div>

      {/* Client Header Card */}
      <div className={cn(
        "rounded-xl border overflow-hidden",
        client.private ? "border-destructive/30" : "border-border/60"
      )}>
        {/* Accent bar */}
        <div className={cn(
          "h-1",
          client.status === 'ativo' ? 'bg-emerald-500' :
          client.status === 'proposta' ? 'bg-blue-500' :
          client.status === 'pausado' ? 'bg-yellow-500' :
          client.status === 'finalizado' ? 'bg-primary' :
          'bg-red-500'
        )} />

        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shrink-0",
                avatarColor
              )}>
                {getInitials(client.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground truncate">{client.name}</h1>
                  {client.private && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                      <Lock className="w-3 h-3" /> Privado
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{client.company || client.segment || '—'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-medium", CLIENT_STATUS_COLORS[client.status])}>
                    {CLIENT_STATUS_LABELS[client.status]}
                  </span>
                  <span className={cn(
                    "text-[10px] flex items-center gap-1",
                    daysSinceContact > 30 ? "text-red-400" : daysSinceContact > 14 ? "text-yellow-400" : "text-muted-foreground"
                  )}>
                    <Calendar className="w-3 h-3" />
                    Último contato: {daysSinceContact === 0 ? 'hoje' : `${daysSinceContact}d`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick contact actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {client.whatsapp && (
                <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
                  <a href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                  </a>
                </Button>
              )}
              {client.email && (
                <Button variant="outline" size="sm" className="gap-1 text-xs" asChild>
                  <a href={`mailto:${client.email}`}>
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Email
                  </a>
                </Button>
              )}
              {client.phone && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(client.phone)}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Service badges */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {services.map(s => (
                <span key={s} className={cn("text-[10px] px-2.5 py-1 rounded-md border font-medium inline-flex items-center gap-1.5", SERVICE_TYPE_COLORS[s])}>
                  {SERVICE_DETAIL_ICONS[s]} {SERVICE_TYPE_LABELS[s]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Valor Total', value: formatCurrency(financials.totalValue), color: 'text-foreground', icon: DollarSign },
          { label: 'Recebido', value: formatCurrency(financials.totalPaid), color: 'text-emerald-400', icon: TrendingUp },
          { label: 'Pendente', value: formatCurrency(Math.max(0, financials.totalRemaining)), color: financials.totalRemaining > 0 ? 'text-orange-400' : 'text-emerald-400', icon: DollarSign },
          { label: 'Custos', value: formatCurrency(financials.totalCosts), color: 'text-red-400', icon: DollarSign },
          { label: 'Lucro', value: formatCurrency(financials.profit), color: financials.profit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: TrendingUp },
          { label: 'Tarefas', value: `${financials.completedTasks}/${financials.totalTasks}`, color: 'text-primary', icon: CheckCircle2 },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border/50 rounded-xl p-3"
          >
            <m.icon className={cn("w-4 h-4 mb-1.5", m.color)} />
            <p className={cn("font-bold text-sm", m.color)}>{m.value}</p>
            <p className="text-muted-foreground text-[10px]">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="servicos" className="gap-1 text-xs">
            <Target className="w-3 h-3" /> Serviços
          </TabsTrigger>
          <TabsTrigger value="projetos" className="gap-1 text-xs">
            <FolderOpen className="w-3 h-3" /> Projetos
          </TabsTrigger>
          <TabsTrigger value="informacoes" className="gap-1 text-xs">
            Informações
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1 text-xs">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="notas" className="gap-1 text-xs">
            Notas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="servicos">
          <ClientServicesTab client={client} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="projetos">
          <ClientProjectsTab client={client} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="informacoes">
          <ClientInfoTab client={client} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="historico">
          <ClientHistoryTab client={client} onUpdate={onUpdate} />
        </TabsContent>
        <TabsContent value="notas">
          <ClientNotesTab client={client} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>

      {/* Confirm Delete */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá permanentemente <strong>{client.name}</strong> e todos os dados associados (projetos, pagamentos, histórico).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
