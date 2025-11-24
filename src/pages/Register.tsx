import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Register: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Get started with our platform today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} className="w-full">
            Sign Up with WorkOS
          </Button>
          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
