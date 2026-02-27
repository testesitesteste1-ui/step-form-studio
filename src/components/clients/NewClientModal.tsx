import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, ClientStatus, CLIENT_STATUS_LABELS, ClientServiceType, SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS } from "@/lib/clients-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Lock, Target, Megaphone, MapPin, Globe, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => Promise<string>;
}

const ALL_SERVICES: { type: ClientServiceType; icon: React.ReactNode; desc: string }[] = [
  { type: 'trafego_pago', icon: <Target className="w-4 h-4" />, desc: 'Facebook, Google, TikTok Ads' },
  { type: 'social_media', icon: <Megaphone className="w-4 h-4" />, desc: 'Posts, stories, reels' },
  { type: 'google_meu_negocio', icon: <MapPin className="w-4 h-4" />, desc: 'Perfil, avaliações, posts' },
  { type: 'sites', icon: <Globe className="w-4 h-4" />, desc: 'Landing pages, e-commerce' },
  { type: 'automacoes', icon: <Zap className="w-4 h-4" />, desc: 'N8N, Make, Zapier' },
];

export default function NewClientModal({ open, onClose, onSave }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
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
      setStep(1);
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
      toast({ title: "Cliente cadastrado com sucesso!" });
      setForm({ name: '', company: '', email: '', phone: '', status: 'proposta', segment: '', observations: '', isPrivate: false, services: [] });
      setStep(1);
      onClose();
    } catch {
      toast({ title: "Erro ao cadastrar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setStep(1); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {step === 1 ? 'Novo Cliente' : 'Selecionar Serviços'}
          </DialogTitle>
          <p className="text-muted-foreground text-xs">
            {step === 1 ? 'Informações básicas do cliente' : 'Quais serviços esse cliente contrata?'}
          </p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("h-1 flex-1 rounded-full transition-colors", step >= 1 ? 'bg-primary' : 'bg-secondary')} />
          <div className={cn("h-1 flex-1 rounded-full transition-colors", step >= 2 ? 'bg-primary' : 'bg-secondary')} />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input value={form.company} onChange={e => update('company', e.target.value)} placeholder="Nome da empresa" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@..." type="email" />
              </div>
              <div>
                <Label>WhatsApp</Label>
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

            <Button onClick={() => {
              if (!form.name.trim()) {
                toast({ title: "Nome é obrigatório", variant: "destructive" });
                return;
              }
              setStep(2);
            }} className="w-full">
              Próximo: Serviços →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {ALL_SERVICES.map(({ type, icon, desc }) => {
                const isActive = form.services.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleService(type)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-secondary/20 hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    )}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                        {SERVICE_TYPE_LABELS[type]}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      isActive ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Voltar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Cadastrando...' : 'Cadastrar Cliente'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
