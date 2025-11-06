import robotImage from "@/assets/robot-3d-orange.png";

const AboutSection = () => {
  return (
    <section className="w-full max-h-screen px-4 md:px-8 lg:px-16 py-12 md:py-20 bg-white flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-60">
          {/* Robot Image */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <img 
              src={robotImage} 
              alt="Robot 3D orange et violet de l'agence digitale"
              className="w-full max-w-lg lg:max-w-xl h-auto object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="text-primary font-bold">Step inside</span>
              <br />
              <span className="text-primary font-bold">Our </span>
              <span className="text-primary font-medium">World</span>
            </h2>

            <h3 className="text-xl md:text-2xl font-semibold text-black">
              Agence <span className="text-primary">Digitale - Web</span>
            </h3>

            <div className="space-y-4 text-black">
              <p className="text-base md:text-lg leading-relaxed max-w-sm text-justify">
                Nous concevons des expériences digitales qui font briller les marques. Guidés par la stratégie, animés par la créativité et portés par le digital, nous créons des contenus et des histoires qui inspirent, osent et laissent une empreinte durable, tout en générant un impact réel.
              </p>
              
              <p className="text-base md:text-lg leading-relaxed max-w-sm text-justify">
                Nous serions ravis de collaborer avec vous, d'imaginer ensemble des projets qui font la différence et de donner à votre marque la visibilité et l'impact qu'elle mérite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
