import Link from 'next/link';
import './index.css';

export default function HomePage() {
    return (<div className="page-container">
        <header className="page-header">
            <div className="page-header__top">
                <img src="logo.png" alt="Site logo" className='rounded-md w-64' />
                <nav className="page-header__nav flex items-center">
                    <Link href="#" className="page-header__nav-link">Contacto</Link>
                    <Link href="#" className="page-header__nav-link">Soporte</Link>
                    <Link href="/layout" className="page-header__main-link button bg-blue-500">
                        <span className="font-bold text-white">Iniciar sesión</span>
                    </Link>
                </nav>
            </div>
            <div className="page-header__main mt-0">
                <div className="page-header__main-left">
                    <h1 className="page-header__title">Dashboard</h1>
                    <p className="page-header__copy">Panel de administración para la aplicación de Vibra.</p>
                    <Link href="/layout" className="page-header__main-link button bg-blue-500">
                        <span className="font-bold text-white">Iniciar sesión</span>
                    </Link>
                </div>
                <div className="page-header__main-right mt-0">
                </div>
            </div>
        </header>
        <main className="page-main">
        </main>
        <footer className="page-footer">
            <div className="page-footer__container">
                <div className="page-footer__site-info">
                    <h2 className="page-footer__title">Vibra</h2>
                    <p className="page-footer__copy">Un desarrollo a la medida</p>
                    <p className="page-footer__copy">Desarrollado por el equipo de vibra y cds.</p>
                </div>
                <div className="page-footer__nav">
                    <div className="page-footer__nav-section">
                        <h3 className="page-footer__subtitle">Mapa del sitio</h3>
                        <a href="#" className="page-footer__link">FAQ</a>
                    </div>
                    <div className="page-footer__nav-section">
                        <h3 className="page-footer__subtitle">Sitemap</h3>
                        <a href="#" className="page-footer__link">Soporte</a>
                        <a href="#" className="page-footer__link">Contacto</a>
                    </div>
                    <div className="page-footer__nav-section">
                        <h3 className="page-footer__subtitle page-footer__subtitle--margin-top">Company</h3>
                        <a href="#" className="page-footer__link">Acerca de</a>
                    </div>
                    <div className="page-footer__nav-section">
                        <h3 className="page-footer__subtitle page-footer__subtitle--margin-top">Portafolio</h3>
                        <a href="#" className="page-footer__link">cds.net.co</a>
                        <a href="#" className="page-footer__link">Vibra</a>
                    </div>
                </div>
            </div>
        </footer>
    </div>);
}