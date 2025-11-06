import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center lg:justify-start min-h-[calc(100vh-120px)] pt-16">
          {/* Left Content */}
          <div className="flex flex-col gap-16">
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

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
