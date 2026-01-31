
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SkillId, GameState, SkillState, ActiveAction, EquipSlot, EquippedItem, UserAccount } from './types.ts';
import { SKILL_DATA, MONSTER_DATA, GAME_SETTINGS } from './constants.ts';
import { getXP, getTime, getLevelThreshold, getMasteryThreshold, ITEM_REGISTRY, formatNumber, calculatePlayerCombatStats } from './utils.ts';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import SkillView from './components/SkillView.tsx';
import CombatView from './components/CombatView.tsx';
import InventoryView from './components/InventoryView.tsx';
import MasteryOverview from './components/MasteryOverview.tsx';
import NexusMarket from './components/NexusMarket.tsx';
import StatsView from './components/StatsView.tsx';
import DevConsole from './components/DevConsole.tsx';
import AccountModal from './components/AccountModal.tsx';
import OfflineModal from './components/OfflineModal.tsx';

const SAVE_KEY = 'neve_rending_v2_final_cyber';

interface Toast {
  id: number;
  text: string;
  type: 'xp' | 'item' | 'alert' | 'success';
  icon?: string;
}

const INITIAL_SKILL_STATE = (lvl = 1): SkillState => ({
  level: lvl,
  xp: getLevelThreshold(lvl),
  nextLevelXP: getLevelThreshold(lvl + 1),
  inventory: {},
  mastery: {}
});

