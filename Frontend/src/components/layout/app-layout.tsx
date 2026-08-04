'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/signin' ||
    pathname?.startsWith('/signin') ||
    pathname === '/register' ||
    pathname?.startsWith('/register');

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <Footer />}
    </>
  );
};
