import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Person, Relationship, FamilyGraph, Gender, RelationshipType } from '../types';

interface FamilyStore extends FamilyGraph {
  // Person actions
  addPerson: (name: string, gender: Gender, extras?: Partial<Person>) => string;
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id'>>) => void;
  deletePerson: (id: string) => void;

  // Relationship actions
  addRelationship: (type: RelationshipType, sourceId: string, targetId: string) => string;
  deleteRelationship: (id: string) => void;

  // Me
  setMePerson: (id: string | null) => void;

  // Layout
  layoutVersion: number;
  triggerRelayout: () => void;

  // Bulk
  importData: (data: FamilyGraph) => void;
  clearAll: () => void;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set) => ({
      persons: {},
      relationships: [],
      mePersonId: null,
      layoutVersion: 0,

      addPerson: (name, gender, extras) => {
        const id = nanoid(10);
        const person: Person = { id, name, gender, ...extras };
        set((state) => ({
          persons: { ...state.persons, [id]: person },
        }));
        return id;
      },

      updatePerson: (id, updates) => {
        set((state) => {
          const person = state.persons[id];
          if (!person) return state;
          return {
            persons: { ...state.persons, [id]: { ...person, ...updates } },
          };
        });
      },

      deletePerson: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.persons;
          return {
            persons: rest,
            relationships: state.relationships.filter(
              (r) => r.sourceId !== id && r.targetId !== id
            ),
            mePersonId: state.mePersonId === id ? null : state.mePersonId,
          };
        });
      },

      addRelationship: (type, sourceId, targetId) => {
        const id = nanoid(10);
        const rel: Relationship = { id, type, sourceId, targetId };
        set((state) => ({
          relationships: [...state.relationships, rel],
        }));
        return id;
      },

      deleteRelationship: (id) => {
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        }));
      },

      setMePerson: (id) => {
        set({ mePersonId: id });
      },

      triggerRelayout: () => {
        set((state) => ({ layoutVersion: state.layoutVersion + 1 }));
      },

      importData: (data) => {
        set({
          persons: data.persons,
          relationships: data.relationships,
          mePersonId: data.mePersonId,
        });
      },

      clearAll: () => {
        set({ persons: {}, relationships: [], mePersonId: null });
      },
    }),
    {
      name: 'family-tree-storage',
    }
  )
);
