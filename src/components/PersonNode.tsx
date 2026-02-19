import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Person } from '../types';
import { useFamilyStore } from '../store';

interface PersonNodeData {
  person: Person;
  kinshipLabel: string;
  isMe: boolean;
  [key: string]: unknown;
}

function PersonNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as unknown as PersonNodeData;
  const { person, kinshipLabel, isMe } = nodeData;
  const setMePerson = useFamilyStore((s) => s.setMePerson);

  const handleDoubleClick = useCallback(() => {
    setMePerson(id);
  }, [id, setMePerson]);

  const bgColor = person.gender === 'male' ? '#e3f2fd' : '#fce4ec';
  const borderColor = isMe ? '#ff9800' : person.gender === 'male' ? '#1976d2' : '#c2185b';
  const genderIcon = person.gender === 'male' ? '♂' : '♀';

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        background: bgColor,
        border: `3px solid ${borderColor}`,
        borderRadius: 12,
        padding: '8px 16px',
        minWidth: 120,
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: isMe ? '0 0 12px rgba(255,152,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#999' }} />

      {kinshipLabel && (
        <div
          style={{
            position: 'absolute',
            top: -22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ff9800',
            color: '#fff',
            fontSize: 11,
            padding: '1px 8px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {kinshipLabel}
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
        {genderIcon} {person.name}
      </div>

      {person.birthYear && (
        <div style={{ fontSize: 11, color: '#666' }}>
          {person.birthYear}年
          {person.isAlive === false ? ' · 已故' : ''}
        </div>
      )}

      {isMe && (
        <div
          style={{
            position: 'absolute',
            bottom: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: '#ff9800',
            fontWeight: 700,
          }}
        >
          ★ 我
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#999' }} />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
