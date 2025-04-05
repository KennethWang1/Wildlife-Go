
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import AnimalCard from '@/components/AnimalCard';
import PlantCard from '@/components/PlantCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Animal, Rarity } from '@/types';

const Collection = () => {
  const { animals, plants, activeTeam, updateActiveTeam } = useGame();
  const [sortOption, setSortOption] = useState<'newest' | 'rarity' | 'name'>('newest');
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');
  
  const sortedAnimals = [...animals].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.captured).getTime() - new Date(a.captured).getTime();
    } else if (sortOption === 'rarity') {
      const rarityOrder = { 'legendary': 5, 'super-rare': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  
  const filteredAnimals = filterRarity === 'all' 
    ? sortedAnimals 
    : sortedAnimals.filter(animal => animal.rarity === filterRarity);
  
  const toggleTeam = (animal: Animal) => {
    const isInTeam = activeTeam.some(a => a.id === animal.id);
    let newTeam = [...activeTeam.map(a => a.id)];
    
    if (isInTeam) {
      // Remove from team
      newTeam = newTeam.filter(id => id !== animal.id);
    } else {
      // Add to team (max 3)
      if (newTeam.length < 3) {
        newTeam.push(animal.id);
      } else {
        // Replace the first animal in the team
        newTeam.shift();
        newTeam.push(animal.id);
      }
    }
    
    updateActiveTeam(newTeam);
  };
  
  return (
    <div className="container max-w-4xl py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Your Collection</h1>
      
      <Tabs defaultValue="animals">
        <TabsList className="mb-4">
          <TabsTrigger value="animals">Animals ({animals.length})</TabsTrigger>
          <TabsTrigger value="plants">Plants ({plants.length})</TabsTrigger>
          <TabsTrigger value="team">Active Team ({activeTeam.length}/3)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="animals">
          <div className="flex justify-between items-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Filter: {filterRarity === 'all' ? 'All Rarities' : filterRarity.charAt(0).toUpperCase() + filterRarity.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRarity('all')}>All Rarities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity('common')}>Common</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity('uncommon')}>Uncommon</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity('rare')}>Rare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity('super-rare')}>Super Rare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRarity('legendary')}>Legendary</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortOption === 'newest' ? 'Newest' : sortOption === 'rarity' ? 'Rarity' : 'Name'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOption('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('rarity')}>Rarity</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption('name')}>Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {filteredAnimals.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No animals found</AlertTitle>
              <AlertDescription>
                {animals.length === 0 
                  ? "You haven't captured any animals yet. Go to the home page and take some pictures!" 
                  : "No animals match your current filter. Try changing the filter."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredAnimals.map(animal => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal} 
                  isInActiveTeam={activeTeam.some(a => a.id === animal.id)}
                  onToggleTeam={() => toggleTeam(animal)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="plants">
          {plants.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No plants found</AlertTitle>
              <AlertDescription>
                You haven't discovered any plants yet. Go to the home page and take some pictures!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {plants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="team">
          {activeTeam.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No team members</AlertTitle>
              <AlertDescription>
                You haven't added any animals to your team yet. Go to the Animals tab and add some to your team!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTeam.map(animal => (
                <AnimalCard 
                  key={animal.id} 
                  animal={animal} 
                  showDeleteButton={false}
                  isInActiveTeam={true}
                  onToggleTeam={() => toggleTeam(animal)}
                />
              ))}
              
              {activeTeam.length < 3 && (
                <Alert className="col-span-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Team not full</AlertTitle>
                  <AlertDescription>
                    Your team isn't full yet. You need a team of 3 animals to battle effectively.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Collection;
