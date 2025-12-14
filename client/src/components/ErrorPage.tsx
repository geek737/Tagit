import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Home, RefreshCw, ArrowLeft, Mail, Search, AlertTriangle, ShieldX, ServerCrash, WifiOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ErrorType = 400 | 401 | 403 | 404 | 500 | 503 | 'offline' | 'unknown';

interface ErrorConfig {
  code: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actions: ActionType[];
  animation?: string;
}

type ActionType = 'home' | 'back' | 'retry' | 'contact' | 'search';

interface ErrorPageProps {
  type?: ErrorType;
  customTitle?: string;
  customDescription?: string;
  showSearch?: boolean;
}

const errorConfigs: Record<ErrorType, ErrorConfig> = {
  400: {
    code: "400",
    title: "Requete invalide",
    description: "La requete envoyee contient des donnees incorrectes. Veuillez verifier et reessayer.",
    icon: AlertTriangle,
    actions: ['back', 'home'],
  },
  401: {
    code: "401",
    title: "Authentification requise",
    description: "Vous devez vous connecter pour acceder a cette page.",
    icon: ShieldX,
    actions: ['back', 'home'],
  },
  403: {
    code: "403",
    title: "Acces refuse",
    description: "Vous n'avez pas les permissions necessaires pour acceder a cette ressource.",
    icon: ShieldX,
    actions: ['back', 'home', 'contact'],
  },
  404: {
    code: "404",
    title: "Page introuvable",
    description: "La page que vous recherchez n'existe pas ou a ete deplacee.",
    icon: Search,
    actions: ['home', 'back'],
  },
  500: {
    code: "500",
    title: "Erreur serveur",
    description: "Une erreur inattendue s'est produite. Notre equipe technique a ete notifiee.",
    icon: ServerCrash,
    actions: ['retry', 'home', 'contact'],
  },
  503: {
    code: "503",
    title: "Service temporairement indisponible",
    description: "Le site est en cours de maintenance. Nous serons de retour tres bientot.",
    icon: Clock,
    actions: ['retry', 'home'],
  },
  offline: {
    code: "Hors ligne",
    title: "Connexion perdue",
    description: "Verifiez votre connexion internet et reessayez.",
    icon: WifiOff,
    actions: ['retry'],
  },
  unknown: {
    code: "Erreur",
    title: "Une erreur est survenue",
    description: "Quelque chose s'est mal passe. Veuillez reessayer ou contacter le support.",
    icon: AlertTriangle,
    actions: ['retry', 'home', 'contact'],
  },
};

const ErrorPage = ({
  type = 404,
  customTitle,
  customDescription,
  showSearch = false
}: ErrorPageProps) => {
  const [location, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const effectiveType = !isOnline ? 'offline' : type;
  const config = errorConfigs[effectiveType];

  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const IconComponent = config.icon;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (type === 404) {
      console.error(`404 Error: User attempted to access non-existent route: ${location}`);
    }
  }, [location, type]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  const handleContact = () => {
    setLocation('/#contact');
  };

  const actionButtons: Record<ActionType, JSX.Element> = {
    home: (
      <Button
        key="home"
        onClick={() => setLocation('/')}
        className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2"
      >
        <Home className="w-4 h-4" />
        Accueil
      </Button>
    ),
    back: (
      <Button
        key="back"
        variant="outline"
        onClick={handleBack}
        className="border-white/20 text-white hover:bg-white/10 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Button>
    ),
    retry: (
      <Button
        key="retry"
        onClick={handleRetry}
        className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Reessayer
      </Button>
    ),
    contact: (
      <Button
        key="contact"
        variant="outline"
        onClick={handleContact}
        className="border-white/20 text-white hover:bg-white/10 gap-2"
      >
        <Mail className="w-4 h-4" />
        Nous contacter
      </Button>
    ),
    search: (
      <Button
        key="search"
        variant="outline"
        onClick={() => setLocation('/')}
        className="border-white/20 text-white hover:bg-white/10 gap-2"
      >
        <Search className="w-4 h-4" />
        Rechercher
      </Button>
    ),
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'linear-gradient(180deg, hsl(265, 85%, 15%) 0%, hsl(265, 75%, 20%) 50%, hsl(265, 85%, 15%) 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 mb-6 animate-float">
            <IconComponent className="w-12 h-12 text-[#FF6B35]" />
          </div>

          <div className="text-8xl font-bold text-white/10 mb-2 select-none">
            {config.code}
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h1>

          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up"
             style={{ animationDelay: '0.4s' }}>
          {config.actions.map((action) => actionButtons[action])}
          {showSearch && actionButtons.search}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 animate-fade-in"
             style={{ animationDelay: '0.6s' }}>
          <p className="text-white/40 text-sm">
            Besoin d'aide ? Contactez-nous a{' '}
            <a href="mailto:contact@tagit.ma" className="text-[#FF6B35] hover:underline">
              contact@tagit.ma
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
