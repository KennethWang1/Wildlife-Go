
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Animal } from '../types';
import { useGame } from '../context/GameContext';
import { Badge } from '@/components/ui/badge';

interface AnimalCardProps {
  animal: Animal;
  showDeleteButton?: boolean;
  isInActiveTeam?: boolean;
  onToggleTeam?: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ 
  animal, 
  showDeleteButton = true,
  isInActiveTeam = false,
  onToggleTeam
}) => {
  const { removeAnimal, getBuffsForAnimal } = useGame();
  const buffs = getBuffsForAnimal(animal);
  
  // Calculate max values for stats to create proportional bars
  const maxAttack = 300;
  const maxAgility = 150;
  const maxCritChance = 50;
  const maxCritDamage = 150;
  const maxDefense = 200;
  
  // Function to determine stat bar width as a percentage
  const getStatBarWidth = (value: number, max: number) => {
    return `${Math.min(100, (value / max) * 100)}%`;
  };
  
  // Function to determine color based on rarity
  const getRarityColor = () => {
    switch (animal.rarity) {
      case 'common': 
        return 'bg-rarity-common';
      case 'uncommon': 
        return 'bg-rarity-uncommon';
      case 'rare': 
        return 'bg-rarity-rare';
      case 'super-rare': 
        return 'bg-rarity-super-rare';
      case 'legendary': 
        return 'bg-rarity-legendary';
      default: 
        return 'bg-gray-300';
    }
  };
  
  // Format date nicely
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isInActiveTeam ? 'ring-2 ring-primary' : ''}`}>
      <div className={`h-2 ${getRarityColor()}`} />
      
      <CardHeader className="relative p-3 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold line-clamp-1">{animal.name}</h3>
            <Badge variant="outline" className={`${getRarityColor()} text-xs`}>
              {animal.rarity.charAt(0).toUpperCase() + animal.rarity.slice(1)}
            </Badge>
          </div>
          {showDeleteButton && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => removeAnimal(animal.id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={animal.imageUrl} 
          alt={animal.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-3">
        <div className="text-sm mb-3">
          <span className="font-medium">Food: </span>
          <span>{animal.food}</span>
        </div>
        
        <div className="text-sm mb-3">
          <span className="font-medium">Health: </span>
          <span>{animal.stats.health}{buffs.health ? ` (+${buffs.health})` : ''}</span>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Attack</span>
              <span>{animal.stats.attack}{buffs.attack ? ` (+${buffs.attack})` : ''}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-red-500" 
                style={{ width: getStatBarWidth(animal.stats.attack + (buffs.attack || 0), maxAttack) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Agility</span>
              <span>{animal.stats.agility}{buffs.agility ? ` (+${buffs.agility})` : ''}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-green-500" 
                style={{ width: getStatBarWidth(animal.stats.agility + (buffs.agility || 0), maxAgility) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Crit Chance</span>
              <span>{animal.stats.critChance}%{buffs.critChance ? ` (+${buffs.critChance}%)` : ''}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-yellow-500" 
                style={{ width: getStatBarWidth(animal.stats.critChance + (buffs.critChance || 0), maxCritChance) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Crit Damage</span>
              <span>{animal.stats.critDamage}%{buffs.critDamage ? ` (+${buffs.critDamage}%)` : ''}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-purple-500" 
                style={{ width: getStatBarWidth(animal.stats.critDamage + (buffs.critDamage || 0), maxCritDamage) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Defense</span>
              <span>{animal.stats.defense}{buffs.defense ? ` (+${buffs.defense})` : ''}</span>
            </div>
            <div className="stat-bar">
              <div 
                className="stat-bar-fill bg-blue-500" 
                style={{ width: getStatBarWidth(animal.stats.defense + (buffs.defense || 0), maxDefense) }}
              />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-1 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Captured: {formatDate(animal.captured)}
        </div>
        
        {onToggleTeam && (
          <Button 
            size="sm" 
            variant={isInActiveTeam ? "destructive" : "default"}
            onClick={onToggleTeam}
          >
            {isInActiveTeam ? "Remove from Team" : "Add to Team"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AnimalCard;
