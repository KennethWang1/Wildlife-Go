
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Database, Swords, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-10">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Camera size={24} />
            <span className="text-xs mt-1">Snap</span>
          </Link>
          
          <Link
            to="/collection"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/collection') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Database size={24} />
            <span className="text-xs mt-1">Collection</span>
          </Link>
          
          <Link
            to="/battle"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/battle') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Swords size={24} />
            <span className="text-xs mt-1">Battle</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
