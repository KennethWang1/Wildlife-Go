
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Animal, Plant, User, Rarity } from '../types';
import { generateStats } from '../utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '../components/ui/use-toast';

interface GameContextProps {
  user: User | null;
  animals: Animal[];
  plants: Plant[];
  activeTeam: Animal[];
  addAnimal: (animal: any & { imageDataUrl: string }) => void;
  addPlant: (plant: Omit<Plant, 'id' | 'expiry'> & { imageDataUrl: string }) => void;
  removeAnimal: (id: string) => void;
  updateActiveTeam: (animalIds: string[]) => void;
  updateElo: (change: number) => void;
  getBuffsForAnimal: (animal: Animal) => Partial<Animal['stats']>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Load user data from localStorage on mount
    const storedUser = localStorage.getItem('fauna-snap-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data', e);
        initializeUser();
      }
    } else {
      initializeUser();
    }
  }, []);
  
  useEffect(() => {
    // Save user data to localStorage whenever it changes
    if (user) {
      localStorage.setItem('fauna-snap-user', JSON.stringify(user));
    }
  }, [user]);
  
  const initializeUser = () => {
    // Create new user if none exists
    const newUser: User = {
      id: uuidv4(),
      elo: 1000,
      animals: [],
      plants: [],
      activeTeam: [],
    };
    setUser(newUser);
  };
  
  const addAnimal = (animalData: any & { imageDataUrl: string }) => {
    if (!user) return;
    
    // const stats = generateStats(animalData.rarity);
    const stats = animalData.stats
    const animal: Animal = {
      id: uuidv4(),
      name: animalData.name,
      rarity: animalData.rarity,
      food: animalData.food,
      stats,
      imageUrl: animalData.imageDataUrl,
      captured: new Date(),
    };
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        animals: [...prev.animals, animal]
      };
    });
    
    toast({
      title: `Captured ${animal.name}!`,
      description: `Rarity: ${animal.rarity.charAt(0).toUpperCase() + animal.rarity.slice(1)}`,
      variant: "default",
    });
  };
  
  const addPlant = (plantData: Omit<Plant, 'id' | 'expiry'> & { imageDataUrl: string }) => {
    if (!user) return;
    
    const plant: Plant = {
      id: uuidv4(),
      name: plantData.name,
      buffs: plantData.buffs,
      duration: plantData.duration,
      expiry: new Date(Date.now() + plantData.duration * 1000),
      imageUrl: plantData.imageDataUrl,
    };
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        plants: [...prev.plants, plant]
      };
    });
    
    toast({
      title: `Discovered ${plant.name}!`,
      description: `Provides buffs to animals that eat ${plantData.name}.`,
      variant: "default",
    });
  };
  
  const removeAnimal = (id: string) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      
      // Remove from active team if present
      const updatedActiveTeam = prev.activeTeam.filter(animalId => animalId !== id);
      
      return {
        ...prev,
        animals: prev.animals.filter(animal => animal.id !== id),
        activeTeam: updatedActiveTeam
      };
    });
  };
  
  const updateActiveTeam = (animalIds: string[]) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        activeTeam: animalIds
      };
    });
  };
  
  const updateElo = (change: number) => {
    if (!user) return;
    
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        elo: prev.elo + change
      };
    });
  };
  
  const getBuffsForAnimal = (animal: Animal): Partial<Animal['stats']> => {
    if (!user) return {};
    
    // Find active plant buffs that affect this animal's food type
    const now = new Date();
    const activePlants = user.plants.filter(plant => 
      plant.expiry && plant.expiry > now && 
      plant.name.toLowerCase() === animal.food.toLowerCase()
    );
    
    // Combine all applicable buffs
    const combinedBuffs: Partial<Animal['stats']> = {};
    
    activePlants.forEach(plant => {
      Object.entries(plant.buffs).forEach(([key, value]) => {
        const statKey = key as keyof Animal['stats'];
        combinedBuffs[statKey] = (combinedBuffs[statKey] || 0) + value;
      });
    });
    
    return combinedBuffs;
  };
  
  // Clean up expired plant buffs
  useEffect(() => {
    if (!user) return;
    
    const cleanup = setInterval(() => {
      const now = new Date();
      setUser(prev => {
        if (!prev) return null;
        
        const updatedPlants = prev.plants.filter(plant => 
          !plant.expiry || plant.expiry > now
        );
        
        if (updatedPlants.length !== prev.plants.length) {
          return {
            ...prev,
            plants: updatedPlants
          };
        }
        
        return prev;
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(cleanup);
  }, [user]);
  
  return (
    <GameContext.Provider
      value={{
        user,
        animals: user?.animals || [],
        plants: user?.plants || [],
        activeTeam: user?.activeTeam.map(id => user.animals.find(a => a.id === id)).filter(Boolean) as Animal[],
        addAnimal,
        addPlant,
        removeAnimal,
        updateActiveTeam,
        updateElo,
        getBuffsForAnimal,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
