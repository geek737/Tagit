import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import logo from "@/assets/logo-tagtik.png";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  display_order: number;
  is_visible: boolean;
}

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const Header = () => {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("main-content");
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Vérifier si on est sur la page d'accueil
  const isHomePage = location === "/" || location === "";

  // Charger les items du menu depuis la base de données
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .is('parent_id', null) // Seulement les items de premier niveau
          .eq('is_visible', true) // Seulement les items visibles
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading menu items:', error);
          // En cas d'erreur, utiliser les items par défaut
          setNavItems([
            { label: "Home", href: "#main-content", id: "main-content" },
            { label: "About", href: "#about", id: "about" },
            { label: "Services", href: "#services", id: "services" },
            { label: "Team", href: "#team", id: "team" },
            { label: "Contact", href: "#contact", id: "contact" },
          ]);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          // Transformer les données de la DB en format NavItem
          const items: NavItem[] = data.map((item: MenuItem) => ({
            label: item.label,
            href: item.href,
            id: item.href.replace('#', '') || item.label.toLowerCase(), // Extraire l'ID du href
          }));
          setNavItems(items);
          
          // Définir la section active par défaut (premier item)
          if (items.length > 0) {
            setActiveSection(items[0].id);
          }
        } else {
          // Pas d'items dans la DB, utiliser les items par défaut
          setNavItems([
            { label: "Home", href: "#main-content", id: "main-content" },
            { label: "About", href: "#about", id: "about" },
            { label: "Services", href: "#services", id: "services" },
            { label: "Team", href: "#team", id: "team" },
            { label: "Contact", href: "#contact", id: "contact" },
          ]);
        }
      } catch (error) {
        console.error('Error:', error);
        // En cas d'erreur, utiliser les items par défaut
        setNavItems([
          { label: "Home", href: "#main-content", id: "main-content" },
          { label: "About", href: "#about", id: "about" },
          { label: "Services", href: "#services", id: "services" },
          { label: "Team", href: "#team", id: "team" },
          { label: "Contact", href: "#contact", id: "contact" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  useEffect(() => {
    if (loading || navItems.length === 0) return; // Attendre que le menu soit chargé

    const headerOffset = 150; // Offset pour le header fixe

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Si on est tout en haut, activer le premier item
      if (window.scrollY < 100 && navItems.length > 0) {
        setActiveSection(navItems[0].id);
        return;
      }

      // Trouver la section actuellement visible dans le viewport
      let currentSection = navItems.length > 0 ? navItems[0].id : "main-content";
      
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
        const element = document.getElementById(item.id);
        
        if (element) {
          const rect = element.getBoundingClientRect();
          // La section est visible si elle commence avant la position du header
          if (rect.top <= headerOffset) {
            currentSection = item.id;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Appeler une fois au chargement pour définir l'état initial
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, navItems]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
    // Si on n'est pas sur la page d'accueil, rediriger vers l'accueil avec la section
    if (!isHomePage) {
      // Naviguer vers l'accueil avec l'ancre
      window.location.href = `/${href}`;
      return;
    }
    
    // Si on est sur la page d'accueil, scroll vers la section
    const element = document.querySelector(href);
    if (element) {
      const sectionId = href.replace('#', '');
      setActiveSection(sectionId); // Mettre à jour immédiatement l'item cliqué
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fonction pour retourner à l'accueil
  const handleLogoClick = () => {
    if (isHomePage) {
      // Si on est sur l'accueil, scroll en haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Sinon, naviguer vers l'accueil
      setLocation('/');
    }
  };

  return (
    <header
      className={`w-full py-6 px-4 md:px-8 lg:px-16 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleLogoClick}
            className="cursor-pointer rounded-lg transition-transform hover:scale-105"
            aria-label="Go to homepage"
          >
            <img src={logo} alt="tagit Logo" className="h-14 md:h-16 w-auto" />
          </button>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {loading ? (
            <div className="flex gap-8">
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : (
            navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-base font-medium transition-colors hover:text-accent focus:outline-none rounded-sm px-1 ${
                    isActive ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.label}
                </a>
              );
            })
          )}
        </nav>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="lg:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-lg border-t border-border py-4 px-4">
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col gap-4">
                <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : (
              navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-base font-medium transition-colors hover:text-accent py-2 focus:outline-none rounded-sm ${
                      isActive ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
