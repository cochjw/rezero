
export type Category = string;

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  tier: number; // 1 (Low) to 5 (High)
  isCustom: boolean;
  isActive: boolean;
  type?: 'food' | 'equipment';
}

export interface GachaSelection {
  ingredient: Ingredient;
  goldReward: number;
}

export interface StoredIngredient extends Ingredient {
  instanceId: string; 
  storedAt: number;
  isUsed?: boolean; 
  canSynthesize: boolean; 
  spentAmount?: number; 
}

export interface EquipmentBox {
  id: string;
  lat: number;
  lng: number;
  isOpened: boolean;
  spawnedAt: number;
  address?: string;
  city?: string; // 점령 시스템을 위한 도시 정보 추가
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'ride' | 'coin' | 'gacha' | 'get' | 'use' | 'synth' | 'system' | 'scan';
  message: string;
}

export interface ExclusionZone {
  id: string;
  lat: number;
  lng: number;
  radius: number; 
  name: string;
  type: 'AUTO' | 'MANUAL'; 
  geojson?: any; 
}
