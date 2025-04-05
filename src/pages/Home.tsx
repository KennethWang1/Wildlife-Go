
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
    
    try {
      if (captureMode === 'animal') {
        // Try to classify as an animal
        try {
          const animalResult = await classifyAnimalImage(imageDataUrl);
          addAnimal({
            ...animalResult,
            imageUrl: animalResult.imageDataUrl
          });
        } catch (animalError) {
          // If not an animal, show error
          toast({
            title: "Classification Failed",
            description: "We couldn't identify an animal in this image. Please try again with a clearer picture.",
            variant: "destructive",
          });
        }
      } else {
        // Try to classify as a plant
        try {
          const plantResult = await classifyPlantImage(imageDataUrl);
          addPlant({
            ...plantResult,
            imageUrl: plantResult.imageDataUrl
          });
        } catch (plantError) {
          // If not a plant, show error
          toast({
            title: "Classification Failed",
            description: "We couldn't identify a plant in this image. Please try again with a clearer picture.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Error during classification:', err);
      toast({
        title: "Error",
        description: "Something went wrong during classification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const openCamera = (mode: 'animal' | 'plant') => {
    setCaptureMode(mode);
    setIsCameraOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container max-w-md py-6 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary-foreground">Fauna Snap Arena</h1>
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
              
              <Button 
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
              </Button>
              
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
            <p className="mb-2">Welcome to Fauna Snap Arena! Here's how to play:</p>
            
            <div className="space-y-1">
              <h3 className="font-bold">Catching Animals</h3>
              <p>Take pictures of animals to capture them. Each animal has unique stats and a rarity level.</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold">Gathering Plants</h3>
              <p>Find plants to gather for buffs. Plants can boost the stats of animals that eat them.</p>
            </div>
            
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
