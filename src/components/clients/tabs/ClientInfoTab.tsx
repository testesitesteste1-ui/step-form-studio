import { useState } from "react";
import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Client, ClientStatus, CLIENT_STATUS_LABELS } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

export default function ClientInfoTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState({ ...client });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof Client, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(form);
      toast({ title: "Informações salvas!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Dados Básicos */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Dados Básicos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Nome completo</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div><Label>Empresa</Label><Input value={form.company} onChange={e => update('company', e.target.value)} /></div>
          <div><Label>Segmento</Label><Input value={form.segment} onChange={e => update('segment', e.target.value)} /></div>
          <div><Label>CPF/CNPJ</Label><Input value={form.cpfCnpj} onChange={e => update('cpfCnpj', e.target.value)} /></div>
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
      </section>

      {/* Contatos */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Contatos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Email</Label>
            <div className="flex gap-1">
              <Input value={form.email} onChange={e => update('email', e.target.value)} className="flex-1" />
              {form.email && <Button variant="ghost" size="icon" onClick={() => copyToClipboard(form.email)}><Copy className="w-4 h-4" /></Button>}
            </div>
          </div>
          <div>
            <Label>Telefone</Label>
            <div className="flex gap-1">
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="flex-1" />
              {form.phone && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`https://wa.me/${form.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div><Label>Telefone Alternativo</Label><Input value={form.phoneAlt} onChange={e => update('phoneAlt', e.target.value)} /></div>
          <div>
            <Label>Site</Label>
            <div className="flex gap-1">
              <Input value={form.site} onChange={e => update('site', e.target.value)} className="flex-1" />
              {form.site && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={form.site.startsWith('http') ? form.site : `https://${form.site}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Endereço</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>CEP</Label><Input value={form.cep} onChange={e => update('cep', e.target.value)} /></div>
          <div className="sm:col-span-2 grid grid-cols-3 gap-3">
            <div className="col-span-2"><Label>Rua</Label><Input value={form.street} onChange={e => update('street', e.target.value)} /></div>
            <div><Label>Número</Label><Input value={form.number} onChange={e => update('number', e.target.value)} /></div>
          </div>
          <div><Label>Complemento</Label><Input value={form.complement} onChange={e => update('complement', e.target.value)} /></div>
          <div><Label>Bairro</Label><Input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} /></div>
          <div><Label>Cidade</Label><Input value={form.city} onChange={e => update('city', e.target.value)} /></div>
          <div><Label>Estado</Label><Input value={form.state} onChange={e => update('state', e.target.value)} /></div>
        </div>
      </section>

      {/* Observações */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Observações</h3>
        <Textarea value={form.observations} onChange={e => update('observations', e.target.value)} rows={4} placeholder="Anotações gerais..." />
      </section>

      <div className="sticky bottom-0 bg-background pt-3 pb-1">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
