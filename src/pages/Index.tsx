import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import heroBackground from "@/assets/hero-handshake-3d.png";

const Index = () => {
  return (
    <>
      <div className="bg-gradient-bg dark max-h-screen">
        {/* Hero Section with Background Image */}
        <div className="relative max-h-screen">
          {/* Background Image - Hidden on mobile, gradient on mobile */}
          <div 
            className="absolute inset-0 bg-gradient-bg md:bg-none"
            style={{
              backgroundImage: `url(${heroBackground})`,
              backgroundSize: 'auto',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Background Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none hidden md:block"
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
          
          <div className="relative z-10 h-screen">
            <Header />
            <HeroSection />
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutSection />
    </>
  );
};

export default Index;
