import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ProjectsSection from "@/components/ProjectsSection";
import TeamSection from "@/components/TeamSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalLoader from "@/components/ui/GlobalLoader";
import heroBackground from "@/assets/hero-handshake-3d.png";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial page load
  useEffect(() => {
    // Wait for all critical components to be ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);
  // Gérer le scroll vers l'ancre après le chargement de la page
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      let attempts = 0;
      const maxAttempts = 10;
      
      const scrollToSection = () => {
        const element = document.querySelector(hash);
        if (element) {
          // Élément trouvé, scroll vers lui
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      // Fonction qui réessaie jusqu'à trouver l'élément
      const attemptScroll = () => {
        attempts++;
        if (!scrollToSection() && attempts < maxAttempts) {
          // Réessayer après 200ms si l'élément n'est pas encore chargé
          setTimeout(attemptScroll, 200);
        }
      };

      // Premier essai après un court délai pour laisser React rendre
      setTimeout(attemptScroll, 100);
    }
  }, []);

  return (
    <>
      {/* Global loading screen */}
      <GlobalLoader isLoading={isLoading} text="Chargement..." fullScreen />
      
      <main className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-accent focus:text-white">
          Skip to main content
        </a>

        <Header />

        <div className="bg-gradient-bg dark min-h-screen">
          <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-gradient-bg lg:bg-none" />
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                backgroundImage: `url(${heroBackground})`,
                backgroundSize: 'auto',
                backgroundRepeat: 'no-repeat',
              }}
              role="presentation"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 opacity-30 pointer-events-none hidden lg:block"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                    repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 101px),
                    repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 101px)
                  `,
                }}
              />
            </div>

            <div className="relative z-10">
              <HeroSection />
            </div>
          </div>
        </div>

        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <TeamSection />
        <TestimonialsSection />
        <ContactSection />
        <Footer />
        <ScrollToTop />
      </main>
    </>
  );
};

export default Index;
