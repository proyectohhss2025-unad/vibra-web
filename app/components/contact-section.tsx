'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ScrollReveal from './scroll-reveal';
import { getApiBaseUrl } from '../lib/api-config';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactSection() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMsg('');

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}`);
      }

      setFormState('success');
      resetForm();
      setTimeout(() => setFormState('idle'), 6000);
    } catch (err) {
      setFormState('error');
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Hubo un error al enviar tu mensaje. Intenta de nuevo.',
      );
      setTimeout(() => setFormState('idle'), 5000);
    }
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-vibra-heading mb-4">
            Contáctanos
          </h2>
          <p className="text-vibra-body text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            ¿Interesado en implementar Vibra en tu institución?
            Escríbenos y te contaremos cómo.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="max-w-xl mx-auto">
          {formState === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-vibra-mint mx-auto mb-4" />
              <h3 className="text-xl font-bold text-vibra-heading mb-2">
                ¡Mensaje enviado!
              </h3>
              <p className="text-vibra-body text-sm">
                Gracias por contactarnos. Te responderemos pronto.
              </p>
            </div>
          ) : formState === 'error' ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-vibra-coral mx-auto mb-4" />
              <h3 className="text-xl font-bold text-vibra-heading mb-2">
                Error al enviar
              </h3>
              <p className="text-vibra-body text-sm mb-6">
                {errorMsg}
              </p>
              <button
                onClick={() => setFormState('idle')}
                className="px-6 py-2.5 rounded-xl bg-vibra-blue text-white text-sm font-medium hover:bg-vibra-blue-light transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-vibra-heading mb-1.5">
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-vibra-heading placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vibra-blue/30 focus:border-vibra-blue transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-vibra-heading mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-vibra-heading placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vibra-blue/30 focus:border-vibra-blue transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-vibra-heading mb-1.5">
                  Asunto
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="¿Sobre qué deseas hablar?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-vibra-heading placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vibra-blue/30 focus:border-vibra-blue transition-all"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-vibra-heading mb-1.5">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos sobre tu institución y cómo podemos ayudarte..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-vibra-heading placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-vibra-blue/30 focus:border-vibra-blue transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={formState === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-vibra-blue to-vibra-coral text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar mensaje
                  </>
                )}
              </button>
            </form>
          )}

          {/* Alternative contact */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-vibra-body text-sm flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-vibra-coral" />
              O escríbenos directamente a{' '}
              <a
                href="mailto:contacto@vibraunad.com.co"
                className="text-vibra-blue font-medium hover:underline"
              >
                contacto@vibraunad.com.co
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
