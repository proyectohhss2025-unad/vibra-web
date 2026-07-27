'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Smartphone, QrCode, ChevronLeft, Monitor, Shield, Wifi, HardDrive } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import ScrollReveal from '../components/scroll-reveal';
import QRCode from 'qrcode';
import { config } from '@/config/config';

export default function DownloadAppPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (
      typeof window !== 'undefined' ? window.location.origin : 'https://cds.net.co'
    );
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const downloadUrl = `${siteUrl}${config[env].apkDownloadPath}`;

    QRCode.toDataURL(downloadUrl, {
      width: 160,
      margin: 1,
      color: { dark: '#1f2937', light: '#ffffff' },
    })
      .then((url: string) => setQrDataUrl(url))
      .catch(console.error);
  }, []);
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
            <img
              src="/logo.png"
              alt="Vibra"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Lleva tu experiencia emocional a donde vayas. Realiza actividades,
              sigue tu progreso y conecta con tu grupo desde tu dispositivo móvil.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Download options */}
      <section className="bg-white pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Android APK */}
            <ScrollReveal direction="left">
              <div className="flex flex-col h-full p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-vibra-blue/10 text-vibra-blue flex items-center justify-center mb-5">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-vibra-heading mb-2">
                  Versión Android
                </h2>
                <p className="text-vibra-body text-sm leading-relaxed mb-6 flex-1">
                  Descarga el archivo APK e instálalo en tu dispositivo Android.
                  Compatible con Android 8.0 en adelante.
                </p>
                {/* Google Play badge */}
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="currentColor">
                    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.496 1.496 0 0 1 0 2.594zM6.212 20.026l-1.94 1.099a1.501 1.501 0 0 1-2.272-1.299V4.174a1.5 1.5 0 0 1 2.272-1.3l3.763 2.13 3.833 4.228-3.584 3.559-1.768 3.772a16.6 16.6 0 0 0-.304 3.463zM15.19 9.932L6.85 3.709l4.188 4.238 4.152 1.985zM7.455 20.064l7.757-4.389-4.037-4.045-3.525 3.543 1.438 3.493a6.689 6.689 0 0 1-.633 1.398z"/>
                  </svg>
                  <span className="text-xs text-vibra-body">Disponible en Google Play</span>
                </div>
                <a
                  href={config[process.env.NODE_ENV === 'production' ? 'production' : 'development'].apkDownloadPath}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-vibra-blue text-white font-semibold text-sm shadow-lg hover:bg-vibra-blue-light transition-all self-start"
                >
                  <Download className="w-4 h-4" />
                  Descargar APK
                </a>
              </div>
            </ScrollReveal>

            {/* iOS App Store */}
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col h-full p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center mb-5">
                  {/* Apple SVG icon */}
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-vibra-heading mb-2">
                  Versión iOS
                </h2>
                <p className="text-vibra-body text-sm leading-relaxed mb-6 flex-1">
                  Descarga Vibra desde la App Store en tu iPhone o iPad.
                  Compatible con iOS 14+.
                </p>
                {/* App Store badge */}
                <div className="flex items-center gap-2 mb-4">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-xs text-vibra-body">Disponible en App Store</span>
                </div>
                <a
                  href="https://apps.apple.com/app/vibra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold text-sm shadow-lg hover:bg-gray-700 transition-all self-start"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Ir a App Store
                </a>
              </div>
            </ScrollReveal>

            {/* QR Code */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="flex flex-col h-full p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-vibra-coral/10 text-vibra-coral flex items-center justify-center mb-5">
                  <QrCode className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-vibra-heading mb-2">
                  Escanea el código QR
                </h2>
                <p className="text-vibra-body text-sm leading-relaxed mb-6 flex-1">
                  Apunta tu cámara al código QR para descargar la app directamente
                  en tu dispositivo.
                </p>
                <div className="flex justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Código QR para descargar Vibra"
                      width={160}
                      height={160}
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Generando QR...</span>
                      </div>
                    </div>
                  )}
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
