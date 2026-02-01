
import React, { useState, useEffect } from 'react';
import { Ingredient } from '../types';
import { getCategoryColor } from '../constants';

interface IngredientManagerProps {
  // Food Props
  foodIngredients: Ingredient[];
  foodCategories: string[];
  onAddFood: (name: string, category: string, tier: number) => void;
  onRemoveFood: (id: string) => void;
  onUpdateFood: (id: string, updates: Partial<Ingredient>) => void;
  onAddFoodCategory: (name: string) => void;
  onRemoveFoodCategory: (name: string) => void;

  // Equipment Props
  equipIngredients: Ingredient[];
  equipCategories: string[];
  onAddEquip: (name: string, category: string, tier: number) => void;
  onRemoveEquip: (id: string) => void;
  onUpdateEquip: (id: string, updates: Partial<Ingredient>) => void;
  onAddEquipCategory: (name: string) => void;
  onRemoveEquipCategory: (name: string) => void;

  onNavigateToGacha: () => void;
  onOpenSaveModal: () => void;
}

const IngredientManager: React.FC<IngredientManagerProps> = ({ 
  foodIngredients, foodCategories, onAddFood, onRemoveFood, onUpdateFood, onAddFoodCategory, onRemoveFoodCategory,
  equipIngredients, equipCategories, onAddEquip, onRemoveEquip, onUpdateEquip, onAddEquipCategory,
  onNavigateToGacha, onOpenSaveModal
}) => {
  // Tab State
  const [activeMode, setActiveMode] = useState<'food' | 'equipment'>('food');

  // Determine current active data handlers based on mode
  const currentIngredients = activeMode === 'equipment' ? equipIngredients : foodIngredients;
  const currentCategories = activeMode === 'equipment' ? equipCategories : foodCategories;
  const handleAdd = activeMode === 'equipment' ? onAddEquip : onAddFood;
  const handleRemove = activeMode === 'equipment' ? onRemoveEquip : onRemoveFood;
  const handleUpdate = activeMode === 'equipment' ? onUpdateEquip : onUpdateFood;
  const handleAddCategory = activeMode === 'equipment' ? onAddEquipCategory : onAddFoodCategory;
  const handleRemoveCategory = activeMode === 'equipment' ? onRemoveFoodCategory : onRemoveFoodCategory;

  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newTier, setNewTier] = useState<number>(3);

  useEffect(() => {
    if (currentCategories.length > 0) {
      setNewCategory(currentCategories[0]);
    } else {
      setNewCategory('');
    }
  }, [currentCategories, activeMode]);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [isManagingCats, setIsManagingCats] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTier, setEditTier] = useState<number>(3);
  
  // Delete confirmation state for ingredients
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(false);

  // Filter State
  const [filter, setFilter] = useState<string>('');
  const [activeTabCat, setActiveTabCat] = useState<string>('all');

  // Reset states when switching tabs
  useEffect(() => {
    setEditingId(null);
    setNewName('');
    setFilter('');
    setActiveTabCat('all');
    setIsManagingCats(false);
  }, [activeMode]);

  // -- Handlers --

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      handleAdd(newName.trim(), newCategory || '기타', newTier);
      setNewName('');
      setNewTier(3);
    }
  };

  const submitAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      handleAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const startEditing = (item: Ingredient) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditTier(item.tier || 3);
  };

  const saveEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editName.trim()) {
      handleUpdate(editingId, { name: editName, category: editCategory, tier: editTier });
      setEditingId(null);
    }
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (deleteConfirmStep) {
      if (editingId) {
        handleRemove(editingId);
        setEditingId(null);
      }
    } else {
      setDeleteConfirmStep(true);
    }
  };

  const toggleActive = (id: string, current: boolean) => {
    if (editingId === id) return;
    handleUpdate(id, { isActive: !current });
  };

  const toggleAll = (active: boolean) => {
    filteredIngredients.forEach(item => {
      if (item.isActive !== active) {
        handleUpdate(item.id, { isActive: active });
      }
    });
  };

  const toggleCategoryGroup = (category: string, targetState: boolean) => {
    const items = groupedIngredients[category] || [];
    items.forEach(item => {
      if (item.isActive !== targetState) {
        handleUpdate(item.id, { isActive: targetState });
      }
    });
  };

  const getTierStars = (tier: number) => {
    return '⭐'.repeat(tier);
  };

  // -- Filtering & Grouping --

  const filteredIngredients = currentIngredients.filter(i => {
    const matchesSearch = i.name.includes(filter) || i.category.includes(filter);
    const matchesCat = activeTabCat === 'all' || i.category === activeTabCat;
    return matchesSearch && matchesCat;
  });

  const groupedIngredients = filteredIngredients.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const displayCategories = Object.keys(groupedIngredients).sort((a, b) => {
    const idxA = currentCategories.indexOf(a);
    const idxB = currentCategories.indexOf(b);
    if (idxA >= 0 && idxB >= 0) return idxA - idxB;
    if (idxA >= 0) return -1;
    if (idxB >= 0) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-t-3xl shadow-lg mt-2 animate-pop relative overflow-hidden font-cute">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button 
          onClick={onNavigateToGacha}
          className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-3 py-2 rounded-xl transition-colors"
        >
          ⬅️ 뽑기 화면
        </button>
        <button 
          onClick={onOpenSaveModal}
          className="flex items-center gap-1 text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors shadow-md"
        >
          💾 리스트 저장/불러오기
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="px-5 mt-2">
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button 
            onClick={() => setActiveMode('food')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeMode === 'food' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400'}`}
          >
            🍎 식량
          </button>
          <button 
            onClick={() => setActiveMode('equipment')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeMode === 'equipment' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            🚲 장비
          </button>
        </div>
      </div>

      <div className="p-5 pt-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${activeMode === 'food' ? 'text-brand-700' : 'text-blue-700'}`}>
            {activeMode === 'food' ? '식량 리스트 편집' : '장비 리스트 편집'}
          </h2>
          <button 
            type="button"
            onClick={() => setIsManagingCats(!isManagingCats)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isManagingCats ? (activeMode === 'food' ? 'bg-brand-500 text-white border-brand-500' : 'bg-blue-500 text-white border-blue-500') : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {isManagingCats ? '완료' : '⚙️ 카테고리 편집'}
          </button>
        </div>

        {isManagingCats && (
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-pop">
            <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">카테고리 목록</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentCategories.map(cat => (
                <div key={cat} className="flex items-center gap-1 pl-3 pr-1 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm">
                  {cat}
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm(`'${cat}' 카테고리를 삭제하시겠습니까?`)) {
                        handleRemoveCategory(cat);
                      }
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={submitAddCat} className="flex gap-2">
              <input 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="새 카테고리 이름"
                className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 shadow-sm font-medium"
              />
              <button disabled={!newCatName.trim()} type="submit" className="px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50">
                추가
              </button>
            </form>
          </div>
        )}
        
        {!isManagingCats && (
          <form onSubmit={submitAdd} className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-[28%] px-2 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 shadow-sm"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={activeMode === 'food' ? "새 재료 이름" : "새 장비 이름"}
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500 shadow-sm font-medium"
              />
              <select
                value={newTier}
                onChange={(e) => setNewTier(parseInt(e.target.value))}
                className="w-[18%] px-1 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-gray-900 shadow-sm text-center"
              >
                <option value={5}>⭐⭐⭐⭐⭐</option>
                <option value={4}>⭐⭐⭐⭐</option>
                <option value={3}>⭐⭐⭐</option>
                <option value={2}>⭐⭐</option>
                <option value={1}>⭐</option>
              </select>
              <button 
                type="submit"
                disabled={!newName.trim()}
                className={`px-3 py-2 text-white rounded-xl font-bold disabled:opacity-50 transition-colors flex-shrink-0 shadow-sm ${activeMode === 'food' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                +
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            type="button"
            onClick={() => setActiveTabCat('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${activeTabCat === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            전체
          </button>
          {currentCategories.map(cat => (
            <button 
              key={cat}
              type="button"
              onClick={() => setActiveTabCat(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${activeTabCat === cat ? (activeMode === 'food' ? 'bg-brand-500 text-white border-brand-500' : 'bg-blue-500 text-white border-blue-500') : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={activeMode === 'food' ? "재료 검색..." : "장비 검색..."}
            className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all text-gray-800"
          />
          <div className="flex gap-1">
            <button type="button" onClick={() => toggleAll(true)} className="text-xs px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-colors">전체 선택</button>
            <button type="button" onClick={() => toggleAll(false)} className="text-xs px-3 py-2 bg-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-300 transition-colors">해제</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-gray-50/50">
        <div className="flex flex-col gap-6 pb-20">
          {displayCategories.map((cat) => {
            const items = groupedIngredients[cat];
            const allActive = items.every(i => i.isActive);
            const someActive = items.some(i => i.isActive);
            const isIndeterminate = someActive && !allActive;

            return (
              <div key={cat} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 sticky top-0 bg-gray-50/95 backdrop-blur py-2 z-10 border-b border-gray-200/50">
                    <button
                      type="button"
                      onClick={() => toggleCategoryGroup(cat, !allActive)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${
                        allActive 
                          ? (activeMode === 'food' ? 'bg-brand-500 border-brand-500 text-white' : 'bg-blue-500 border-blue-500 text-white') 
                          : isIndeterminate 
                            ? 'bg-brand-100 border-brand-300 text-brand-600' 
                            : 'bg-white border-gray-300 text-transparent'
                      }`}
                    >
                      {allActive && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {isIndeterminate && <div className="w-2.5 h-2.5 bg-current rounded-sm" />}
                    </button>
                    <span className="font-bold text-gray-700">{cat}</span>
                    <span className="text-xs text-gray-400 font-normal">({items.length})</span>
                </div>
                
                <div className="flex flex-col gap-2 pl-1">
                    {items.map((item) => {
                      const isEditing = editingId === item.id;
                      return (
                        <div 
                          key={item.id}
                          className={`flex items-center p-3 rounded-xl border transition-all duration-200 ${
                            isEditing ? 'bg-white ring-2 ring-brand-400 border-transparent shadow-lg z-10 scale-[1.02]' : 
                            item.isActive ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'
                          }`}
                        >
                          {!isEditing && (
                            <button 
                              type="button"
                              onClick={() => toggleActive(item.id, item.isActive)}
                              className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-3 transition-colors ${item.isActive ? (activeMode === 'food' ? 'bg-brand-500 text-white' : 'bg-blue-500 text-white') : 'bg-gray-200 text-transparent'}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </button>
                          )}

                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex flex-col gap-3 py-1">
                                <div className="flex gap-2">
                                  <input 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                                    placeholder="이름"
                                    autoFocus
                                  />
                                  <select
                                    value={editTier}
                                    onChange={(e) => setEditTier(parseInt(e.target.value))}
                                    className="w-16 px-1 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 outline-none shadow-sm text-center"
                                  >
                                    <option value={5}>5⭐</option>
                                    <option value={4}>4⭐</option>
                                    <option value={3}>3⭐</option>
                                    <option value={2}>2⭐</option>
                                    <option value={1}>1⭐</option>
                                  </select>
                                </div>
                                <select
                                  value={editCategory}
                                  onChange={(e) => setEditCategory(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none shadow-sm"
                                >
                                  {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex gap-2 mt-1">
                                  <button type="button" onClick={saveEditing} className="flex-1 bg-brand-500 text-white text-sm font-bold py-2 rounded-lg">저장</button>
                                  <button type="button" onClick={cancelEditing} className="flex-1 bg-gray-200 text-gray-700 text-sm font-bold py-2 rounded-lg">취소</button>
                                </div>
                                <button 
                                  type="button"
                                  onClick={handleDeleteClick}
                                  className={`w-full text-sm font-bold py-2 rounded-lg mt-1 flex items-center justify-center gap-1 ${
                                    deleteConfirmStep 
                                      ? 'bg-red-500 text-white' 
                                      : 'bg-red-50 text-red-600 border border-red-200'
                                  }`}
                                >
                                  {deleteConfirmStep ? '진짜 삭제할까요?' : '삭제하기'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between" onClick={() => toggleActive(item.id, item.isActive)}>
                                <div>
                                  <div className={`text-sm font-bold ${item.isActive ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{item.name}</div>
                                  <div className="flex gap-2 mt-0.5">
                                    <div className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${getCategoryColor(item.category)}`}>{item.category}</div>
                                    <div className="text-[10px] text-yellow-500">{getTierStars(item.tier || 3)}</div>
                                  </div>
                                </div>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(item);
                                  }}
                                  className="p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-500 rounded-lg transition ml-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 flex justify-between px-6 mb-safe">
        <span>총 {currentIngredients.length}개</span>
        <span className={`font-bold ${activeMode === 'food' ? 'text-brand-600' : 'text-blue-600'}`}>활성: {currentIngredients.filter(i => i.isActive).length}개</span>
      </div>
    </div>
  );
};

export default IngredientManager;
