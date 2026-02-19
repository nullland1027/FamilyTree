import { useCallback, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useFamilyStore } from '../store';

export function Toolbar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const persons = useFamilyStore((s) => s.persons);
  const relationships = useFamilyStore((s) => s.relationships);
  const mePersonId = useFamilyStore((s) => s.mePersonId);
  const importData = useFamilyStore((s) => s.importData);
  const clearAll = useFamilyStore((s) => s.clearAll);
  const addPerson = useFamilyStore((s) => s.addPerson);
  const triggerRelayout = useFamilyStore((s) => s.triggerRelayout);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data = { persons, relationships, mePersonId };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-tree.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [persons, relationships, mePersonId]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          if (data.persons && data.relationships) {
            importData(data);
          } else {
            alert('无效的家族树文件');
          }
        } catch {
          alert('文件解析失败');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importData]
  );

  const handleClear = useCallback(() => {
    if (confirm('确定清空所有数据？此操作不可撤销。')) {
      clearAll();
    }
  }, [clearAll]);

  const handleAddPerson = useCallback(() => {
    addPerson('新成员', 'male');
  }, [addPerson]);

  const handleLoadSample = useCallback(() => {
    if (Object.keys(persons).length > 0) {
      if (!confirm('加载示例数据将覆盖当前数据，是否继续？')) return;
    }
    loadSampleData(importData);
  }, [persons, importData]);

  const personCount = Object.keys(persons).length;

  return (
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 15, marginRight: 8 }}>🌳 家族树</span>

        <button onClick={handleAddPerson} style={btnStyle} title="添加人物">
          + 添加
        </button>

        <div style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />

        <button onClick={() => zoomIn()} style={btnStyle} title="放大">🔍+</button>
        <button onClick={() => zoomOut()} style={btnStyle} title="缩小">🔍−</button>
        <button onClick={() => fitView({ padding: 0.2 })} style={btnStyle} title="适应视口">📐</button>
        <button onClick={() => { triggerRelayout(); setTimeout(() => fitView({ padding: 0.2 }), 150); }} style={autoLayoutBtnStyle} title="自动排列节点">✨ 自动排列</button>

        <div style={{ width: 1, height: 20, background: '#ddd', margin: '0 4px' }} />

        <button onClick={handleExport} style={btnStyle} title="导出JSON">📤 导出</button>
        <button onClick={handleImport} style={btnStyle} title="导入JSON">📥 导入</button>
        <button onClick={handleLoadSample} style={btnStyle} title="加载示例数据">📋 示例</button>
        <button onClick={handleClear} style={clearBtnStyle} title="清空所有数据，返回首页">🗑️ 清空重建</button>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
      </div>

      <div style={{ fontSize: 12, color: '#999' }}>
        {personCount} 人 · 双击节点设为"我" · 右键节点操作
      </div>
    </div>
  );
}

const toolbarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 48,
  background: '#fff',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  zIndex: 10,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const btnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  whiteSpace: 'nowrap',
};

const autoLayoutBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#e8f5e9',
  border: '1px solid #a5d6a7',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  whiteSpace: 'nowrap',
  color: '#2e7d32',
  fontWeight: 500,
};

const clearBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#fff5f5',
  border: '1px solid #ffcdd2',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  whiteSpace: 'nowrap',
  color: '#d32f2f',
  fontWeight: 500,
};

// Sample family data
function loadSampleData(importData: (data: { persons: Record<string, any>; relationships: any[]; mePersonId: string | null }) => void) {
  const grandpa = { id: 'gf', name: '张大山', gender: 'male' as const, birthYear: 1940 };
  const grandma = { id: 'gm', name: '李秀英', gender: 'female' as const, birthYear: 1942 };
  const father = { id: 'fa', name: '张建国', gender: 'male' as const, birthYear: 1965 };
  const mother = { id: 'mo', name: '王丽华', gender: 'female' as const, birthYear: 1967 };
  const uncle = { id: 'un', name: '张建军', gender: 'male' as const, birthYear: 1968 };
  const aunt = { id: 'au', name: '刘芳', gender: 'female' as const, birthYear: 1970 };
  const me = { id: 'me', name: '张伟', gender: 'male' as const, birthYear: 1992 };
  const sister = { id: 'si', name: '张敏', gender: 'female' as const, birthYear: 1995 };
  const cousin = { id: 'co', name: '张磊', gender: 'male' as const, birthYear: 1994 };
  const mgf = { id: 'mgf', name: '王福', gender: 'male' as const, birthYear: 1938 };
  const mgm = { id: 'mgm', name: '赵淑芬', gender: 'female' as const, birthYear: 1940 };

  const persons: Record<string, any> = {};
  [grandpa, grandma, father, mother, uncle, aunt, me, sister, cousin, mgf, mgm].forEach((p) => {
    persons[p.id] = p;
  });

  const relationships = [
    { id: 'r1', type: 'spouse' as const, sourceId: 'gf', targetId: 'gm' },
    { id: 'r2', type: 'parent-child' as const, sourceId: 'gf', targetId: 'fa' },
    { id: 'r3', type: 'parent-child' as const, sourceId: 'gm', targetId: 'fa' },
    { id: 'r4', type: 'parent-child' as const, sourceId: 'gf', targetId: 'un' },
    { id: 'r5', type: 'parent-child' as const, sourceId: 'gm', targetId: 'un' },
    { id: 'r6', type: 'spouse' as const, sourceId: 'fa', targetId: 'mo' },
    { id: 'r7', type: 'spouse' as const, sourceId: 'un', targetId: 'au' },
    { id: 'r8', type: 'parent-child' as const, sourceId: 'fa', targetId: 'me' },
    { id: 'r9', type: 'parent-child' as const, sourceId: 'mo', targetId: 'me' },
    { id: 'r10', type: 'parent-child' as const, sourceId: 'fa', targetId: 'si' },
    { id: 'r11', type: 'parent-child' as const, sourceId: 'mo', targetId: 'si' },
    { id: 'r12', type: 'parent-child' as const, sourceId: 'un', targetId: 'co' },
    { id: 'r13', type: 'parent-child' as const, sourceId: 'au', targetId: 'co' },
    { id: 'r14', type: 'spouse' as const, sourceId: 'mgf', targetId: 'mgm' },
    { id: 'r15', type: 'parent-child' as const, sourceId: 'mgf', targetId: 'mo' },
    { id: 'r16', type: 'parent-child' as const, sourceId: 'mgm', targetId: 'mo' },
  ];

  importData({ persons, relationships, mePersonId: 'me' });
}
