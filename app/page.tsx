import './globals.css';
import Navbar from './components/navbar';
import HeroSection from './components/hero-section';
import WaveDivider from './components/wave-divider';
import AboutSection from './components/about-section';
import HowItWorksSection from './components/how-it-works';
import BenefitsSection from './components/benefits-section';
import TeamSection from './components/team-section';
import ContactSection from './components/contact-section';
import Footer from './components/footer';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <WaveDivider color="#ffffff" />
      <AboutSection />
      <WaveDivider color="#f8fafc" />
      <HowItWorksSection />
      <WaveDivider color="#ffffff" />
      <BenefitsSection />
      <WaveDivider color="#f8fafc" />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
