import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import MediaSelector from '../MediaSelector';
import { SectionLoader } from '@/components/ui/GlobalLoader';

interface Project {
  id?: string;
  title: string;
  description: string;
  image: string;
  services_label: string;
  services_label_color: string;
  display_order: number;
  is_visible: boolean;
}

interface ProjectsHeader {
  id?: string;
  heading: string;
  description_p1: string;
  description_p2: string;
  button_text: string;
  button_url: string;
  background_color: string;
  heading_color: string;
  description_color: string;
  button_bg_color: string;
  button_text_color: string;
}

export default function EnhancedProjectsEditor() {
  const [header, setHeader] = useState<ProjectsHeader>({
    heading: 'Our bold projects',
    description_p1: 'chaque projet est une aventure audacieuse. Nous ne nous contentons pas de suivre les tendances : nous les créons. Nos projets allient créativité, innovation et stratégie pour transformer les idées en résultats concrets.',
    description_p2: 'Avec nos projets audacieux, le digital devient bien plus qu\'un outil : il devient un véritable moteur de croissance et d\'opportunités.',
    button_text: 'view projects',
    button_url: '/projects',
    background_color: '#F3F4F6',
    heading_color: '#7C3AED',
    description_color: '#374151',
    button_bg_color: '#FF6B35',
    button_text_color: '#FFFFFF'
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, projectsRes] = await Promise.all([
        supabase.from('projects_header').select('*').single(),
        supabase.from('projects').select('*').order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error loading projects content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      const { error } = header.id
        ? await supabase
            .from('projects_header')
            .update({ ...header, updated_at: new Date().toISOString() })
            .eq('id', header.id)
        : await supabase.from('projects_header').insert([header]);

      if (error) throw error;
      toast.success('Projects header saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save projects header');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProjects = async () => {
    setSaving(true);
    try {
      const updates = projects.map((project, index) => ({
        ...project,
        display_order: index,
        updated_at: new Date().toISOString()
      }));

      for (const project of updates) {
        if (project.id) {
          await supabase.from('projects').update(project).eq('id', project.id);
        } else {
          await supabase.from('projects').insert([project]);
        }
      }

      toast.success('Projects saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save projects');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    setProjects(prev => [...prev, {
      title: 'New Project',
      description: 'Logo Design, Graphic Chart Creation, and Visual Identity Development',
      image: '',
      services_label: 'Services',
      services_label_color: '#FF6B35',
      display_order: prev.length,
      is_visible: true
    }]);
  };

  const removeProject = async (index: number) => {
    const project = projects[index];
    if (project.id) {
      await supabase.from('projects').delete().eq('id', project.id);
    }
    setProjects(prev => prev.filter((_, i) => i !== index));
    toast.success('Project removed');
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    setProjects(prev => prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
  };

  if (loading) {
    return <SectionLoader text="Chargement des projets..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Projects Section Editor</h3>
          <p className="text-sm text-gray-600">Edit header content and manage project carousel</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            className={previewMode ? "bg-accent text-white hover:bg-accent/90" : "text-black hover:text-accent hover:border-accent"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-0">
            <section
              className="w-full min-h-screen relative flex items-center py-16"
              style={{ backgroundColor: header.background_color }}
            >
              <div className="container mx-auto px-8">
                <div className="flex gap-16 items-stretch">
                  <div className="flex-1">
                    <div className="bg-white p-6 rounded-lg">
                      {projects.filter(p => p.is_visible)[0]?.image && (
                        <img
                          src={projects.filter(p => p.is_visible)[0].image}
                          alt={projects.filter(p => p.is_visible)[0].title}
                          className="w-full h-auto object-contain mb-4"
                        />
                      )}
                      <h3 className="text-xl font-bold mb-2" style={{ color: projects[0]?.services_label_color || '#FF6B35' }}>
                        {projects[0]?.services_label || 'Services'}
                      </h3>
                      <p className="text-gray-700 text-sm">{projects[0]?.description}</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-end">
                    <h2 className="text-6xl font-bold text-right mb-12" style={{ color: header.heading_color }}>
                      {header.heading}
                    </h2>
                    <div className="space-y-3 text-right" style={{ color: header.description_color }}>
                      <p className="text-lg font-medium">{header.description_p1}</p>
                      <p className="text-lg font-medium">{header.description_p2}</p>
                    </div>
                    <button
                      className="mt-8 px-5 py-2.5 rounded-full font-semibold inline-flex items-center gap-2"
                      style={{
                        backgroundColor: header.button_bg_color,
                        color: header.button_text_color
                      }}
                    >
                      {header.button_text}
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="header" className="space-y-4">
          <TabsList>
            <TabsTrigger value="header">Header Content</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="styling">Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Content</CardTitle>
                <CardDescription>Edit the section heading and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Heading</Label>
                  <Input
                    value={header.heading}
                    onChange={(e) => setHeader(prev => ({ ...prev, heading: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description Paragraph 1</Label>
                  <Textarea
                    value={header.description_p1}
                    onChange={(e) => setHeader(prev => ({ ...prev, description_p1: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description Paragraph 2</Label>
                  <Textarea
                    value={header.description_p2}
                    onChange={(e) => setHeader(prev => ({ ...prev, description_p2: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={header.button_text}
                      onChange={(e) => setHeader(prev => ({ ...prev, button_text: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input
                      value={header.button_url}
                      onChange={(e) => setHeader(prev => ({ ...prev, button_url: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Header
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage project carousel items</p>
                <Button onClick={addProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {projects.map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <CardTitle>Project {index + 1}</CardTitle>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeProject(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input
                          value={project.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Services Label</Label>
                        <Input
                          value={project.services_label}
                          onChange={(e) => updateProject(index, 'services_label', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project Image</Label>
                      <MediaSelector
                        value={project.image || ''}
                        onChange={(url) => updateProject(index, 'image', url)}
                        placeholder="Select a project image"
                        previewShape="square"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleSaveProjects} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save All Projects
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="styling">
            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.heading_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.heading_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, heading_color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.background_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.background_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, background_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Colors
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
