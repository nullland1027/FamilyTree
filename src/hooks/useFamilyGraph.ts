import { useMemo, useCallback, useRef, useEffect } from 'react';
import type { Node, Edge, NodeChange, OnNodesChange } from '@xyflow/react';
import { applyNodeChanges } from '@xyflow/react';
import { useFamilyStore } from '../store';
import { layoutFamilyTree } from '../utils/layout';
import { computeAllKinships } from '../utils/kinshipResolver';
import { useState } from 'react';

export function useFamilyGraph() {
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const mePersonId = useFamilyStore((s) => s.mePersonId);
  const layoutVersion = useFamilyStore((s) => s.layoutVersion);

  const kinshipLabels = useMemo(() => {
    if (!mePersonId || !persons[mePersonId]) return {};
    return computeAllKinships(persons, relationships, mePersonId);
  }, [persons, relationships, mePersonId]);

  // Track the data version to know when to re-layout
  const dataVersion = useMemo(() => {
    return JSON.stringify([Object.keys(persons).sort(), relationships.length, layoutVersion]);
  }, [persons, relationships, layoutVersion]);

  const prevDataVersion = useRef(dataVersion);

  // Compute layout only when data structure changes
  const layoutedResult = useMemo(() => {
    const rawNodes: Node[] = Object.values(persons).map((person) => ({
      id: person.id,
      type: 'personNode',
      position: { x: 0, y: 0 },
      draggable: true,
      data: {
        person,
        kinshipLabel: kinshipLabels[person.id] || '',
        isMe: person.id === mePersonId,
      },
    }));

    const rawEdges: Edge[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      type: rel.type === 'spouse' ? 'straight' : 'smoothstep',
      style: rel.type === 'spouse'
        ? { stroke: '#e91e63', strokeWidth: 2, strokeDasharray: '6 3' }
        : { stroke: '#555', strokeWidth: 2 },
      label: rel.type === 'spouse' ? '💑' : undefined,
      labelStyle: rel.type === 'spouse' ? { fontSize: 14 } : undefined,
      animated: false,
    }));

    const layoutedNodes = layoutFamilyTree(rawNodes, rawEdges, relationships);
    return { nodes: layoutedNodes, edges: rawEdges };
  }, [persons, relationships, mePersonId, kinshipLabels]);

  // Maintain a mutable nodes state for drag support
  const [nodes, setNodes] = useState<Node[]>(layoutedResult.nodes);

  // When layout changes (new persons/relationships), reset positions
  useEffect(() => {
    if (prevDataVersion.current !== dataVersion) {
      prevDataVersion.current = dataVersion;
      setNodes(layoutedResult.nodes);
    } else {
      // Data content changed (e.g. name edit) but structure same — update data only, keep positions
      setNodes((prev) =>
        prev.map((n) => {
          const updated = layoutedResult.nodes.find((ln) => ln.id === n.id);
          if (updated) {
            return { ...n, data: updated.data };
          }
          return n;
        })
      );
    }
  }, [layoutedResult, dataVersion]);

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  return { nodes, edges: layoutedResult.edges, onNodesChange };
}
