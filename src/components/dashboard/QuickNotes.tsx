import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StickyNote, Plus, Check, Trash2, Pencil } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickNote {
  id: string;
  text: string;
  done: boolean;
  createdBy: string;
  createdAt: string;
}

const NOTES_PATH = "quickNotes";

export default function QuickNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const notesRef = ref(database, NOTES_PATH);
    const unsub = onValue(notesRef, (snap) => {
      const data = snap.val();
      if (data) {
        const parsed: QuickNote[] = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          text: val.text || "",
          done: val.done || false,
          createdBy: val.createdBy || "",
          createdAt: val.createdAt || "",
        }));
        setNotes(parsed.sort((a, b) => {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }));
      } else {
        setNotes([]);
      }
    });
    return () => unsub();
  }, []);

  const addNote = async () => {
    if (!newText.trim() || !user) return;
    const notesRef = ref(database, NOTES_PATH);
    const newRef = push(notesRef);
    await set(newRef, {
      text: newText.trim(),
      done: false,
      createdBy: user.email || user.uid,
      createdAt: new Date().toISOString(),
    });
    setNewText("");
  };

  const toggleDone = async (note: QuickNote) => {
    await set(ref(database, `${NOTES_PATH}/${note.id}`), { ...note, id: undefined, done: !note.done });
  };

  const deleteNote = async (id: string) => {
    await remove(ref(database, `${NOTES_PATH}/${id}`));
  };

  const saveEdit = async (note: QuickNote) => {
    if (!editText.trim()) return;
    await set(ref(database, `${NOTES_PATH}/${note.id}`), { ...note, id: undefined, text: editText.trim() });
    setEditingId(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          Anotações Rápidas
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {notes.filter(n => !n.done).length} pendentes
        </span>
      </div>

      {/* Add */}
      <div className="flex gap-2 mb-3">
        <Input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Nova anotação..."
          className="text-xs h-8"
          onKeyDown={e => { if (e.key === "Enter") addNote(); }}
        />
        <Button size="sm" className="h-8 px-2.5" onClick={addNote} disabled={!newText.trim()}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        <AnimatePresence>
          {notes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                "flex items-start gap-2 p-2 rounded-lg group transition-colors",
                note.done ? "bg-secondary/30" : "bg-secondary/60"
              )}
            >
              <button
                onClick={() => toggleDone(note)}
                className={cn(
                  "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  note.done
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40 hover:border-primary"
                )}
              >
                {note.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </button>

              <div className="flex-1 min-w-0">
                {editingId === note.id ? (
                  <Input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveEdit(note)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(note); if (e.key === "Escape") setEditingId(null); }}
                    className="text-xs h-6 p-1"
                    autoFocus
                  />
                ) : (
                  <p className={cn("text-xs leading-relaxed", note.done ? "line-through text-muted-foreground" : "text-foreground")}>
                    {note.text}
                  </p>
                )}
                <p className="text-[9px] text-muted-foreground mt-0.5">{note.createdBy}</p>
              </div>

              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                  className="p-0.5 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => deleteNote(note.id)} className="p-0.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhuma anotação ainda</p>
        )}
      </div>
    </div>
  );
}
