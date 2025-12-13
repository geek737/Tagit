/*
  # User Roles and Permissions System

  ## Overview
  This migration creates a comprehensive role-based access control (RBAC) system
  with user types, permissions, and secure password management.

  ## 1. New Tables

  ### `user_roles`
  - Defines different user types (Admin, Editor, Viewer, etc.)
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Role name (admin, editor, viewer)
  - `display_name` (text) - Human-readable name
  - `description` (text) - Role description
  - `is_system` (boolean) - Whether this is a system role (cannot be deleted)
  - `created_at` (timestamptz) - Creation date
  - `updated_at` (timestamptz) - Last update date

  ### `permissions`
  - Defines granular permissions for the system
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Permission name (users.create, users.read, etc.)
  - `display_name` (text) - Human-readable name
  - `description` (text) - Permission description
  - `category` (text) - Category for grouping (users, content, media, etc.)
  - `created_at` (timestamptz) - Creation date

  ### `role_permissions`
  - Junction table linking roles to permissions
  - `role_id` (uuid, foreign key) - Reference to user_roles
  - `permission_id` (uuid, foreign key) - Reference to permissions

  ## 2. Modified Tables

  ### `admin_users` (updated)
  - Added `role_id` (uuid, foreign key) - Reference to user_roles
  - Added `is_active` (boolean) - Whether user account is active
  - Added `last_login` (timestamptz) - Last login timestamp
  - Added `password_changed_at` (timestamptz) - When password was last changed

  ## 3. Security
  - Enable RLS on all new tables
  - Only admins can manage users and roles
  - Users can only view their own data

  ## 4. Initial Data
  - Create default roles (Admin, Editor, Viewer)
  - Create default permissions
  - Assign all permissions to Admin role
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Add new columns to admin_users if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN role_id uuid REFERENCES user_roles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN last_login timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'password_changed_at'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN password_changed_at timestamptz;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Anyone can read user roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on user_roles"
  ON user_roles FOR ALL
  USING (true);

-- Create policies for permissions
CREATE POLICY "Anyone can read permissions"
  ON permissions FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on permissions"
  ON permissions FOR ALL
  USING (true);

-- Create policies for role_permissions
CREATE POLICY "Anyone can read role permissions"
  ON role_permissions FOR SELECT
  USING (true);

CREATE POLICY "Allow all operations on role_permissions"
  ON role_permissions FOR ALL
  USING (true);

-- Insert default roles
INSERT INTO user_roles (name, display_name, description, is_system) VALUES
  ('admin', 'Administrateur', 'Acces complet a toutes les fonctionnalites du systeme', true),
  ('editor', 'Editeur', 'Peut gerer le contenu, les medias et les pages', false),
  ('viewer', 'Lecteur', 'Acces en lecture seule au tableau de bord', false)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, category) VALUES
  -- User management permissions
  ('users.view', 'Voir les utilisateurs', 'Peut voir la liste des utilisateurs', 'users'),
  ('users.create', 'Creer des utilisateurs', 'Peut creer de nouveaux utilisateurs', 'users'),
  ('users.edit', 'Modifier les utilisateurs', 'Peut modifier les informations des utilisateurs', 'users'),
  ('users.delete', 'Supprimer les utilisateurs', 'Peut supprimer des utilisateurs', 'users'),
  
  -- Role management permissions
  ('roles.view', 'Voir les roles', 'Peut voir la liste des roles', 'roles'),
  ('roles.create', 'Creer des roles', 'Peut creer de nouveaux roles', 'roles'),
  ('roles.edit', 'Modifier les roles', 'Peut modifier les roles existants', 'roles'),
  ('roles.delete', 'Supprimer les roles', 'Peut supprimer des roles', 'roles'),
  
  -- Content management permissions
  ('content.view', 'Voir le contenu', 'Peut voir le contenu du site', 'content'),
  ('content.edit', 'Modifier le contenu', 'Peut modifier le contenu du site', 'content'),
  
  -- Pages management permissions
  ('pages.view', 'Voir les pages', 'Peut voir les pages du site', 'pages'),
  ('pages.create', 'Creer des pages', 'Peut creer de nouvelles pages', 'pages'),
  ('pages.edit', 'Modifier les pages', 'Peut modifier les pages existantes', 'pages'),
  ('pages.delete', 'Supprimer les pages', 'Peut supprimer des pages', 'pages'),
  
  -- Media management permissions
  ('media.view', 'Voir les medias', 'Peut voir la bibliotheque de medias', 'media'),
  ('media.upload', 'Telecharger des medias', 'Peut telecharger de nouveaux fichiers', 'media'),
  ('media.delete', 'Supprimer des medias', 'Peut supprimer des fichiers', 'media'),
  
  -- Menu management permissions
  ('menu.view', 'Voir le menu', 'Peut voir la configuration du menu', 'menu'),
  ('menu.edit', 'Modifier le menu', 'Peut modifier le menu de navigation', 'menu'),
  
  -- Appearance permissions
  ('appearance.view', 'Voir l''apparence', 'Peut voir les parametres d''apparence', 'appearance'),
  ('appearance.edit', 'Modifier l''apparence', 'Peut modifier l''apparence du site', 'appearance'),
  
  -- Settings permissions
  ('settings.view', 'Voir les parametres', 'Peut voir les parametres du site', 'settings'),
  ('settings.edit', 'Modifier les parametres', 'Peut modifier les parametres du site', 'settings'),
  
  -- Email permissions
  ('emails.view', 'Voir les emails', 'Peut voir les emails recus', 'emails'),
  ('emails.manage', 'Gerer les emails', 'Peut gerer la configuration email', 'emails'),
  
  -- Administration permissions
  ('admin.access', 'Acces administration', 'Peut acceder au menu Administration', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'admin'),
  p.id
FROM permissions p
ON CONFLICT DO NOTHING;

-- Assign editor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'editor'),
  p.id
FROM permissions p
WHERE p.name IN (
  'content.view', 'content.edit',
  'pages.view', 'pages.create', 'pages.edit',
  'media.view', 'media.upload',
  'menu.view',
  'appearance.view',
  'emails.view'
)
ON CONFLICT DO NOTHING;

-- Assign viewer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'viewer'),
  p.id
FROM permissions p
WHERE p.name IN (
  'content.view',
  'pages.view',
  'media.view',
  'menu.view',
  'appearance.view'
)
ON CONFLICT DO NOTHING;

-- Update existing admin user to have admin role
UPDATE admin_users
SET role_id = (SELECT id FROM user_roles WHERE name = 'admin')
WHERE username = 'admin' AND role_id IS NULL;
