// ═══════════════════════════════════════════════════════════
// useProjects - Independent project CRUD with Firebase
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Project } from "@/lib/projects-data";
import { toast } from "sonner";

const PROJECTS_PATH = "projects";

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function parseProject(firebaseKey: string, value: any): Project {
  return {
    id: firebaseKey,
    name: value.name || '',
    description: value.description || '',
    status: value.status || 'negociando',
    priority: value.priority || 'media',
    service: value.service || 'dev_web',
    recurrence: value.recurrence || 'unico',
    value: Number(value.value) || 0,
    cost: Number(value.cost) || 0,
    startDate: value.startDate || new Date().toISOString().split('T')[0],
    endDate: value.endDate || undefined,
    tags: toArray(value.tags),
    favorite: value.favorite || false,
    tasks: toArray(value.tasks).map((t: any) => ({
      ...t,
      completed: t.completed || false,
      column: t.column || 'todo',
      priority: t.priority || 'media',
    })),
    notes: toArray(value.notes),
    links: toArray(value.links),
    payments: toArray(value.payments).map((p: any) => ({ ...p, value: Number(p.value) || 0 })),
    costs: toArray(value.costs).map((c: any) => ({ ...c, value: Number(c.value) || 0 })),
    createdAt: value.createdAt || new Date().toISOString(),
  };
}

function sanitize(data: any): any {
  return JSON.parse(JSON.stringify(data));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(database, PROJECTS_PATH);
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const parsed = Object.entries(data).map(([key, value]: [string, any]) => parseProject(key, value));
          setProjects(parsed);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Erro ao carregar projetos:", err);
        toast.error("Erro ao carregar projetos");
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase listener error:", error);
      toast.error("Erro de conexão com o banco de dados");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const projectsRef = ref(database, PROJECTS_PATH);
      const newRef = push(projectsRef);
      await set(newRef, sanitize(project));
      toast.success("Projeto criado com sucesso!");
      return newRef.key!;
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
      toast.error("Erro ao criar projeto");
      throw err;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const projectRef = ref(database, `${PROJECTS_PATH}/${project.id}`);
      const { id, ...data } = project;
      await set(projectRef, sanitize(data));
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
      toast.error("Erro ao salvar projeto");
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const projectRef = ref(database, `${PROJECTS_PATH}/${id}`);
      await remove(projectRef);
      toast.success("Projeto excluído");
    } catch (err) {
      console.error("Erro ao excluir projeto:", err);
      toast.error("Erro ao excluir projeto");
      throw err;
    }
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}
