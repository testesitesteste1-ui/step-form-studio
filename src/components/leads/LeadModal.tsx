import { useState } from "react";
import { Lead, LeadStatus, LeadOrigin, STATUS_LABELS, ORIGIN_LABELS, SERVICE_COLORS, formatCurrency } from "@/lib/leads-data";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Phone, Clock, FileText, StickyNote, History, Info, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export default function LeadModal({ lead, open, onClose, onSave }: Props) {
  const [editedLead, setEditedLead] = useState<Lead | null>(lead);
  const [newInteraction, setNewInteraction] = useState({ type: 'nota' as const, description: '' });

  // Sync when lead changes
  if (lead && editedLead?.id !== lead.id) {
    setEditedLead(lead);
  }

  if (!editedLead) return null;

  const update = (partial: Partial<Lead>) => setEditedLead({ ...editedLead, ...partial });

  const handleSave = () => {
    onSave(editedLead);
    toast({ title: "Lead salvo com sucesso!" });
  };

  const addInteraction = () => {
    if (!newInteraction.description) return;
    const interaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newInteraction.type,
      description: newInteraction.description,
    };
    update({ interactions: [...editedLead.interactions, interaction] });
    setNewInteraction({ type: 'nota', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {editedLead.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg">{editedLead.name}</p>
              <p className="text-sm text-muted-foreground font-normal">{editedLead.company}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-2">
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="info" className="text-xs gap-1"><Info className="w-3 h-3" />Info</TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1"><History className="w-3 h-3" />Histórico</TabsTrigger>
            <TabsTrigger value="proposal" className="text-xs gap-1"><FileText className="w-3 h-3" />Proposta</TabsTrigger>
            <TabsTrigger value="files" className="text-xs gap-1"><FileText className="w-3 h-3" />Arquivos</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs gap-1"><StickyNote className="w-3 h-3" />Notas</TabsTrigger>
          </TabsList>

          {/* INFO TAB */}
          <TabsContent value="info" className="space-y-3 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={editedLead.name} onChange={e => update({ name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Empresa</label>
                <Input value={editedLead.company} onChange={e => update({ company: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={editedLead.email} onChange={e => update({ email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Telefone</label>
                <Input value={editedLead.phone} onChange={e => update({ phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">WhatsApp</label>
                <Input value={editedLead.whatsapp} onChange={e => update({ whatsapp: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Valor Estimado (R$)</label>
                <Input type="number" value={editedLead.estimatedValue} onChange={e => update({ estimatedValue: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={editedLead.status} onValueChange={v => update({ status: v as LeadStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Origem</label>
                <Select value={editedLead.origin} onValueChange={v => update({ origin: v as LeadOrigin })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ORIGIN_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Próximo Follow-up</label>
                <Input type="date" value={editedLead.nextFollowUp} onChange={e => update({ nextFollowUp: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {editedLead.services.map(s => (
                <Badge key={s} variant="secondary" className={cn("text-xs", SERVICE_COLORS[s])}>{s}</Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSave} size="sm"><Save className="w-3.5 h-3.5 mr-1" />Salvar</Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/${editedLead.whatsapp}`, '_blank')}>
                <MessageCircle className="w-3.5 h-3.5 mr-1" />WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${editedLead.email}`, '_blank')}>
                <Mail className="w-3.5 h-3.5 mr-1" />Email
              </Button>
            </div>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="mt-3">
            <div className="space-y-3 mb-4">
              {editedLead.interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma interação registrada.</p>
              ) : (
                <div className="relative border-l-2 border-border ml-3 space-y-4 pl-4">
                  {[...editedLead.interactions].reverse().map(i => (
                    <div key={i.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                      <p className="text-xs text-muted-foreground">{new Date(i.date).toLocaleDateString('pt-BR')} • {i.type}</p>
                      <p className="text-sm text-foreground">{i.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">+ Adicionar interação</p>
              <div className="flex gap-2">
                <Select value={newInteraction.type} onValueChange={v => setNewInteraction(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="nota">Nota</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newInteraction.description}
                  onChange={e => setNewInteraction(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descrição..."
                  className="flex-1"
                />
                <Button size="sm" onClick={addInteraction}>Add</Button>
              </div>
            </div>
          </TabsContent>

          {/* PROPOSAL TAB */}
          <TabsContent value="proposal" className="mt-3 space-y-3">
            {editedLead.proposal ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Título</label>
                    <Input value={editedLead.proposal.title} onChange={e => update({ proposal: { ...editedLead.proposal!, title: e.target.value } })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Valor</label>
                    <Input type="number" value={editedLead.proposal.value} onChange={e => update({ proposal: { ...editedLead.proposal!, value: Number(e.target.value) } })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Prazo</label>
                    <Input value={editedLead.proposal.deadline} onChange={e => update({ proposal: { ...editedLead.proposal!, deadline: e.target.value } })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <Select value={editedLead.proposal.status} onValueChange={v => update({ proposal: { ...editedLead.proposal!, status: v as any } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="enviada">Enviada</SelectItem>
                        <SelectItem value="aprovada">Aprovada</SelectItem>
                        <SelectItem value="rejeitada">Rejeitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Descrição/Escopo</label>
                  <Textarea value={editedLead.proposal.description} onChange={e => update({ proposal: { ...editedLead.proposal!, description: e.target.value } })} />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-3">Nenhuma proposta criada.</p>
                <Button size="sm" onClick={() => update({ proposal: { title: '', description: '', value: editedLead.estimatedValue, deadline: '', status: 'rascunho' } })}>
                  Criar Proposta
                </Button>
              </div>
            )}
          </TabsContent>

          {/* FILES TAB */}
          <TabsContent value="files" className="mt-3">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Arraste arquivos aqui ou clique para upload</p>
              <p className="text-xs text-muted-foreground mt-1">Em breve — funcionalidade de upload</p>
            </div>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="mt-3">
            <Textarea
              value={editedLead.notes}
              onChange={e => update({ notes: e.target.value })}
              placeholder="Notas internas da equipe..."
              className="min-h-[200px]"
            />
            <Button size="sm" className="mt-2" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1" />Salvar Notas</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
