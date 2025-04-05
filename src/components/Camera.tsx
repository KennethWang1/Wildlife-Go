
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Call the onCapture handler with the data URL
    onCapture(imageDataUrl);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 text-white p-4 text-center">
            <div>
              <p className="text-red-400 mb-2">{error}</p>
              <Button onClick={onClose} variant="destructive">Close</Button>
            </div>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        
        <canvas ref={canvasRef} className="hidden" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4 flex justify-center bg-black">
        <Button 
          onClick={captureImage} 
          size="lg" 
          className="rounded-full w-16 h-16 flex items-center justify-center"
          disabled={!isCameraReady}
        >
          <Camera size={32} />
        </Button>
      </div>
    </div>
  );
};

export default CameraComponent;
