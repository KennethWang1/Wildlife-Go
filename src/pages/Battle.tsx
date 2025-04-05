
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import AnimalCard from '@/components/AnimalCard';
import BattleResult from '@/components/BattleResult';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Swords } from 'lucide-react';
import { Animal, BattleResult as BattleResultType } from '@/types';
import { simulateBattle } from '@/utils/gameLogic';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Battle = () => {
  const { user, activeTeam, updateElo } = useGame();
  const [isBattling, setIsBattling] = useState(false);
  const [battleProgress, setBattleProgress] = useState(0);
  const [battleResult, setBattleResult] = useState<BattleResultType | null>(null);
  
  const generateOpponent = () => {
    if (!user) return [];
    
    // Generate an opponent team based on user's ELO
    const elo = user.elo;
    const opponentElo = elo + Math.floor(Math.random() * 200) - 100; // Random ELO around user's
    
    // Determine opponent strength based on relative ELO
    const strengthFactor = 0.8 + (opponentElo / elo) * 0.4;
    
    // Clone the active team and adjust stats based on strength factor
    const opponentTeam: Animal[] = activeTeam.map(animal => {
      const clone = JSON.parse(JSON.stringify(animal)) as Animal;
      clone.id = `opponent-${clone.id}`;
      
      // Adjust stats based on strength factor
      Object.keys(clone.stats).forEach(key => {
        const statKey = key as keyof Animal['stats'];
        if (statKey !== 'health') { // Don't adjust base health
          clone.stats[statKey] = Math.floor(clone.stats[statKey] * strengthFactor);
        }
      });
      
      return clone;
    });
    
    return opponentTeam;
  };
  
  const startBattle = () => {
    if (activeTeam.length < 3) {
      return;
    }
    
    setIsBattling(true);
    setBattleProgress(0);
    
    // Generate opponent team
    const opponentTeam = generateOpponent();
    
    // Simulate progress animation
    const simulationTime = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = simulationTime / interval;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      setBattleProgress(Math.min(100, (currentStep / steps) * 100));
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
        
        // Execute actual battle simulation
        if (user) {
          const result = simulateBattle(activeTeam, opponentTeam, user.elo, user.elo);
          setBattleResult(result);
          updateElo(result.eloChange);
        }
        
        setIsBattling(false);
      }
    }, interval);
  };
  
  const closeBattleResult = () => {
    setBattleResult(null);
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container max-w-4xl py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Battle Arena</h1>
      
      <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
        <div>
          <h2 className="text-lg font-semibold">Your ELO Rating</h2>
          <p className="text-2xl font-bold">{user.elo}</p>
        </div>
        
        <Button 
          size="lg" 
          onClick={startBattle} 
          disabled={activeTeam.length < 3 || isBattling}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
        >
          <Swords className="mr-2" />
          Start Battle
        </Button>
      </div>
      
      {activeTeam.length < 3 ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Team not ready</AlertTitle>
          <AlertDescription>
            You need a team of 3 animals to battle. Visit the Collection page to set up your team.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Your Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTeam.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                showDeleteButton={false}
              />
            ))}
          </div>
        </div>
      )}
      
      {isBattling && (
        <div className="p-6 bg-black/5 rounded-lg text-center my-8">
          <h2 className="text-xl font-bold mb-3">Battle in Progress</h2>
          <Progress value={battleProgress} className="h-4 mb-3" />
          <p className="text-muted-foreground">Your animals are fighting...</p>
        </div>
      )}
      
      <Dialog open={battleResult !== null} onOpenChange={(open) => !open && closeBattleResult()}>
        <DialogContent className="max-w-md">
          {battleResult && (
            <BattleResult 
              result={battleResult} 
              onClose={closeBattleResult} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Battle;
