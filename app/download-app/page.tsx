'use client';

import Link from 'next/link';
import { Download, Smartphone, QrCode, ChevronLeft, Monitor, Shield, Wifi, HardDrive } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import ScrollReveal from '../components/scroll-reveal';

export default function DownloadAppPage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-28 pb-16 md:pt-36 md:pb-20"
        style={{
          background: 'radial-gradient(at top left, #72adc9 0%, #d2e8f1 15%, #fdfcf9 30%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm text-vibra-blue text-xs font-medium mb-6 border border-vibra-blue/20">
              <Smartphone className="w-3.5 h-3.5" />
              App móvil Vibra
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-vibra-heading mb-4">
              Descarga la app{' '}
              <span className="bg-gradient-to-r from-vibra-blue to-vibra-coral bg-clip-text text-transparent">
                Vibra
              </span>
            </h1>
            <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Lleva tu experiencia emocional a donde vayas. Realiza actividades,
              sigue tu progreso y conecta con tu grupo desde tu dispositivo móvil.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Download options */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Android APK */}
            <ScrollReveal direction="left">
              <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-vibra-blue/10 text-vibra-blue flex items-center justify-center mb-5">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-vibra-heading mb-2">
                  Versión Android
                </h2>
                <p className="text-vibra-body text-sm leading-relaxed mb-6">
                  Descarga el archivo APK e instálalo en tu dispositivo Android.
                  Compatible con Android 8.0 en adelante.
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('APK — próximamente disponible');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vibra-blue text-white font-semibold text-sm shadow-lg hover:bg-vibra-blue-light transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar APK
                </a>
              </div>
            </ScrollReveal>

            {/* QR Code */}
            <ScrollReveal direction="right" delay={0.15}>
              <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-vibra-coral/10 text-vibra-coral flex items-center justify-center mb-5">
                  <QrCode className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-vibra-heading mb-2">
                  Escanea el código QR
                </h2>
                <p className="text-vibra-body text-sm leading-relaxed mb-6">
                  Apunta tu cámara al código QR para descargar la app directamente
                  en tu dispositivo.
                </p>
                <div className="flex justify-center">
                  <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">QR aquí</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Requirements */}
          <ScrollReveal delay={0.3} className="mt-16">
            <div className="p-8 rounded-2xl bg-[#f8fafc] border border-gray-100">
              <h3 className="text-lg font-bold text-vibra-heading mb-6 text-center">
                ✨ Requisitos mínimos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vibra-mint/10 text-vibra-mint flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-vibra-heading">Sistema</p>
                    <p className="text-xs text-vibra-body">Android 8.0+ / iOS 14+</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vibra-yellow/10 text-vibra-yellow flex items-center justify-center flex-shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-vibra-heading">Conexión</p>
                    <p className="text-xs text-vibra-body">Internet requerido</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vibra-coral/10 text-vibra-coral flex items-center justify-center flex-shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-vibra-heading">Espacio</p>
                    <p className="text-xs text-vibra-body">50 MB libres</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Back link */}
      <div className="bg-white pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-vibra-body text-sm hover:text-vibra-blue transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
