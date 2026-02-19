import { useState, useEffect } from 'react';
import type { Gender } from '../types';
import { useFamilyStore } from '../store';

interface Props {
  personId: string | null;
  onClose: () => void;
}

export function PersonDetailPanel({ personId, onClose }: Props) {
  const persons = useFamilyStore((s) => s.persons);
  const updatePerson = useFamilyStore((s) => s.updatePerson);
  const deletePerson = useFamilyStore((s) => s.deletePerson);
  const setMePerson = useFamilyStore((s) => s.setMePerson);
  const mePersonId = useFamilyStore((s) => s.mePersonId);

  const person = personId ? persons[personId] : null;

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthYear, setBirthYear] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (person) {
      setName(person.name);
      setGender(person.gender);
      setBirthYear(person.birthYear?.toString() || '');
      setBirthPlace(person.birthPlace || '');
      setIsAlive(person.isAlive !== false);
      setNotes(person.notes || '');
    }
  }, [person]);

  if (!person || !personId) return null;

  const handleSave = () => {
    updatePerson(personId, {
      name,
      gender,
      birthYear: birthYear ? parseInt(birthYear) : undefined,
      birthPlace: birthPlace || undefined,
      isAlive,
      notes: notes || undefined,
    });
  };

  const handleDelete = () => {
    if (confirm(`确定删除 ${person.name} 吗？相关关系也会被删除。`)) {
      deletePerson(personId);
      onClose();
    }
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>编辑人物</h3>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>

      <label style={labelStyle}>姓名</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>性别</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setGender('male')}
          style={{ ...genderBtnStyle, background: gender === 'male' ? '#1976d2' : '#eee', color: gender === 'male' ? '#fff' : '#333' }}
        >
          ♂ 男
        </button>
        <button
          onClick={() => setGender('female')}
          style={{ ...genderBtnStyle, background: gender === 'female' ? '#c2185b' : '#eee', color: gender === 'female' ? '#fff' : '#333' }}
        >
          ♀ 女
        </button>
      </div>

      <label style={labelStyle}>出生年份</label>
      <input value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="例: 1960" style={inputStyle} type="number" />

      <label style={labelStyle}>出生地</label>
      <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>
        <input type="checkbox" checked={isAlive} onChange={(e) => setIsAlive(e.target.checked)} style={{ marginRight: 6 }} />
        在世
      </label>

      <label style={labelStyle}>备注</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...inputStyle, height: 60, resize: 'vertical' }} />

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleSave} style={saveBtnStyle}>保存</button>
        <button
          onClick={() => setMePerson(personId)}
          style={{ ...actionBtnStyle, background: mePersonId === personId ? '#ff9800' : '#f5f5f5', color: mePersonId === personId ? '#fff' : '#333' }}
        >
          {mePersonId === personId ? '★ 当前是"我"' : '设为"我"'}
        </button>
      </div>

      <button onClick={handleDelete} style={deleteBtnStyle}>删除此人</button>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: 300,
  background: '#fff',
  borderLeft: '1px solid #e0e0e0',
  padding: 20,
  overflowY: 'auto',
  zIndex: 10,
  boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: '#666',
  marginBottom: 4,
  marginTop: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 14,
  marginBottom: 4,
  boxSizing: 'border-box',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 18,
  cursor: 'pointer',
  color: '#999',
};

const genderBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 0',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

const saveBtnStyle: React.CSSProperties = {
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

const actionBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 0',
  border: '1px solid #ddd',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const deleteBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 0',
  marginTop: 20,
  background: 'none',
  color: '#d32f2f',
  border: '1px solid #d32f2f',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
};
