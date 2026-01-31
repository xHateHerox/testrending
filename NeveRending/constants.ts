
import { SkillId, SkillData, Monster, EquipSlot } from './types';

export const GAME_SETTINGS = {
  xpMultiplier: 1.0,
  baseXP: 10,
  xpGrowth: 1.10, 
  baseTime: 2.5,  
  timeGrowth: 0.12, 
  levelUpBase: 120, 
  levelUpFactor: 1.16, 
  combatRoundDuration: 2200, 
  playerMaxHp: 100,
  maxOfflineCycles: 1440, 
  maxRefineLevel: 12
};

export const MONSTER_DATA: Record<string, Monster> = {
  chicken: { id: "chicken", name: "Farm Chicken", req: 1, hp: 12, att: 2, def: 1, xp: 15, creditRange: [1, 5], drops: [{ id: "feather", chance: 0.8 }, { id: "raw_chicken", chance: 1.0 }] },
  goblin:  { id: "goblin",  name: "Cave Goblin",  req: 1, hp: 45, att: 10, def: 6, xp: 45, creditRange: [5, 15], drops: [{ id: "bones", chance: 1.0 }, { id: "stannum_ore", chance: 0.08 }] },
  cow:     { id: "cow",     name: "Heifer",     req: 1, hp: 90, att: 6, def: 18, xp: 75, creditRange: [10, 25], drops: [{ id: "raw_beef", chance: 1.0 }, { id: "bones", chance: 0.3 }] },
  wolf:    { id: "wolf",    name: "Forest Wolf", req: 12, hp: 320, att: 35, def: 28, xp: 200, creditRange: [40, 80], drops: [{ id: "wolf_pelt", chance: 0.5 }, { id: "bones", chance: 1.0 }] },
  skeleton: { id: "skeleton", name: "Restless Dead", req: 25, hp: 1200, att: 95, def: 70, xp: 600, creditRange: [120, 250], drops: [{ id: "bones", chance: 1.0 }, { id: "ferrum_ore", chance: 0.15 }, { id: "ancient_dust", chance: 0.25 }] },
  giant:   { id: "giant",   name: "Hill Giant", req: 38, hp: 4200, att: 220, def: 130, xp: 1600, creditRange: [400, 900], drops: [{ id: "giant_bone", chance: 1.0 }, { id: "carbon_ore", chance: 0.25 }] },
  ogre:    { id: "ogre",    name: "Ogre Warrior", req: 50, hp: 14000, att: 450, def: 320, xp: 4500, creditRange: [1200, 2500], drops: [{ id: "giant_bone", chance: 1.0 }, { id: "aether_ore", chance: 0.15 }] },
  demon:   { id: "demon",   name: "Greater Fire Demon", req: 60, hp: 45000, att: 950, def: 700, xp: 9500, creditRange: [3500, 7000], drops: [{ id: "demon_ash", chance: 1.0 }, { id: "aetheric_shard", chance: 0.08 }] },
  void_sentinel: { id: "void_sentinel", name: "Shadow Guardian", req: 70, hp: 180000, att: 1800, def: 1400, xp: 35000, isBoss: true, creditRange: [15000, 45000], drops: [{ id: "aetheric_shard", chance: 0.8 }, { id: "void_core", chance: 0.03 }, { id: "zenith_ore", chance: 1.0 }] },
  frost_wyrm: { id: "frost_wyrm", name: "Ancient Frost Wyrm", req: 82, hp: 600000, att: 4800, def: 3500, xp: 95000, creditRange: [40000, 90000], drops: [{ id: "ancient_dust", chance: 1.0, qtyRange: [3, 8] }, { id: "pure_essence", chance: 0.15 }] },
  void_reaver: { id: "void_reaver", name: "Void Reaver Lord", req: 90, hp: 2000000, att: 8500, def: 6500, xp: 250000, creditRange: [120000, 350000], drops: [{ id: "void_core", chance: 0.15 }, { id: "aetheric_shard", chance: 1.0, qtyRange: [2, 4] }] },
  astral_behemoth: { id: "astral_behemoth", name: "Celestial Behemoth", req: 97, hp: 6500000, att: 14500, def: 9500, xp: 1200000, isBoss: true, creditRange: [500000, 1500000], drops: [{ id: "astral_prism", chance: 0.4 }, { id: "pure_essence", chance: 1.0, qtyRange: [2, 6] }] },
  void_god: { id: "void_god", name: "Chronos - The Void God", req: 99, hp: 15000000, att: 22000, def: 15000, xp: 6500000, isBoss: true, creditRange: [5000000, 15000000], drops: [{ id: "void_core", chance: 1.0, qtyRange: [3, 7] }, { id: "astral_prism", chance: 1.0 }, { id: "pure_essence", chance: 1.0, qtyRange: [15, 30] }] }
};

