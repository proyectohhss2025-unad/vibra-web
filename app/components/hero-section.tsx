'use client';

import Link from 'next/link';
import { LogIn, Smartphone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ScrollReveal from './scroll-reveal';

const screenshots = [
  { id: 1, src: '/images/screenshot-1.png', alt: 'Pantalla de actividades Vibra' },
  { id: 2, src: '/images/screenshot-2.png', alt: 'Pantalla de inicio Vibra' },
];

function ScreenshotShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const front = screenshots[activeIndex];
  const back = screenshots[activeIndex === 0 ? 1 : 0];

  return (
    <div
      className="relative w-72 h-[34rem] md:w-80 md:h-[38rem] flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card de atrás — asomando con rotación */}
      <motion.div
        key={`back-${back.id}`}
        className="absolute w-64 h-[29rem] md:w-72 md:h-[33rem] rounded-[2rem] overflow-hidden shadow-xl border-4 border-gray-700/60"
        initial={false}
        animate={{
          x: 28,
          y: 20,
          rotate: 6,
          scale: 0.88,
          opacity: 0.7,
          zIndex: 0,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <img
          src={back.src}
          alt={back.alt}
          className="w-full h-full object-cover"
        />
        {/* Overlay sutil para dar profundidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.div>

      {/* Card de adelante — principal */}
      <motion.div
        key={`front-${front.id}`}
        className="absolute w-72 h-[34rem] md:w-80 md:h-[38rem] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-800 cursor-pointer"
        initial={false}
        animate={{
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          zIndex: 10,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setActiveIndex((prev) => (prev === 0 ? 1 : 0))}
      >
        <img
          src={front.src}
          alt={front.alt}
          className="w-full h-full object-cover"
        />

        {/* Notch decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-xl z-10" />

        {/* Indicadores de página */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'bg-white w-5 shadow-lg'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Luces decorativas de fondo */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-vibra-blue/10 rounded-full blur-2xl -z-10" />
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-vibra-coral/10 rounded-full blur-2xl -z-10" />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{
        background: 'radial-gradient(at top left, #72adc9 0%, #d2e8f1 15%, #fdfcf9 30%)'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-vibra-coral/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-vibra-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-12 md:pt-24 md:pb-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16">
          {/* Left: Text */}
          <ScrollReveal direction="left" className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-vibra-coral text-xs font-medium mb-6 border border-vibra-coral/20">
              <Sparkles className="w-3.5 h-3.5" />
              Educación emocional interactiva
            </div>

            {/* Logo grande y llamativo */}
            <div className="flex justify-center md:justify-start mb-6">
              <div className="relative inline-flex items-center gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm shadow-lg shadow-vibra-blue/10 border border-white/50 group hover:shadow-xl hover:shadow-vibra-blue/20 transition-all duration-500">
                <img
                  src="logo.png"
                  alt="Vibra"
                  className="h-14 md:h-20 w-auto drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                />
                <div className="hidden sm:block">
                  <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-vibra-heading">
                    <span className="bg-gradient-to-r from-vibra-blue via-vibra-blue-light to-vibra-coral bg-clip-text text-transparent">
                      Vibra
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-vibra-body max-w-lg mx-auto md:mx-0 mb-2">
              Educación emocional a través de experiencias interactivas.
            </p>
            <p className="text-sm sm:text-base text-vibra-body/70 max-w-md mx-auto md:mx-0 mb-8">
              Actividades diarias, retos grupales y seguimiento emocional para
              instituciones educativas.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link
                href="/layout"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-vibra-blue text-white font-semibold text-sm shadow-lg shadow-vibra-blue/25 hover:shadow-xl hover:shadow-vibra-blue/30 hover:bg-vibra-blue-light transition-all"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Link>
              <Link
                href="/download-app"
                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-vibra-blue text-white font-semibold text-sm shadow-lg shadow-vibra-blue/25 hover:shadow-xl hover:shadow-vibra-blue/30 hover:bg-vibra-blue-light transition-all overflow-hidden"
              >
                {/* Fondo animado en hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-vibra-coral to-vibra-coral/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Icono con animación */}
                <Smartphone className="relative z-10 w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                <span className="relative z-10">Descargar app</span>
                {/* Punto animado indicador */}
                <span className="relative z-10 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 group-hover:opacity-100" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Right: Screenshot Showcase */}
          <ScrollReveal direction="right" delay={0.2} className="flex-1 flex justify-center">
            <ScreenshotShowcase />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
