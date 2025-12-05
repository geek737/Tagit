import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import MediaSelector from '@/components/admin/MediaSelector';

interface PortfolioProject {
  id: string;
  page_id: string;
  title: string;
  description: string | null;
  display_order: number;
  client_name: string | null;
  services_provided: string | null;
  main_image: string | null;
  secondary_images: string[];
  title_color: string;
  title_size: string;
  description_color: string;
  is_visible: boolean;
}

interface PortfolioProjectsEditorProps {
  pageId: string;
}

const defaultProject: Omit<PortfolioProject, 'id' | 'page_id'> = {
  title: '',
  description: '',
  display_order: 0,
  client_name: '',
  services_provided: '',
  main_image: '',
  secondary_images: [],
  title_color: '#1f2937',
  title_size: 'lg',
  description_color: '#374151',
  is_visible: true,
};

export default function PortfolioProjectsEditor({ pageId }: PortfolioProjectsEditorProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState(defaultProject);

  useEffect(() => {
    if (pageId) {
      loadProjects();
    }
  }, [pageId]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('page_id', pageId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      const parsedData = (data || []).map(project => ({
        ...project,
        secondary_images: Array.isArray(project.secondary_images) 
          ? project.secondary_images 
          : JSON.parse(project.secondary_images || '[]')
      }));
      
      setProjects(parsedData);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project?: PortfolioProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        display_order: project.display_order,
        client_name: project.client_name || '',
        services_provided: project.services_provided || '',
        main_image: project.main_image || '',
        secondary_images: project.secondary_images || [],
        title_color: project.title_color || '#1f2937',
        title_size: project.title_size || 'lg',
        description_color: project.description_color || '#374151',
        is_visible: project.is_visible,
      });
    } else {
      setEditingProject(null);
      setFormData({
        ...defaultProject,
        display_order: projects.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Le titre du projet est requis');
      return;
    }

    try {
      const dataToSave = {
        page_id: pageId,
        title: formData.title,
        description: formData.description || null,
        display_order: formData.display_order,
        client_name: formData.client_name || null,
        services_provided: formData.services_provided || null,
        main_image: formData.main_image || null,
        secondary_images: formData.secondary_images,
        title_color: formData.title_color,
        title_size: formData.title_size,
        description_color: formData.description_color,
        is_visible: formData.is_visible,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('portfolio_projects')
          .update(dataToSave)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Projet mis à jour');
      } else {
        const { error } = await supabase
          .from('portfolio_projects')
          .insert(dataToSave);

        if (error) throw error;
        toast.success('Projet créé');
      }

      setIsDialogOpen(false);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (project: PortfolioProject) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${project.title}" ?`)) return;

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      toast.success('Projet supprimé');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleVisibility = async (project: PortfolioProject) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ is_visible: !project.is_visible })
        .eq('id', project.id);

      if (error) throw error;
      loadProjects();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projects.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newProjects = [...projects];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];

    // Update display_order for both projects
    try {
      await Promise.all([
        supabase
          .from('portfolio_projects')
          .update({ display_order: newIndex })
          .eq('id', projects[index].id),
        supabase
          .from('portfolio_projects')
          .update({ display_order: index })
          .eq('id', projects[newIndex].id),
      ]);
      loadProjects();
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast.error('Erreur lors du réordonnancement');
    }
  };

  const addSecondaryImage = (url: string) => {
    if (url && !formData.secondary_images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        secondary_images: [...prev.secondary_images, url]
      }));
    }
  };

  const removeSecondaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondary_images: prev.secondary_images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Projets ({projects.length})</h3>
          <p className="text-sm text-gray-500">Gérez les projets affichés sur cette page</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un projet
        </Button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun projet pour le moment</p>
            <Button onClick={() => handleOpenDialog()} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <Card key={project.id} className={`${!project.is_visible ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Drag Handle & Order Controls */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => handleMoveProject(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <GripVertical className="w-5 h-5 text-gray-300" />
                    <button
                      onClick={() => handleMoveProject(index, 'down')}
                      disabled={index === projects.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {project.main_image ? (
                      <img src={project.main_image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{project.title}</h4>
                    {project.client_name && (
                      <p className="text-sm text-gray-500">Client: {project.client_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {project.secondary_images.length} image(s) secondaire(s)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(project)}
                      title={project.is_visible ? 'Masquer' : 'Afficher'}
                    >
                      {project.is_visible ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(project)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
            </DialogTitle>
            <DialogDescription>
              Configurez les détails du projet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Informations de base</h4>
              
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Titre du projet *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Promotion de l'égalité de genre"
                  className="text-gray-900 bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le projet..."
                  rows={6}
                  className="text-gray-900 bg-white border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Nom du client</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="ECHOCOMUNICATION"
                    className="text-gray-900 bg-white border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Services fournis</Label>
                  <Input
                    value={formData.services_provided}
                    onChange={(e) => setFormData(prev => ({ ...prev, services_provided: e.target.value }))}
                    placeholder="Logo Design, Graphic Chart Creation..."
                    className="text-gray-900 bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Images</h4>
              
              <MediaSelector
                label="Image principale (affichée à droite)"
                value={formData.main_image}
                onChange={(url) => setFormData(prev => ({ ...prev, main_image: url }))}
                placeholder="Sélectionner l'image principale..."
              />

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Images secondaires (grille 2 colonnes)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.secondary_images.map((image, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={image} alt={`Secondary ${index}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeSecondaryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <MediaSelector
                    label=""
                    value=""
                    onChange={(url) => addSecondaryImage(url)}
                    placeholder=""
                    className="aspect-square"
                    buttonOnly
                  />
                </div>
                <p className="text-xs text-gray-500">Cliquez sur + pour ajouter des images secondaires</p>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Typographie</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Couleur du titre</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.title_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_color: e.target.value }))}
                      className="w-14 h-10 cursor-pointer border-gray-300"
                    />
                    <Input
                      value={formData.title_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_color: e.target.value }))}
                      className="font-mono text-sm text-gray-900 bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Taille du titre</Label>
                  <Select
                    value={formData.title_size}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, title_size: value }))}
                  >
                    <SelectTrigger className="text-gray-900 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="sm" className="text-gray-900">Petit</SelectItem>
                      <SelectItem value="md" className="text-gray-900">Moyen</SelectItem>
                      <SelectItem value="lg" className="text-gray-900">Grand</SelectItem>
                      <SelectItem value="xl" className="text-gray-900">Très grand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Couleur de la description</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.description_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_color: e.target.value }))}
                      className="w-14 h-10 cursor-pointer border-gray-300"
                    />
                    <Input
                      value={formData.description_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_color: e.target.value }))}
                      className="font-mono text-sm text-gray-900 bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="is_visible"
                checked={formData.is_visible}
                onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                className="w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <Label htmlFor="is_visible" className="cursor-pointer text-gray-900 font-medium">
                Projet visible sur le site
              </Label>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Aperçu</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 
                      className={`font-bold ${
                        formData.title_size === 'sm' ? 'text-base' :
                        formData.title_size === 'md' ? 'text-lg' :
                        formData.title_size === 'lg' ? 'text-xl' : 'text-2xl'
                      }`}
                      style={{ color: formData.title_color }}
                    >
                      PROJET : {formData.title || 'Titre du projet'}
                    </h5>
                    <p 
                      className="text-sm line-clamp-3"
                      style={{ color: formData.description_color }}
                    >
                      {formData.description || 'Description du projet...'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {formData.main_image && (
                      <img src={formData.main_image} alt="Preview" className="w-full rounded-lg" />
                    )}
                    {formData.secondary_images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {formData.secondary_images.slice(0, 2).map((img, i) => (
                          <img key={i} src={img} alt={`Preview ${i}`} className="w-full aspect-square object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-accent hover:bg-orange-600 text-white">
              {editingProject ? 'Mettre à jour' : 'Créer le projet'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

