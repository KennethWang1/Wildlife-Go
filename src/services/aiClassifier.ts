
// This is a mock classifier service since we can't directly integrate with Gemini API
// In a real implementation, you would use the Gemini API or another image classification service

import { Rarity } from '../types';

const MOCK_ANIMALS = [
  { name: 'Red Fox', food: 'Berries', rarityScore: 0.7 },
  { name: 'Blue Jay', food: 'Seeds', rarityScore: 0.5 },
  { name: 'Gray Squirrel', food: 'Nuts', rarityScore: 0.3 },
  { name: 'Barn Owl', food: 'Mice', rarityScore: 0.75 },
  { name: 'Brown Rabbit', food: 'Carrots', rarityScore: 0.4 },
  { name: 'Black Bear', food: 'Fish', rarityScore: 0.85 },
  { name: 'Whitetail Deer', food: 'Grass', rarityScore: 0.6 },
  { name: 'Eastern Chipmunk', food: 'Acorns', rarityScore: 0.35 },
  { name: 'Great Blue Heron', food: 'Frogs', rarityScore: 0.82 },
  { name: 'River Otter', food: 'Crayfish', rarityScore: 0.78 },
  { name: 'Snowy Owl', food: 'Lemmings', rarityScore: 0.9 },
  { name: 'White-tailed Eagle', food: 'Fish', rarityScore: 0.95 },
  { name: 'Wild Turkey', food: 'Insects', rarityScore: 0.55 },
];

const MOCK_PLANTS = [
  { name: 'Oak Tree', buffs: { attack: 15, defense: 10 }, duration: 600 },
  { name: 'Pine Tree', buffs: { health: 50, critChance: 5 }, duration: 600 },
  { name: 'Maple Tree', buffs: { agility: 20, critDamage: 25 }, duration: 600 },
  { name: 'Sunflower', buffs: { attack: 25, agility: 15 }, duration: 600 },
  { name: 'Blackberry Bush', buffs: { critChance: 10, critDamage: 20 }, duration: 600 },
  { name: 'Apple Tree', buffs: { health: 75, defense: 5 }, duration: 600 },
  { name: 'Grass', buffs: { agility: 30, defense: 10 }, duration: 600 },
  { name: 'Corn', buffs: { attack: 20, health: 40 }, duration: 600 },
  { name: 'Carrot', buffs: { critChance: 7, attack: 12 }, duration: 600 },
  { name: 'Acorn', buffs: { defense: 25, health: 30 }, duration: 600 },
];

// In a real implementation, this would use the Gemini API to classify images
export const classifyImage = async (imageDataUrl: string): Promise<{
  type: 'animal' | 'plant';
  name: string;
  rarity?: Rarity;
  food?: string;
  buffs?: any;
  duration?: number;
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Randomly decide if this is an animal or plant
  const isAnimal = Math.random() > 0.3; // 70% chance of animal, 30% chance of plant
  
  if (isAnimal) {
    // Randomly select an animal from our mock data
    const animal = MOCK_ANIMALS[Math.floor(Math.random() * MOCK_ANIMALS.length)];
    
    // Determine rarity based on rarityScore
    let rarity: Rarity;
    if (animal.rarityScore >= 0.9) {
      rarity = 'legendary';
    } else if (animal.rarityScore >= 0.75) {
      rarity = 'super-rare';
    } else if (animal.rarityScore >= 0.6) {
      rarity = 'rare';
    } else if (animal.rarityScore >= 0.4) {
      rarity = 'uncommon';
    } else {
      rarity = 'common';
    }
    
    return {
      type: 'animal',
      name: animal.name,
      rarity,
      food: animal.food
    };
  } else {
    // Randomly select a plant from our mock data
    const plant = MOCK_PLANTS[Math.floor(Math.random() * MOCK_PLANTS.length)];
    
    return {
      type: 'plant',
      name: plant.name,
      buffs: plant.buffs,
      duration: plant.duration
    };
  }
};

// In a real implementation, this would be integrated with Gemini
export const classifyAnimalImage = async (imageDataUrl: string) => {
  const result = await classifyImage(imageDataUrl);
  if (true) {
    return {
      name: result.name,
      rarity: result.rarity || "common",
      food: result.food!,
      imageDataUrl
    };
  }
  throw new Error('The image does not contain an animal');
};

// In a real implementation, this would be integrated with Gemini
export const classifyPlantImage = async (imageDataUrl: string) => {
  const result = await classifyImage(imageDataUrl);
  if (result.type === 'plant') {
    return {
      name: result.name,
      buffs: result.buffs,
      duration: result.duration!,
      imageDataUrl
    };
  }
  throw new Error('The image does not contain a plant');
};
