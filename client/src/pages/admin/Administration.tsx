import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Users, Shield, Plus, Pencil, Trash2, Loader2, Key, AlertTriangle } from 'lucide-react';

interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
}

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  user_roles: UserRole | null;
}

export default function Administration() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true,
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
  });

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
        supabase.from('admin_users').select(`
          id, username, email, is_active, created_at,
          user_roles (id, name, display_name, description, is_system)
        `).order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('category, name'),
        supabase.from('role_permissions').select('role_id, permission_id'),
      ]);

      if (usersRes.data) setUsers(usersRes.data as any);
      if (rolesRes.data) setRoles(rolesRes.data);
      if (permissionsRes.data) setPermissions(permissionsRes.data);

      if (rolePermissionsRes.data) {
        const permMap: Record<string, string[]> = {};
        rolePermissionsRes.data.forEach((rp: any) => {
          if (!permMap[rp.role_id]) permMap[rp.role_id] = [];
          permMap[rp.role_id].push(rp.permission_id);
        });
        setRolePermissions(permMap);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des donnees');
    }
    setLoading(false);
  };

  const openUserDialog = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        username: userToEdit.username,
        email: userToEdit.email || '',
        password: '',
        role_id: userToEdit.user_roles?.id || '',
        is_active: userToEdit.is_active,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        password: '',
        role_id: roles.find(r => r.name === 'editor')?.id || '',
        is_active: true,
      });
    }
    setUserDialogOpen(true);
  };

  const openRoleDialog = (roleToEdit?: UserRole) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleForm({
        name: roleToEdit.name,
        display_name: roleToEdit.display_name,
        description: roleToEdit.description || '',
        permissions: rolePermissions[roleToEdit.id] || [],
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        name: '',
        display_name: '',
        description: '',
        permissions: [],
      });
    }
    setRoleDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.username.trim()) {
      toast.error('Le nom d\'utilisateur est requis');
      return;
    }
    if (!userForm.role_id) {
      toast.error('Le role est requis');
      return;
    }
    if (!editingUser && !userForm.password) {
      toast.error('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }
    if (userForm.password && userForm.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (editingUser) {
        const response = await fetch(`${supabaseUrl}/functions/v1/auth-manager`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            action: 'update_user',
            user_id: editingUser.id,
            username: userForm.username,
            email: userForm.email || null,
            password: userForm.password || undefined,
            role_id: userForm.role_id,
            is_active: userForm.is_active,
          }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        toast.success('Utilisateur mis a jour');
      } else {
        const response = await fetch(`${supabaseUrl}/functions/v1/auth-manager`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            action: 'create_user',
            username: userForm.username,
            email: userForm.email || null,
            password: userForm.password,
            role_id: userForm.role_id,
          }),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        toast.success('Utilisateur cree');
      }

      setUserDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim() || !roleForm.display_name.trim()) {
      toast.error('Le nom et le nom d\'affichage sont requis');
      return;
    }

    setSaving(true);
    try {
      let roleId = editingRole?.id;

      if (editingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({
            name: roleForm.name,
            display_name: roleForm.display_name,
            description: roleForm.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRole.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('user_roles')
          .insert({
            name: roleForm.name.toLowerCase().replace(/\s+/g, '_'),
            display_name: roleForm.display_name,
            description: roleForm.description,
          })
          .select()
          .single();

        if (error) throw error;
        roleId = data.id;
      }

      if (roleId) {
        await supabase.from('role_permissions').delete().eq('role_id', roleId);

        if (roleForm.permissions.length > 0) {
          const { error } = await supabase
            .from('role_permissions')
            .insert(roleForm.permissions.map(permId => ({
              role_id: roleId,
              permission_id: permId,
            })));

          if (error) throw error;
        }
      }

      toast.success(editingRole ? 'Role mis a jour' : 'Role cree');
      setRoleDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast.success('Utilisateur supprime');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return;

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/auth-manager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action: 'reset_password',
          user_id: userToResetPassword.id,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      toast.success('Mot de passe reinitialise');
      setResetPasswordDialogOpen(false);
      setUserToResetPassword(null);
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la reinitialisation');
    }
    setSaving(false);
  };

  const handleDeleteRole = async (role: UserRole) => {
    if (role.is_system) {
      toast.error('Les roles systeme ne peuvent pas etre supprimes');
      return;
    }

    const usersWithRole = users.filter(u => u.user_roles?.id === role.id);
    if (usersWithRole.length > 0) {
      toast.error(`Ce role est utilise par ${usersWithRole.length} utilisateur(s)`);
      return;
    }

    try {
      const { error } = await supabase.from('user_roles').delete().eq('id', role.id);
      if (error) throw error;

      toast.success('Role supprime');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryLabels: Record<string, string> = {
    users: 'Utilisateurs',
    roles: 'Roles',
    content: 'Contenu',
    pages: 'Pages',
    media: 'Medias',
    menu: 'Menu',
    appearance: 'Apparence',
    settings: 'Parametres',
    emails: 'Emails',
    admin: 'Administration',
  };

  if (!isAdmin()) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Shield className="h-12 w-12 mb-4" />
          <p className="text-lg">Acces reserve aux administrateurs</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
          <p className="text-gray-600 mt-1">Gerer les utilisateurs et les roles</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles et Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{users.length} utilisateur(s)</p>
              <Button onClick={() => openUserDialog()} className="bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((u) => (
                  <Card key={u.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{u.username}</span>
                              {u.id === user?.id && (
                                <Badge variant="outline" className="text-xs text-gray-700 border-gray-400">Vous</Badge>
                              )}
                              {!u.is_active && (
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">Inactif</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{u.email || 'Pas d\'email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            {u.user_roles?.display_name || 'Aucun role'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToResetPassword(u);
                                setNewPassword('');
                                setResetPasswordDialogOpen(true);
                              }}
                              title="Reinitialiser le mot de passe"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUserDialog(u)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {u.id !== user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setUserToDelete(u);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{roles.length} role(s)</p>
              <Button onClick={() => openRoleDialog()} className="bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau role
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid gap-4">
                {roles.map((role) => {
                  const permCount = rolePermissions[role.id]?.length || 0;
                  const userCount = users.filter(u => u.user_roles?.id === role.id).length;

                  return (
                    <Card key={role.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{role.display_name}</span>
                              {role.is_system && (
                                <Badge variant="outline" className="text-xs text-blue-700 border-blue-400 bg-blue-50">Systeme</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{role.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                              <span>{permCount} permission(s)</span>
                              <span>{userCount} utilisateur(s)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRoleDialog(role)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!role.is_system && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteRole(role)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Modifiez les informations de l\'utilisateur' : 'Creez un nouveau compte utilisateur'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="Entrez le nom d'utilisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Entrez l'email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Entrez le mot de passe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={userForm.role_id}
                onValueChange={(value) => setUserForm({ ...userForm, role_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingUser && (
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Compte actif</Label>
                <Switch
                  id="is_active"
                  checked={userForm.is_active}
                  onCheckedChange={(checked) => setUserForm({ ...userForm, is_active: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={saving} className="bg-accent hover:bg-accent/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingUser ? 'Mettre a jour' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Modifier le role' : 'Nouveau role'}</DialogTitle>
            <DialogDescription>
              {editingRole ? 'Modifiez les informations et permissions du role' : 'Creez un nouveau role avec des permissions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Nom technique *</Label>
                <Input
                  id="role_name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="ex: moderateur"
                  disabled={editingRole?.is_system}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_display_name">Nom d'affichage *</Label>
                <Input
                  id="role_display_name"
                  value={roleForm.display_name}
                  onChange={(e) => setRoleForm({ ...roleForm, display_name: e.target.value })}
                  placeholder="ex: Moderateur"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_description">Description</Label>
              <Input
                id="role_description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Decrivez ce role..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Permissions</Label>
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <Card key={category} className="bg-gray-50 border-gray-200">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm text-gray-800">{categoryLabels[category] || category}</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={roleForm.permissions.includes(perm.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: [...roleForm.permissions, perm.id],
                                });
                              } else {
                                setRoleForm({
                                  ...roleForm,
                                  permissions: roleForm.permissions.filter(p => p !== perm.id),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={perm.id}
                            className="text-sm cursor-pointer text-gray-700"
                            title={perm.description}
                          >
                            {perm.display_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRole} disabled={saving} className="bg-accent hover:bg-accent/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingRole ? 'Mettre a jour' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>Reinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Definir un nouveau mot de passe pour {userToResetPassword?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez le nouveau mot de passe"
              />
              <p className="text-xs text-gray-500">Minimum 6 caracteres</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleResetPassword} disabled={saving} className="bg-accent hover:bg-accent/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer l'utilisateur <strong>{userToDelete?.username}</strong> ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
