import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { SectionLoader } from '@/components/ui/GlobalLoader';
import MediaSelector from '@/components/admin/MediaSelector';

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  skills: string[];
  image: string;
  name_color: string;
  role_color: string;
  skills_color: string;
  display_order: number;
  is_visible: boolean;
}

interface TeamHeader {
  id?: string;
  heading_word1: string;
  heading_word2: string;
  description: string;
  background_color: string;
  background_gradient: string;
  heading_color: string;
  description_color: string;
}

export default function EnhancedTeamEditor() {
  const [header, setHeader] = useState<TeamHeader>({
    heading_word1: 'Our',
    heading_word2: 'Team',
    description: 'Une équipe passionnée, créative et engagée. Chacun de nos membres apporte son expertise unique pour transformer les idées en projets concrets et performants.',
    background_color: '#7C3AED',
    background_gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    heading_color: '#FF6B35',
    description_color: '#FFFFFF'
  });

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [headerRes, membersRes] = await Promise.all([
        supabase.from('team_header').select('*').single(),
        supabase.from('team_members').select('*').order('display_order', { ascending: true })
      ]);

      if (headerRes.data) setHeader(headerRes.data);
      if (membersRes.data) setMembers(membersRes.data);
    } catch (error) {
      console.error('Error loading team content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      const { error } = header.id
        ? await supabase
            .from('team_header')
            .update({ ...header, updated_at: new Date().toISOString() })
            .eq('id', header.id)
        : await supabase.from('team_header').insert([header]);

      if (error) throw error;
      toast.success('Team header saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save team header');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMembers = async () => {
    setSaving(true);
    try {
      const updates = members.map((member, index) => ({
        ...member,
        display_order: index,
        updated_at: new Date().toISOString()
      }));

      for (const member of updates) {
        if (member.id) {
          await supabase.from('team_members').update(member).eq('id', member.id);
        } else {
          await supabase.from('team_members').insert([member]);
        }
      }

      toast.success('Team members saved successfully');
      await loadContent();
    } catch (error) {
      toast.error('Failed to save team members');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateMemberImage = (memberIndex: number, imageUrl: string) => {
    setMembers(prev => prev.map((m, i) =>
      i === memberIndex ? { ...m, image: imageUrl } : m
    ));
  };

  const addMember = () => {
    setMembers(prev => [...prev, {
      name: 'New Member',
      role: 'Role Title',
      skills: [],
      image: '',
      name_color: '#FF6B35',
      role_color: '#FFFFFF',
      skills_color: '#D1D5DB',
      display_order: prev.length,
      is_visible: true
    }]);
  };

  const removeMember = async (index: number) => {
    const member = members[index];
    if (member.id) {
      await supabase.from('team_members').delete().eq('id', member.id);
    }
    setMembers(prev => prev.filter((_, i) => i !== index));
    toast.success('Team member removed');
  };

  const updateMember = (index: number, field: keyof TeamMember, value: any) => {
    setMembers(prev => prev.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    ));
  };

  const addSkill = (memberIndex: number) => {
    setMembers(prev => prev.map((m, i) =>
      i === memberIndex ? { ...m, skills: [...m.skills, ''] } : m
    ));
  };

  const updateSkill = (memberIndex: number, skillIndex: number, value: string) => {
    setMembers(prev => prev.map((m, i) =>
      i === memberIndex ? {
        ...m,
        skills: m.skills.map((s, si) => si === skillIndex ? value : s)
      } : m
    ));
  };

  const removeSkill = (memberIndex: number, skillIndex: number) => {
    setMembers(prev => prev.map((m, i) =>
      i === memberIndex ? {
        ...m,
        skills: m.skills.filter((_, si) => si !== skillIndex)
      } : m
    ));
  };

  if (loading) {
    return <SectionLoader text="Chargement de l'équipe..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Team Section Editor</h3>
          <p className="text-sm text-gray-600">Edit header content and manage team members</p>
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
              className="w-full min-h-screen relative overflow-hidden flex items-center py-16"
              style={{
                background: header.background_gradient || header.background_color
              }}
            >
              <div className="container mx-auto px-8">
                <div className="flex flex-col gap-12 justify-center">
                  <div className="text-center">
                    <h2 className="text-7xl font-bold mb-6" style={{ color: header.heading_color }}>
                      {header.heading_word1} {header.heading_word2}
                    </h2>
                    <p className="text-lg font-medium max-w-4xl mx-auto" style={{ color: header.description_color }}>
                      {header.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {members.filter(m => m.is_visible).map((member, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="bg-transparent p-6 flex flex-col">
                          <div className="flex items-center justify-center mb-4">
                            {member.image && (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-auto max-h-[250px] object-contain rounded-xl"
                              />
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-bold mb-2 uppercase" style={{ color: member.name_color }}>
                              {member.name}
                            </h3>
                            <p className="text-sm mb-2" style={{ color: member.role_color }}>
                              {member.role}
                            </p>
                            {member.skills.length > 0 && (
                              <div className="space-y-1">
                                {member.skills.map((skill, i) => (
                                  <p key={i} className="text-xs" style={{ color: member.skills_color }}>
                                    {skill}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
            <TabsTrigger value="members">Team Members ({members.length})</TabsTrigger>
            <TabsTrigger value="styling">Colors & Background</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Header Content</CardTitle>
                <CardDescription>Edit the section heading and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heading Word 1</Label>
                    <Input
                      value={header.heading_word1}
                      onChange={(e) => setHeader(prev => ({ ...prev, heading_word1: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heading Word 2</Label>
                    <Input
                      value={header.heading_word2}
                      onChange={(e) => setHeader(prev => ({ ...prev, heading_word2: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={header.description}
                    onChange={(e) => setHeader(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Header
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Manage team member profiles</p>
                <Button onClick={addMember}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {members.map((member, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                        <CardTitle>{member.name}</CardTitle>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removeMember(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role/Title</Label>
                        <Input
                          value={member.role}
                          onChange={(e) => updateMember(index, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    <MediaSelector
                      label="Member Photo"
                      value={member.image || ''}
                      onChange={(url) => updateMemberImage(index, url)}
                      placeholder="Select member photo"
                      previewShape="square"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Skills</Label>
                        <Button size="sm" variant="outline" onClick={() => addSkill(index)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Skill
                        </Button>
                      </div>
                      {member.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => updateSkill(index, skillIndex, e.target.value)}
                            placeholder="Skill description"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSkill(index, skillIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={handleSaveMembers} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save All Members
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="styling">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Background</CardTitle>
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
                    <Label>Description Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={header.description_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, description_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={header.description_color}
                        onChange={(e) => setHeader(prev => ({ ...prev, description_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Gradient (CSS)</Label>
                  <Input
                    value={header.background_gradient}
                    onChange={(e) => setHeader(prev => ({ ...prev, background_gradient: e.target.value }))}
                    placeholder="linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
                  />
                </div>
                <Button onClick={handleSaveHeader} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Styling
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
