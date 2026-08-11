'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isAuthPage =
    pathname?.startsWith('/signin') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/verify-email');

  // Hide Navbar & Footer on /dashboard, /realtor, and /customer routes
  const isDashboardPage =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/realtor') ||
    pathname?.startsWith('/customer');

  const hideHeaderFooter = isAuthPage || isDashboardPage;

  return (
    <>
      {!hideHeaderFooter && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideHeaderFooter && <Footer />}
    </>
  );
};