
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Camera, Leaf } from 'lucide-react';
import LoginForm from '@/components/LoginForm';

const Login = () => {
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
              src="/public/assets/logo-no-shadow.png" 
              alt="Wildlife Go" 
              className="h-auto w-full sm:w-11/12 md:w-2/2 max-w-[2000px] mx-auto mb-2" 
          />
          <p className="text-muted-foreground mb-6">Capture, collect, and battle with animals!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Wildlife Go</CardTitle>
            <CardDescription>
              Login to start your adventure catching animals and battling with your collection!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoginFormOpen ? (
              <LoginForm onSuccess={() => navigate('/')} />
            ) : (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full h-12"
                  onClick={() => setIsLoginFormOpen(true)}
                >
                  Login to Play
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <p>New to Wildlife Go? <Link to="/signup" className="text-primary hover:underline">Create an account</Link> to start your journey.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <div className="flex justify-center space-x-4 mb-2">
            <span className="flex items-center"><Camera size={16} className="mr-1" /> Catch Animals</span>
            <span className="flex items-center"><Leaf size={16} className="mr-1" /> Gather Plants</span>
          </div>
          <p>Build your collection and battle to become the ultimate champion!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
