import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ToastContainer from '../components/ToastContainer';
import { useToast } from '../context/ToastContext';
import './Layout.css';

const Layout = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Layout;

