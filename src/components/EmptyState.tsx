interface Props {
  onLoadSample: () => void;
  onAddPerson: () => void;
}

export function EmptyState({ onLoadSample, onAddPerson }: Props) {
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌳</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#333' }}>开始创建你的家族树</h2>
      <p style={{ margin: '0 0 24px', color: '#666', fontSize: 14 }}>
        添加家庭成员，建立亲属关系，查看中文称谓
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onAddPerson} style={primaryBtnStyle}>
          + 添加第一个人
        </button>
        <button onClick={onLoadSample} style={secondaryBtnStyle}>
          📋 加载示例家庭
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 500,
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#f5f5f5',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
};