export const SKILL_DATA: Record<SkillId, SkillData> = {
  [SkillId.MINING]: {
    displayName: "Mining", icon: "⛏️", hubName: "Crystal Caves", actionWord: "Mining", desc: "Extraction of precious ores and mythical geological clusters.",
    items: [
      { id: "stannum_ore",   name: "Stannum Vein",  itemName: "Stannum Ore",  req: 1, value: 2 },
      { id: "cuprum_ore",    name: "Cuprum Vein",   itemName: "Cuprum Ore",   req: 5, value: 5 },
      { id: "argent_ore",    name: "Argent Vein",      itemName: "Argent Ore",   req: 15, value: 12 },
      { id: "carbon_ore",    name: "Carbon Seam",      itemName: "Carbon",       req: 25, value: 25 },
      { id: "ferrum_ore",    name: "Ferrum Vein",   itemName: "Ferrum Ore",   req: 35, value: 50 },
      { id: "limestone_ore", name: "Limestone Rock",  itemName: "Limestone",    req: 45, value: 100 },
      { id: "aurum_ore",     name: "Aurum Vein",       itemName: "Aurum Ore",    req: 55, value: 250 },
      { id: "platina_ore",   name: "Platina Rock",     itemName: "Platina Ore",  req: 65, value: 600 },
      { id: "mana_crystal",  name: "Mana Crystal", itemName: "Mana Crystal", req: 70, value: 1200 },
      { id: "aether_ore",    name: "Aether Stone",      itemName: "Aether Ore",   req: 78, value: 3500 },
      { id: "durasteel_ore", name: "Durasteel Rock",   itemName: "Durasteel Ore",req: 84, value: 8000 },
      { id: "ancient_dust",  name: "Ancient Dust", itemName: "Ancient Dust", req: 85, value: 1500, description: "Dust from ancient bones and minerals." },
      { id: "zenith_ore",    name: "Zenith Stone",      itemName: "Zenith Ore",   req: 92, value: 25000 },
      { id: "void_core",     name: "Void Core", itemName: "Void Core", req: 94, value: 45000, description: "The condensed essence of the void." },
      { id: "duraglass_ore", name: "Dura-Glass Vein", itemName: "Dura-Glass", req: 95, value: 65000 },
      { id: "astral_prism",  name: "Astral Prism", itemName: "Astral Prism", req: 96, value: 85000, description: "Refracts light into physical matter." },
      { id: "astralite_ore", name: "Astralite Vein", itemName: "Astralite Ore", req: 98, value: 150000 },
      { id: "voidstone_ore", name: "Voidstone Cluster", itemName: "Voidstone Ore", req: 99, value: 500000 }
    ]
  },
  [SkillId.FORESTRY]: {
    displayName: "Forestry", icon: "🪓", hubName: "Whispering Woods", actionWord: "Chopping", desc: "Harvesting rare timber from ancient and enchanted trees.",
    items: [
      { id: "core_logs",    name: "Core Tree",    itemName: "Core Logs",     req: 1, value: 3 },
      { id: "weeping_logs", name: "Weeping Tree",     itemName: "Weeping Logs",  req: 12, value: 15 },
      { id: "willow_logs",  name: "Gnarled Willow",   itemName: "Willow Logs",   req: 28, value: 45 },
      { id: "amber_logs",   name: "Amber Tree",   itemName: "Amber Logs",    req: 45, value: 150 },
      { id: "ironbark_logs",name: "Ironbark Tree",    itemName: "Ironbark Logs", req: 60, value: 500 },
      { id: "mystic_logs",  name: "Mystic Tree",      itemName: "Mystic Logs",   req: 75, value: 2000 },
      { id: "ancient_logs", name: "Ancient Tree",     itemName: "Ancient Logs",  req: 85, value: 7500 },
      { id: "shadow_logs",  name: "Shadow Willow",    itemName: "Shadow Logs",   req: 92, value: 30000 },
      { id: "elder_logs",   name: "Elder Tree",       itemName: "Elder Logs",    req: 96, value: 120000 },
      { id: "ghost_logs",   name: "Ghostwood Tree",   itemName: "Ghostwood Logs", req: 98, value: 450000 },
      { id: "soulbark_logs",name: "Soulbark Tree",    itemName: "Soulbark Logs", req: 99, value: 1200000 }
    ]
  },
  [SkillId.COOKING]: {
    displayName: "Cooking", icon: "🔥", hubName: "Chef's Hearth", actionWord: "Cooking", desc: "Preparing hearty meals and rations for long journeys.",
    items: [
      // Recipes
      { id: "cooked_shrimp", name: "Grilled Shrimp", itemName: "Grilled Shrimp", req: 1, heal: 10, value: 10, inputs: [{ id: "raw_shrimp", qty: 1 }] },
      { id: "cooked_chicken", name: "Roast Chicken", itemName: "Roast Chicken", req: 8, heal: 15, value: 25, inputs: [{ id: "raw_chicken", qty: 1 }] },
      { id: "cooked_meat", name: "Hearty Stew", itemName: "Hearty Stew", req: 18, heal: 25, value: 60, inputs: [{ id: "raw_beef", qty: 1 }] },
      { id: "cooked_sardine", name: "Baked Sardine", itemName: "Baked Sardine", req: 30, heal: 45, value: 150, inputs: [{ id: "raw_sardine", qty: 1 }] },
      { id: "cooked_salmon", name: "Seared Salmon", itemName: "Seared Salmon", req: 45, heal: 75, value: 450, inputs: [{ id: "raw_salmon", qty: 1 }] },
      { id: "cooked_tuna", name: "Tuna Steak", itemName: "Tuna Steak", req: 60, heal: 110, value: 1200, inputs: [{ id: "raw_tuna", qty: 1 }] },
      { id: "cooked_lobster", name: "Boiled Lobster", itemName: "Boiled Lobster", req: 75, heal: 160, value: 4000, inputs: [{ id: "raw_lobster", qty: 1 }] },
      { id: "cooked_swordfish", name: "Pan-Seared Swordfish", itemName: "Seared Swordfish", req: 85, heal: 250, value: 12000, inputs: [{ id: "raw_swordfish", qty: 1 }] },
      // Intertwined: High level cooking now requires Herbs (Botany)
      { id: "cooked_angler", name: "Glow-Stew", itemName: "Glow-Stew", req: 92, heal: 400, value: 50000, inputs: [{ id: "raw_angler", qty: 1 }, { id: "sun_moss", qty: 5 }] },
      { id: "cooked_solar", name: "Solar Carp Fillet", itemName: "Solar Fillet", req: 96, heal: 650, value: 250000, inputs: [{ id: "raw_solar_carp", qty: 1 }, { id: "frostpetal", qty: 2 }] },
      { id: "cooked_kraken", name: "Kraken Tentacle", itemName: "Grilled Kraken", req: 98, heal: 1000, value: 1000000, inputs: [{ id: "raw_kraken", qty: 1 }, { id: "aetherbloom", qty: 1 }] },
      { id: "cooked_void_whale", name: "Void Whale Steak", itemName: "Void Fillet", req: 99, heal: 2500, value: 5000000, inputs: [{ id: "raw_void_whale", qty: 1 }, { id: "zenith_rose", qty: 1 }] }
    ]
  },
  [SkillId.FISHING]: {
    displayName: "Fishing", icon: "🎣", hubName: "Azure Coast", actionWord: "Fishing", desc: "Catching rare aquatic life from the deep oceans and rivers.",
    items: [
      { id: "raw_shrimp",    name: "Net Fishing", itemName: "Raw Shrimp",  req: 1, value: 4 },
      { id: "raw_sardine",   name: "Bait Fishing", itemName: "Raw Sardine", req: 15, value: 25 },
      { id: "raw_salmon",    name: "Lure Fishing",   itemName: "Raw Salmon",  req: 35, value: 120 },
      { id: "raw_tuna",      name: "Harpoon Fishing", itemName: "Raw Tuna",    req: 55, value: 450 },
      { id: "raw_lobster",   name: "Cage Fishing", itemName: "Raw Lobster", req: 70, value: 1800 },
      { id: "raw_swordfish", name: "Big Game Fishing", itemName: "Raw Swordfish", req: 82, value: 6500 },
      { id: "raw_angler",    name: "Deep-Sea Glow-Fishing", itemName: "Raw Angler", req: 90, value: 35000 },
      { id: "raw_solar_carp",name: "Surface Lure Fishing", itemName: "Raw Solar Carp", req: 95, value: 150000 },
      { id: "raw_kraken",    name: "Mythic Fishing", itemName: "Raw Kraken", req: 98, value: 750000 },
      { id: "raw_void_whale",name: "Dimensional Fishing", itemName: "Raw Void Whale", req: 99, value: 3500000 }
    ]
  },
  [SkillId.SMITHING]: {
    displayName: "Smithing", icon: "🔨", hubName: "Great Forge", actionWord: "Smithing", desc: "Hammering raw ores into powerful weapons and armor.",
    items: [
      // BRONZE TIER (Req 1-25)
      { id: "bar_bronze", name: "Bronze Smelting", itemName: "Bronze Bar", req: 1, value: 10, inputs: [{ id: "stannum_ore", qty: 1 }, { id: "cuprum_ore", qty: 1 }] },
      { id: "bronze_dagger", name: "Bronze Dagger", itemName: "Bronze Dagger", req: 5, value: 40, atkBonus: 2, strBonus: 1, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_bronze", qty: 3 }] },
      { id: "bronze_helm", name: "Bronze Helm", itemName: "Bronze Helm", req: 8, value: 50, defBonus: 3, slot: EquipSlot.HEAD, inputs: [{ id: "bar_bronze", qty: 4 }] },
      { id: "bronze_shield", name: "Bronze Shield", itemName: "Bronze Shield", req: 10, value: 75, defBonus: 5, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_bronze", qty: 6 }] },
      { id: "bronze_legs", name: "Bronze Legs", itemName: "Bronze Legs", req: 14, value: 90, defBonus: 7, slot: EquipSlot.LEGS, inputs: [{ id: "bar_bronze", qty: 8 }] },
      { id: "bronze_plate", name: "Bronze Plate", itemName: "Bronze Plate", req: 18, value: 150, defBonus: 12, slot: EquipSlot.CHEST, inputs: [{ id: "bar_bronze", qty: 12 }] },
      
      // FERRUM TIER (Req 30-55)
      { id: "bar_ferrum", name: "Ferrum Smelting", itemName: "Ferrum Bar", req: 30, value: 150, inputs: [{ id: "ferrum_ore", qty: 1 }, { id: "carbon_ore", qty: 1 }] },
      { id: "ferrum_dagger", name: "Ferrum Dagger", itemName: "Ferrum Dagger", req: 35, value: 600, atkBonus: 12, strBonus: 10, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_ferrum", qty: 8 }] },
      { id: "ferrum_helm", name: "Ferrum Helm", itemName: "Ferrum Helm", req: 38, value: 750, defBonus: 15, slot: EquipSlot.HEAD, inputs: [{ id: "bar_ferrum", qty: 10 }] },
      { id: "ferrum_shield", name: "Ferrum Shield", itemName: "Ferrum Shield", req: 42, value: 1000, defBonus: 22, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_ferrum", qty: 12 }] },
      { id: "ferrum_legs", name: "Ferrum Legs", itemName: "Ferrum Legs", req: 46, value: 1500, defBonus: 30, slot: EquipSlot.LEGS, inputs: [{ id: "bar_ferrum", qty: 18 }] },
      { id: "ferrum_plate", name: "Ferrum Plate", itemName: "Ferrum Plate", req: 50, value: 2500, defBonus: 45, slot: EquipSlot.CHEST, inputs: [{ id: "bar_ferrum", qty: 25 }] },
      
      // STEEL TIER (Req 60-80)
      { id: "bar_steel", name: "Steel Refining", itemName: "Steel Bar", req: 60, value: 800, inputs: [{ id: "ferrum_ore", qty: 2 }, { id: "carbon_ore", qty: 3 }] },
      { id: "steel_dagger", name: "Steel Dagger", itemName: "Steel Dagger", req: 65, value: 4500, atkBonus: 35, strBonus: 25, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_steel", qty: 15 }] },
      { id: "steel_helm", name: "Steel Helm", itemName: "Steel Helm", req: 68, value: 5500, defBonus: 40, slot: EquipSlot.HEAD, inputs: [{ id: "bar_steel", qty: 18 }] },
      { id: "steel_shield", name: "Steel Shield", itemName: "Steel Shield", req: 72, value: 7500, defBonus: 60, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_steel", qty: 20 }] },
      { id: "steel_legs", name: "Steel Legs", itemName: "Steel Legs", req: 76, value: 12000, defBonus: 85, slot: EquipSlot.LEGS, inputs: [{ id: "bar_steel", qty: 30 }] },
      { id: "steel_plate", name: "Steel Plate", itemName: "Steel Plate", req: 80, value: 18000, defBonus: 120, slot: EquipSlot.CHEST, inputs: [{ id: "bar_steel", qty: 40 }] },
      
      // AETHER TIER (Req 85-95)
      { id: "bar_aether", name: "Aether Smelting", itemName: "Aether Bar", req: 85, value: 12000, inputs: [{ id: "aether_ore", qty: 3 }, { id: "carbon_ore", qty: 8 }] },
      { id: "aether_blade", name: "Aether Blade", itemName: "Aether Blade", req: 88, value: 95000, atkBonus: 85, strBonus: 70, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_aether", qty: 25 }] },
      { id: "aether_helm", name: "Aether Helm", itemName: "Aether Helm", req: 90, value: 110000, defBonus: 120, slot: EquipSlot.HEAD, inputs: [{ id: "bar_aether", qty: 30 }] },
      { id: "aether_shield", name: "Aether Shield", itemName: "Aether Shield", req: 92, value: 150000, defBonus: 180, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_aether", qty: 35 }] },
      { id: "aether_legs", name: "Aether Legs", itemName: "Aether Legs", req: 94, value: 250000, defBonus: 250, slot: EquipSlot.LEGS, inputs: [{ id: "bar_aether", qty: 50 }] },
      { id: "aether_plate", name: "Aether Plate", itemName: "Aether Plate", req: 95, value: 450000, defBonus: 350, slot: EquipSlot.CHEST, inputs: [{ id: "bar_aether", qty: 75 }] },
      
      // ZENITH TIER (Req 97-99)
      { id: "bar_zenith", name: "Zenith Smelting", itemName: "Zenith Bar", req: 97, value: 150000, inputs: [{ id: "zenith_ore", qty: 5 }, { id: "carbon_ore", qty: 15 }] },
      { id: "zenith_blade", name: "Zenith Blade", itemName: "Zenith Blade", req: 98, value: 1200000, atkBonus: 350, strBonus: 280, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_zenith", qty: 40 }] },
      { id: "zenith_helm", name: "Zenith Helm", itemName: "Zenith Helm", req: 98, value: 1500000, defBonus: 500, slot: EquipSlot.HEAD, inputs: [{ id: "bar_zenith", qty: 45 }] },
      { id: "zenith_shield", name: "Zenith Shield", itemName: "Zenith Shield", req: 99, value: 2500000, defBonus: 650, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_zenith", qty: 60 }] },
      { id: "zenith_legs", name: "Zenith Legs", itemName: "Zenith Legs", req: 99, value: 3500000, defBonus: 750, slot: EquipSlot.LEGS, inputs: [{ id: "bar_zenith", qty: 85 }] },
      { id: "zenith_plate", name: "Zenith Plate", itemName: "Zenith Plate", req: 99, value: 5000000, defBonus: 950, slot: EquipSlot.CHEST, inputs: [{ id: "bar_zenith", qty: 120 }] },
      
      // VOID TIER (Req 99)
      // Intertwined: Requires Demon Ash (Combat/Enchanting) as a binding agent
      { id: "bar_void", name: "Void Smelting", itemName: "Void Bar", req: 99, value: 2500000, inputs: [{ id: "voidstone_ore", qty: 10 }, { id: "pure_essence", qty: 5 }, { id: "demon_ash", qty: 5 }] },
      { id: "void_blade", name: "Void Blade", itemName: "Void Blade", req: 99, value: 25000000, atkBonus: 750, strBonus: 600, slot: EquipSlot.WEAPON, inputs: [{ id: "bar_void", qty: 50 }, { id: "void_core", qty: 8 }] },
      { id: "void_helm", name: "Void Helm", itemName: "Void Helm", req: 99, value: 45000000, defBonus: 1500, slot: EquipSlot.HEAD, inputs: [{ id: "bar_void", qty: 80 }, { id: "void_core", qty: 12 }] },
      { id: "void_shield", name: "Void Shield", itemName: "Void Shield", req: 99, value: 85000000, defBonus: 2000, slot: EquipSlot.SHIELD, inputs: [{ id: "bar_void", qty: 100 }, { id: "void_core", qty: 15 }] },
      { id: "void_legs", name: "Void Legs", itemName: "Void Legs", req: 99, value: 120000000, defBonus: 2200, slot: EquipSlot.LEGS, inputs: [{ id: "bar_void", qty: 125 }, { id: "void_core", qty: 20 }] },
      { id: "void_plate", name: "Void Plate", itemName: "Void Plate", req: 99, value: 150000000, defBonus: 2500, slot: EquipSlot.CHEST, inputs: [{ id: "bar_void", qty: 150 }, { id: "pure_essence", qty: 30 }] }
    ]
  },
  [SkillId.JEWELRY]: {
    displayName: "Jewelry", icon: "💎", hubName: "Gemstone Sanctum", actionWord: "Engraving", desc: "Forging magical accessories that amplify physical and mystical prowess.",
    items: [
      { id: "silver_ring", name: "Silver Ring", itemName: "Silver Ring", req: 10, value: 250, accMult: 0.05, slot: EquipSlot.RING, description: "Provides +5% Weapon Accuracy.", inputs: [{ id: "argent_ore", qty: 12 }] },
      { id: "gold_amulet", name: "Gold Amulet", itemName: "Gold Amulet", req: 35, value: 1500, dmgMult: 0.05, slot: EquipSlot.NECK, description: "Provides +5% Raw Damage.", inputs: [{ id: "aurum_ore", qty: 15 }] },
      { id: "aether_ring", name: "Aether Band", itemName: "Aether Band", req: 60, value: 12000, accMult: 0.15, slot: EquipSlot.RING, description: "Provides +15% Weapon Accuracy.", inputs: [{ id: "aether_ore", qty: 25 }] },
      { id: "platina_band", name: "Platina Band", itemName: "Platina Band", req: 80, value: 85000, accMult: 0.25, slot: EquipSlot.RING, description: "Provides +25% Weapon Accuracy.", inputs: [{ id: "platina_ore", qty: 20 }] },
      { id: "durasteel_amulet", name: "Durasteel Amulet", itemName: "Dura-Amulet", req: 90, value: 450000, dmgMult: 0.40, slot: EquipSlot.NECK, description: "Provides +40% Raw Damage.", inputs: [{ id: "durasteel_ore", qty: 50 }] },
      { id: "astral_band", name: "Astral Prism Band", itemName: "Astral Band", req: 97, value: 2500000, accMult: 0.50, slot: EquipSlot.RING, description: "Provides +50% Weapon Accuracy.", inputs: [{ id: "astralite_ore", qty: 30 }, { id: "astral_prism", qty: 4 }] },
      { id: "singularity_loop", name: "Singularity Loop", itemName: "Singularity Loop", req: 99, value: 75000000, accMult: 1.25, dmgMult: 1.25, slot: EquipSlot.RING, description: "The ultimate relic: +125% Accuracy & Damage.", inputs: [{ id: "voidstone_ore", qty: 50 }, { id: "astral_prism", qty: 10 }, { id: "pure_essence", qty: 25 }] }
    ]
  },
  [SkillId.ENCHANTING]: {
    displayName: "Enchanting", icon: "✨", hubName: "Astral Altar", actionWord: "Enchanting", desc: "Infusing raw essence into runes for devastating combat potential.",
    items: [
      { id: "minor_rune", name: "Minor Rune", itemName: "Minor Rune", req: 5, value: 25, description: "Temporary +5 ATK for 5 mins.", boost: { stat: 'atk', value: 5, duration: 300000 }, inputs: [{ id: "core_logs", qty: 20 }] },
      { id: "nature_rune", name: "Nature Rune", itemName: "Nature Rune", req: 30, value: 150, description: "Temporary +20 ATK for 5 mins.", boost: { stat: 'atk', value: 20, duration: 300000 }, inputs: [{ id: "weeping_logs", qty: 25 }] },
      { id: "fire_rune", name: "Fire Rune", itemName: "Fire Rune", req: 60, value: 1200, description: "Temporary +65 ATK for 5 mins.", boost: { stat: 'atk', value: 65, duration: 300000 }, inputs: [{ id: "ironbark_logs", qty: 30 }, { id: "demon_ash", qty: 12 }] },
      { id: "major_rune", name: "Major Rune", itemName: "Major Rune", req: 85, value: 8500, description: "Temporary +150 ATK for 5 mins.", boost: { stat: 'atk', value: 150, duration: 300000 }, inputs: [{ id: "ancient_logs", qty: 40 }] },
      { id: "solar_rune", name: "Solar Rune", itemName: "Solar Rune", req: 95, value: 50000, description: "Temporary +350 ATK for 5 mins.", boost: { stat: 'atk', value: 350, duration: 300000 }, inputs: [{ id: "elder_logs", qty: 50 }, { id: "pure_essence", qty: 5 }] },
      { id: "void_rune", name: "Void Rune", itemName: "Void Rune", req: 99, value: 450000, description: "Temporary +850 ATK for 2 mins.", boost: { stat: 'atk', value: 850, duration: 120000 }, inputs: [{ id: "soulbark_logs", qty: 60 }, { id: "pure_essence", qty: 20 }, { id: "void_core", qty: 5 }] }
    ]
  },
  [SkillId.AGILITY]: {
    displayName: "Agility", icon: "🏃", hubName: "Training Grounds", actionWord: "Training", desc: "Mastering movement and reflexes to evade any strike.",
    items: [
      { id: "obstacle_basic",  name: "Footwork Drill",   itemName: "Agility XP", req: 1, value: 0 },
      { id: "wall_climb",      name: "Scaling Walls",     itemName: "Agility XP", req: 20, value: 0 },
      { id: "rope_balance",    name: "Tightrope Walk",    itemName: "Agility XP", req: 40, value: 0 },
      { id: "rooftop_run",     name: "Rooftop Sprint",   itemName: "Agility XP", req: 60, value: 0 },
      { id: "parkour_circuit", name: "Combat Evasion",   itemName: "Agility XP", req: 80, value: 0 },
      { id: "mountain_scaling",name: "Peak Ascent",      itemName: "Agility XP", req: 90, value: 0 },
      { id: "void_leap",       name: "Dimensional Leaping", itemName: "Agility XP", req: 97, value: 0 },
      { id: "void_parkour",    name: "Endless Void Circuit", itemName: "Agility XP", req: 99, value: 0 }
    ]
  },
  [SkillId.BOTANY]: {
    displayName: "Botany", icon: "🌿", hubName: "Secret Garden", actionWord: "Growing", desc: "Cultivating magical herbs and flora for alchemical use.",
    items: [
      // Intertwined: High level Botany requires seeds from Thievery
      { id: "sun_moss", name: "Sun Moss", itemName: "Sun Moss", req: 1, value: 15 },
      { id: "nightshade", name: "Nightshade", itemName: "Nightshade", req: 30, value: 85, inputs: [{ id: "nightshade_seed", qty: 1 }] },
      { id: "frostpetal", name: "Frostpetal", itemName: "Frostpetal", req: 60, value: 450, inputs: [{ id: "ancient_dust", qty: 15 }] },
      { id: "aetherbloom", name: "Aetherbloom", itemName: "Aetherbloom", req: 80, value: 2500, inputs: [{ id: "aetheric_shard", qty: 2 }] },
      { id: "void_fern", name: "Void Fern", itemName: "Void Fern", req: 95, value: 15000, inputs: [{ id: "void_seed", qty: 1 }] },
      { id: "zenith_rose", name: "Zenith Rose", itemName: "Zenith Rose", req: 99, value: 120000, inputs: [{ id: "pure_essence", qty: 15 }, { id: "astral_seed", qty: 1 }] }
    ]
  },
  [SkillId.ALCHEMY]: {
    displayName: "Alchemy", icon: "🧪", hubName: "Alchemist's Lab", actionWord: "Brewing", desc: "Brewing powerful potions and elixirs from harvested components.",
    items: [
      // Intertwined: Alchemy requires Combat drops and Mining ores
      { id: "agility_pot", name: "Agility Potion", itemName: "Agility Potion", req: 5, value: 200, description: "Boosts AGI by +10 for 10 mins.", boost: { stat: 'agi', value: 10, duration: 600000 }, inputs: [{ id: "sun_moss", qty: 10 }] },
      { id: "strength_elixir", name: "Strength Elixir", itemName: "Strength Elixir", req: 40, value: 1500, description: "Boosts STR by +35 for 10 mins.", boost: { stat: 'str', value: 35, duration: 600000 }, inputs: [{ id: "nightshade", qty: 15 }, { id: "giant_bone", qty: 2 }] },
      { id: "iron_skin", name: "Iron Skin Tonic", itemName: "Iron Skin Tonic", req: 70, value: 8500, description: "Boosts DEF by +100 for 10 mins.", boost: { stat: 'def', value: 100, duration: 600000 }, inputs: [{ id: "frostpetal", qty: 25 }, { id: "limestone_ore", qty: 5 }, { id: "raw_lobster", qty: 5 }] },
      { id: "exp_elixir", name: "Wisdom Tincture", itemName: "Wisdom Tincture", req: 85, value: 35000, description: "A moderate +25% XP boost for 5 mins.", boost: { stat: 'xp', value: 25, duration: 300000 }, inputs: [{ id: "aetherbloom", qty: 10 }, { id: "mana_crystal", qty: 2 }] },
      { id: "eternal_draught", name: "Eternal Draught", itemName: "Eternal Draught", req: 92, value: 150000, description: "Boosts STR by +800 for 5 mins.", boost: { stat: 'str', value: 800, duration: 300000 }, inputs: [{ id: "zenith_rose", qty: 8 }, { id: "void_core", qty: 4 }] },
      { id: "zenith_draught", name: "Zenith Draught", itemName: "Zenith Draught", req: 99, value: 850000, description: "Boosts ATK by +2000 for 1 min.", boost: { stat: 'atk', value: 2000, duration: 60000 }, inputs: [{ id: "zenith_rose", qty: 25 }, { id: "pure_essence", qty: 50 }, { id: "raw_void_whale", qty: 1 }] }
    ]
  },
  [SkillId.THIEVERY]: {
    displayName: "Thievery", icon: "🧤", hubName: "Thieves' Den", actionWord: "Stealing", desc: "Infiltrating pockets and vaults to liberate precious assets.",
    items: [
      { id: "stolen_pouch", name: "Pickpocketing", itemName: "Stolen Pouch", req: 1, value: 25 },
      { id: "silverware", name: "Merchant's Stall", itemName: "Silverware", req: 25, value: 150 },
      { id: "nightshade_seed", name: "Noble's Safe", itemName: "Nightshade Seed", req: 25, value: 1200 },
      { id: "archive_loot", name: "Ancient Archive", itemName: "Ancient Archive", req: 75, value: 8500 },
      { id: "void_seed", name: "Guild Vault", itemName: "Void Seed", req: 85, value: 65000 },
      { id: "astral_seed", name: "Celestial Vault", itemName: "Astral Seed", req: 95, value: 450000 }
    ]
  },
  [SkillId.SCRIBING]: {
    displayName: "Scribing", icon: "📜", hubName: "Wizard's Tower", actionWord: "Writing", desc: "Writing magical scrolls and runes on prepared parchment.",
    items: [
      { id: "apprentice_scroll", name: "Apprentice Scroll", itemName: "Apprentice Scroll", req: 5, value: 450, description: "Provides +10% XP for 10 mins.", boost: { stat: 'xp', value: 10, duration: 600000 }, inputs: [{ id: "core_logs", qty: 15 }, { id: "stolen_pouch", qty: 5 }] },
      { id: "heroic_tome", name: "Heroic Tome", itemName: "Heroic Tome", req: 45, value: 4500, description: "Provides +25% XP for 15 mins.", boost: { stat: 'xp', value: 25, duration: 900000 }, inputs: [{ id: "weeping_logs", qty: 25 }, { id: "silverware", qty: 10 }] },
      { id: "forbidden_scroll", name: "Forbidden Scroll", itemName: "Forbidden Scroll", req: 85, value: 65000, description: "Provides +35% XP for 20 mins.", boost: { stat: 'xp', value: 35, duration: 1200000 }, inputs: [{ id: "shadow_logs", qty: 40 }, { id: "pure_essence", qty: 10 }] },
      { id: "cosmic_decree", name: "Cosmic Decree", itemName: "Cosmic Decree", req: 99, value: 1200000, description: "Provides +50% XP for 30 mins.", boost: { stat: 'xp', value: 50, duration: 1800000 }, inputs: [{ id: "soulbark_logs", qty: 100 }, { id: "astral_prism", qty: 15 }, { id: "pure_essence", qty: 50 }] }
    ]
  },
  [SkillId.ATTACK]: { 
    displayName: "Attack", 
    icon: "⚔️", 
    hubName: "Shattered Plains", 
    desc: "Precision and accuracy in battle.", 
    actionWord: "Fight", 
    items: [
      // Loot Table Registration (Ensures drops exist in registry)
      { id: "feather", name: "Feather", itemName: "Feather", req: 1, value: 1 },
      { id: "bones", name: "Bones", itemName: "Bones", req: 1, value: 1 },
      { id: "wolf_pelt", name: "Wolf Pelt", itemName: "Wolf Pelt", req: 1, value: 25 },
      { id: "giant_bone", name: "Giant Bone", itemName: "Giant Bone", req: 1, value: 150 },
      { id: "aetheric_shard", name: "Aetheric Shard", itemName: "Aetheric Shard", req: 1, value: 5000, description: "A volatile shard of pure energy used for gear enhancement." },
      { id: "raw_chicken", name: "Raw Chicken", itemName: "Raw Chicken", req: 1, value: 5 },
      { id: "raw_beef", name: "Raw Beef", itemName: "Raw Beef", req: 1, value: 15 },
      { id: "demon_ash", name: "Demon Ash", itemName: "Demon Ash", req: 1, value: 300, description: "Ash collected from slain demons." },
      { id: "pure_essence", name: "Pure Essence", itemName: "Pure Essence", req: 1, value: 500, description: "Raw magical essence used in high-level crafting." }
    ], 
    monsters: Object.values(MONSTER_DATA) 
  },
  [SkillId.STRENGTH]: { displayName: "Strength", icon: "💪", hubName: "Shattered Plains", desc: "Raw physical power and impact.", actionWord: "Fight", items: [], monsters: Object.values(MONSTER_DATA) },
  [SkillId.DEFENSE]: { displayName: "Defense", icon: "🛡️", hubName: "Shattered Plains", desc: "Hardiness and mitigation.", actionWord: "Fight", items: [], monsters: Object.values(MONSTER_DATA) },
  [SkillId.HITPOINTS]: { displayName: "Hitpoints", icon: "❤️", hubName: "Shattered Plains", desc: "Vitality and life force.", actionWord: "Live", items: [] }
};

export const SHOP_DATA = {
  consumables: [
    { id: 'cooked_lobster', price: 15000, name: 'Combat Ration: Lobster', desc: 'Instant +160 HP recovery.' },
    { id: 'exp_elixir', price: 250000, name: 'Wisdom Tincture', desc: 'Temporary +25% Global XP boost.' }
  ],
  materials: [
    { id: 'stannum_ore', price: 50, name: 'Stannum Ore', desc: 'Basic ore for smithing starters.' },
    { id: 'cuprum_ore', price: 120, name: 'Cuprum Ore', desc: 'Secondary ore for smithing starters.' },
    { id: 'core_logs', price: 75, name: 'Core Wood', desc: 'Basic timber for crafting and scribing.' }
  ],
  upgrades: [
    { id: 'bank_overclock_1', price: 250000, name: 'Bank Overclock v1', desc: 'Permanently increases all sell values by 2%.', type: 'permanent', bonus: 0.02 },
    { id: 'neural_bridge_1', price: 1000000, name: 'Neural Bridge v1', desc: 'Permanently increases all XP gains by 2%.', type: 'permanent', bonus: 0.02 }
  ]
};
