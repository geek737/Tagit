import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SectionLoader } from "@/components/ui/GlobalLoader";
import { toast } from "sonner";

interface ContactHeader {
  heading_line1: string;
  heading_line2: string;
  heading_line1_color: string;
  heading_line2_color: string;
  description: string;
  description_color: string;
  background_color: string;
  background_gradient: string | null;
  map_enabled: boolean;
  map_embed_code: string;
  map_address: string;
  map_height: string;
}

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
}

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [header, setHeader] = useState<ContactHeader | null>(null);
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, contactsRes] = await Promise.all([
        supabase.from('contact_header').select('*').eq('is_active', true).single(),
        supabase.from('contact_info').select('*').eq('is_visible', true).order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (contactsRes.data) setContactInfos(contactsRes.data);
    } catch (error) {
      console.error('Error loading contact content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        toast.success('Votre message a ete envoye avec succes!');
        
        // Reset submitted state after 3 seconds to show button again
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      } else {
        toast.error(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      toast.error('Erreur de connexion. Veuillez reessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const defaultHeader: ContactHeader = {
    heading_line1: 'Contact',
    heading_line2: 'Us',
    heading_line1_color: '#FFFFFF',
    heading_line2_color: '#FF6B35',
    description: 'Ready to make your brand shine? Let\'s talk about your project and discover together how we can help you.',
    description_color: '#FFFFFF',
    background_color: '#2D1B4E',
    background_gradient: null,
    map_enabled: true,
    map_embed_code: '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d13120.798867211159!2d-1.9428840296350465!3d34.70014227450874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sma!4v1765714776080!5m2!1sfr!2sma" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    map_address: 'Oujda, Morocco',
    map_height: '300px'
  };

  const displayHeader = header || defaultHeader;

  const extractMapSrc = (embedCode: string): string | null => {
    const match = embedCode.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  // Fonction pour obtenir l'icône
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return Mail;
      case 'Phone':
        return Phone;
      case 'MapPin':
        return MapPin;
      default:
        return Mail;
    }
  };

  if (loading) {
    return (
      <section id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-24 bg-gradient-bg dark">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <SectionLoader text="Chargement..." />
        </div>
      </section>
    );
  }

  return (
    <section 
      id="contact" 
      className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 lg:py-24 bg-gradient-bg dark"
      style={{
        backgroundColor: displayHeader.background_color,
        background: displayHeader.background_gradient || displayHeader.background_color
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span style={{ color: displayHeader.heading_line1_color }}>
              {displayHeader.heading_line1}
            </span>{' '}
            <span style={{ color: displayHeader.heading_line2_color }}>
              {displayHeader.heading_line2}
            </span>
          </h2>
          <p 
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: displayHeader.description_color }}
          >
            {displayHeader.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white">
                Let's Stay Connected
              </h3>
              <p className="text-foreground/70 text-sm md:text-base">
                Our team is here to answer all your questions and support you in your digital projects.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfos.length > 0 ? (
                contactInfos.map((contact) => {
                  const IconComponent = getIcon(contact.icon);
                  const href = contact.type === 'email' 
                    ? `mailto:${contact.value}`
                    : contact.type === 'phone'
                    ? `tel:${contact.value.replace(/\s/g, '')}`
                    : undefined;

                  return (
                    <div key={contact.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">{contact.label}</h4>
                        {href ? (
                          <a
                            href={href}
                            className="text-foreground/70 hover:text-accent transition-colors text-sm"
                          >
                            {contact.value}
                          </a>
                        ) : (
                          <p className="text-foreground/70 text-sm">{contact.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback si pas de données
                <>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Email</h4>
                      <a
                        href="mailto:contact@tagit.ma"
                        className="text-foreground/70 hover:text-accent transition-colors text-sm"
                      >
                        contact@tagit.ma
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Phone</h4>
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
                      <h4 className="text-white font-medium mb-1">Location</h4>
                      <p className="text-foreground/70 text-sm">Morocco</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {displayHeader.map_enabled && displayHeader.map_embed_code && (
              <div className="mt-6">
                <div
                  className="relative rounded-xl overflow-hidden border border-white/10"
                  style={{ height: displayHeader.map_height }}
                >
                  <iframe
                    src={extractMapSrc(displayHeader.map_embed_code) || ''}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps"
                  />
                </div>
                {displayHeader.map_address && (
                  <p className="text-white/60 text-sm mt-2 text-center">
                    {displayHeader.map_address}
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
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
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-white">
                Phone
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
              <label htmlFor="subject" className="text-sm font-medium text-white">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="What is this about?"
                value={formData.subject}
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
                placeholder="Tell us about your project..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="bg-white/10 border-white/20 text-white placeholder:text-foreground/50 focus:border-accent resize-none"
              />
            </div>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Message sent successfully!</span>
              </div>
            ) : (
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={submitting}
                className="w-full focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
