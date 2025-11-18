import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  display_order: number;
  is_visible: boolean;
}

export default function ProjectsEditor() {
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
        if (project.id.startsWith('new-')) {
          await supabase
            .from('projects')
            .insert({
              title: project.title,
              description: project.description,
              image_url: project.image_url,
              category: project.category,
              display_order: project.display_order,
              is_visible: project.is_visible
            });
        } else {
          await supabase
            .from('projects')
            .update({
              title: project.title,
              description: project.description,
              image_url: project.image_url,
              category: project.category,
              display_order: project.display_order,
              is_visible: project.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', project.id);
        }
      }

      toast.success('Projects updated successfully');
      loadProjects();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: `new-${Date.now()}`,
      title: 'New Project',
      description: 'Project description',
      image_url: '',
      category: 'Web Design',
      display_order: projects.length,
      is_visible: true
    };
    setProjects([...projects, newProject]);
  };

  const deleteProject = async (id: string) => {
    if (id.startsWith('new-')) {
      setProjects(projects.filter(p => p.id !== id));
    } else {
      try {
        await supabase.from('projects').delete().eq('id', id);
        setProjects(projects.filter(p => p.id !== id));
        toast.success('Project deleted');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= projects.length) return;

    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];

    newProjects.forEach((p, i) => {
      p.display_order = i;
    });

    setProjects(newProjects);
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProject(id, 'image_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects & Portfolio</h3>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveProject(index, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveProject(index, 'down')}
                      disabled={index === projects.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-base">{project.title}</CardTitle>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                    placeholder="Project title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={project.category || ''}
                    onChange={(e) => updateProject(project.id, 'category', e.target.value)}
                    placeholder="Web Design, Branding, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                  placeholder="Project description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Project Image</Label>
                <div className="flex gap-2 items-start">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(project.id, e)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt="Project preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Projects'}
        </Button>
      </div>
    </div>
  );
}
