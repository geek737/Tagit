import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg dark">
      {/* Background Pattern Overlay - Hidden on mobile */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none hidden md:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 101px),
            repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 101px)
          `,
        }}
      />
      
      <div className="relative z-10">
        <Header />
        <HeroSection />
      </div>
    </div>
  );
};

export default Index;
