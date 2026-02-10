import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, ClientStatus, CLIENT_STATUS_LABELS, ClientServiceType, SERVICE_TYPE_LABELS, SERVICE_TYPE_ICONS, SERVICE_TYPE_COLORS } from "@/lib/clients-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => Promise<string>;
}

const ALL_SERVICES: ClientServiceType[] = ['trafego_pago', 'social_media', 'google_meu_negocio', 'sites', 'automacoes'];

export default function NewClientModal({ open, onClose, onSave }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    status: 'proposta' as ClientStatus, segment: '', observations: '',
    isPrivate: false,
    services: [] as ClientServiceType[],
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleService = (service: ClientServiceType) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        service: 'marketing' as any,
        private: form.isPrivate,
        createdBy: user?.uid || '',
        cpfCnpj: '', phoneAlt: '', whatsapp: form.phone, site: '',
        cep: '', street: '', number: '', complement: '',
        neighborhood: '', city: '', state: '',
        favorite: false,
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        projects: [], interactions: [], notes: [], documents: [],
        serviceData: {},
      });
      toast({ title: "Cliente cadastrado!" });
      setForm({ name: '', company: '', email: '', phone: '', status: 'proposta', segment: '', observations: '', isPrivate: false, services: [] });
      onClose();
    } catch {
      toast({ title: "Erro ao cadastrar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label>Empresa</Label>
            <Input value={form.company} onChange={e => update('company', e.target.value)} placeholder="Empresa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@..." type="email" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(00) 00000-0000" />
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
            <div>
              <Label>Segmento</Label>
              <Input value={form.segment} onChange={e => update('segment', e.target.value)} placeholder="Área de atuação" />
            </div>
          </div>

          {/* Services multi-select */}
          <div>
            <Label className="mb-2 block">Serviços Contratados</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SERVICES.map(service => {
                const isActive = form.services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-left transition-all text-xs font-medium",
                      isActive
                        ? SERVICE_TYPE_COLORS[service] + " border-current"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    <span className="text-base">{SERVICE_TYPE_ICONS[service]}</span>
                    <span>{SERVICE_TYPE_LABELS[service]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={e => update('observations', e.target.value)} placeholder="Anotações gerais..." rows={3} />
          </div>
          <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Cliente Privado</p>
              <p className="text-xs text-muted-foreground">Apenas você poderá ver este cliente</p>
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
