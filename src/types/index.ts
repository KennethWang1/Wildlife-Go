
export type Rarity = 'common' | 'uncommon' | 'rare' | 'super-rare' | 'legendary';

export interface AnimalStats {
  health: number;
  attack: number;
  agility: number;
  critChance: number;
  critDamage: number;
  defense: number;
}

export interface Animal {
  id: string;
  name: string;
  rarity: Rarity;
  food: string;
  stats: AnimalStats;
  imageUrl: string;
  captured: Date;
}

export interface BattleResult {
  winner: 'player' | 'opponent';
  playerTeamRemaining: number;
  opponentTeamRemaining: number;
  battleLog: string[];
  eloChange: number;
}

export interface Plant {
  id: string;
  name: string;
  buffs: Partial<AnimalStats>;
  duration: number; // in seconds
  expiry: Date | null;
  imageUrl: string;
}

export interface User {
  id: string;
  elo: number;
  animals: Animal[];
  plants: Plant[];
  activeTeam: string[]; // IDs of animals in the team
}
