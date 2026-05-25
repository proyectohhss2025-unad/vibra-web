'use client';

import { Gamepad2, Smartphone, BarChart3, Bot } from 'lucide-react';
import ScrollReveal from './scroll-reveal';

const features = [
  {
    icon: Gamepad2,
    title: 'Gamificación educativa',
    description: 'Actividades tipo juego que hacen del aprendizaje emocional una experiencia divertida y motivadora.',
    accent: 'border-l-vibra-blue',
    iconColor: 'text-vibra-blue',
    bgColor: 'bg-vibra-blue/5',
  },
  {
    icon: Smartphone,
    title: 'Experiencia mobile-first',
    description: 'Los participantes acceden desde su celular en cualquier momento y lugar, sin complicaciones.',
    accent: 'border-l-vibra-coral',
    iconColor: 'text-vibra-coral',
    bgColor: 'bg-vibra-coral/5',
  },
  {
    icon: BarChart3,
    title: 'Dashboard institucional',
    description: 'Los administradores visualizan el progreso en tiempo real con reportes detallados y exportables.',
    accent: 'border-l-vibra-mint',
    iconColor: 'text-vibra-mint',
    bgColor: 'bg-vibra-mint/5',
  },
  {
    icon: Bot,
    title: 'Asistente emocional',
    description: 'Un acompañante virtual animado que guía y motiva a los estudiantes durante las actividades.',
    accent: 'border-l-vibra-yellow',
    iconColor: 'text-vibra-yellow',
    bgColor: 'bg-vibra-yellow/5',
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibra-heading mb-4">
            ¿Por qué{' '}
            <span className="bg-gradient-to-r from-vibra-blue to-vibra-coral bg-clip-text text-transparent">
              Vibra
            </span>
            ?
          </h2>
          <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Una plataforma diseñada para instituciones que quieren transformar la
            educación emocional de sus estudiantes.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} delay={index * 0.1} direction={index % 2 === 0 ? 'left' : 'right'}>
                <div
                  className={`group flex gap-5 p-6 rounded-2xl border border-gray-100 border-l-4 ${feature.accent} hover:shadow-lg transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bgColor} ${feature.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold text-vibra-heading mb-1.5 ${feature.iconColor}`}>
                      {feature.title}
                    </h3>
                    <p className="text-vibra-body text-sm leading-relaxed">
                      {feature.description}
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
