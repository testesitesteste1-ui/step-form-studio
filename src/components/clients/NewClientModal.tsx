import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, ClientType, ClientStatus, CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS } from "@/lib/clients-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Lock, Building2, UserCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => Promise<string>;
}

export default function NewClientModal({ open, onClose, onSave }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'administradora' as ClientType,
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    contactName: '',
    status: 'proposta' as ClientStatus,
    observations: '',
    isPrivate: false,
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        type: form.type,
        name: form.name,
        cnpj: form.cnpj,
        address: form.address,
        phone: form.phone,
        email: form.email,
        contactName: form.contactName,
        status: form.status,
        observations: form.observations,
        private: form.isPrivate,
        createdBy: user?.uid || '',
        logoUrl: '',
        favorite: false,
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        condominios: [],
        projects: [],
        interactions: [],
        notes: [],
        documents: [],
      });
      toast({ title: "Cliente cadastrado com sucesso!" });
      setForm({
        type: 'administradora', name: '', cnpj: '', address: '', phone: '',
        email: '', contactName: '', status: 'proposta', observations: '', isPrivate: false,
      });
      onClose();
    } catch {
      toast({ title: "Erro ao cadastrar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Novo Cliente</DialogTitle>
          <p className="text-muted-foreground text-xs">Cadastre uma Administradora ou Síndico Profissional</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <Label className="mb-2 block">Tipo de Cliente</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { type: 'administradora' as ClientType, icon: <Building2 className="w-5 h-5" />, desc: 'Empresa administradora de condomínios' },
                { type: 'sindico' as ClientType, icon: <UserCheck className="w-5 h-5" />, desc: 'Síndico profissional autônomo' },
              ]).map(({ type, icon, desc }) => {
                const isActive = form.type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type }))}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all",
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-secondary/20 hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    )}>
                      {icon}
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {CLIENT_TYPE_LABELS[type]}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>{form.type === 'administradora' ? 'Nome da Administradora *' : 'Nome da Empresa *'}</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={e => update('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>{form.type === 'administradora' ? 'Responsável' : 'Nome do Síndico'}</Label>
              <Input value={form.contactName} onChange={e => update('contactName', e.target.value)} placeholder="Nome do contato" />
            </div>
          </div>

          <div>
            <Label>Endereço</Label>
            <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Endereço completo" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@..." type="email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={e => update('observations', e.target.value)} placeholder="Anotações gerais..." rows={2} />
          </div>

          {/* Private toggle */}
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Cliente Privado</p>
                <p className="text-[10px] text-muted-foreground">Apenas você poderá ver este cliente</p>
              </div>
            </div>
            <Switch checked={form.isPrivate} onCheckedChange={v => setForm(prev => ({ ...prev, isPrivate: v }))} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
