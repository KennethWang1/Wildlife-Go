
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, Leaf, Info, AlertCircle, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CameraComponent from '@/components/Camera';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { classifyAnimalImage, classifyPlantImage } from '@/services/aiClassifier';
import { useToast } from '@/components/ui/use-toast';

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const Home = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isShowingTutorial, setIsShowingTutorial] = useState(false);
  const [captureMode, setCaptureMode] = useState<'animal' | 'plant'>('animal');
  const { addAnimal, addPlant } = useGame();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleCapture = async (imageDataUrl: string) => {
    setIsCameraOpen(false);
    setIsClassifying(true);

    const headers = new Headers();
    headers.append("Content-Type", "application/json")

    fetch('http://localhost:3000/api/v1/uploadCard', {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "image": imageDataUrl,
        "username": getCookie("username")
      })
    }).then(
      response => response.json()
    ).then(async r => {
      if (r['error'] !== undefined) {
        throw new Error("error")
      } else {
        r['critDamage'] = r['critical_damage']
        r['critChance'] = r['critical_chance']
        addAnimal({
          name: r.name,
          rarity: r.rarity,
          stats: r,
          imageDataUrl: imageDataUrl
        })
      }
    })
    .finally(() => {
      setIsClassifying(false);
    })
    .catch(err => {
      console.log(err)
      toast({
        title: "Classification Failed",
        description: "We couldn't identify an animal in this image. Please try again with a clearer picture.",
        variant: "destructive",
      });
    })
      
  };

  const openCamera = (mode: 'animal' | 'plant') => {
    setCaptureMode(mode);
    setIsCameraOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col pt-[20vh]">
      <main className="flex-1 container max-w-md py-6 px-4">
        
        <div className="text-center mb-8">
          <img 
              src="/public/assets/logo-no-shadow.png" 
              alt="Wildlife Go" 
              className="h-auto w-full sm:w-11/12 md:w-2/2 max-w-[2000px] mx-auto mb-2" 
            />
          <p className="text-muted-foreground mb-6">Capture, collect, and battle with animals!</p>
          
          {!isAuthenticated && (
            <div className="grid gap-4 mb-8">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="h-14 flex items-center gap-2 text-lg w-full"
                >
                  <UserPlus size={20} />
                  <span>Sign Up to Play</span>
                </Button>
              </Link>
              <div className="text-center text-sm text-muted-foreground">
                <p>Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></p>
              </div>
            </div>
          )}
          
          {isAuthenticated && (
            <div className="grid gap-4">
              <Button 
                size="lg" 
                className="h-20 flex items-center gap-2 text-lg relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-500"
                onClick={() => openCamera('animal')}
                disabled={isClassifying}
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse-glow"></div>
                <div className="relative flex items-center gap-2">
                  <Camera size={24} />
                  <span>Catch an Animal</span>
                </div>
              </Button>
              
              {/* <Button 
                size="lg" 
                className="h-20 flex items-center gap-2 text-lg relative overflow-hidden bg-gradient-to-r from-green-500 to-green-700"
                onClick={() => openCamera('plant')}
                disabled={isClassifying}
                variant="outline"
              >
                <div className="relative flex items-center gap-2">
                  <Leaf size={24} />
                  <span>Gather a Plant</span>
                </div>
              </Button> */}
              
              <Button 
                size="lg" 
                className="h-12 flex items-center gap-2"
                onClick={() => setIsShowingTutorial(true)}
                variant="outline"
              >
                <Info size={20} />
                <span>How to Play</span>
              </Button>
            </div>
          )}
        </div>
        
        {isClassifying && (
          <div className="text-center py-10">
            <div className="inline-block animate-bounce-subtle">
              <AlertCircle size={48} className="text-primary mb-4" />
            </div>
            <h2 className="text-xl font-bold mb-2">Classifying Image...</h2>
            <p className="text-muted-foreground">Our AI is analyzing what you captured!</p>
          </div>
        )}
      </main>
      
      {isCameraOpen && (
        <CameraComponent 
          onCapture={handleCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
      
      <Dialog open={isShowingTutorial} onOpenChange={setIsShowingTutorial}>
        <DialogContent>
          <DialogTitle>How to Play</DialogTitle>
          <DialogDescription className="space-y-4">
            <p className="mb-2">Welcome Wildlife Go! Here's how to play:</p>
            
            <div className="space-y-1">
              <h3 className="font-bold">Catching Animals</h3>
              <p>Take pictures of animals to capture them. Each animal has unique stats and a rarity level.</p>
            </div>
            
            {/* <div className="space-y-1">
              <h3 className="font-bold">Gathering Plants</h3>
              <p>Find plants to gather for buffs. Plants can boost the stats of animals that eat them.</p>
            </div>
             */}
            <div className="space-y-1">
              <h3 className="font-bold">Battle System</h3>
              <p>Create a team of 3 animals and battle against opponents to increase your ELO ranking.</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold">Stats</h3>
              <p>Animals have different stats: Health, Attack, Agility, Crit Chance, Crit Damage, and Defense.</p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
