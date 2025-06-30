import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/products/Products';
import Categories from '../pages/products/Categories';
import Sales from '../pages/sales/Sales';
import Clients from '../pages/clients/Clients';
import Employees from '../pages/employees/Employees';
import Expenses from '../pages/expenses/Expenses';
import Business from '../pages/business/Business';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/profile/Profile';

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/business" element={<Business />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainLayout>
  );
};

export default ProtectedRoutes; 