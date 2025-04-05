
import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BattleResult as BattleResultType } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';

interface BattleResultProps {
  result: BattleResultType;
  onClose: () => void;
}

const BattleResult: React.FC<BattleResultProps> = ({ result, onClose }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Battle Results</h2>
          {result.winner === 'player' ? (
            <div className="flex items-center gap-2 text-green-500">
              <Trophy size={20} />
              <span>Victory!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <span>Defeat</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-2 bg-muted rounded-md">
          <div>
            <div className="text-sm text-muted-foreground">ELO Change</div>
            <div className="text-xl font-bold flex items-center">
              {result.eloChange > 0 ? (
                <>
                  <ChevronUp className="text-green-500" size={20} />
                  <span className="text-green-500">+{result.eloChange}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="text-red-500" size={20} />
                  <span className="text-red-500">{result.eloChange}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="font-bold">
              {result.playerTeamRemaining} vs {result.opponentTeamRemaining}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Battle Log</h3>
          <ScrollArea className="h-60 rounded-md border">
            <div className="p-3 space-y-2">
              {result.battleLog.map((log, index) => (
                <div 
                  key={index} 
                  className={`text-sm p-2 rounded-md ${
                    log.includes('CRITICAL HIT') 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : log.includes('defeated') 
                      ? 'bg-red-100 text-red-800'
                      : log.includes('Battle ended') 
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'bg-gray-100'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BattleResult;
