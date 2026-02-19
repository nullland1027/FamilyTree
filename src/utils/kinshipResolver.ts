import type { Person, Relationship, KinshipStep, KinshipResult } from '../types';
import { findKinshipPathWithSiblings } from './graphTraversal';
import { kinshipTermMap, genericTerms } from '../data/kinshipTerms';

/**
 * Resolve the Chinese kinship term between "me" and another person.
 */
export function resolveKinship(
  persons: Record<string, Person>,
  relationships: Relationship[],
  meId: string,
  targetId: string
): KinshipResult | null {
  if (meId === targetId) {
    return { path: [], term: '我' };
  }

  const path = findKinshipPathWithSiblings(persons, relationships, meId, targetId);
  if (!path) return null;

  // 1. Try raw path
  const key = path.join(',');
  const term = kinshipTermMap[key];
  if (term) {
    return { path, term };
  }

  // 2. Try normalized path (collapse spouse detours)
  const normalized = normalizeSpousePath(path);
  const normKey = normalized.join(',');
  if (normKey !== key) {
    const normTerm = kinshipTermMap[normKey];
    if (normTerm) {
      return { path: normalized, term: normTerm };
    }
  }

  // 3. Fallback
  const fallbackTerm = buildFallbackTerm(normalized);
  return { path: normalized, term: fallbackTerm };
}

/**
 * Normalize spouse detours in a kinship path.
 *
 * Core idea: when the path goes through a person and then to their spouse,
 * it's often equivalent to going directly. In Chinese kinship:
 *   母→母→夫  =  母→父  (外婆的丈夫 = 外公)
 *   父→父→妻  =  父→母  (爷爷的妻子 = 奶奶)
 *   母→夫     =  父      (妈妈的丈夫 = 爸爸)
 *   父→妻     =  母      (爸爸的妻子 = 妈妈)
 *
 * The rule: when we see a parent-type step followed by "husband"/"wife",
 * collapse them into the opposite-gender parent step.
 * Similarly for child-type steps followed by spouse.
 */
function normalizeSpousePath(path: KinshipStep[]): KinshipStep[] {
  const result: KinshipStep[] = [...path];
  let changed = true;

  // Iterate until no more simplifications can be made
  while (changed) {
    changed = false;
    for (let i = 0; i < result.length - 1; i++) {
      const current = result[i];
      const next = result[i + 1];

      const replacement = getSpouseCollapse(current, next);
      if (replacement !== null) {
        result.splice(i, 2, replacement);
        changed = true;
        break; // restart scan from beginning
      }
    }
  }

  return result;
}

/**
 * Given two consecutive steps, return a single collapsed step if the second
 * step is a spouse step that can be safely simplified, or null if no collapse.
 *
 * Only parent-type steps are safe to collapse:
 *   母→夫 = 父  (母亲的丈夫 = 父亲)
 *   父→妻 = 母  (父亲的妻子 = 母亲)
 *
 * Other spouse steps have their own distinct terms and must NOT be collapsed:
 *   女儿→夫 = 女婿 (NOT 儿子)
 *   姐姐→夫 = 姐夫 (NOT 哥哥)
 *   儿子→妻 = 儿媳 (NOT 女儿)
 *   哥哥→妻 = 嫂子 (NOT 姐姐)
 */
function getSpouseCollapse(
  step: KinshipStep,
  spouseStep: KinshipStep
): KinshipStep | null {
  if (spouseStep === 'husband' && step === 'mother') {
    return 'father'; // 母亲的丈夫 = 父亲
  }
  if (spouseStep === 'wife' && step === 'father') {
    return 'mother'; // 父亲的妻子 = 母亲
  }
  return null;
}

function buildFallbackTerm(path: KinshipStep[]): string {
  if (path.length === 0) return '我';

  // Try progressively shorter suffixes
  for (let start = 0; start < path.length; start++) {
    const subKey = path.slice(start).join(',');
    if (kinshipTermMap[subKey]) {
      const prefix = path.slice(0, start);
      const prefixTerms = prefix.map((s) => genericTerms[s] || s);
      return prefixTerms.join('的') + '的' + kinshipTermMap[subKey];
    }
  }

  // Last resort: chain generic terms
  return path.map((s) => genericTerms[s] || s).join('的');
}

/**
 * Compute kinship labels for all persons relative to "me".
 */
export function computeAllKinships(
  persons: Record<string, Person>,
  relationships: Relationship[],
  meId: string
): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const personId of Object.keys(persons)) {
    const result = resolveKinship(persons, relationships, meId, personId);
    if (result) {
      labels[personId] = result.term;
    }
  }
  return labels;
}
