import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { AdminPanel } from '../components/AdminPanel';

export const AdminPage: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen } = useShop();

  useEffect(() => {
    setIsAdminOpen(true);
  }, [setIsAdminOpen]);

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminPanel />
    </div>
  );
};
