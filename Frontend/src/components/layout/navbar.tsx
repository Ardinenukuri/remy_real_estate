'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home as HouseIcon, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--navy)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="Remy Real Estates Home">
            <div className="w-8 h-8 bg-[var(--emerald)] rounded-lg flex items-center justify-center shadow-md">
              <HouseIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-wide">Remy</span>
              <span className="text-[var(--emerald)] text-[10px] font-medium tracking-widest uppercase">
                Real Estates
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            <Link
              href="/"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Properties
            </Link>
            <Link
              href="/realtors"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Realtors
            </Link>
            <Link
              href="/blog"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/faq"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors" />
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:border-white/60 hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--emerald)] rounded-lg hover:opacity-90 transition-colors shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle className="p-2 text-white/80 hover:text-white focus:outline-none" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--navy)] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            Home
          </Link>
          <Link
            href="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            Properties
          </Link>
          <Link
            href="/realtors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            Realtors
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            Blog
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            About Us
          </Link>
          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base text-white/90 hover:bg-white/10 rounded-md"
          >
            Contact
          </Link>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center w-full px-4 py-2.5 text-sm font-medium text-white border border-white/30 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center w-full px-4 py-2.5 text-sm font-medium text-white bg-[var(--emerald)] rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
