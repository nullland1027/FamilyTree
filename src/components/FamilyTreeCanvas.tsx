import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type NodeMouseHandler,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PersonNode } from './PersonNode';
import { PersonDetailPanel } from './PersonDetailPanel';
import { AddRelativeDialog } from './AddRelativeDialog';
import { ContextMenu } from './ContextMenu';
import { Toolbar } from './Toolbar';
import { EmptyState } from './EmptyState';
import { useFamilyGraph } from '../hooks/useFamilyGraph';
import { useFamilyStore } from '../store';

const nodeTypes = { personNode: PersonNode };

function FamilyTreeCanvasInner() {
  const { nodes, edges, onNodesChange } = useFamilyGraph();
  const { fitView } = useReactFlow();
  const persons = useFamilyStore((s) => s.persons);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const importData = useFamilyStore((s) => s.importData);

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [addRelativeForId, setAddRelativeForId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    personId: string;
  } | null>(null);

  const personCount = Object.keys(persons).length;

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [nodes.length, fitView]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedPersonId(node.id);
    setContextMenu(null);
  }, []);

  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, personId: node.id });
  }, []);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAddPerson = useCallback(() => {
    addPerson('新成员', 'male');
  }, [addPerson]);

  const handleLoadSample = useCallback(() => {
    loadSampleData(importData);
  }, [importData]);

  if (personCount === 0) {
    return (
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <EmptyState onLoadSample={handleLoadSample} onAddPerson={handleAddPerson} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Toolbar />

      <div style={{ position: 'absolute', top: 48, left: 0, right: selectedPersonId ? 300 : 0, bottom: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="#f0f0f0" />
          <Controls position="bottom-left" />
        </ReactFlow>
      </div>

      {selectedPersonId && (
        <PersonDetailPanel
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}

      {addRelativeForId && (
        <AddRelativeDialog
          anchorPersonId={addRelativeForId}
          onClose={() => setAddRelativeForId(null)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          personId={contextMenu.personId}
          onClose={() => setContextMenu(null)}
          onEdit={setSelectedPersonId}
          onAddRelative={setAddRelativeForId}
        />
      )}
    </div>
  );
}

export function FamilyTreeCanvas() {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvasInner />
    </ReactFlowProvider>
  );
}

// Inline sample data loader (same as Toolbar)
function loadSampleData(importData: (data: any) => void) {
  const persons: Record<string, any> = {
    gf: { id: 'gf', name: '张大山', gender: 'male', birthYear: 1940 },
    gm: { id: 'gm', name: '李秀英', gender: 'female', birthYear: 1942 },
    fa: { id: 'fa', name: '张建国', gender: 'male', birthYear: 1965 },
    mo: { id: 'mo', name: '王丽华', gender: 'female', birthYear: 1967 },
    un: { id: 'un', name: '张建军', gender: 'male', birthYear: 1968 },
    au: { id: 'au', name: '刘芳', gender: 'female', birthYear: 1970 },
    me: { id: 'me', name: '张伟', gender: 'male', birthYear: 1992 },
    si: { id: 'si', name: '张敏', gender: 'female', birthYear: 1995 },
    co: { id: 'co', name: '张磊', gender: 'male', birthYear: 1994 },
    mgf: { id: 'mgf', name: '王福', gender: 'male', birthYear: 1938 },
    mgm: { id: 'mgm', name: '赵淑芬', gender: 'female', birthYear: 1940 },
  };

  const relationships = [
    { id: 'r1', type: 'spouse', sourceId: 'gf', targetId: 'gm' },
    { id: 'r2', type: 'parent-child', sourceId: 'gf', targetId: 'fa' },
    { id: 'r3', type: 'parent-child', sourceId: 'gm', targetId: 'fa' },
    { id: 'r4', type: 'parent-child', sourceId: 'gf', targetId: 'un' },
    { id: 'r5', type: 'parent-child', sourceId: 'gm', targetId: 'un' },
    { id: 'r6', type: 'spouse', sourceId: 'fa', targetId: 'mo' },
    { id: 'r7', type: 'spouse', sourceId: 'un', targetId: 'au' },
    { id: 'r8', type: 'parent-child', sourceId: 'fa', targetId: 'me' },
    { id: 'r9', type: 'parent-child', sourceId: 'mo', targetId: 'me' },
    { id: 'r10', type: 'parent-child', sourceId: 'fa', targetId: 'si' },
    { id: 'r11', type: 'parent-child', sourceId: 'mo', targetId: 'si' },
    { id: 'r12', type: 'parent-child', sourceId: 'un', targetId: 'co' },
    { id: 'r13', type: 'parent-child', sourceId: 'au', targetId: 'co' },
    { id: 'r14', type: 'spouse', sourceId: 'mgf', targetId: 'mgm' },
    { id: 'r15', type: 'parent-child', sourceId: 'mgf', targetId: 'mo' },
    { id: 'r16', type: 'parent-child', sourceId: 'mgm', targetId: 'mo' },
  ];

  importData({ persons, relationships, mePersonId: 'me' });
}
