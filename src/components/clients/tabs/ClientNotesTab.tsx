import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Client, ClientNote, newId } from "@/lib/clients-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Props {
  client: Client;
  onUpdate: (client: Client) => Promise<void>;
}

export default function ClientNotesTab({ client, onUpdate }: Props) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [content, setContent] = useState('');

  const sorted = [...client.notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openNew = () => { setEditingNote(null); setContent(''); setModalOpen(true); };
  const openEdit = (note: ClientNote) => { setEditingNote(note); setContent(note.content); setModalOpen(true); };

  const handleSave = async () => {
    if (!content.trim()) { toast({ title: "Conteúdo obrigatório", variant: "destructive" }); return; }
    if (editingNote) {
      const notes = client.notes.map(n => n.id === editingNote.id ? { ...n, content } : n);
      await onUpdate({ ...client, notes });
    } else {
      const note: ClientNote = { id: newId(), content, createdAt: new Date().toISOString() };
      await onUpdate({ ...client, notes: [...client.notes, note] });
    }
    toast({ title: editingNote ? "Nota atualizada!" : "Nota criada!" });
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onUpdate({ ...client, notes: client.notes.filter(n => n.id !== id) });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">{sorted.length} notas</h3>
        <Button size="sm" onClick={openNew} className="gap-1"><Plus className="w-4 h-4" /> Nova Nota</Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhuma nota registrada</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(note => (
            <div key={note.id} className="bg-secondary/50 rounded-lg p-4 group">
              <p className="text-foreground text-sm whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-muted-foreground text-[10px]">
                  {new Date(note.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(note)}><Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
                  <button onClick={() => handleDelete(note.id)}><Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingNote ? 'Editar Nota' : 'Nova Nota'}</DialogTitle></DialogHeader>
          <Textarea value={content} onChange={e => setContent(e.target.value)} rows={6} placeholder="Escreva sua nota..." />
          <Button onClick={handleSave} className="w-full">Salvar Nota</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
