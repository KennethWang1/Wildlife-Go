
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Trophy, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Rarity } from '@/types';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { user, animals } = useGame();
  const { logout } = useAuth();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const getRarityCount = (rarity: Rarity) => {
    return animals.filter(animal => animal.rarity === rarity).length;
  };
  
  const getHighestStatAnimal = () => {
    if (animals.length === 0) return null;
    
    let highest = animals[0];
    let highestTotal = Object.values(highest.stats).reduce((sum, val) => sum + val, 0);
    
    animals.forEach(animal => {
      const total = Object.values(animal.stats).reduce((sum, val) => sum + val, 0);
      if (total > highestTotal) {
        highest = animal;
        highestTotal = total;
      }
    });
    
    return highest;
  };
  
  const resetGame = () => {
    // Clear localStorage and reload page
    localStorage.removeItem('fauna-snap-user');
    window.location.reload();
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const highestStatAnimal = getHighestStatAnimal();
  
  return (
    <div className="container max-w-4xl py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Stats</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>ELO Rating</span>
              <span className="font-bold">{user.elo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Animals Collected</span>
              <span className="font-bold">{animals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Unique Species</span>
              <span className="font-bold">{new Set(animals.map(a => a.name)).size}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-xl font-semibold">Rarities Collected</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-common"></div>
                Common
              </span>
              <span className="font-bold">{getRarityCount('common')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-uncommon"></div>
                Uncommon
              </span>
              <span className="font-bold">{getRarityCount('uncommon')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-rare"></div>
                Rare
              </span>
              <span className="font-bold">{getRarityCount('rare')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-super-rare"></div>
                Super Rare
              </span>
              <span className="font-bold">{getRarityCount('super-rare')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rarity-legendary"></div>
                Legendary
              </span>
              <span className="font-bold">{getRarityCount('legendary')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        
        {animals.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No achievements yet</AlertTitle>
            <AlertDescription>
              Capture animals and battle to unlock achievements!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {animals.length >= 1 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Award className="text-yellow-500" size={24} />
                <div>
                  <h3 className="font-medium">First Capture</h3>
                  <p className="text-sm text-muted-foreground">Captured your first animal</p>
                </div>
              </div>
            )}
            
            {animals.length >= 10 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Award className="text-green-500" size={24} />
                <div>
                  <h3 className="font-medium">Collector</h3>
                  <p className="text-sm text-muted-foreground">Captured 10 or more animals</p>
                </div>
              </div>
            )}
            
            {getRarityCount('legendary') >= 1 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Trophy className="text-rarity-legendary" size={24} />
                <div>
                  <h3 className="font-medium">Legendary Hunter</h3>
                  <p className="text-sm text-muted-foreground">Captured a legendary animal</p>
                </div>
              </div>
            )}
            
            {user.elo >= 1100 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Trophy className="text-blue-500" size={24} />
                <div>
                  <h3 className="font-medium">Rising Star</h3>
                  <p className="text-sm text-muted-foreground">Reached 1100+ ELO</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {highestStatAnimal && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Strongest Animal</h2>
          <div className="p-4 bg-muted rounded-lg flex flex-col sm:flex-row gap-4 items-center">
            <img
              src={highestStatAnimal.imageUrl}
              alt={highestStatAnimal.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-bold text-lg">{highestStatAnimal.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {highestStatAnimal.rarity.charAt(0).toUpperCase() + highestStatAnimal.rarity.slice(1)} • Captured on {formatDate(highestStatAnimal.captured)}
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm font-medium">ATK</p>
                  <p className="font-bold">{highestStatAnimal.stats.attack}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">DEF</p>
                  <p className="font-bold">{highestStatAnimal.stats.defense}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">AGI</p>
                  <p className="font-bold">{highestStatAnimal.stats.agility}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 border-t pt-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Account Options</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
          <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
            Reset Game Data
          </Button>
        </div>
      </div>
      
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Game Data</DialogTitle>
            <DialogDescription>
              This will delete all your animals, plants, and progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={resetGame}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
