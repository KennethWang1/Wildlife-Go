
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const headers = new Headers();
      headers.append("Content-Type", "application/json")

      fetch("http://localhost:3000/api/v1/login", {
        method: "POST", 
        headers: headers,
        body: JSON.stringify({
          "email": email,
          "password": password
        })
      })
      .then(r => r.json())
      .then(async r => {
        if (r['error'] !== undefined) throw new Error("error :(")

          setCookie("username", r.username, 999999)

        toast({
          title: "Login Successful",
          description: "Account successfully logged in.",
        });

        await login(email, password)

        onSuccess();
      })
      .catch (err => {
        console.log(err)
        toast({
          title: "Login Failed",
          description: "Wrong email or password",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      })
    
    } catch (error) {
    } finally {
    }

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground pt-2">
        <p>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link></p>
      </div>
    </form>
  );
};

export default LoginForm;
