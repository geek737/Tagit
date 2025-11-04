import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-handshake-3d.png";

const HeroSection = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-accent">Digital marketing,</span>
              <br />
              <span className="text-foreground">Branding, Content</span>
            </h1>

            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                Chaque marque a une histoire à raconter.
              </h2>
              <p className="text-foreground/90 text-base md:text-lg leading-relaxed max-w-xl">
                La nôtre, c'est d'aider la vôtre à briller avec des idées qui marquent, une stratégie qui inspire et un impact qui dure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="lg" className="group">
                what we offer
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline-light" size="lg" className="group">
                See Our Work
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative backdrop-blur-sm bg-foreground/5 border border-foreground/20 rounded-3xl p-8 md:p-12">
                <img
                  src={heroImage}
                  alt="Digital partnership handshake"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
