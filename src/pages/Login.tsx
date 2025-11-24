import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} className="w-full">
            Sign In with WorkOS
          </Button>
          <div className="mt-4 text-center text-sm text-gray-500">
            Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
