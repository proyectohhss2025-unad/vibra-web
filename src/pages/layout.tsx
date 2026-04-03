import AuthProvider from '@/services/auth-provider';
import { Inter } from "next/font/google";
import React from 'react';
import "../../app/globals.css";
import MainContent from '../components/main-content';

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children }: Readonly<{ children: React.ReactNode; }>) => {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <main className="flex min-h-screen flex-col items-center justify-between">
          <MainContent content={children} />
        </main>
      </AuthProvider>
    </div>
  );
};

export default Layout;