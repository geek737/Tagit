import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedHeroEditor from '@/components/admin/content/EnhancedHeroEditor';
import EnhancedAboutEditor from '@/components/admin/content/EnhancedAboutEditor';
import EnhancedServicesEditor from '@/components/admin/content/EnhancedServicesEditor';
import EnhancedProjectsEditor from '@/components/admin/content/EnhancedProjectsEditor';
import EnhancedTeamEditor from '@/components/admin/content/EnhancedTeamEditor';
import EnhancedTestimonialsEditor from '@/components/admin/content/EnhancedTestimonialsEditor';
import ContactEditor from '@/components/admin/content/ContactEditor';
import EnhancedFooterEditor from '@/components/admin/content/EnhancedFooterEditor';

export default function Content() {
  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Edit all content for your website sections</p>
        </div>

        <Tabs defaultValue="hero" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-4 sm:flex sm:flex-wrap h-auto gap-1 sm:gap-2 bg-gray-100 p-1.5 sm:p-2 rounded-lg w-full">
            <TabsTrigger value="hero" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              About
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Services
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Projects
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Team
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Contact
            </TabsTrigger>
            <TabsTrigger value="footer" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900">
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
            <EnhancedServicesEditor />
          </TabsContent>

          <TabsContent value="projects">
            <EnhancedProjectsEditor />
          </TabsContent>

          <TabsContent value="team">
            <EnhancedTeamEditor />
          </TabsContent>

          <TabsContent value="testimonials">
            <EnhancedTestimonialsEditor />
          </TabsContent>

          <TabsContent value="contact">
            <ContactEditor />
          </TabsContent>

          <TabsContent value="footer">
            <EnhancedFooterEditor />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
