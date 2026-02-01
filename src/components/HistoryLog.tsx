
import React, { useState, useMemo } from 'react';
import { LogEntry } from '../types';

interface HistoryLogProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onNavigateToGacha: () => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ logs, onClearLogs, onNavigateToGacha }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const lowerTerm = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.message.toLowerCase().includes(lowerTerm)
    );
  }, [logs, searchTerm]);

  // Group logs by date using the filtered list
  const groupedLogs = useMemo(() => {
    const groups: { date: string; items: LogEntry[] }[] = [];
    
    filteredLogs.forEach((log) => {
      const dateKey = new Date(log.timestamp).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      }); // e.g., 2024년 5월 20일 (월)

      const lastGroup = groups[groups.length - 1];

      // Assuming logs are already sorted by time (newest first)
      if (lastGroup && lastGroup.date === dateKey) {
        lastGroup.items.push(log);
      } else {
        groups.push({ date: dateKey, items: [log] });
      }
    });
    return groups;
  }, [filteredLogs]);

  // Type Icons
  const getIcon = (type: string) => {
    switch (type) {
      case 'ride': return '🚲';
      case 'coin': return '💰';
      case 'gacha': return '🎰';
      case 'get': return '📦';
      case 'use': return '🍽️';
      case 'synth': return '⚗️';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'ride': return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'coin': return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      case 'gacha': return 'bg-purple-50 text-purple-800 border-purple-100';
      case 'get': return 'bg-green-50 text-green-800 border-green-100';
      case 'use': return 'bg-gray-50 text-gray-600 border-gray-200 grayscale';
      case 'synth': return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      default: return 'bg-white text-gray-700 border-gray-100';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${min}`;
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header & Search */}
      <div className="px-5 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 flex flex-col gap-3 shadow-sm">
        <div className="flex justify-start -mb-1">
           <button 
             onClick={onNavigateToGacha}
             className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
           >
             ⬅️ 뽑기 하러 가기
           </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
             <h2 className="text-xl font-black text-gray-800">활동 기록</h2>
             <span className="text-xs text-gray-500">최근 {logs.length}건의 활동 내역</span>
          </div>
          <button 
            onClick={() => setShowConfirm(true)}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-red-100 hover:text-red-600 border border-gray-200 transition-colors"
          >
            🗑️ 기록 삭제
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="기록 검색 (예: 획득, 사용)..."
            className="w-full pl-9 pr-8 py-2.5 bg-gray-100 border-transparent focus:bg-white border focus:border-brand-500 rounded-xl text-sm font-medium outline-none transition-all placeholder-gray-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-gray-50/50">
        {logs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
            <span className="text-4xl opacity-30">📜</span>
            <span className="text-sm">기록된 활동이 없습니다.</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
            <span className="text-4xl opacity-30">🔍</span>
            <span className="text-sm">검색 결과가 없습니다.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20">
            {groupedLogs.map((group) => (
              <div key={group.date} className="flex flex-col gap-2">
                {/* Date Sticky Header */}
                <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-10 flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-600 bg-gray-200/60 px-2.5 py-1 rounded-lg border border-gray-200">
                    {group.date}
                  </span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Logs for this date */}
                {group.items.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-xl border flex gap-3 items-start shadow-sm transition-all hover:shadow-md ${getStyle(log.type)}`}
                  >
                    <div className="text-xl mt-0.5 select-none">{getIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold break-keep leading-tight mb-1">
                        {log.message}
                      </div>
                      <div className="text-[10px] opacity-60 font-mono">
                        {formatTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop" onClick={() => setShowConfirm(false)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 text-2xl">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">기록 전체 삭제</h3>
            <p className="text-gray-500 mb-6 text-sm">
              저장된 모든 활동 로그를 지우시겠습니까?<br/>
              <span className="text-xs text-gray-400">(코인이나 식재료는 삭제되지 않습니다)</span>
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  onClearLogs();
                  setShowConfirm(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryLog;
