'use client';

import { Building2, Settings2, Smartphone, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from './scroll-reveal';

const steps = [
  {
    icon: Building2,
    title: 'Institución se registra',
    description: 'La escuela o institución educativa crea su espacio en Vibra desde el panel de administración.',
    color: 'text-vibra-blue',
    bgColor: 'bg-vibra-blue/10',
    gradient: 'from-vibra-blue to-vibra-blue-light',
  },
  {
    icon: Settings2,
    title: 'Admin configura actividades',
    description: 'El equipo docente diseña y programa las actividades emocionales para sus estudiantes.',
    color: 'text-vibra-coral',
    bgColor: 'bg-vibra-coral/10',
    gradient: 'from-vibra-coral to-rose-400',
  },
  {
    icon: Smartphone,
    title: 'Estudiantes participan',
    description: 'Los participantes acceden desde la app móvil y completan las actividades diarias.',
    color: 'text-vibra-yellow',
    bgColor: 'bg-vibra-yellow/10',
    gradient: 'from-vibra-yellow to-amber-400',
  },
  {
    icon: TrendingUp,
    title: 'Crecimiento emocional',
    description: 'Se genera un registro del progreso emocional individual y colectivo en tiempo real.',
    color: 'text-vibra-mint',
    bgColor: 'bg-vibra-mint/10',
    gradient: 'from-vibra-mint to-emerald-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#f8fafc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibra-heading mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Cuatro pasos simples para transformar la educación emocional en tu institución.
          </p>
        </ScrollReveal>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:grid grid-cols-4 gap-6 relative isolate">
          {/* Línea conectora — justo detrás de los números de paso, conectándolos secuencialmente */}
          <motion.div
            className="absolute top-[18px] left-[12.5%] right-[12.5%] h-[3px] rounded-full bg-gradient-to-r from-vibra-blue via-vibra-coral via-vibra-yellow to-vibra-mint -z-10"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.1 }}
                className="flex flex-col items-center text-center z-10"
              >
                  {/* Step number — con fondo sólido para tapar la línea que pasa detrás */}
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${step.gradient} text-white text-sm font-bold flex items-center justify-center mb-6 shadow-md group-hover:scale-125 group-hover:shadow-xl transition-all duration-300`}>
                    {index + 1}
                  </div>
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl ${step.bgColor} ${step.color} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}>
                    <Icon className="w-9 h-9 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Text */}
                  <h3 className={`text-lg font-bold mb-2 ${step.color}`}>
                    {step.title}
                  </h3>
                  <p className="text-vibra-body text-sm leading-relaxed max-w-[220px] group-hover:text-vibra-heading transition-colors duration-300">
                    {step.description}
                  </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={step.title} delay={index * 0.1} direction="left">
                <div className="group flex gap-5 items-start">
                  {/* Number + line */}
                  <div className="flex flex-col items-center">
                    <div className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-br ${step.gradient} text-white text-base font-bold flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-12 bg-gradient-to-b from-vibra-blue/30 to-vibra-mint/30 mt-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl ${step.bgColor} ${step.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className={`text-base font-bold transition-colors duration-300 ${step.color}`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-vibra-body text-sm leading-relaxed ml-[3.25rem] group-hover:text-vibra-heading transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
