import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Image, Users, Briefcase, Palette, Menu } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Content Sections', value: '7', icon: FileText, color: 'text-blue-600' },
    { title: 'Media Files', value: '24', icon: Image, color: 'text-green-600' },
    { title: 'Team Members', value: '4', icon: Users, color: 'text-purple-600' },
    { title: 'Projects', value: '4', icon: Briefcase, color: 'text-orange-600' },
  ];

  const quickLinks = [
    { title: 'Customize Colors', description: 'Change site colors and themes', icon: Palette, path: '/admin/appearance' },
    { title: 'Manage Content', description: 'Edit text and descriptions', icon: FileText, path: '/admin/content' },
    { title: 'Upload Media', description: 'Add images and files', icon: Image, path: '/admin/media' },
    { title: 'Edit Menu', description: 'Configure navigation menu', icon: Menu, path: '/admin/menu' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to Admin Panel</h2>
          <p className="text-gray-600 mt-2">Manage your website content, appearance, and settings from here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card key={link.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                        <CardDescription className="mt-1">{link.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-accent to-primary text-white">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription className="text-white/80">
              New to the admin panel? Here's what you can do:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Content:</strong> Edit all text, titles, and descriptions for each section</p>
            <p>• <strong>Appearance:</strong> Customize colors, backgrounds, and overall theme</p>
            <p>• <strong>Media:</strong> Upload and organize images, logos, and icons</p>
            <p>• <strong>Menu:</strong> Configure navigation menu items and structure</p>
            <p>• <strong>Projects:</strong> Add, edit, or remove portfolio projects</p>
            <p>• <strong>Team:</strong> Manage team member profiles and information</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
