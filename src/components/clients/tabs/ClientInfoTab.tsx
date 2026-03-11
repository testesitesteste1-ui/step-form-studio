import { useState } from "react";
import { Copy, MessageCircle } from "lucide-react";
import { Client, ClientStatus, CLIENT_STATUS_LABELS, CLIENT_TYPE_LABELS, ClientType } from "@/lib/clients-data";
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
          <div>
            <Label>Tipo de Cliente</Label>
            <Select value={form.type} onValueChange={v => update('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CLIENT_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{form.type === 'administradora' ? 'Nome da Administradora' : 'Nome da Empresa'}</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input value={form.cnpj} onChange={e => update('cnpj', e.target.value)} />
          </div>
          <div>
            <Label>{form.type === 'administradora' ? 'Responsável' : 'Nome do Síndico'}</Label>
            <Input value={form.contactName} onChange={e => update('contactName', e.target.value)} />
          </div>
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
            <Label>E-mail</Label>
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
        </div>
      </section>

      {/* Endereço */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">Endereço</h3>
        <div>
          <Label>Endereço Completo</Label>
          <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Rua, número, bairro, cidade - UF" />
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
