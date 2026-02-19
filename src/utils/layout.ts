import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { Relationship } from '../types';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 80;

/**
 * Layout strategy:
 * 1. For each spouse pair, pick one as the "primary" (the one with parent-child edges).
 *    Merge them into a single compound node for dagre.
 * 2. Run dagre on the simplified graph.
 * 3. Expand compound nodes back into side-by-side spouse pairs.
 *
 * This prevents spouses from being placed independently (and overlapping other pairs).
 */
export function layoutFamilyTree(
  nodes: Node[],
  _edges: Edge[],
  relationships: Relationship[]
): Node[] {
  if (nodes.length === 0) return nodes;

  const spousePairs = relationships
    .filter((r) => r.type === 'spouse')
    .map((r) => ({ a: r.sourceId, b: r.targetId }));

  // Build a map: personId → their spouse pair index
  const spousePairIndex = new Map<string, number>();
  spousePairs.forEach((pair, i) => {
    spousePairIndex.set(pair.a, i);
    spousePairIndex.set(pair.b, i);
  });

  // For each spouse pair, determine a "primary" person
  // (the one who has parent-child edges, so dagre connects them properly)
  // The "secondary" won't be added to dagre — they'll be placed beside the primary
  const parentChildRels = relationships.filter((r) => r.type === 'parent-child');

  const secondaryIds = new Set<string>();
  const primaryOf = new Map<string, string>(); // secondaryId → primaryId

  for (const pair of spousePairs) {
    const aEdges = parentChildRels.filter(
      (r) => r.sourceId === pair.a || r.targetId === pair.a
    ).length;
    const bEdges = parentChildRels.filter(
      (r) => r.sourceId === pair.b || r.targetId === pair.b
    ).length;

    // The one with more parent-child edges is primary
    let primary: string, secondary: string;
    if (aEdges >= bEdges) {
      primary = pair.a;
      secondary = pair.b;
    } else {
      primary = pair.b;
      secondary = pair.a;
    }
    secondaryIds.add(secondary);
    primaryOf.set(secondary, primary);
  }

  // Build dagre graph — only primary nodes + non-spouse nodes
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 60,
    ranksep: 140,
    marginx: 40,
    marginy: 40,
  });

  // Add nodes (double width for compound spouse nodes)
  for (const node of nodes) {
    if (secondaryIds.has(node.id)) continue; // skip secondaries
    const hasSpouse = spousePairIndex.has(node.id) && !secondaryIds.has(node.id);
    const width = hasSpouse ? NODE_WIDTH * 2 + 40 : NODE_WIDTH;
    g.setNode(node.id, { width, height: NODE_HEIGHT });
  }

  // Add parent-child edges, redirecting secondary → primary
  for (const rel of parentChildRels) {
    let source = rel.sourceId;
    let target = rel.targetId;

    // If source is a secondary, remap to its primary
    if (secondaryIds.has(source)) {
      source = primaryOf.get(source)!;
    }
    if (secondaryIds.has(target)) {
      target = primaryOf.get(target)!;
    }

    // Avoid self-loops (e.g. both parents mapped to same primary)
    if (source !== target) {
      // dagre doesn't allow duplicate edges, but it's ok — it overwrites
      g.setEdge(source, target);
    }
  }

  dagre.layout(g);

  // Build position map
  const posMap = new Map<string, { x: number; y: number }>();

  for (const node of nodes) {
    if (secondaryIds.has(node.id)) continue;

    const pos = g.node(node.id);
    const hasSpouse = spousePairIndex.has(node.id) && !secondaryIds.has(node.id);

    if (hasSpouse) {
      // Place primary on the left, secondary on the right
      const pairIdx = spousePairIndex.get(node.id)!;
      const pair = spousePairs[pairIdx];
      const secondaryId = pair.a === node.id ? pair.b : pair.a;

      const gap = 10;
      // Place symmetrically around dagre center so children are centered below
      posMap.set(node.id, {
        x: pos.x - gap / 2 - NODE_WIDTH,
        y: pos.y - NODE_HEIGHT / 2,
      });
      posMap.set(secondaryId, {
        x: pos.x + gap / 2,
        y: pos.y - NODE_HEIGHT / 2,
      });
    } else {
      posMap.set(node.id, {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      });
    }
  }

  return nodes.map((node) => ({
    ...node,
    position: posMap.get(node.id) || { x: 0, y: 0 },
  }));
}
