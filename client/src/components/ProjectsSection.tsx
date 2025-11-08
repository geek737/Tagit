import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import projectPromotion from "@/assets/project-promotion.png";
import projectPromotionCopy from "@/assets/project-promotion copy.png";
import projectPromotionCopy2 from "@/assets/project-promotion copy copy.png";
import projectBlendimmo from "@/assets/project-blendimmo.png";
import projectBlendimmoCopy from "@/assets/project-blendimmo copy.png";
import projectMoujda from "@/assets/project-moujda.png";

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      image: projectPromotion,
      title: "Promotion de l'Égalité de Genre",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 2,
      image: projectPromotionCopy,
      title: "Promotion de l'Égalité de Genre",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 3,
      image: projectPromotionCopy2,
      title: "Promotion de l'Égalité de Genre",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 4,
      image: projectBlendimmo,
      title: "Blendimmo",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 5,
      image: projectBlendimmoCopy,
      title: "Blendimmo",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
    {
      id: 6,
      image: projectMoujda,
      title: "Moujda",
      description: "Logo Design, Graphic Chart Creation, and Visual Identity Development"
    },
  ];

  return (
    <section
      id="projects"
      className="w-full min-h-screen relative overflow-hidden flex items-center bg-white"
    >
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <Carousel className="w-full">
              <CarouselContent>
                {projects.map((project) => (
                  <CarouselItem key={project.id}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-accent mb-2">Services</h3>
                      <p className="text-gray-700">{project.description}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-4xl lg:text-6xl font-bold">
              <span className="text-[#7c3aed]">Our bold</span>
              <br />
              <span className="text-[#7c3aed]">projects</span>
            </h2>

            <div className="space-y-4 text-gray-700">
              <p>
                chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons. Nos projets allient créativité, innovation et stratégie pour transformer les idées en résultats concrets. Chaque initiative est pensée pour repousser les limites, surprendre, et générer une réelle valeur pour nos clients.
              </p>

              <p>
                Avec nos projets audacieux, le digital devient bien plus qu'un outil : il devient un véritable moteur de croissance et d'opportunités.
              </p>
            </div>

            <div className="relative">
              <svg
                className="w-full h-32 opacity-20"
                viewBox="0 0 400 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="30" r="4" fill="#9b87f5" />
                <circle cx="100" cy="60" r="4" fill="#9b87f5" />
                <circle cx="150" cy="40" r="4" fill="#9b87f5" />
                <circle cx="200" cy="70" r="4" fill="#9b87f5" />
                <circle cx="250" cy="20" r="4" fill="#9b87f5" />
                <circle cx="300" cy="50" r="4" fill="#9b87f5" />
                <circle cx="350" cy="35" r="4" fill="#9b87f5" />
                <line x1="50" y1="30" x2="100" y2="60" stroke="#9b87f5" strokeWidth="1" />
                <line x1="100" y1="60" x2="150" y2="40" stroke="#9b87f5" strokeWidth="1" />
                <line x1="150" y1="40" x2="200" y2="70" stroke="#9b87f5" strokeWidth="1" />
                <line x1="200" y1="70" x2="250" y2="20" stroke="#9b87f5" strokeWidth="1" />
                <line x1="250" y1="20" x2="300" y2="50" stroke="#9b87f5" strokeWidth="1" />
                <line x1="300" y1="50" x2="350" y2="35" stroke="#9b87f5" strokeWidth="1" />
              </svg>
            </div>

            <button className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-2 transition-all hover:scale-105">
              view projects
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
