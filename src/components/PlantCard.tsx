
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plant } from '../types';
import { Badge } from '@/components/ui/badge';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  // Calculate remaining time
  const getRemainingTime = () => {
    if (!plant.expiry) return 'Inactive';
    
    const now = new Date();
    const expiry = new Date(plant.expiry);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffSec = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSec / 60);
    const seconds = diffSec % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  };
  
  // Get a list of all the buffs this plant provides
  const getBuffList = () => {
    return Object.entries(plant.buffs).map(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      return (
        <div key={key} className="flex justify-between text-sm">
          <span className="capitalize">{formattedKey}</span>
          <span className="font-medium">+{value}</span>
        </div>
      );
    });
  };
  
  const isActive = plant.expiry && new Date(plant.expiry) > new Date();
  
  return (
    <Card className={`overflow-hidden ${isActive ? 'ring-2 ring-nature-500' : 'opacity-70'}`}>
      <div className="h-2 bg-nature-500" />
      
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{plant.name}</h3>
            <Badge variant="outline" className="bg-nature-200 text-xs">
              Plant
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <div className="relative h-40 overflow-hidden">
        <img 
          src={plant.imageUrl} 
          alt={plant.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-3">
        <div className="space-y-1 mb-3">
          {getBuffList()}
        </div>
        
        <div className={`text-sm ${isActive ? 'text-green-600' : 'text-red-500'} font-medium`}>
          {getRemainingTime()}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlantCard;
