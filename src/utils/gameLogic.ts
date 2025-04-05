
import { Animal, AnimalStats, Rarity, BattleResult } from '../types';

export const RARITY_STATS: Record<Rarity, number> = {
  'common': 100,
  'uncommon': 200,
  'rare': 300,
  'super-rare': 400,
  'legendary': 500
};

export const BASE_STATS: AnimalStats = {
  health: 500,
  attack: 50,
  agility: 0,
  critChance: 0,
  critDamage: 0,
  defense: 0
};

// Generate random stats for an animal based on its rarity
export function generateStats(rarity: Rarity): AnimalStats {
  const totalStatPoints = RARITY_STATS[rarity];
  const variance = Math.floor(Math.random() * 51) - 25; // +/- 25
  const actualStatPoints = totalStatPoints + variance;
  
  // Distribute stat points randomly
  const attackPercent = Math.random() * 0.4 + 0.1; // 10-50% for attack
  const agilityPercent = Math.random() * 0.3 + 0.05; // 5-35% for agility
  const critChancePercent = Math.random() * 0.1 + 0.05; // 5-15% for crit chance
  const critDamagePercent = Math.random() * 0.2 + 0.1; // 10-30% for crit damage
  const defensePercent = 1 - attackPercent - agilityPercent - critChancePercent - critDamagePercent; // remaining for defense
  
  return {
    health: BASE_STATS.health,
    attack: BASE_STATS.attack + Math.floor(actualStatPoints * attackPercent),
    agility: BASE_STATS.agility + Math.floor(actualStatPoints * agilityPercent),
    critChance: BASE_STATS.critChance + Math.floor(actualStatPoints * critChancePercent) / 2, // Divide by 2 to get a reasonable percentage
    critDamage: BASE_STATS.critDamage + Math.floor(actualStatPoints * critDamagePercent),
    defense: BASE_STATS.defense + Math.floor(actualStatPoints * defensePercent)
  };
}

// Calculate damage for an attack
export function calculateDamage(attacker: Animal, defender: Animal): number {
  const isCritical = Math.random() * 100 < attacker.stats.critChance;
  const baseDamage = attacker.stats.attack;
  const critMultiplier = isCritical ? (100 + attacker.stats.critDamage) / 100 : 1;
  const damage = Math.max(1, Math.floor((baseDamage * critMultiplier) - defender.stats.defense));
  
  return damage;
}

// Determine attack order based on agility
export function determineAttackOrder(team1: Animal[], team2: Animal[]): Animal[] {
  return [...team1, ...team2].sort((a, b) => b.stats.agility - a.stats.agility);
}

// Simulate a battle between two teams
export function simulateBattle(playerTeam: Animal[], opponentTeam: Animal[], playerElo: number, opponentElo: number): BattleResult {
  // Deep clone to avoid modifying original objects
  const playerTeamClone = JSON.parse(JSON.stringify(playerTeam)) as Animal[];
  const opponentTeamClone = JSON.parse(JSON.stringify(opponentTeam)) as Animal[];
  
  let battleLog: string[] = [];
  battleLog.push("Battle started!");
  
  // Track remaining health for each team
  const playerHealth = new Map<string, number>();
  const opponentHealth = new Map<string, number>();
  
  playerTeamClone.forEach(animal => playerHealth.set(animal.id, animal.stats.health));
  opponentTeamClone.forEach(animal => opponentHealth.set(animal.id, animal.stats.health));
  
  // Battle until one team is defeated
  let round = 1;
  while (playerHealth.size > 0 && opponentHealth.size > 0 && round < 100) { // Limit to 100 rounds to prevent infinite loops
    battleLog.push(`Round ${round} begins!`);
    
    // Determine attack order based on agility
    const attackOrder = determineAttackOrder(
      playerTeamClone.filter(a => playerHealth.has(a.id)),
      opponentTeamClone.filter(a => opponentHealth.has(a.id))
    );
    
    // Each animal takes its turn
    for (const attacker of attackOrder) {
      // Skip if attacker is defeated
      if (!playerHealth.has(attacker.id) && !opponentHealth.has(attacker.id)) continue;
      
      // Determine if attacker is from player team
      const isPlayerTeam = playerTeamClone.some(a => a.id === attacker.id);
      
      // Choose a random target from the opposing team
      const targets = isPlayerTeam 
        ? opponentTeamClone.filter(a => opponentHealth.has(a.id)) 
        : playerTeamClone.filter(a => playerHealth.has(a.id));
        
      if (targets.length === 0) break; // No targets left
      
      const targetIndex = Math.floor(Math.random() * targets.length);
      const defender = targets[targetIndex];
      
      // Calculate damage
      const damage = calculateDamage(attacker, defender);
      
      // Apply damage to target
      const healthMap = isPlayerTeam ? opponentHealth : playerHealth;
      const currentHealth = healthMap.get(defender.id)!;
      const newHealth = Math.max(0, currentHealth - damage);
      healthMap.set(defender.id, newHealth);
      
      // Log the attack
      const isCritical = Math.random() * 100 < attacker.stats.critChance;
      battleLog.push(`${attacker.name} attacks ${defender.name} for ${damage} damage${isCritical ? " (CRITICAL HIT!)" : ""}! ${defender.name} has ${newHealth} health remaining.`);
      
      // Remove defeated animals
      if (newHealth <= 0) {
        battleLog.push(`${defender.name} has been defeated!`);
        healthMap.delete(defender.id);
      }
      
      // Check if battle is over
      if (playerHealth.size === 0 || opponentHealth.size === 0) break;
    }
    
    round++;
  }
  
  // Determine winner
  const winner = playerHealth.size > 0 ? 'player' : 'opponent';
  battleLog.push(`Battle ended! ${winner === 'player' ? 'You' : 'Opponent'} won!`);
  
  // Calculate ELO change
  const expectedOutcome = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualOutcome = winner === 'player' ? 1 : 0;
  const eloChange = Math.round(32 * (actualOutcome - expectedOutcome));
  
  return {
    winner,
    playerTeamRemaining: playerHealth.size,
    opponentTeamRemaining: opponentHealth.size,
    battleLog,
    eloChange
  };
}

// Calculate the effective stat value with plant buffs applied
export function calculateEffectiveStats(animal: Animal, plantBuffs: Partial<AnimalStats> = {}): AnimalStats {
  return {
    health: animal.stats.health + (plantBuffs.health || 0),
    attack: animal.stats.attack + (plantBuffs.attack || 0),
    agility: animal.stats.agility + (plantBuffs.agility || 0),
    critChance: animal.stats.critChance + (plantBuffs.critChance || 0),
    critDamage: animal.stats.critDamage + (plantBuffs.critDamage || 0),
    defense: animal.stats.defense + (plantBuffs.defense || 0)
  };
}
