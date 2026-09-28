import React from 'react';
import Link from 'next/link';
import { Home as HouseIcon, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[var(--navy)] text-white/80 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[var(--emerald)] rounded-lg flex items-center justify-center">
                <HouseIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-bold text-sm tracking-wide">Remy</span>
                <span className="text-[var(--emerald)] text-[10px] font-medium tracking-widest uppercase">
                  Real Estates
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-6">
              Rwanda's premier platform for verified luxury real estate listings. Connecting buyers, renters, and realtors seamlessly.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[var(--emerald)] flex items-center justify-center text-white transition-colors"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[var(--emerald)] flex items-center justify-center text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[var(--emerald)] flex items-center justify-center text-white transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[1.5]" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeLinecap="round"></line>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[var(--emerald)] flex items-center justify-center text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?type=buy">
                  Buy Properties
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?type=rent">
                  Rent Properties
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties">
                  All Listings
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/realtors">
                  Find Realtors
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/list-property">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/blog">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Property Types</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Villa">
                  Residential Villas
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Apartment">
                  Apartments
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Office">
                  Commercial Offices
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Land">
                  Land & Plots
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Penthouse">
                  Luxury Penthouses
                </Link>
              </li>
              <li>
                <Link className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors" href="/properties?category=Guest+House">
                  Guest Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--emerald)] mt-0.5 shrink-0" />
                <span className="text-sm text-white/60">KG 15 Ave, Nyarutarama, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--emerald)] shrink-0" />
                <a href="tel:+250788000000" className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors">
                  +250 788 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--emerald)] shrink-0" />
                <a href="mailto:info@remyrealestate.rw" className="text-sm text-white/60 hover:text-[var(--emerald)] transition-colors">
                  info@remyrealestate.rw
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© 2026 Remy Real Estates. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link className="text-xs text-white/40 hover:text-[var(--emerald)] transition-colors" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-xs text-white/40 hover:text-[var(--emerald)] transition-colors" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-xs text-white/40 hover:text-[var(--emerald)] transition-colors" href="/cookies">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
