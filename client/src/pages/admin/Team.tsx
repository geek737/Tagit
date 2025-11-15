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
import { Plus, Trash2, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  skills: string[];
  display_order: number;
  is_visible: boolean;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkills, setNewSkills] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const member of teamMembers) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: member.name,
            role: member.role,
            image_url: member.image_url,
            skills: member.skills,
            is_visible: member.is_visible,
            display_order: member.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', member.id);

        if (error) throw error;
      }
      toast.success('Team members updated successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = async () => {
    try {
      const newOrder = teamMembers.length > 0
        ? Math.max(...teamMembers.map(m => m.display_order)) + 1
        : 1;

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          name: 'New Team Member',
          role: 'Role',
          image_url: '',
          skills: [],
          display_order: newOrder,
          is_visible: true
        })
        .select()
        .single();

      if (error) throw error;
      setTeamMembers(prev => [...prev, data]);
      toast.success('Team member added');
    } catch (error) {
      toast.error('Failed to add team member');
    }
  };

  const deleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      toast.success('Team member deleted');
    } catch (error) {
      toast.error('Failed to delete team member');
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string | boolean | number | string[]) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addSkill = (memberId: string) => {
    const skill = newSkills[memberId]?.trim();
    if (!skill) return;

    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    updateTeamMember(memberId, 'skills', [...member.skills, skill]);
    setNewSkills(prev => ({ ...prev, [memberId]: '' }));
  };

  const removeSkill = (memberId: string, skillIndex: number) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const newSkills = member.skills.filter((_, idx) => idx !== skillIndex);
    updateTeamMember(memberId, 'skills', newSkills);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-gray-600 mt-1">Manage your team members</p>
          </div>
          <Button onClick={addTeamMember}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <div className="space-y-4">
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No team members found</p>
                <p className="text-sm text-gray-500 mt-1">Add your first team member to get started</p>
              </CardContent>
            </Card>
          ) : (
            teamMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`visible-${member.id}`}
                          checked={member.is_visible}
                          onCheckedChange={(checked) => updateTeamMember(member.id, 'is_visible', checked)}
                        />
                        <Label htmlFor={`visible-${member.id}`}>Visible</Label>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${member.id}`}>Name</Label>
                      <Input
                        id={`name-${member.id}`}
                        value={member.name}
                        onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`role-${member.id}`}>Role</Label>
                      <Input
                        id={`role-${member.id}`}
                        value={member.role}
                        onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`image-${member.id}`}>Image URL</Label>
                    <Input
                      id={`image-${member.id}`}
                      value={member.image_url}
                      onChange={(e) => updateTeamMember(member.id, 'image_url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(member.id, idx)}
                            className="hover:bg-accent/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkills[member.id] || ''}
                        onChange={(e) => setNewSkills(prev => ({ ...prev, [member.id]: e.target.value }))}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill(member.id)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSkill(member.id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {teamMembers.length > 0 && (
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
