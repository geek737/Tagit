# TagIT - Digital Marketing & Branding Platform

## 🚀 Description

TagIT est une plateforme web complète pour une agence de marketing digital et branding au Maroc. Le projet inclut :
- **Site vitrine** : Pages de services, portfolio, équipe, témoignages
- **Backoffice CMS** : Gestion complète du contenu, médias, pages
- **Système d'emails** : Templates stylés, SMTP configurable, logs

## 🛠 Technologies

- **Frontend** : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend** : Express.js, Supabase (Database + Auth + Storage)
- **Email** : Nodemailer avec SMTP configurable
- **Deployment** : Hostinger (FTP ou GitHub Actions)

## 📦 Installation

```bash
# Cloner le repo
git clone <YOUR_GIT_URL>
cd Tagit

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement requises

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon

# Optionnel - pour le déploiement
VITE_PUBLIC_DOMAIN=tagit.ma
VITE_ADMIN_SUBDOMAIN=admin.tagit.ma
```

### Base de données Supabase

Exécuter les migrations dans l'ordre depuis `supabase/migrations/`.

## 🏗 Structure du Projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   │   ├── admin/      # Composants backoffice
│   │   │   ├── pages/      # Composants de pages publiques
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── pages/          # Pages React
│   │   ├── lib/            # Utilitaires (Supabase, helpers)
│   │   └── assets/         # Images et assets statiques
│   └── public/             # Fichiers publics
├── server/                 # Backend Express
│   ├── routes.ts           # API routes
│   └── index.ts            # Entry point
├── supabase/
│   └── migrations/         # Migrations SQL
└── scripts/                # Scripts utilitaires
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build
```

## 🚀 Déploiement

### Option 1 : FTP Manuel

```bash
npm run build
# Uploader le contenu de dist/public/ vers public_html/
```

### Option 2 : GitHub Actions (Automatisé)

Voir `SETUP_INSTRUCTIONS.md` pour la configuration GitHub Actions.

## 📖 Documentation

- `QUICK_START.md` - Guide de démarrage rapide
- `SETUP_INSTRUCTIONS.md` - Instructions de configuration détaillées

## 🔐 Sécurité

- Variables d'environnement pour les secrets
- Validation côté serveur des uploads
- RLS (Row Level Security) sur Supabase
- HTTPS forcé en production

## 📄 License

Propriétaire - TagIT © 2025
