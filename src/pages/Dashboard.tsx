import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {user?.email}!</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
};

export default Dashboard;
