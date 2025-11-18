import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, X } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  skills: string[];
  display_order: number;
  is_visible: boolean;
}

export default function TeamEditor() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const member of members) {
        if (member.id.startsWith('new-')) {
          await supabase
            .from('team_members')
            .insert({
              name: member.name,
              role: member.role,
              image_url: member.image_url,
              skills: member.skills,
              display_order: member.display_order,
              is_visible: member.is_visible
            });
        } else {
          await supabase
            .from('team_members')
            .update({
              name: member.name,
              role: member.role,
              image_url: member.image_url,
              skills: member.skills,
              display_order: member.display_order,
              is_visible: member.is_visible,
              updated_at: new Date().toISOString()
            })
            .eq('id', member.id);
        }
      }

      toast.success('Team members updated successfully');
      loadMembers();
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const addMember = () => {
    const newMember: TeamMember = {
      id: `new-${Date.now()}`,
      name: 'New Member',
      role: 'Position',
      image_url: '',
      skills: [],
      display_order: members.length,
      is_visible: true
    };
    setMembers([...members, newMember]);
  };

  const deleteMember = async (id: string) => {
    if (id.startsWith('new-')) {
      setMembers(members.filter(m => m.id !== id));
    } else {
      try {
        await supabase.from('team_members').delete().eq('id', id);
        setMembers(members.filter(m => m.id !== id));
        toast.success('Team member deleted');
      } catch (error) {
        toast.error('Failed to delete team member');
      }
    }
  };

  const updateMember = (id: string, field: keyof TeamMember, value: any) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addSkill = (memberId: string) => {
    const skill = newSkill[memberId]?.trim();
    if (skill) {
      const member = members.find(m => m.id === memberId);
      if (member && !member.skills.includes(skill)) {
        updateMember(memberId, 'skills', [...member.skills, skill]);
        setNewSkill({ ...newSkill, [memberId]: '' });
      }
    }
  };

  const removeSkill = (memberId: string, skill: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      updateMember(memberId, 'skills', member.skills.filter(s => s !== skill));
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMember(id, 'image_url', reader.result as string);
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
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button onClick={addMember} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{member.name}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMember(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(member.id, e)}
                    className="flex-1"
                  />
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt="Member"
                      className="w-16 h-16 object-cover rounded-full border-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={member.name}
                  onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={member.role || ''}
                  onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                  placeholder="Job title"
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill[member.id] || ''}
                    onChange={(e) => setNewSkill({ ...newSkill, [member.id]: e.target.value })}
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(member.id);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(member.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSkill(member.id, skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save All Team Members'}
        </Button>
      </div>
    </div>
  );
}
