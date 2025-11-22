# Instructions de Configuration - Projet Tagit

Ce document liste tous les éléments nécessaires pour configurer et lancer le projet Tagit avec Supabase.

## 📋 Prérequis

### 1. Node.js
- **Version requise**: Node.js 18+ (recommandé: LTS)
- **Vérification**: `node --version`
- **Installation**: [https://nodejs.org/](https://nodejs.org/)

### 2. Gestionnaire de paquets
- **npm** (inclus avec Node.js) ou
- **bun** (optionnel, mais le projet a un `bun.lock`)

### 3. Compte Supabase
- Créer un compte sur [https://supabase.com/](https://supabase.com/)
- Créer un nouveau projet Supabase

---

## 🔧 Configuration Supabase

### Étape 1: Créer un projet Supabase

1. Se connecter à [Supabase Dashboard](https://app.supabase.com/)
2. Cliquer sur "New Project"
3. Remplir les informations:
   - **Name**: tagit (ou nom de votre choix)
   - **Database Password**: Choisir un mot de passe fort (le sauvegarder!)
   - **Region**: Choisir la région la plus proche
4. Attendre la création du projet (2-3 minutes)

### Étape 2: Récupérer les clés d'API

1. Dans le Dashboard Supabase, aller dans **Settings** → **API**
2. Noter les valeurs suivantes:
   - **Project URL** (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (longue clé commençant par `eyJ...`)

### Étape 3: Appliquer les migrations SQL

Les migrations sont dans le dossier `supabase/migrations/`. Elles doivent être exécutées dans l'ordre:

1. Aller dans **SQL Editor** dans le Dashboard Supabase
2. Exécuter les fichiers dans l'ordre suivant:

   ```sql
   -- 1. Migration principale
   supabase/migrations/20251115101941_create_admin_system_schema.sql
   
   -- 2. Tables de contenu améliorées
   supabase/migrations/20251119215114_create_enhanced_content_tables.sql
   
   -- 3. Mise à jour About
   supabase/migrations/20251119215522_update_about_content_schema.sql
   
   -- 4. Mise à jour sections restantes
   supabase/migrations/20251119221317_enhance_remaining_sections_schema.sql
   ```

   **Note**: Copier le contenu de chaque fichier SQL dans l'éditeur et cliquer sur "Run"

### Étape 4: Vérifier les données initiales

Après les migrations, vérifier que:
- ✅ Table `admin_users` créée avec un utilisateur par défaut
- ✅ Toutes les tables de contenu créées
- ✅ RLS (Row Level Security) activé sur toutes les tables

### Étape 5: Configurer les politiques RLS (Row Level Security)

Vérifier que les politiques RLS sont correctement configurées pour permettre:
- Lecture publique des données de contenu (sections, projets, services, etc.)
- Écriture authentifiée pour les administrateurs

Si besoin, les politiques sont définies dans la première migration.

---

## 🔑 Configuration des Variables d'Environnement

### Créer le fichier `.env`

À la **racine du projet**, créer un fichier `.env` avec le contenu suivant:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

**Remplacez**:
- `https://votre-projet.supabase.co` par votre Project URL de Supabase
- `votre_cle_anon_publique` par votre anon/public key

**⚠️ Important**:
- Le fichier `.env` est déjà dans `.gitignore` (ne sera pas commité)
- Ces variables sont **publiques** (OK pour le frontend)
- Ne jamais commit de clés secrètes dans Git
- **Pas d'espaces** autour du signe `=` dans les variables d'environnement
- **Pas de guillemets** autour des valeurs (sauf si nécessaire)

### Format du fichier `.env`

Le fichier doit être à la racine du projet:
```
Tagit/
├── .env          ← Ici (créez ce fichier)
├── package.json
├── client/
└── server/
```

**Exemple de contenu correct**:
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.exemple...
```

---

## 📦 Installation des Dépendances

### Option 1: Avec npm

```bash
npm install
```

### Option 2: Avec bun (si installé)

```bash
bun install
```

**Durée estimée**: 1-3 minutes selon la connexion

---

## 🚀 Scripts Disponibles

Après l'installation, les scripts suivants sont disponibles:

### Développement
```bash
npm run dev
```
- Démarre le serveur de développement
- Port: `5000`
- Hot reload activé
- Accès: `http://localhost:5000`

**⚠️ Note Windows**: Si vous utilisez PowerShell sur Windows et que le script ne fonctionne pas, vous pouvez installer `cross-env`:
```bash
npm install --save-dev cross-env
```
Puis modifier `package.json` pour utiliser `cross-env NODE_ENV=development` au lieu de `NODE_ENV=development`

### Production (Build)
```bash
npm run build
```
- Compile le projet pour la production
- Génère les fichiers dans `dist/`

### Production (Démarrage)
```bash
npm run start
```
- Démarre le serveur en mode production
- Nécessite d'avoir fait `npm run build` avant

### Lint
```bash
npm run lint
```
- Vérifie la qualité du code

### Preview
```bash
npm run preview
```
- Prévisualise le build de production localement

---

## ✅ Vérification de la Configuration

### 1. Vérifier les variables d'environnement

Dans `client/src/lib/supabase.ts`, le code vérifie automatiquement la présence des variables:
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

Si les variables manquent, une erreur sera affichée au démarrage.

### 2. Tester la connexion Supabase

Après avoir lancé `npm run dev`, ouvrir la console du navigateur et vérifier:
- ❌ Pas d'erreur "Missing Supabase environment variables"
- ❌ Pas d'erreur de connexion à Supabase

### 3. Tester l'authentification admin

1. Aller sur `http://localhost:5000/admin/login`
2. Utiliser les identifiants:
   - **Username**: `admin`
   - **Password**: `admin`
3. Si la connexion fonctionne, la configuration est correcte ✅

---

## 🔍 Problèmes Courants

### Erreur: "Missing Supabase environment variables"

**Solution**:
1. Vérifier que le fichier `.env` existe à la racine du projet
2. Vérifier que les noms des variables sont corrects (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Vérifier qu'il n'y a pas d'espaces avant/après les valeurs
4. Redémarrer le serveur de développement

### Erreur: "Failed to fetch" ou problèmes de connexion

**Solution**:
1. Vérifier que l'URL Supabase est correcte (commence par `https://`)
2. Vérifier que la clé anon est correcte (très longue, commence par `eyJ`)
3. Vérifier que le projet Supabase est actif dans le Dashboard
4. Vérifier les politiques RLS dans Supabase

### Erreur: Tables n'existent pas

**Solution**:
1. Vérifier que toutes les migrations SQL ont été exécutées
2. Dans Supabase Dashboard → Table Editor, vérifier que les tables existent
3. Réexécuter les migrations si nécessaire

### Le serveur ne démarre pas

**Solution**:
1. Vérifier que le port 5000 n'est pas utilisé:
   - Windows: `netstat -ano | findstr :5000`
   - Mac/Linux: `lsof -i :5000`
2. Vérifier que Node.js est installé: `node --version`
3. Réinstaller les dépendances:
   - Windows: `rmdir /s /q node_modules && npm install`
   - Mac/Linux: `rm -rf node_modules && npm install`
4. Vérifier les logs d'erreur dans la console
5. Sur Windows, si `NODE_ENV` ne fonctionne pas, voir la section "Scripts Disponibles" ci-dessus

### Le script `npm run dev` ne fonctionne pas sur Windows

**Solution**: 
Le script utilise la syntaxe Unix pour `NODE_ENV`. Sur Windows PowerShell, installer `cross-env`:
```bash
npm install --save-dev cross-env
```
Puis modifier les scripts dans `package.json`:
- `"dev": "cross-env NODE_ENV=development tsx watch ..."`
- `"start": "cross-env NODE_ENV=production tsx server/index.ts"`

---

## 📊 Structure de la Base de Données

Après les migrations, les tables suivantes sont créées:

### Tables principales
- `admin_users` - Utilisateurs administrateurs
- `site_settings` - Paramètres du site
- `sections` - Configuration des sections
- `media_library` - Bibliothèque de médias

### Tables de contenu
- `hero_content` - Contenu de la section Hero
- `about_content` - Contenu de la section About
- `services` - Services offerts
- `projects` - Projets réalisés
- `team_members` - Membres de l'équipe
- `testimonials` - Témoignages clients
- `contact_content` - Contenu de la section Contact
- `footer_content` - Contenu du footer

### Tables de support
- `section_content` - Contenu dynamique des sections
- `menu_items` - Éléments du menu

---

## 🔐 Sécurité

### RLS (Row Level Security)

- ✅ RLS activé sur toutes les tables
- ✅ Politiques configurées pour:
  - Lecture publique des contenus
  - Écriture authentifiée pour les admins

### Variables d'environnement

- ✅ `VITE_SUPABASE_ANON_KEY` est une clé **publique** (OK pour le frontend)
- ✅ Ne jamais exposer la clé `service_role` (clé secrète)
- ✅ Le fichier `.env` est dans `.gitignore`

### Authentification

- ⚠️ Par défaut, le mot de passe admin est `admin`
- 🔒 **Recommandation**: Changer le mot de passe dans la production

---

## 📝 Checklist de Configuration

Avant de lancer le projet, vérifier:

- [ ] Node.js installé (version 18+)
- [ ] Compte Supabase créé
- [ ] Projet Supabase créé
- [ ] Clés API récupérées (URL + anon key)
- [ ] Fichier `.env` créé avec les bonnes valeurs
- [ ] Migrations SQL exécutées dans l'ordre
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur de développement fonctionne (`npm run dev`)
- [ ] Connexion admin fonctionne (`/admin/login`)

---

## 🎯 Prochaines Étapes

Une fois la configuration terminée:

1. **Explorer l'admin**: `http://localhost:5000/admin/login`
2. **Voir le site**: `http://localhost:5000`
3. **Gérer le contenu**: `/admin/content`
4. **Gérer l'apparence**: `/admin/appearance`
5. **Gérer les médias**: `/admin/media`

Pour plus de détails, voir:
- `QUICK_START.md` - Guide rapide
- `COMPLETE_CMS_DOCUMENTATION.md` - Documentation complète du CMS

---

## 📞 Support

En cas de problème:
1. Vérifier la section "Problèmes Courants" ci-dessus
2. Consulter les logs dans la console
3. Vérifier les logs Supabase dans le Dashboard
4. Vérifier que toutes les migrations ont été exécutées

---

**Date de création**: 2025-01-21
**Dernière mise à jour**: 2025-01-21

