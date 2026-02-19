import { useState } from 'react';
import type { Gender } from '../types';
import { useFamilyStore } from '../store';

type RelativeType = 'father' | 'mother' | 'son' | 'daughter' | 'spouse' | 'brother' | 'sister';

interface Props {
  anchorPersonId: string;
  onClose: () => void;
}

export function AddRelativeDialog({ anchorPersonId, onClose }: Props) {
  const persons = useFamilyStore((s) => s.persons);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const addRelationship = useFamilyStore((s) => s.addRelationship);
  const relationships = useFamilyStore((s) => s.relationships);

  const anchor = persons[anchorPersonId];

  const [relType, setRelType] = useState<RelativeType>('son');
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');

  if (!anchor) return null;

  const relOptions: { value: RelativeType; label: string }[] = [
    { value: 'father', label: '父亲' },
    { value: 'mother', label: '母亲' },
    { value: 'son', label: '儿子' },
    { value: 'daughter', label: '女儿' },
    { value: 'spouse', label: '配偶' },
    { value: 'brother', label: '兄弟' },
    { value: 'sister', label: '姐妹' },
  ];

  const handleAdd = () => {
    if (!name.trim()) return;

    const genderMap: Record<RelativeType, Gender> = {
      father: 'male',
      mother: 'female',
      son: 'male',
      daughter: 'female',
      spouse: anchor.gender === 'male' ? 'female' : 'male',
      brother: 'male',
      sister: 'female',
    };

    const gender = genderMap[relType];
    const extras: { birthYear?: number } = {};
    if (birthYear) extras.birthYear = parseInt(birthYear);

    const newId = addPerson(name.trim(), gender, extras);

    switch (relType) {
      case 'father':
      case 'mother':
        // New person is parent of anchor
        addRelationship('parent-child', newId, anchorPersonId);
        // Also link to anchor's siblings (they share the same parents)
        linkParentToSiblings(newId, anchorPersonId);
        // Also link as spouse to anchor's existing opposite-gender parent
        linkToExistingParentAsSpouse(newId, anchorPersonId, gender);
        break;
      case 'son':
      case 'daughter':
        // Anchor is parent of new person
        addRelationship('parent-child', anchorPersonId, newId);
        // Also link to anchor's spouse if exists
        linkToSpouse(anchorPersonId, newId);
        break;
      case 'spouse':
        addRelationship('spouse', anchorPersonId, newId);
        // Also link new spouse as parent to anchor's existing children
        linkSpouseToChildren(anchorPersonId, newId);
        break;
      case 'brother':
      case 'sister': {
        // Find anchor's parents, add new person as their child too
        const parentRels = relationships.filter(
          (r) => r.type === 'parent-child' && r.targetId === anchorPersonId
        );
        if (parentRels.length > 0) {
          for (const pr of parentRels) {
            addRelationship('parent-child', pr.sourceId, newId);
          }
        }
        break;
      }
    }

    onClose();
  };

  const linkToSpouse = (parentId: string, childId: string) => {
    const spouseRel = relationships.find(
      (r) => r.type === 'spouse' && (r.sourceId === parentId || r.targetId === parentId)
    );
    if (spouseRel) {
      const spouseId = spouseRel.sourceId === parentId ? spouseRel.targetId : spouseRel.sourceId;
      addRelationship('parent-child', spouseId, childId);
    }
  };

  // When adding a spouse, also make them parent of anchor's children
  const linkSpouseToChildren = (anchorId: string, newSpouseId: string) => {
    const childRels = relationships.filter(
      (r) => r.type === 'parent-child' && r.sourceId === anchorId
    );
    for (const cr of childRels) {
      addRelationship('parent-child', newSpouseId, cr.targetId);
    }
  };

  // When adding a parent, also link them to anchor's siblings
  const linkParentToSiblings = (newParentId: string, anchorId: string) => {
    // Find anchor's existing parents
    const existingParentIds = relationships
      .filter((r) => r.type === 'parent-child' && r.targetId === anchorId)
      .map((r) => r.sourceId)
      .filter((id) => id !== newParentId);

    if (existingParentIds.length === 0) return;

    // Find siblings: other children of existing parents
    const siblingIds = new Set<string>();
    for (const pid of existingParentIds) {
      relationships
        .filter((r) => r.type === 'parent-child' && r.sourceId === pid && r.targetId !== anchorId)
        .forEach((r) => siblingIds.add(r.targetId));
    }

    // Link new parent to each sibling
    for (const sibId of siblingIds) {
      addRelationship('parent-child', newParentId, sibId);
    }
  };

  // When adding a parent, auto-link them as spouse to the existing opposite-gender parent
  const linkToExistingParentAsSpouse = (newParentId: string, anchorId: string, newGender: Gender) => {
    const existingParentIds = relationships
      .filter((r) => r.type === 'parent-child' && r.targetId === anchorId)
      .map((r) => r.sourceId)
      .filter((id) => id !== newParentId);

    for (const pid of existingParentIds) {
      const existingParent = persons[pid];
      if (existingParent && existingParent.gender !== newGender) {
        // Check no spouse relationship already exists
        const alreadySpouse = relationships.some(
          (r) =>
            r.type === 'spouse' &&
            ((r.sourceId === pid && r.targetId === newParentId) ||
              (r.sourceId === newParentId && r.targetId === pid))
        );
        if (!alreadySpouse) {
          addRelationship('spouse', pid, newParentId);
        }
      }
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>
          为 {anchor.name} 添加亲属
        </h3>

        <label style={labelStyle}>关系类型</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {relOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRelType(opt.value)}
              style={{
                padding: '4px 12px',
                border: relType === opt.value ? '2px solid #1976d2' : '1px solid #ddd',
                borderRadius: 16,
                background: relType === opt.value ? '#e3f2fd' : '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label style={labelStyle}>姓名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          autoFocus
          placeholder="输入姓名"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />

        <label style={labelStyle}>出生年份（可选）</label>
        <input
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          style={inputStyle}
          placeholder="例: 1990"
          type="number"
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleAdd} style={addBtnStyle} disabled={!name.trim()}>
            添加
          </button>
          <button onClick={onClose} style={cancelBtnStyle}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
};

const dialogStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 24,
  width: 380,
  maxWidth: '90vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: '#666',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
  marginBottom: 8,
  boxSizing: 'border-box',
};

const addBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 0',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

const cancelBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 0',
  background: '#f5f5f5',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
};
