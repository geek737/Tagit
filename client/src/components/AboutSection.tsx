import robotImage from "@/assets/robot-3d-orange.png";

const AboutSection = () => {
  return (
    <section id="about" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-24 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
          <div className="flex-1 flex justify-center lg:justify-start w-full">
            <img
              src={robotImage}
              alt="Robot 3D orange et violet représentant l'innovation de l'agence TagTik"
              className="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex-1 space-y-4 md:space-y-6 lg:space-y-8 w-full">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight">
              <span className="text-primary font-bold">Entrez dans</span>
              <br />
              <span className="text-primary font-bold">Notre </span>
              <span className="text-primary font-normal">Univers</span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl text-black font-medium">
              Agence <span className="text-accent font-semibold">Digitale - Web</span>
            </p>

            <div className="space-y-4 md:space-y-5 text-black">
              <p className="text-sm md:text-base lg:text-lg leading-relaxed text-justify">
                Nous concevons des expériences digitales qui font briller les marques. Guidés par la stratégie, animés par la créativité et portés par le digital, nous créons des contenus et des histoires qui inspirent, osent et laissent une empreinte durable, tout en générant un impact réel.
              </p>
              
              <p className="text-sm md:text-base lg:text-lg leading-relaxed text-justify">
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
