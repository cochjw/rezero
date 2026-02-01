import React, { useState, useEffect } from 'react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  onReset: () => void;
  slots: Record<string, any>;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onDelete,
  onReset,
  slots
}) => {
  const [slotName, setSlotName] = useState('');
  
  // Confirmation states
  const [confirmLoadSlot, setConfirmLoadSlot] = useState<string | null>(null);
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Reset internal states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmLoadSlot(null);
      setConfirmDeleteSlot(null);
      setConfirmReset(false);
      setSlotName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slotName.trim()) {
      onSave(slotName.trim());
      setSlotName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <span>💾</span> 저장소 관리
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
          {/* Save Form */}
          <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">현재 상태 저장하기</label>
            <form onSubmit={handleSaveSubmit} className="flex gap-2">
              <input
                type="text"
                value={slotName}
                onChange={(e) => setSlotName(e.target.value)}
                placeholder="예: 다이어트용, 파티용..."
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 bg-white font-medium shadow-sm"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!slotName.trim()} 
                className="px-4 bg-brand-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors shadow-sm"
              >
                저장
              </button>
            </form>
          </div>

          {/* Slot List */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase px-1">저장된 리스트</label>
            <div className="flex flex-col gap-2 mt-1">
              {Object.keys(slots).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  저장된 데이터가 없습니다.
                </div>
              )}
              {Object.entries(slots).map(([name, data]: [string, any]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-200 hover:shadow-md transition-all group">
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-brand-600 transition-colors">{name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(data.timestamp || Date.now()).toLocaleDateString()} • 재료 {data.ingredients?.length}개
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {confirmLoadSlot === name ? (
                        <button 
                        type="button"
                        onClick={() => {
                          onLoad(name);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 animate-pop shadow-sm"
                      >
                        확인
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                            setConfirmLoadSlot(name);
                            setConfirmDeleteSlot(null);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 border border-blue-100"
                      >
                        불러오기
                      </button>
                    )}
                    
                    {confirmDeleteSlot === name ? (
                      <button 
                        type="button"
                        onClick={() => {
                          onDelete(name);
                          setConfirmDeleteSlot(null); // Stay open to show updated list
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 animate-pop shadow-sm"
                      >
                        삭제확인
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                            setConfirmDeleteSlot(name);
                            setConfirmLoadSlot(null);
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 border border-red-100"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Reset */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          {confirmReset ? (
              <button 
              type="button"
              onClick={() => {
                  onReset();
                  onClose();
              }}
              className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors animate-pop shadow-md"
            >
              ⚠️ 모든 데이터를 초기화 하시겠습니까?
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              데이터 초기화 (기본값 복구)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;