
import { GAME_SETTINGS, SKILL_DATA } from './constants';
import { SkillId, SkillItem, SkillState, EquipSlot, EquippedItem } from './types';

/**
 * Global Item Registry for high-performance lookups
 */
export const ITEM_REGISTRY = Object.entries(SKILL_DATA).reduce((acc, [skillId, skillData]) => {
  skillData.items.forEach(item => {
    acc[item.id] = { ...item, skillId: skillId as SkillId };
  });
  return acc;
}, {} as Record<string, SkillItem & { skillId: SkillId }>);

/**
 * Calculates incremental XP awarded for an action.
 */
export const getXP = (req: number) => 
  Math.floor(GAME_SETTINGS.baseXP * Math.pow(GAME_SETTINGS.xpGrowth, req - 1));

/**
 * Calculates time in seconds for an action.
 */
export const getTime = (req: number) => 
  Math.max(0.5, GAME_SETTINGS.baseTime + (req - 1) * GAME_SETTINGS.timeGrowth);

/**
 * Calculates the cumulative XP threshold for a level.
 */
export const getLevelThreshold = (lvl: number): number => {
  if (lvl <= 1) return 0;
  // Approximation for performance, or precise loop for exact values
  let total = 0;
  for (let i = 1; i < lvl; i++) {
    total += Math.floor(GAME_SETTINGS.levelUpBase * Math.pow(GAME_SETTINGS.levelUpFactor, i - 1));
  }
  return total;
};

/**
 * Cumulative XP threshold for Item Mastery.
 */
export const getMasteryThreshold = (lvl: number): number => {
  if (lvl <= 1) return 0;
  let total = 0;
  for (let i = 1; i < lvl; i++) {
    total += Math.floor((GAME_SETTINGS.levelUpBase * 0.7) * Math.pow(GAME_SETTINGS.levelUpFactor - 0.02, i - 1));
  }
  return total;
};

/**
 * Centralized Combat Stats Calculation
 * Ensures App.tsx (Logic) and CombatView.tsx (Display) are always in sync.
 */
export const calculatePlayerCombatStats = (
  skills: Record<SkillId, SkillState>, 
  equipment: Record<EquipSlot, EquippedItem | null>,
  masteryLevel: number = 1
) => {
  const atkLvl = skills[SkillId.ATTACK].level;
  const strLvl = skills[SkillId.STRENGTH].level;
  const defLvl = skills[SkillId.DEFENSE].level;
  const agiLvl = skills[SkillId.AGILITY].level;

  // Mastery Bonuses
  const masteryAccBonus = 1 + ((masteryLevel - 1) * 0.005);
  const masteryDmgBonus = 1 + ((masteryLevel - 1) * 0.005);

  let gearAtk = 0, gearStr = 0, gearDef = 0, accMult = 1, dmgMult = 1;

  Object.values(equipment).forEach(eq => {
    if (eq) {
      const item = ITEM_REGISTRY[eq.id];
      if (item) {
        // Enhancement: +10% stats per equipment level
        const mult = 1 + (eq.level * 0.10);
        if (item.atkBonus) gearAtk += item.atkBonus * mult;
        if (item.strBonus) gearStr += item.strBonus * mult;
        if (item.defBonus) gearDef += item.defBonus * mult;
        if (item.accMult) accMult += item.accMult;
        if (item.dmgMult) dmgMult += item.dmgMult;
      }
    }
  });

  // Effective Strength & Max Hit
  const effectiveStr = Math.floor((strLvl + gearStr) * dmgMult * masteryDmgBonus);
  const maxHit = Math.floor(2 + (effectiveStr / 6));

  // Accuracy Rating
  const playerAccuracy = Math.floor(((atkLvl * 5) + gearAtk) * accMult * masteryAccBonus);

  // Defense Rating
  const playerDefense = Math.floor((defLvl * 3) + (agiLvl * 1.5) + gearDef);

  return {
    maxHit,
    playerAccuracy,
    playerDefense,
    effectiveStr
  };
};

/**
 * Formats IDs into display names.
 */
export const formatIdToName = (id: string): string => {
  if (ITEM_REGISTRY[id]) return ITEM_REGISTRY[id].itemName;
  return id
    .replace('_loot', '') 
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * High-performance number formatting.
 */
export const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.floor(num).toLocaleString();
};

/**
 * Deterministic AI Art Generator
 */
export const getArtUrl = (id: string, name: string): string => {
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = ((seed << 5) - seed) + id.charCodeAt(i);
    seed |= 0; 
  }
  seed = Math.abs(seed);
  const prompt = encodeURIComponent(`Professional RPG game icon of ${name}, magical materials, unreal engine 5, black background`);
  return `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${seed}&nologo=true`;
};
