import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, FolderOpen, DollarSign, Clock, BarChart3 } from "lucide-react";
import { Client, Project, CLIENT_STATUS_LABELS, CLIENT_STATUS_COLORS, CLIENT_STATUS_ICONS, getAvatarColor, getInitials, formatCurrency, getMonthsSince, newId } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import ClientProjectsTab from "./tabs/ClientProjectsTab";
import ClientInfoTab from "./tabs/ClientInfoTab";
import ClientHistoryTab from "./tabs/ClientHistoryTab";
import ClientNotesTab from "./tabs/ClientNotesTab";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  client: Client;
  onBack: () => void;
  onUpdate: (client: Client) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ClientDetail({ client, onBack, onUpdate, onDelete }: Props) {
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const avatarColor = getAvatarColor(client.name);

  const activeProjects = client.projects.filter(p => p.status === 'ativo').length;
  const totalValue = client.projects.reduce((sum, p) => sum + (p.value || 0), 0);
  const months = getMonthsSince(client.createdAt);

  const handleDelete = async () => {
    await onDelete(client.id);
    toast({ title: "Cliente excluído" });
    onBack();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0", avatarColor)}>
            {getInitials(client.name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", CLIENT_STATUS_COLORS[client.status])}>
              {CLIENT_STATUS_ICONS[client.status]} {CLIENT_STATUS_LABELS[client.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-4 h-4 mr-1" /> Excluir
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: FolderOpen, label: 'Total de Projetos', value: client.projects.length, color: 'text-primary' },
          { icon: BarChart3, label: 'Projetos Ativos', value: activeProjects, color: 'text-emerald-400' },
          { icon: DollarSign, label: 'Valor Total', value: formatCurrency(totalValue), color: 'text-amber-400' },
          { icon: Clock, label: `Cliente há ${months} meses`, value: new Date(client.createdAt).toLocaleDateString('pt-BR'), color: 'text-violet-400' },
        ].map((m, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
            <m.icon className={cn("w-5 h-5 mx-auto mb-2", m.color)} />
            <p className="text-foreground font-bold text-lg">{m.value}</p>
            <p className="text-muted-foreground text-xs">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projetos" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="projetos">Projetos</TabsTrigger>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>
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
              Isso removerá permanentemente {client.name} e todos os dados associados.
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
