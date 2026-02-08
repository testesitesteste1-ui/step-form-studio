// ═══════════════════════════════════════════════════════════
// useProjects - Independent project CRUD with Firebase
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { Project, ProjectTask, ProjectNote, ProjectLink, ProjectPayment, ProjectCost } from "@/lib/projects-data";

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
    tasks: toArray(value.tasks),
    notes: toArray(value.notes),
    links: toArray(value.links),
    payments: toArray(value.payments),
    costs: toArray(value.costs),
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
      const data = snapshot.val();
      if (data) {
        const parsed = Object.entries(data).map(([key, value]: [string, any]) => parseProject(key, value));
        setProjects(parsed);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    const projectsRef = ref(database, PROJECTS_PATH);
    const newRef = push(projectsRef);
    await set(newRef, sanitize(project));
    return newRef.key!;
  };

  const updateProject = async (project: Project) => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${project.id}`);
    const { id, ...data } = project;
    await set(projectRef, sanitize(data));
  };

  const deleteProject = async (id: string) => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${id}`);
    await remove(projectRef);
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}
