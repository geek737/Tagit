import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-tagtik.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Acceuil", href: "#", active: true },
    { label: "à propos", href: "#" },
    { label: "Nos services", href: "#" },
    { label: "Portfolio", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <header className="w-full py-6 px-4 md:px-8 lg:px-16 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="TagIt Logo" className="h-10 w-auto" />
          <span className="text-foreground text-2xl font-bold">tagit</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-base font-medium transition-colors hover:text-accent ${
                item.active ? "text-accent" : "text-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden text-foreground p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-lg border-t border-border py-4 px-4">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-base font-medium transition-colors hover:text-accent py-2 ${
                  item.active ? "text-accent" : "text-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
