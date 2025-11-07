import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-tagtik.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <img src={logo} alt="TagTik Logo" className="h-10 w-auto" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              Votre agence de marketing digital au Maroc. Nous transformons vos idées en succès digitaux.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#main-content"
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Nos Services
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-foreground/80 hover:text-accent transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Services</h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>Marketing Digital</li>
              <li>Branding & Brand Content</li>
              <li>Social Media Management</li>
              <li>Création de Contenu</li>
              <li>Web Design & UI/UX</li>
              <li>Design Visuel</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:contact@tagtik.ma"
                  className="hover:text-accent transition-colors"
                >
                  contact@tagtik.ma
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+212600000000"
                  className="hover:text-accent transition-colors"
                >
                  +212 6 00 00 00 00
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Maroc</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              {currentYear} TagTik. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm text-foreground/60">
              <a
                href="#mentions-legales"
                className="hover:text-accent transition-colors"
              >
                Mentions Légales
              </a>
              <a
                href="#politique-confidentialite"
                className="hover:text-accent transition-colors"
              >
                Politique de Confidentialité
              </a>
              <a
                href="#cgv"
                className="hover:text-accent transition-colors"
              >
                CGV
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
