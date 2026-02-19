import type { Person, Relationship, KinshipStep } from '../types';

interface GraphNode {
  personId: string;
  path: KinshipStep[];
}

/**
 * BFS to find the kinship path from `fromId` to `toId`.
 * Returns the path as an array of KinshipStep, or null if unreachable.
 */
export function findKinshipPath(
  persons: Record<string, Person>,
  relationships: Relationship[],
  fromId: string,
  toId: string
): KinshipStep[] | null {
  if (fromId === toId) return [];

  const visited = new Set<string>();
  const queue: GraphNode[] = [{ personId: fromId, path: [] }];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current.personId, persons, relationships);

    for (const { personId, step } of neighbors) {
      if (visited.has(personId)) continue;
      const newPath = [...current.path, step];

      if (personId === toId) return newPath;

      visited.add(personId);
      queue.push({ personId, path: newPath });
    }
  }

  return null;
}

interface Neighbor {
  personId: string;
  step: KinshipStep;
}

function getNeighbors(
  personId: string,
  persons: Record<string, Person>,
  relationships: Relationship[]
): Neighbor[] {
  const neighbors: Neighbor[] = [];
  const me = persons[personId];
  if (!me) return neighbors;

  for (const rel of relationships) {
    if (rel.type === 'spouse') {
      if (rel.sourceId === personId) {
        const spouse = persons[rel.targetId];
        if (spouse) {
          neighbors.push({
            personId: rel.targetId,
            step: spouse.gender === 'male' ? 'husband' : 'wife',
          });
        }
      } else if (rel.targetId === personId) {
        const spouse = persons[rel.sourceId];
        if (spouse) {
          neighbors.push({
            personId: rel.sourceId,
            step: spouse.gender === 'male' ? 'husband' : 'wife',
          });
        }
      }
    } else if (rel.type === 'parent-child') {
      // source is parent, target is child
      if (rel.sourceId === personId) {
        // I am the parent, neighbor is my child
        const child = persons[rel.targetId];
        if (child) {
          neighbors.push({
            personId: rel.targetId,
            step: child.gender === 'male' ? 'son' : 'daughter',
          });
        }
      } else if (rel.targetId === personId) {
        // I am the child, neighbor is my parent
        const parent = persons[rel.sourceId];
        if (parent) {
          neighbors.push({
            personId: rel.sourceId,
            step: parent.gender === 'male' ? 'father' : 'mother',
          });
        }
      }
    }
  }

  return neighbors;
}

/**
 * Get siblings of a person (share at least one parent).
 * Returns siblings with elder/younger distinction based on birthYear.
 */
export function getSiblings(
  personId: string,
  persons: Record<string, Person>,
  relationships: Relationship[]
): { personId: string; step: KinshipStep }[] {
  const me = persons[personId];
  if (!me) return [];

  // Find my parents
  const parentIds = relationships
    .filter((r) => r.type === 'parent-child' && r.targetId === personId)
    .map((r) => r.sourceId);

  if (parentIds.length === 0) return [];

  // Find all children of my parents (excluding me)
  const siblingIds = new Set<string>();
  for (const parentId of parentIds) {
    relationships
      .filter((r) => r.type === 'parent-child' && r.sourceId === parentId && r.targetId !== personId)
      .forEach((r) => siblingIds.add(r.targetId));
  }

  return Array.from(siblingIds).map((sibId) => {
    const sib = persons[sibId];
    const isElder = determineElderYounger(me, sib);
    if (sib.gender === 'male') {
      return { personId: sibId, step: isElder ? 'elder_brother' : 'younger_brother' };
    } else {
      return { personId: sibId, step: isElder ? 'elder_sister' : 'younger_sister' };
    }
  });
}

function determineElderYounger(me: Person, sibling: Person): boolean {
  // Returns true if sibling is elder
  if (me.birthYear && sibling.birthYear) {
    return sibling.birthYear < me.birthYear;
  }
  // Default: treat as elder if unknown
  return true;
}

/**
 * Enhanced BFS that also handles sibling relationships.
 */
export function findKinshipPathWithSiblings(
  persons: Record<string, Person>,
  relationships: Relationship[],
  fromId: string,
  toId: string
): KinshipStep[] | null {
  if (fromId === toId) return [];

  const visited = new Set<string>();
  const queue: GraphNode[] = [{ personId: fromId, path: [] }];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Regular neighbors (parent/child/spouse)
    const neighbors = getNeighbors(current.personId, persons, relationships);
    // Sibling neighbors
    const siblings = getSiblings(current.personId, persons, relationships);

    const allNeighbors = [...neighbors, ...siblings];

    for (const { personId, step } of allNeighbors) {
      if (visited.has(personId)) continue;
      const newPath = [...current.path, step];

      if (personId === toId) return newPath;

      visited.add(personId);
      queue.push({ personId, path: newPath });
    }
  }

  return null;
}
