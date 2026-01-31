
export enum SkillId {
  MINING = 'mining',
  FORESTRY = 'forestry',
  COOKING = 'cooking',
  FISHING = 'fishing',
  SMITHING = 'smithing',
  JEWELRY = 'jewelry',
  ENCHANTING = 'enchanting',
  AGILITY = 'agility',
  BOTANY = 'botany',
  ALCHEMY = 'alchemy',
  THIEVERY = 'thievery',
  SCRIBING = 'scribing',
  ATTACK = 'attack',
  STRENGTH = 'strength',
  DEFENSE = 'defense',
  HITPOINTS = 'hitpoints'
}

export enum EquipSlot {
  HEAD = 'head',
  CHEST = 'chest',
  LEGS = 'legs',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  NECK = 'neck',
  RING = 'ring'
}

export interface ItemInput {
  id: string;
  qty: number;
}

export interface SkillItem {
  id: string;
  name: string;
  itemName: string;
  req: number;
  value?: number; 
  description?: string;
  inputs?: ItemInput[];
  heal?: number; 
  boost?: {
    stat: 'atk' | 'str' | 'def' | 'agi' | 'xp';
    value: number;
    duration: number;
  };
  iconUrl?: string; 
  slot?: EquipSlot;
  atkBonus?: number;
  strBonus?: number;
  defBonus?: number;
  accMult?: number; 
  dmgMult?: number; 
}

export interface MonsterDrop {
  id: string;
  chance: number;
  qtyRange?: [number, number];
}

export interface Monster {
  id: string;
  name: string;
  req: number;
  hp: number;
  att: number;
  def: number;
  xp: number;
  creditRange?: [number, number]; 
  drops: MonsterDrop[];
  isBoss?: boolean;
  imageUrl?: string;
}

export interface SkillData {
  displayName: string;
  icon: string;
  hubName: string;
  desc: string;
  actionWord: string;
  items: SkillItem[];
  monsters?: Monster[];
}

export interface MasteryState {
  level: number;
  xp: number;
}

export interface SkillState {
  level: number;
  xp: number;
  nextLevelXP: number;
  inventory: Record<string, number>;
  mastery: Record<string, MasteryState>;
}

export interface CombatHit {
  damage: number;
  isPlayer: boolean;
  timestamp: number;
  isMiss: boolean;
  isCrit?: boolean;
}

export interface ActiveAction {
  type: 'skill' | 'combat';
  skillId: SkillId;
  itemId?: string;
  monsterId?: string;
  startTime: number;
  duration: number;
  enemyCurHp?: number;
  playerHp?: number;
  lastTickTime: number;
  combatFocus?: SkillId;
  // Independent Combat Timers
  playerTimer?: number;
  enemyTimer?: number;
  playerInterval?: number;
  enemyInterval?: number;
  combatHits?: CombatHit[];
}

export interface EquippedItem {
  id: string;
  level: number;
}

export interface ActiveBooster {
  id: string;
  stat: 'atk' | 'str' | 'def' | 'agi' | 'xp';
  value: number;
  expiry: number;
}

export interface UserAccount {
  username: string;
  accountId: string;
  linkedAt: number;
}

export interface GameState {
  account: UserAccount | null;
  credits: number; 
  upgrades: string[]; // Track permanent shop upgrades
  skills: Record<SkillId, SkillState>;
  player: {
    hp: number;
    maxHp: number;
    autoEatThreshold: number;
    equipment: Record<EquipSlot, EquippedItem | null>;
    boosters: ActiveBooster[];
  };
  activeAction: ActiveAction | null;
  lastSaveTime: number;
}
