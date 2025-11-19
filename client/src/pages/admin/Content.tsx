import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedHeroEditor from '@/components/admin/content/EnhancedHeroEditor';
import EnhancedAboutEditor from '@/components/admin/content/EnhancedAboutEditor';
import ServicesEditor from '@/components/admin/content/ServicesEditor';
import ProjectsEditor from '@/components/admin/content/ProjectsEditor';
import TeamEditor from '@/components/admin/content/TeamEditor';
import TestimonialsEditor from '@/components/admin/content/TestimonialsEditor';
import ContactEditor from '@/components/admin/content/ContactEditor';
import FooterEditor from '@/components/admin/content/FooterEditor';

export default function Content() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600 mt-1">Edit all content for your website sections</p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-gray-100 p-2 rounded-lg">
            <TabsTrigger value="hero" className="data-[state=active]:bg-white">
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-white">
              About
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-white">
              Services
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white">
              Team
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-white">
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-white">
              Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <EnhancedHeroEditor />
          </TabsContent>

          <TabsContent value="about">
            <EnhancedAboutEditor />
          </TabsContent>

          <TabsContent value="services">
            <ServicesEditor />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsEditor />
          </TabsContent>

          <TabsContent value="team">
            <TeamEditor />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsEditor />
          </TabsContent>

          <TabsContent value="contact">
            <ContactEditor />
          </TabsContent>

          <TabsContent value="footer">
            <FooterEditor />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
