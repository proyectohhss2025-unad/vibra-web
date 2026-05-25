'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Smartphone, LogIn, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="logo.png"
            alt="Vibra"
            className="h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/layout"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vibra-blue text-white font-medium text-sm hover:bg-vibra-blue-light transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>
          <Link
            href="/download-app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-vibra-coral text-vibra-coral font-medium text-sm hover:bg-vibra-coral hover:text-white transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Descargar app
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-vibra-heading"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link
              href="/layout"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-vibra-blue text-white font-medium text-sm"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </Link>
            <Link
              href="/download-app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-vibra-coral text-vibra-coral font-medium text-sm"
            >
              <Smartphone className="w-4 h-4" />
              Descargar app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
