import { useFamilyStore } from '../store';

interface Props {
  x: number;
  y: number;
  personId: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onAddRelative: (id: string) => void;
}

export function ContextMenu({ x, y, personId, onClose, onEdit, onAddRelative }: Props) {
  const persons = useFamilyStore((s) => s.persons);
  const setMePerson = useFamilyStore((s) => s.setMePerson);
  const deletePerson = useFamilyStore((s) => s.deletePerson);
  const mePersonId = useFamilyStore((s) => s.mePersonId);
  const person = persons[personId];

  if (!person) return null;

  const items = [
    { label: '编辑信息', action: () => { onEdit(personId); onClose(); } },
    { label: '添加亲属', action: () => { onAddRelative(personId); onClose(); } },
    {
      label: mePersonId === personId ? '取消设为"我"' : '设为"我"',
      action: () => { setMePerson(mePersonId === personId ? null : personId); onClose(); },
    },
    { label: '——', action: () => {} },
    {
      label: '删除',
      action: () => {
        if (confirm(`确定删除 ${person.name}？`)) {
          deletePerson(personId);
        }
        onClose();
      },
      danger: true,
    },
  ];

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={onClose} />
      <div style={{ ...menuStyle, left: x, top: y }}>
        <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', borderBottom: '1px solid #eee' }}>
          {person.name}
        </div>
        {items.map((item, i) =>
          item.label === '——' ? (
            <div key={i} style={{ borderTop: '1px solid #eee', margin: '2px 0' }} />
          ) : (
            <button
              key={i}
              onClick={item.action}
              style={{
                ...menuItemStyle,
                color: 'danger' in item && item.danger ? '#d32f2f' : '#333',
              }}
            >
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

const menuStyle: React.CSSProperties = {
  position: 'fixed',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  minWidth: 160,
  zIndex: 51,
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 14,
};
