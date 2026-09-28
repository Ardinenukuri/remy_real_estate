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

  // Hide Navbar & Footer on /dashboard, /realtor (the realtor dashboard), and
  // /customer routes - but NOT on /realtors, the public "Meet Our Realtors"
  // marketing page, which merely shares the same prefix.
  const isDashboardPage =
    pathname?.startsWith('/dashboard') ||
    pathname === '/realtor' ||
    pathname?.startsWith('/realtor/') ||
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