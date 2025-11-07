import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-24 bg-gradient-bg dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Contactez-<span className="text-accent">Nous</span>
          </h2>
          <p className="text-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
            Prêt à faire briller votre marque ? Parlons de votre projet et découvrons ensemble comment nous pouvons vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">
                Restons en Contact
              </h3>
              <p className="text-foreground/70 text-sm md:text-base">
                Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans vos projets digitaux.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Email</h4>
                  <a
                    href="mailto:contact@tagtik.ma"
                    className="text-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    contact@tagtik.ma
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Téléphone</h4>
                  <a
                    href="tel:+212600000000"
                    className="text-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    +212 6 00 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Localisation</h4>
                  <p className="text-foreground/70 text-sm">Maroc</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Nom complet
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-white">
                Téléphone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+212 6 00 00 00 00"
                value={formData.phone}
                onChange={handleChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-white">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Parlez-nous de votre projet..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full focus:ring-2 focus:ring-accent focus:ring-offset-2"
            >
              Envoyer le Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
