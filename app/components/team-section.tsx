'use client';

import ScrollReveal from './scroll-reveal';

const teamMembers = [
  {
    name: 'Ermes Guarnizo Motta',
    role: 'Designer and Product Owner',
    image: '/images/team/ermes_guarnizo_motta.jpeg',
  },
  {
    name: 'Yovany Suárez Silva',
    role: 'Software Engineer & Lead Developer',
    image: '/images/team/yovany_suarez.jpeg',
  },
  {
    name: 'Lic. Javier Miranda',
    role: 'Líder de Investigación',
    image: '/images/team/javier_miranda.png',
  },
];

const sponsors = [
  {
    name: 'UNAD',
    description: 'Universidad Nacional Abierta y a Distancia',
    image: '/images/sponsors/logo_unad.png',
  },
  {
    name: 'SEMILLERO',
    description: 'Semillero de Investigación',
    image: '/images/sponsors/logo_semillero.jpg',
  },
  {
    name: 'CURARE',
    description: 'Semillero de Investigación',
    image: '/images/sponsors/ciencia_curare.png',
  },
];

export default function TeamSection() {
  return (
    <section className="bg-[#f8fafc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Team members */}
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vibra-heading mb-4">
            Equipo{' '}
            <span className="bg-gradient-to-r from-vibra-blue to-vibra-coral bg-clip-text text-transparent">
              Vibra
            </span>
          </h2>
          <p className="text-vibra-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Un proyecto impulsado por investigadores, desarrolladores y educadores
            comprometidos con la educación emocional.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          {teamMembers.map((member, index) => (
            <ScrollReveal key={member.name} delay={index * 0.1}>
              <div className="group text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="w-24 h-24 rounded-full mx-auto mb-5 overflow-hidden ring-2 ring-vibra-blue/20 group-hover:ring-vibra-blue/40 transition-all duration-300">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-base md:text-lg font-bold text-vibra-heading mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-vibra-body/70">
                  {member.role}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Sponsors */}
        <ScrollReveal delay={0.4}>
          <div className="text-center border-t border-gray-200 pt-16">
            <p className="text-xs uppercase tracking-widest text-vibra-body/50 mb-2">
              Con el apoyo de
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap mt-8">
              {sponsors.map((sponsor, index) => (
                <ScrollReveal key={sponsor.name} delay={0.5 + index * 0.1}>
                  <div className="group text-center">
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-3 overflow-hidden bg-white p-2 shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300">
                      <img
                        src={sponsor.image}
                        alt={sponsor.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-sm font-semibold text-vibra-heading">
                      {sponsor.name}
                    </p>
                    <p className="text-xs text-vibra-body/60 max-w-[140px] mx-auto">
                      {sponsor.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