const INITIAL_STATE: GameState = {
  account: null,
  credits: 0,
  upgrades: [],
  skills: Object.values(SkillId).reduce((acc, s) => ({ 
    ...acc, 
    [s]: INITIAL_SKILL_STATE(s === SkillId.HITPOINTS ? 10 : 1) 
  }), {} as Record<SkillId, SkillState>),
  player: {
    hp: 500, // Initial HP for level 10
    maxHp: 500,
    autoEatThreshold: 0.3,
    equipment: {
      [EquipSlot.HEAD]: null, [EquipSlot.CHEST]: null, [EquipSlot.LEGS]: null,
      [EquipSlot.WEAPON]: null, [EquipSlot.SHIELD]: null, [EquipSlot.NECK]: null, [EquipSlot.RING]: null
    },
    boosters: []
  },
  activeAction: null,
  lastSaveTime: Date.now()
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentSkill, setCurrentSkill] = useState<SkillId | 'inventory' | 'combat' | 'stats' | 'mastery' | 'market'>(SkillId.MINING);
  const [combatFocus, setCombatFocus] = useState<SkillId>(SkillId.ATTACK);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<any>(null);

  // Performance Optimization: Mutable Refs for High-Frequency Logic
  const stateRef = useRef(gameState);
  
  // Dedicated Combat Timer Ref to decouple logic from render cycle
  const combatRef = useRef({
    playerTimer: 0,
    enemyTimer: 0,
    lastTick: Date.now(),
    isActive: false
  });

  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  const addToast = useCallback((text: string, type: 'xp' | 'item' | 'alert' | 'success', icon?: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-8), { id, text, type, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
  }, []);

  const totalLevel = useMemo(() => 
    Object.values(gameState.skills).reduce((acc, s) => acc + (s as SkillState).level, 0), 
    [gameState.skills]
  );

  const activeSkillState = useMemo(() => {
    if (Object.values(SkillId).includes(currentSkill as SkillId)) {
      return gameState.skills[currentSkill as SkillId];
    }
    return undefined;
  }, [currentSkill, gameState.skills]);

  // --- CORE LOGIC: XP & ITEMS ---

  const addXP = useCallback((skillId: SkillId, amount: number) => {
    setGameState(prev => {
      const skill = prev.skills[skillId];
      if (!skill) return prev;
      
      // Apply Boosters
      let multiplier = 1;
      const xpBooster = prev.player.boosters.find(b => b.stat === 'xp' && b.expiry > Date.now());
      if (xpBooster) multiplier += (xpBooster.value / 100);

      // Apply Upgrade Multipliers (e.g. Shop)
      if (prev.upgrades.includes('neural_bridge_1')) multiplier += 0.02;

      const finalAmount = Math.floor(amount * multiplier);
      const newXP = skill.xp + finalAmount;
      
      let newLevel = skill.level;
      while (newLevel < 99 && newXP >= getLevelThreshold(newLevel + 1)) {
        newLevel++;
      }

      const levelUp = newLevel > skill.level;
      if (levelUp) {
        addToast(`${SKILL_DATA[skillId].displayName} Level Up! (${newLevel})`, 'success', '🎉');
      } else if (Math.random() > 0.85 && finalAmount > 5) {
        addToast(`+${finalAmount} XP`, 'xp');
      }

      // Handle HP Level Up MaxHP Increase immediately
      let nextPlayer = { ...prev.player };
      if (skillId === SkillId.HITPOINTS) {
        // Recalculate MaxHP on any XP gain just to be safe, but specifically on level up
        nextPlayer.maxHp = newLevel * 50; // HP Scaling: 50 HP per level
        if (levelUp) nextPlayer.hp = nextPlayer.maxHp; 
      }

      return {
        ...prev,
        player: nextPlayer,
        skills: {
          ...prev.skills,
          [skillId]: {
            ...skill,
            level: newLevel,
            xp: newXP,
            nextLevelXP: getLevelThreshold(newLevel + 1)
          }
        }
      };
    });
  }, [addToast]);

  const addItem = useCallback((itemId: string, qty: number) => {
    setGameState(prev => {
      const item = ITEM_REGISTRY[itemId];
      if (!item) return prev;
      
      const skillState = prev.skills[item.skillId];
      const mastery = skillState.mastery[itemId] || { level: 1, xp: 0 };
      
      // Mastery Double Drop Chance logic (0.5% per level)
      const doubleChance = ((mastery.level - 1) * 0.005);
      const isDouble = Math.random() < doubleChance;
      const finalQty = isDouble ? qty * 2 : qty;

      // Immutable update chain
      const nextSkills = { ...prev.skills };
      const nextSkill = { ...nextSkills[item.skillId] };
      const nextInv = { ...nextSkill.inventory };
      const nextMastery = { ...nextSkill.mastery };

      nextInv[itemId] = (nextInv[itemId] || 0) + finalQty;
      
      // Update Mastery
      let newMXP = mastery.xp + 10;
      let newMLvl = mastery.level;
      while (newMLvl < 99 && newMXP >= getMasteryThreshold(newMLvl + 1)) {
        newMLvl++;
      }
      nextMastery[itemId] = { level: newMLvl, xp: newMXP };

      nextSkill.inventory = nextInv;
      nextSkill.mastery = nextMastery;
      nextSkills[item.skillId] = nextSkill;

      if (isDouble) addToast(`Mastery Bonus: +${finalQty} ${item.itemName}`, 'success', '✨');
      else addToast(`+${finalQty} ${item.itemName}`, 'item');

      return { ...prev, skills: nextSkills };
    });
  }, [addToast]);

  // --- ACTIONS ---

  const handleEquip = (itemId: string) => {
    const item = ITEM_REGISTRY[itemId];
    if (!item || !item.slot) return;
    
    setGameState(prev => {
      const sId = item.skillId;
      if (!prev.skills[sId].inventory[itemId] || prev.skills[sId].inventory[itemId] <= 0) return prev;

      const nextInv = { ...prev.skills[sId].inventory };
      nextInv[itemId]--; 

      const currentEquipped = prev.player.equipment[item.slot!];
      
      if (currentEquipped) {
         const oldItem = ITEM_REGISTRY[currentEquipped.id];
         const oldSId = oldItem.skillId;
         if (oldSId !== sId) {
            const newState = JSON.parse(JSON.stringify(prev));
            newState.skills[sId].inventory[itemId] = nextInv[itemId];
            newState.skills[oldSId].inventory[currentEquipped.id] = (newState.skills[oldSId].inventory[currentEquipped.id] || 0) + 1;
            newState.player.equipment[item.slot!] = { id: itemId, level: 1 };
            addToast(`Equipped ${item.itemName}`, 'success');
            return newState;
         } else {
            nextInv[currentEquipped.id] = (nextInv[currentEquipped.id] || 0) + 1;
         }
      }

      const nextSkills = { ...prev.skills };
      nextSkills[sId] = { ...nextSkills[sId], inventory: nextInv };
      
      addToast(`Equipped ${item.itemName}`, 'success');
      return {
        ...prev,
        skills: nextSkills,
        player: {
          ...prev.player,
          equipment: {
            ...prev.player.equipment,
            [item.slot!]: { id: itemId, level: 1 } 
          }
        }
      };
    });
  };

  const handleUnequip = (slot: EquipSlot) => {
    setGameState(prev => {
      const equipped = prev.player.equipment[slot];
      if (!equipped) return prev;

      const item = ITEM_REGISTRY[equipped.id];
      const nextSkills = { ...prev.skills };
      const nextInv = { ...nextSkills[item.skillId].inventory };
      
      nextInv[equipped.id] = (nextInv[equipped.id] || 0) + 1;
      nextSkills[item.skillId] = { ...nextSkills[item.skillId], inventory: nextInv };

      addToast(`Unequipped ${item.itemName}`, 'alert');
      return {
        ...prev,
        skills: nextSkills,
        player: {
          ...prev.player,
          equipment: { ...prev.player.equipment, [slot]: null }
        }
      };
    });
  };

  const handleEat = (itemId: string) => {
    const item = ITEM_REGISTRY[itemId];
    if (!item || !item.heal) return;

    setGameState(prev => {
      if (prev.player.hp >= prev.player.maxHp) {
        addToast("HP already full!", 'alert');
        return prev;
      }
      
      const nextSkills = { ...prev.skills };
      if (nextSkills[item.skillId].inventory[itemId] <= 0) return prev;

      nextSkills[item.skillId] = {
        ...nextSkills[item.skillId],
        inventory: {
          ...nextSkills[item.skillId].inventory,
          [itemId]: nextSkills[item.skillId].inventory[itemId] - 1
        }
      };

      const healedHp = Math.min(prev.player.maxHp, prev.player.hp + item.heal);
      addToast(`Healed +${item.heal} HP`, 'success', '❤️');
      
      return {
        ...prev,
        skills: nextSkills,
        player: { ...prev.player, hp: healedHp }
      };
    });
  };

  const handleSetAutoEatThreshold = (value: number) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, autoEatThreshold: value / 100 }
    }));
  };

  const handleUseBooster = (itemId: string) => {
    const item = ITEM_REGISTRY[itemId];
    if (!item || !item.boost) return;

    setGameState(prev => {
      const nextSkills = { ...prev.skills };
      if (nextSkills[item.skillId].inventory[itemId] <= 0) return prev;

      nextSkills[item.skillId].inventory[itemId]--;

      const newBooster = {
        id: itemId,
        stat: item.boost!.stat,
        value: item.boost!.value,
        expiry: Date.now() + item.boost!.duration
      };

      const otherBoosters = prev.player.boosters.filter(b => b.stat !== item.boost!.stat);

      addToast(`${item.itemName} Activated!`, 'success', '⚡');
      return {
        ...prev,
        skills: nextSkills,
        player: {
          ...prev.player,
          boosters: [...otherBoosters, newBooster]
        }
      };
    });
  };

  const handleSell = (itemId: string, qty: number) => {
    const item = ITEM_REGISTRY[itemId];
    if (!item) return;

    setGameState(prev => {
      const nextSkills = { ...prev.skills };
      const currentQty = nextSkills[item.skillId].inventory[itemId] || 0;
      const sellQty = Math.min(currentQty, qty);
      
      if (sellQty <= 0) return prev;

      nextSkills[item.skillId].inventory[itemId] -= sellQty;
      
      let unitValue = item.value || 1;
      if (prev.upgrades.includes('bank_overclock_1')) unitValue = Math.floor(unitValue * 1.02);

      const totalValue = unitValue * sellQty;

      addToast(`Sold ${sellQty}x ${item.itemName} for ${formatNumber(totalValue)}`, 'success', '💰');
      return {
        ...prev,
        credits: prev.credits + totalValue,
        skills: nextSkills
      };
    });
  };

  const handleUpgradeItem = (slot: EquipSlot) => {
    setGameState(prev => {
      const equip = prev.player.equipment[slot];
      if (!equip) return prev;
      
      if (equip.level >= GAME_SETTINGS.maxRefineLevel) {
        addToast("Max level reached!", 'alert');
        return prev;
      }
      
      const shardCost = Math.floor(equip.level / 2) + 1;
      const crystalCost = 5 + (equip.level * 12);

      const miningInv = prev.skills[SkillId.MINING].inventory;
      const attackInv = prev.skills[SkillId.ATTACK].inventory; 

      const shards = attackInv['aetheric_shard'] || 0;
      const crystals = miningInv['mana_crystal'] || 0;

      if (shards < shardCost || crystals < crystalCost) {
        addToast("Insufficient Upgrade Materials", 'alert');
        return prev;
      }

      const nextSkills = { ...prev.skills };
      
      // Update Mining Inventory (Crystals)
      nextSkills[SkillId.MINING] = { 
        ...nextSkills[SkillId.MINING],
        inventory: {
          ...miningInv,
          'mana_crystal': crystals - crystalCost
        }
      };

      // Update Attack Inventory (Shards)
      nextSkills[SkillId.ATTACK] = {
        ...nextSkills[SkillId.ATTACK],
        inventory: {
            ...attackInv,
            'aetheric_shard': shards - shardCost
        }
      };

      addToast(`Upgraded to +${equip.level + 1}!`, 'success', '🔨');
      return {
        ...prev,
        skills: nextSkills,
        player: {
          ...prev.player,
          equipment: {
            ...prev.player.equipment,
            [slot]: { ...equip, level: equip.level + 1 }
          }
        }
      };
    });
  };

  const handleBuy = (itemId: string, cost: number, type?: string) => {
    setGameState(prev => {
      if (prev.credits < cost) {
        addToast("Insufficient Credits", 'alert');
        return prev;
      }

      if (type === 'permanent') {
        return {
          ...prev,
          credits: prev.credits - cost,
          upgrades: [...prev.upgrades, itemId]
        };
      } else {
        const item = ITEM_REGISTRY[itemId];
        if (!item) return prev;

        const nextSkills = { ...prev.skills };
        const nextInv = { ...nextSkills[item.skillId].inventory };
        nextInv[itemId] = (nextInv[itemId] || 0) + 1;
        nextSkills[item.skillId] = { ...nextSkills[item.skillId], inventory: nextInv };

        addToast(`Purchased ${item.itemName}`, 'success');
        return {
          ...prev,
          credits: prev.credits - cost,
          skills: nextSkills
        };
      }
    });
  };

  // --- GAME LOOP ---
  // Optimized to use Refs for timing to prevent render lag
  useEffect(() => {
    const loop = setInterval(() => {
      const state = stateRef.current;
      const now = Date.now();

      // 1. Process Boosters Expiry
      if (state.player.boosters.some(b => b.expiry <= now)) {
         setGameState(prev => ({
           ...prev,
           player: { ...prev.player, boosters: prev.player.boosters.filter(b => b.expiry > now) }
         }));
      }

      // 2. Process Active Action
      if (state.activeAction) {
        // --- SKILL ACTION ---
        if (state.activeAction.type === 'skill') {
          const elapsed = now - state.activeAction.startTime;
          if (elapsed >= state.activeAction.duration) {
            const { skillId, itemId } = state.activeAction;
            const item = itemId ? ITEM_REGISTRY[itemId] : null;

            if (item?.inputs) {
              let hasMaterials = true;
              for (const input of item.inputs) {
                const count = Object.values(state.skills).reduce((acc, s) => acc + (s.inventory[input.id] || 0), 0);
                if (count < input.qty) { hasMaterials = false; break; }
              }
              
              if (!hasMaterials) { 
                addToast("Out of materials!", 'alert');
                onStop(); 
                return; 
              }

              setGameState(prev => {
                const next = { ...prev, skills: { ...prev.skills } };
                item.inputs!.forEach(inp => {
                  for (const sId of Object.values(SkillId)) {
                    const inv = next.skills[sId].inventory;
                    if (inv[inp.id] && inv[inp.id] >= inp.qty) {
                      next.skills[sId] = { ...next.skills[sId], inventory: { ...inv, [inp.id]: inv[inp.id] - inp.qty } };
                      break;
                    }
                  }
                });
                return next;
              });
            }

            addXP(skillId, getXP(item?.req || 1));
            if (itemId && skillId !== SkillId.AGILITY) addItem(itemId, 1);

            setGameState(prev => ({
              ...prev,
              activeAction: prev.activeAction ? { ...prev.activeAction, startTime: now } : null
            }));
          }
        } 
        // --- COMBAT ACTION OVERHAUL ---
        else if (state.activeAction.type === 'combat') {
          const delta = now - combatRef.current.lastTick;
          combatRef.current.lastTick = now;

          if (!combatRef.current.isActive) return;

          const monster = MONSTER_DATA[state.activeAction.monsterId!];
          if (!monster) { onStop(); return; }

          combatRef.current.playerTimer += delta;
          combatRef.current.enemyTimer += delta;
          
          const playerInterval = state.activeAction.playerInterval || 2000;
          const enemyInterval = state.activeAction.enemyInterval || 2400;

          let monsterDied = false;
          let playerDied = false;
          let stateUpdateNeeded = false;
          let hits = [...(state.activeAction.combatHits || [])];
          
          let currentEnemyHp = state.activeAction.enemyCurHp || 0;
          let currentPlayerHp = state.activeAction.playerHp || 0;

          // Process Player Attacks
          while (combatRef.current.playerTimer >= playerInterval) {
             combatRef.current.playerTimer -= playerInterval;
             
             // --- PROPER COMBAT CALCULATION ---
             // We use the shared util function to ensure the logic matches the UI.
             const masteryLevel = state.skills[SkillId.ATTACK].mastery[monster.id]?.level || 1;
             const pStats = calculatePlayerCombatStats(state.skills, state.player.equipment, masteryLevel);
             
             // Accuracy Check
             const enemyEvasion = monster.def * 2.5;
             const hitChance = Math.max(0, Math.min(100, (pStats.playerAccuracy / (pStats.playerAccuracy + enemyEvasion)) * 100));
             const isHit = Math.random() * 100 < hitChance;
             
             let dmg = 0;
             if (isHit) {
               dmg = Math.floor(Math.random() * (pStats.maxHit + 1));
               if (dmg > 0) {
                  currentEnemyHp -= dmg;
                  addXP(combatFocus, dmg * 4);
                  addXP(SkillId.HITPOINTS, Math.floor(dmg * 1.33));
               }
             }

             // Record Hit (Even misses)
             hits.push({
               damage: dmg,
               isPlayer: true,
               timestamp: Date.now(),
               isMiss: !isHit || dmg === 0 // Treat 0 damage hit as miss for visual clarity
             });
             stateUpdateNeeded = true;

             if (currentEnemyHp <= 0) {
               currentEnemyHp = 0;
               monsterDied = true;
               stateUpdateNeeded = true;
               break; 
             }
          }

          // Process Enemy Attacks
          while (!monsterDied && combatRef.current.enemyTimer >= enemyInterval) {
             combatRef.current.enemyTimer -= enemyInterval;
             
             // Enemy Hit Calculation (Simplified vs Player Def)
             const pStats = calculatePlayerCombatStats(state.skills, state.player.equipment, 1);
             const enemyAcc = monster.att; 
             const playerEva = pStats.playerDefense * 0.8; // Player defense acts as evasion
             
             // Very simple enemy accuracy formula
             const enemyHitChance = Math.max(10, Math.min(90, (enemyAcc / (enemyAcc + playerEva)) * 100));
             const isEnemyHit = Math.random() * 100 < enemyHitChance;

             let dmg = 0;
             if (isEnemyHit) {
                const maxEnemyHit = Math.floor(monster.att / 6);
                dmg = Math.floor(Math.random() * (maxEnemyHit + 1));
                if (dmg > 0) {
                   currentPlayerHp -= dmg;
                }
             }
             
             // Record Enemy Hit
             if (isEnemyHit && dmg > 0) {
               hits.push({
                 damage: dmg,
                 isPlayer: false,
                 timestamp: Date.now(),
                 isMiss: false
               });
               stateUpdateNeeded = true;
             }

             // Check Auto Eat inside the loop
             if (currentPlayerHp > 0 && currentPlayerHp < state.player.maxHp * state.player.autoEatThreshold) {
                // Find Food
                let foundFoodId: string | null = null;
                let foundFoodSkill: SkillId | null = null;
                for (const sId of Object.values(SkillId)) {
                  const inv = state.skills[sId].inventory;
                  // Fast check
                  for (const k in inv) {
                    if (inv[k] > 0 && ITEM_REGISTRY[k]?.heal) {
                       foundFoodId = k; foundFoodSkill = sId; break;
                    }
                  }
                  if (foundFoodId) break;
                }

                if (foundFoodId && foundFoodSkill) {
                  const heal = ITEM_REGISTRY[foundFoodId].heal || 0;
                  currentPlayerHp = Math.min(state.player.maxHp, currentPlayerHp + heal);
                  
                  // Consume food directly via state update
                  setGameState(prev => {
                    const nextSkills = { ...prev.skills };
                    const nextInv = { ...nextSkills[foundFoodSkill!].inventory };
                    nextInv[foundFoodId!]--;
                    nextSkills[foundFoodSkill!] = { ...nextSkills[foundFoodSkill!], inventory: nextInv };
                    return { ...prev, skills: nextSkills };
                  });
                  stateUpdateNeeded = true;
                }
             }

             if (currentPlayerHp <= 0) {
               currentPlayerHp = 0;
               playerDied = true;
               stateUpdateNeeded = true;
               break; 
             }
          }

          // Prune hits to keep memory low
          if (hits.length > 20) hits = hits.slice(-20);

          // Commit Updates if needed
          if (monsterDied) {
             setGameState(prev => {
                const creditGain = 10 + Math.floor(Math.random() * 10);
                return {
                  ...prev,
                  credits: prev.credits + creditGain,
                  activeAction: {
                    ...prev.activeAction!,
                    enemyCurHp: monster.hp,
                    playerHp: currentPlayerHp,
                    combatHits: [] // Clear hits on respawn
                  }
                };
             });
             monster.drops.forEach(d => {
               if (Math.random() < d.chance) addItem(d.id, 1);
             });
             
             combatRef.current.enemyTimer = 0;
             currentEnemyHp = monster.hp;
          } else if (playerDied) {
             onStop();
             setGameState(prev => ({ ...prev, player: { ...prev.player, hp: Math.floor(prev.player.maxHp * 0.1) } }));
             addToast("You have been defeated!", 'alert');
          } else if (stateUpdateNeeded) {
             setGameState(prev => ({
               ...prev,
               activeAction: {
                 ...prev.activeAction!,
                 enemyCurHp: currentEnemyHp,
                 playerHp: currentPlayerHp,
                 combatHits: hits
               }
             }));
          }
        }
      }
    }, 50); 
    return () => clearInterval(loop);
  }, [addXP, addItem, combatFocus]);

  const onStartSkill = (sId: SkillId, itemId: string) => {
    const item = ITEM_REGISTRY[itemId];
    if (!item) return;

    const mastery = gameState.skills[sId].mastery[itemId] || { level: 1, xp: 0 };
    const efficiencyMult = Math.max(0.5, 1 - ((mastery.level - 1) * 0.002));
    const duration = Math.max(400, getTime(item.req) * 1000 * efficiencyMult);

    setGameState(prev => ({
      ...prev,
      activeAction: {
        type: 'skill', skillId: sId, itemId: itemId, startTime: Date.now(),
        duration: duration, lastTickTime: Date.now()
      }
    }));
  };

  const onStartCombat = (mId: string) => {
    const monster = MONSTER_DATA[mId];
    if (!monster) return;
    
    const hpLvl = gameState.skills[SkillId.HITPOINTS].level;
    const calcMaxHp = hpLvl * 50; 
    const agi = gameState.skills[SkillId.AGILITY].level;
    const playerSpeed = Math.max(600, 2000 - (agi * 8));

    // Reset Combat Ref
    combatRef.current = {
      playerTimer: playerSpeed + 10, 
      enemyTimer: 0,
      lastTick: Date.now(),
      isActive: true
    };

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        maxHp: calcMaxHp,
        hp: prev.player.hp > calcMaxHp ? calcMaxHp : prev.player.hp
      },
      activeAction: {
        type: 'combat', skillId: SkillId.ATTACK, monsterId: mId, 
        startTime: Date.now(),
        duration: 0, 
        enemyCurHp: monster.hp,
        playerHp: prev.player.hp, 
        lastTickTime: Date.now(), 
        combatFocus: combatFocus,
        playerInterval: playerSpeed,
        enemyInterval: 2400,
        combatHits: []
      }
    }));
  };

  const onStop = useCallback(() => {
    combatRef.current.isActive = false; // Kill the ref loop immediately
    setGameState(prev => ({ ...prev, activeAction: null }));
  }, []);

  // --- SAVE / LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) { 
      try { 
        const loadedState = JSON.parse(saved);
        const hpLvl = loadedState.skills[SkillId.HITPOINTS].level || 10;
        loadedState.player.maxHp = hpLvl * 50;
        
        setGameState(loadedState); 
        
        const now = Date.now();
        const diff = now - loadedState.lastSaveTime;
        if (diff > 60000 && loadedState.activeAction) { 
           setOfflineReport({
             durationMs: diff,
             xpGained: {},
             itemsGained: {},
             kills: 0
           });
        }
      } catch (e) {
        console.error("Save load error", e);
      } 
    }
  }, []);

  useEffect(() => { 
    const saver = setInterval(() => {
      setGameState(prev => {
        const next = { ...prev, lastSaveTime: Date.now() };
        localStorage.setItem(SAVE_KEY, JSON.stringify(next));
        return next;
      });
    }, 10000); 
    return () => clearInterval(saver);
  }, []);

  return (
    <div className="flex h-screen bg-[#050608] text-[#94a3b8] overflow-hidden selection:bg-cyan-500/30">
      <div className="fixed top-20 right-6 z-[100] pointer-events-none flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="toast-enter bg-[#0a0c10]/95 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-xl">
            {t.icon && <span className="text-lg">{t.icon}</span>}
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              t.type === 'xp' ? 'text-cyan-400' : 
              t.type === 'item' ? 'text-fuchsia-400' :
              t.type === 'success' ? 'text-green-400' :
              'text-red-400'
            }`}>
              {t.text}
            </span>
          </div>
        ))}
      </div>

      <Sidebar 
        currentSkill={currentSkill} 
        onSelect={(s) => { setCurrentSkill(s); setSidebarOpen(false); }}
        skillLevels={Object.entries(gameState.skills).reduce((acc, [k, v]) => ({ ...acc, [k]: (v as SkillState).level }), {} as Record<string, number>)}
        combatLevel={Math.floor(totalLevel/16)} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onOpenDev={() => setIsDevConsoleOpen(true)} 
        onOpenAccount={() => setIsAccountModalOpen(true)} 
        account={gameState.account}
      />
      
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0 md:ml-60'}`}>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden fixed top-3 left-4 z-[60] p-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
          <i className="fa-solid fa-bars"></i>
        </button>

        <Header 
          credits={gameState.credits} 
          skillId={currentSkill} 
          state={activeSkillState} 
          boosters={gameState.player.boosters}
          isCombatGroup={currentSkill === 'combat' || [SkillId.ATTACK, SkillId.STRENGTH, SkillId.DEFENSE, SkillId.HITPOINTS].includes(currentSkill as any)}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 w-full max-w-[1920px] mx-auto">
          <div className="pb-24">
            {currentSkill === 'inventory' ? <InventoryView skills={gameState.skills} onSell={handleSell} onEquip={handleEquip} onEat={handleEat} onDiscard={() => {}} onUseBooster={handleUseBooster} equipment={gameState.player.equipment} />
            : currentSkill === 'stats' ? <StatsView skills={gameState.skills} totalLevel={totalLevel} equipment={gameState.player.equipment} onUnequip={handleUnequip} onUpgrade={handleUpgradeItem} account={gameState.account} />
            : currentSkill === 'combat' ? 
              <CombatView 
                activeAction={gameState.activeAction} 
                onStart={onStartCombat} 
                onStop={onStop} 
                monsterData={MONSTER_DATA} 
                combatLevel={Math.floor(totalLevel/16)} 
                skills={gameState.skills} 
                equipment={gameState.player.equipment} 
                currentFocus={combatFocus} 
                onFocusChange={setCombatFocus} 
                onEat={handleEat} 
                player={gameState.player} 
                onSetAutoEatThreshold={handleSetAutoEatThreshold}
              />
            : currentSkill === 'mastery' ? <MasteryOverview skills={gameState.skills} />
            : currentSkill === 'market' ? <NexusMarket credits={gameState.credits} onBuy={handleBuy} ownedUpgrades={gameState.upgrades} />
            : <SkillView skillId={currentSkill as SkillId} state={gameState.skills[currentSkill as SkillId]} allSkills={gameState.skills} activeAction={gameState.activeAction} onStart={onStartSkill} onStop={onStop} onEat={handleEat} />}
          </div>
        </main>
      </div>
      
      {offlineReport && (
        <OfflineModal report={offlineReport} onClose={() => setOfflineReport(null)} />
      )}

      {isAccountModalOpen && (
        <AccountModal onClose={() => setIsAccountModalOpen(false)} onRegister={(name) => {
          setGameState(prev => ({ ...prev, account: { username: name, accountId: `USR-${Math.floor(Math.random()*10000)}`, linkedAt: Date.now() } }));
          setIsAccountModalOpen(false);
        }} />
      )}

      {isDevConsoleOpen && <DevConsole onClose={() => setIsDevConsoleOpen(false)} onAddLevel={(s, l) => {
        setGameState(prev => ({ ...prev, skills: { ...prev.skills, [s]: INITIAL_SKILL_STATE(l) } }));
      }} onAddItem={addItem} />}
    </div>
  );
};

export default App;
