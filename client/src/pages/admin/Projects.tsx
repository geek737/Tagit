import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  display_order: number;
  is_visible: boolean;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const project of projects) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: project.title,
            description: project.description,
            image_url: project.image_url,
            category: project.category,
            is_visible: project.is_visible,
            display_order: project.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);

        if (error) throw error;
      }
      toast.success('Projects updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addProject = async () => {
    try {
      const newOrder = projects.length > 0
        ? Math.max(...projects.map(p => p.display_order)) + 1
        : 1;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: 'New Project',
          description: 'Project description',
          image_url: '',
          category: 'Design',
          display_order: newOrder,
          is_visible: true
        })
        .select()
        .single();

      if (error) throw error;
      setProjects(prev => [...prev, data]);
      toast.success('Project added');
    } catch (error) {
      toast.error('Failed to add project');
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const updateProject = (id: string, field: keyof Project, value: string | boolean | number) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Projects Management</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your portfolio projects</p>
          </div>
          <Button onClick={addProject} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No projects found</p>
                <p className="text-sm text-gray-500 mt-1">Add your first project to get started</p>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-base sm:text-lg">{project.title}</CardTitle>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`visible-${project.id}`}
                          checked={project.is_visible}
                          onCheckedChange={(checked) => updateProject(project.id, 'is_visible', checked)}
                        />
                        <Label htmlFor={`visible-${project.id}`} className="text-sm">Visible</Label>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${project.id}`}>Title</Label>
                      <Input
                        id={`title-${project.id}`}
                        value={project.title}
                        onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`category-${project.id}`}>Category</Label>
                      <Input
                        id={`category-${project.id}`}
                        value={project.category}
                        onChange={(e) => updateProject(project.id, 'category', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${project.id}`}>Description</Label>
                    <Textarea
                      id={`description-${project.id}`}
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`image-${project.id}`}>Image URL</Label>
                    <Input
                      id={`image-${project.id}`}
                      value={project.image_url}
                      onChange={(e) => updateProject(project.id, 'image_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {projects.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
