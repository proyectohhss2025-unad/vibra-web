import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#fdfcf9] border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Brand */}
          <div className="flex-1">
            <img
              src="logo.png"
              alt="Vibra"
              className="h-10 w-auto mb-4"
            />
            <p className="text-vibra-body text-sm max-w-xs leading-relaxed">
              Educación emocional a través de experiencias interactivas. Un proyecto
              diseñado para comprender y gestionar las emociones.
            </p>
          </div>

          {/* Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Col 1 */}
            <div>
              <h3 className="font-semibold text-vibra-heading text-sm mb-4">
                Navegación
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="/layout" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2 */}
            <div>
              <h3 className="font-semibold text-vibra-heading text-sm mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="#" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-vibra-body text-sm hover:text-vibra-blue transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h3 className="font-semibold text-vibra-heading text-sm mb-4">
                Contacto
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="mailto:contacto@vibra.com"
                    className="text-vibra-body text-sm hover:text-vibra-blue transition-colors"
                  >
                    contacto@vibraunad.com.co
                  </a>
                </li>
                <li>
                  <a
                    href="https://cds.net.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vibra-body text-sm hover:text-vibra-blue transition-colors"
                  >
                    cds.net.co
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-vibra-body text-xs">
            © {currentYear} Vibra — Todos los derechos reservados.
          </p>
          <p className="text-vibra-body text-xs flex items-center gap-1">
            Hecho con <Heart className="w-3.5 h-3.5 text-vibra-coral fill-vibra-coral" /> por el equipo Vibra & CDS
          </p>
        </div>
      </div>
    </footer>
  );
}
