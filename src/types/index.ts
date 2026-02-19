export type Gender = 'male' | 'female';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  birthPlace?: string;
  isAlive?: boolean;
  notes?: string;
}

export type RelationshipType = 'parent-child' | 'spouse';

export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceId: string; // parent or spouse1
  targetId: string; // child or spouse2
}

export interface FamilyGraph {
  persons: Record<string, Person>;
  relationships: Relationship[];
  mePersonId: string | null;
}

// Kinship path steps
export type KinshipStep =
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'husband'
  | 'wife'
  | 'elder_brother'
  | 'younger_brother'
  | 'elder_sister'
  | 'younger_sister';

export interface KinshipResult {
  path: KinshipStep[];
  term: string;
}
