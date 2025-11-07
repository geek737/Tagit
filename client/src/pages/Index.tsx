import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import heroBackground from "@/assets/hero-handshake-3d.png";

const Index = () => {
  return (
    <main>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-accent focus:text-white">
        Skip to main content
      </a>

      <div className="bg-gradient-bg dark min-h-screen">
        <div className="relative min-h-screen">
          <div
            className="absolute inset-0 bg-gradient-bg lg:bg-none"
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
            <Header />
            <HeroSection />
          </div>
        </div>
      </div>

      <AboutSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </main>
  );
};

export default Index;
