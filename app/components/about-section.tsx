'use client';

import { Target, Users, BarChart3 } from 'lucide-react';
import ScrollReveal from './scroll-reveal';

const benefits = [
  {
    icon: Target,
    title: 'Actividades diarias',
    description: 'Ejercicios cortos e interactivos diseñados para explorar y comprender las emociones del día a día.',
    color: 'text-vibra-blue',
    bgColor: 'bg-vibra-blue/10',
    borderColor: 'border-vibra-blue/20',
  },
  {
    icon: Users,
    title: 'Retos grupales',
    description: 'Desafíos colaborativos que fomentan el trabajo en equipo y la inteligencia emocional colectiva.',
    color: 'text-vibra-coral',
    bgColor: 'bg-vibra-coral/10',
    borderColor: 'border-vibra-coral/20',
  },
  {
    icon: BarChart3,
    title: 'Progreso emocional',
    description: 'Visualización clara del avance individual y grupal con reportes detallados para instituciones.',
    color: 'text-vibra-mint',
    bgColor: 'bg-vibra-mint/10',
    borderColor: 'border-vibra-mint/20',
  },
];

export default function AboutSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibra-heading mb-4">
            ¿Qué es{' '}
            <span className="bg-gradient-to-r from-vibra-blue to-vibra-coral bg-clip-text text-transparent">
              Vibra
            </span>
            ?
          </h2>
          <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Un proyecto educativo que utiliza la tecnología para ayudar a estudiantes
            a explorar, comprender y gestionar sus emociones a través de
            actividades interactivas diseñadas por expertos.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <ScrollReveal key={benefit.title} delay={index * 0.15}>
                <div
                  className={`group p-8 rounded-2xl border ${benefit.borderColor} ${benefit.bgColor} hover:shadow-lg transition-all duration-300`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${benefit.bgColor} ${benefit.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className={`text-xl font-bold text-vibra-heading mb-2 ${benefit.color}`}>
                    {benefit.title}
                  </h3>
                  <p className="text-vibra-body text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
