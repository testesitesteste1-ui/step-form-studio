import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MapPin, Phone, Mail, Building, Edit2, Save, X, FileText } from "lucide-react";
import { Client, Condominio, newId } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

const emptyCondominio: Omit<Condominio, 'id'> = {
  name: '', cnpj: '', address: '', phone: '', contactName: '', email: '', observations: '',
};

export default function ClientCondominiosTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCond, setEditingCond] = useState<Condominio | null>(null);
  const [form, setForm] = useState<Omit<Condominio, 'id'>>(emptyCondominio);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const condominios = client.condominios || [];

  const openNew = () => {
    setEditingCond(null);
    setForm(emptyCondominio);
    setModalOpen(true);
  };

  const openEdit = (cond: Condominio) => {
    setEditingCond(cond);
    setForm({ name: cond.name, cnpj: cond.cnpj, address: cond.address, phone: cond.phone, contactName: cond.contactName, email: cond.email, observations: cond.observations || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let updated: Condominio[];
      if (editingCond) {
        updated = condominios.map(c => c.id === editingCond.id ? { ...c, ...form } : c);
      } else {
        updated = [...condominios, { id: newId(), ...form }];
      }
      await onUpdate({ ...client, condominios: updated });
      toast({ title: editingCond ? "Condomínio atualizado!" : "Condomínio adicionado!" });
      setModalOpen(false);
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const updated = condominios.filter(c => c.id !== deleteId);
      await onUpdate({ ...client, condominios: updated });
      toast({ title: "Condomínio removido" });
      setDeleteId(null);
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Condomínios</h3>
          <p className="text-muted-foreground text-xs">{condominios.length} condomínio{condominios.length !== 1 ? 's' : ''} cadastrado{condominios.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </div>

      {/* List */}
      {condominios.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
            <Building className="w-7 h-7 text-muted-foreground/30" />
          </div>
          <p className="text-foreground font-medium mb-1">Nenhum condomínio cadastrado</p>
          <p className="text-muted-foreground text-sm mb-4">Adicione os condomínios que esta administradora atende</p>
          <Button size="sm" onClick={openNew} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Adicionar Condomínio
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {condominios.map((cond, i) => (
              <motion.div
                key={cond.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{cond.name}</h4>
                      {cond.cnpj && <p className="text-[10px] text-muted-foreground">{cond.cnpj}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(cond)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                      <Edit2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => setDeleteId(cond.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {cond.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cond.address}</span>
                    </div>
                  )}
                  {cond.contactName && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 shrink-0" />
                      <span>{cond.contactName}</span>
                    </div>
                  )}
                  {cond.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{cond.phone}</span>
                    </div>
                  )}
                  {cond.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{cond.email}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCond ? 'Editar Condomínio' : 'Novo Condomínio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome do Condomínio *</Label>
              <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Residencial das Flores" />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={e => setForm(prev => ({ ...prev, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Endereço completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Telefone</Label>
                <Input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>Nome do Contato</Label>
                <Input value={form.contactName} onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))} placeholder="Nome" />
              </div>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="email@..." type="email" />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.observations} onChange={e => setForm(prev => ({ ...prev, observations: e.target.value }))} rows={2} placeholder="Notas sobre o condomínio..." />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Salvando...' : editingCond ? 'Salvar Alterações' : 'Adicionar Condomínio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover condomínio?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é permanente e não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
