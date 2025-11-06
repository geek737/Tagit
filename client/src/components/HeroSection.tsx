import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 py-8 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center lg:justify-start min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-120px)]">
          {/* Left Content */}
          <div className="flex flex-col gap-8 md:gap-12 lg:gap-16 w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="text-accent">Digital marketing,</span>
              <br />
              <span className="text-foreground">Branding, Content</span>
            </h1>

            <div className="space-y-3 md:space-y-4">
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                Chaque marque a une histoire à raconter.
              </h2>
              <p className="text-foreground/90 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                La nôtre, c'est d'aider la vôtre à briller avec des idées qui marquent, une stratégie qui inspire et un impact qui dure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="group w-full sm:w-auto"
                data-testid="button-what-we-offer"
              >
                what we offer
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline-light" 
                size="lg" 
                className="group w-full sm:w-auto"
                data-testid="button-see-our-work"
              >
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
