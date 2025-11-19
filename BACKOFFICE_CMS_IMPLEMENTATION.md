# Comprehensive Backoffice Content Management System
## Implementation Plan & Technical Documentation

---

## Executive Summary

This document provides a complete implementation plan for replicating all frontend sections into an editable backoffice interface with visual previews, real-time editing capabilities, and database persistence.

### Current Issues Identified

**Image Display Problem - ROOT CAUSE:**
- Frontend uses `import` statements for images (e.g., `import robotImage from "@/assets/robot-3d-orange.png"`)
- These imports only work in frontend compilation, NOT in backoffice
- Images are "[DUMMY FILE CONTENT]" placeholders (20 bytes each)
- No base64 data or actual image content in files

**Solution:**
1. Store images as base64 in Supabase database
2. Use data URLs for display in both frontend and backoffice
3. Upload real images through admin interface
4. Sync database with frontend rendering

---

## Section Analysis from Images

### 1. Hero Section (Image 1)
**Visual Elements:**
- Background: Dark purple with grid pattern
- Main heading: "Digital marketing," (orange) + "Branding, Content" (white)
- Subheading: "Every brand has a story to tell."
- Description text
- Two buttons: "What we offer" (orange) + "About Us" (outlined)
- Right side: 3D handshake image in rounded frame

**Editable Fields:**
- Main heading (line 1 - orange text)
- Main heading (line 2 - white text)
- Subheading text
- Description paragraph
- Button 1: text, URL, styling
- Button 2: text, URL, styling
- Background color
- Background pattern/image
- Hero image (3D handshake)

---

### 2. About Section (Image 2)
**Visual Elements:**
- Background: White
- Left side: Orange robot image
- Right side text:
  - "Step inside" (purple)
  - "Our World" (purple + regular weight)
  - "Digital Agency - Web" (with orange "Web")
  - Two description paragraphs

**Editable Fields:**
- Left side image
- Heading line 1
- Heading line 2
- Subheading with accent word
- Description paragraph 1
- Description paragraph 2
- Background color
- Text colors and styling

---

### 3. Services Section (Image 3)
**Visual Elements:**
- Background: Purple/pink gradient with camera imagery
- Left side:
  - "Smart ideas" + "Real growth" heading
  - Description text
  - "See Our Work" button (orange)
- Right side: 6 service cards (3x2 grid)
  - Each card: Icon, title, description, arrow button

**Services Listed:**
1. Branding & Brand content
2. Digital marketing
3. Social Media Management
4. Content Creation
5. Web Design & UI/UX
6. Visual Design

**Editable Fields:**
- Background image/gradient
- Main heading
- Description text
- CTA button
- For each service:
  - Icon image
  - Title
  - Description
  - Button styling

---

### 4. Projects Section (Image 4)
**Visual Elements:**
- Background: Light gray
- Left side: Carousel with project images
  - Shows "PROMOTION DE L'ÉGALITÉ DE GENRE" project
  - Multiple project slides
  - Dot indicators for navigation
- Right side:
  - "Our bold projects" heading (purple)
  - Two description paragraphs (French text)
  - "view projects" button (orange)

**Editable Fields:**
- Background color
- Heading text
- Description paragraphs
- CTA button
- For each project:
  - Project image
  - Project title
  - Project description
  - Display order

---

### 5. Team Section (Image 5)
**Visual Elements:**
- Background: Purple gradient
- Center-aligned heading: "Our Team" (orange)
- Description paragraph
- 4 team member cards in carousel
- Each card: Robot image, name, role, skills

**Team Members:**
1-3. ATOINI ZAKARIAE - Designer, Infographiste
4. R-TAG01 - DIGITAL ASSISTANT

**Editable Fields:**
- Background gradient/color
- Section heading
- Description text
- For each team member:
  - Photo
  - Name
  - Role
  - Skills list
  - Display order

---

## Database Schema Enhancement

### Extended Schema for All Sections

```sql
-- Hero Section Content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT NOT NULL,
  heading_line1_color TEXT DEFAULT '#FF6B35',
  heading_line2 TEXT NOT NULL,
  heading_line2_color TEXT DEFAULT '#FFFFFF',
  subheading TEXT NOT NULL,
  description TEXT NOT NULL,
  background_color TEXT DEFAULT '#2D1B4E',
  background_image TEXT,
  hero_image TEXT, -- base64 or URL
  button1_text TEXT DEFAULT 'What we offer',
  button1_url TEXT DEFAULT '#services',
  button1_bg_color TEXT DEFAULT '#FF6B35',
  button1_text_color TEXT DEFAULT '#FFFFFF',
  button2_text TEXT DEFAULT 'About Us',
  button2_url TEXT DEFAULT '#about',
  button2_style TEXT DEFAULT 'outline',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- About Section Content
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT NOT NULL,
  heading_line2 TEXT NOT NULL,
  subheading TEXT NOT NULL,
  subheading_accent TEXT, -- The word to highlight
  description_p1 TEXT NOT NULL,
  description_p2 TEXT NOT NULL,
  left_image TEXT, -- base64 or URL
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#2D1B4E',
  accent_color TEXT DEFAULT '#FF6B35',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services Section (already exists, enhance)
ALTER TABLE services ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT '→';
ALTER TABLE services ADD COLUMN IF NOT EXISTS button_url TEXT;

-- Services Section Header
CREATE TABLE IF NOT EXISTS services_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading_line1 TEXT DEFAULT 'Smart ideas',
  heading_line2 TEXT DEFAULT 'Real growth',
  description TEXT,
  button_text TEXT DEFAULT 'See Our Work',
  button_url TEXT DEFAULT '#contact',
  background_image TEXT,
  background_color TEXT DEFAULT '#7C3AED',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects Section (already exists, enhance)
-- Projects header
CREATE TABLE IF NOT EXISTS projects_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT 'Our bold projects',
  description_p1 TEXT,
  description_p2 TEXT,
  button_text TEXT DEFAULT 'view projects',
  button_url TEXT DEFAULT '/projects',
  background_color TEXT DEFAULT '#F3F4F6',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team Section (already exists, enhance)
-- Team header
CREATE TABLE IF NOT EXISTS team_header (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT DEFAULT 'Our Team',
  description TEXT,
  background_color TEXT DEFAULT '#7C3AED',
  background_gradient TEXT DEFAULT 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_header ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON hero_content FOR ALL USING (true);

CREATE POLICY "Allow public read" ON about_content FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON about_content FOR ALL USING (true);

CREATE POLICY "Allow public read" ON services_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON services_header FOR ALL USING (true);

CREATE POLICY "Allow public read" ON projects_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON projects_header FOR ALL USING (true);

CREATE POLICY "Allow public read" ON team_header FOR SELECT USING (true);
CREATE POLICY "Allow all operations" ON team_header FOR ALL USING (true);
```

---

## Implementation Phases

### Phase 1: Image System Fix (Week 1, Days 1-2)

**Objective:** Solve the image display problem

**Tasks:**
1. Create image conversion utility
2. Upload real images to database as base64
3. Update admin editors to display base64 images
4. Test image rendering

**Implementation:**

```typescript
// utils/imageUtils.ts
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

---

### Phase 2: Enhanced Content Editors (Week 1, Days 3-5)

**Objective:** Create visual editors matching frontend exactly

#### 2.1 Enhanced Hero Editor

```typescript
// components/admin/content/EnhancedHeroEditor.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, Eye, Save } from 'lucide-react';
import { convertImageToBase64, compressImage } from '@/utils/imageUtils';

interface HeroContent {
  id?: string;
  heading_line1: string;
  heading_line1_color: string;
  heading_line2: string;
  heading_line2_color: string;
  subheading: string;
  description: string;
  background_color: string;
  background_image: string;
  hero_image: string;
  button1_text: string;
  button1_url: string;
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_url: string;
  button2_style: string;
}

export default function EnhancedHeroEditor() {
  const [content, setContent] = useState<HeroContent>({
    heading_line1: 'Digital marketing,',
    heading_line1_color: '#FF6B35',
    heading_line2: 'Branding, Content',
    heading_line2_color: '#FFFFFF',
    subheading: 'Every brand has a story to tell.',
    description: 'Ours is to help yours shine with ideas that make an impact, a strategy that inspires, and results that last.',
    background_color: '#2D1B4E',
    background_image: '',
    hero_image: '',
    button1_text: 'What we offer',
    button1_url: '#services',
    button1_bg_color: '#FF6B35',
    button1_text_color: '#FFFFFF',
    button2_text: 'About Us',
    button2_url: '#about',
    button2_style: 'outline'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (content.id) {
        const { error } = await supabase
          .from('hero_content')
          .update({
            ...content,
            updated_at: new Date().toISOString()
          })
          .eq('id', content.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_content')
          .insert([content]);

        if (error) throw error;
      }

      toast.success('Hero section saved successfully');
      loadContent();
    } catch (error) {
      toast.error('Failed to save hero section');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (field: 'background_image' | 'hero_image', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info('Compressing image...');
      const compressed = await compressImage(file, 1920, 0.8);
      setContent(prev => ({ ...prev, [field]: compressed }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    }
  };

  const updateField = (field: keyof HeroContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Hero Section Editor</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div
              className="relative w-full min-h-[600px] p-8 flex items-center"
              style={{
                backgroundColor: content.background_color,
                backgroundImage: content.background_image ? `url(${content.background_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="max-w-7xl mx-auto w-full flex items-center gap-12">
                <div className="flex-1 space-y-8">
                  <h1 className="text-6xl font-bold">
                    <span style={{ color: content.heading_line1_color }}>
                      {content.heading_line1}
                    </span>
                    <br />
                    <span style={{ color: content.heading_line2_color }}>
                      {content.heading_line2}
                    </span>
                  </h1>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">
                      {content.subheading}
                    </h2>
                    <p className="text-lg text-white/90 max-w-xl">
                      {content.description}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      style={{
                        backgroundColor: content.button1_bg_color,
                        color: content.button1_text_color
                      }}
                      className="px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                    >
                      {content.button1_text}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-semibold border-2 border-white text-white"
                    >
                      {content.button2_text}
                      <svg className="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {content.hero_image && (
                  <div className="flex-1">
                    <div className="rounded-3xl border-4 border-white/20 overflow-hidden">
                      <img
                        src={content.hero_image}
                        alt="Hero"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="styling">Styling & Images</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Main Heading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Line 1 Text</Label>
                    <Input
                      value={content.heading_line1}
                      onChange={(e) => updateField('heading_line1', e.target.value)}
                      placeholder="Digital marketing,"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line 1 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={content.heading_line1_color}
                        onChange={(e) => updateField('heading_line1_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Line 2 Text</Label>
                    <Input
                      value={content.heading_line2}
                      onChange={(e) => updateField('heading_line2', e.target.value)}
                      placeholder="Branding, Content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line 2 Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.heading_line2_color}
                        onChange={(e) => updateField('heading_line2_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={content.heading_line2_color}
                        onChange={(e) => updateField('heading_line2_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subheading & Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subheading</Label>
                  <Input
                    value={content.subheading}
                    onChange={(e) => updateField('subheading', e.target.value)}
                    placeholder="Every brand has a story to tell."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={content.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button 1 (Primary)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Input
                      value={content.button1_text}
                      onChange={(e) => updateField('button1_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={content.button1_url}
                      onChange={(e) => updateField('button1_url', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.button1_bg_color}
                        onChange={(e) => updateField('button1_bg_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={content.button1_bg_color}
                        onChange={(e) => updateField('button1_bg_color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={content.button1_text_color}
                        onChange={(e) => updateField('button1_text_color', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        value={content.button1_text_color}
                        onChange={(e) => updateField('button1_text_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button 2 (Secondary)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Input
                      value={content.button2_text}
                      onChange={(e) => updateField('button2_text', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={content.button2_url}
                      onChange={(e) => updateField('button2_url', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={content.background_color}
                      onChange={(e) => updateField('background_color', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={content.background_color}
                      onChange={(e) => updateField('background_color', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Background Image (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('background_image', e)}
                  />
                  {content.background_image && (
                    <img
                      src={content.background_image}
                      alt="Background preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Main Hero Image (3D Handshake)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('hero_image', e)}
                  />
                  {content.hero_image && (
                    <img
                      src={content.hero_image}
                      alt="Hero image preview"
                      className="w-full h-64 object-contain rounded-md bg-gray-100"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

---

### Phase 3: Frontend Integration (Week 2, Days 1-3)

**Objective:** Connect frontend components to database

```typescript
// components/HeroSection.tsx - Database Connected Version
import { useEffect, useState } from 'react';
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';

interface HeroContent {
  heading_line1: string;
  heading_line1_color: string;
  heading_line2: string;
  heading_line2_color: string;
  subheading: string;
  description: string;
  background_color: string;
  background_image: string;
  hero_image: string;
  button1_text: string;
  button1_url: string;
  button1_bg_color: string;
  button1_text_color: string;
  button2_text: string;
  button2_url: string;
}

const HeroSection = () => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .single();

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !content) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </section>
    );
  }

  return (
    <section
      id="main-content"
      className="w-full px-4 md:px-8 lg:px-16 py-8 md:py-12 lg:py-16"
      style={{
        backgroundColor: content.background_color,
        backgroundImage: content.background_image ? `url(${content.background_image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center lg:justify-start min-h-[calc(100vh-140px)]">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 w-full items-center">
            <div className="flex-1 space-y-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span style={{ color: content.heading_line1_color }}>
                  {content.heading_line1}
                </span>
                <br />
                <span style={{ color: content.heading_line2_color }}>
                  {content.heading_line2}
                </span>
              </h1>

              <div className="space-y-3 md:space-y-4">
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-white">
                  {content.subheading}
                </h2>
                <p className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl">
                  {content.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button
                  style={{
                    backgroundColor: content.button1_bg_color,
                    color: content.button1_text_color
                  }}
                  size="lg"
                  className="group w-full sm:w-auto"
                  onClick={() => {
                    const targetId = content.button1_url.replace('#', '');
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {content.button1_text}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline-light"
                  size="lg"
                  className="group w-full sm:w-auto"
                  onClick={() => {
                    const targetId = content.button2_url.replace('#', '');
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {content.button2_text}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {content.hero_image && (
              <div className="flex-1">
                <div className="rounded-3xl border-4 border-white/20 overflow-hidden">
                  <img
                    src={content.hero_image}
                    alt="Hero"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
```

---

## Testing Plan

### Test Cases

#### 1. Image Display Tests
- [ ] Upload image in admin
- [ ] Image displays in admin preview
- [ ] Image displays on frontend
- [ ] Image survives page refresh
- [ ] Large images are compressed

#### 2. Content Edit Tests
- [ ] Edit text content
- [ ] Changes save to database
- [ ] Frontend updates after save
- [ ] Multiple sections can be edited
- [ ] Preview mode shows changes

#### 3. Styling Tests
- [ ] Color pickers work
- [ ] Colors apply in preview
- [ ] Colors apply on frontend
- [ ] Background images work
- [ ] Responsive design maintained

#### 4. Data Persistence Tests
- [ ] Data survives browser refresh
- [ ] Data survives server restart
- [ ] Multiple admin users see same data
- [ ] Changes are atomic
- [ ] No data loss on errors

---

## File Structure

```
project/
├── client/src/
│   ├── components/
│   │   ├── HeroSection.tsx (updated - database connected)
│   │   ├── AboutSection.tsx (updated - database connected)
│   │   ├── ServicesSection.tsx (updated - database connected)
│   │   ├── ProjectsSection.tsx (updated - database connected)
│   │   └── TeamSection.tsx (updated - database connected)
│   │
│   ├── components/admin/content/
│   │   ├── EnhancedHeroEditor.tsx (new)
│   │   ├── EnhancedAboutEditor.tsx (new)
│   │   ├── EnhancedServicesEditor.tsx (enhanced)
│   │   ├── EnhancedProjectsEditor.tsx (enhanced)
│   │   └── EnhancedTeamEditor.tsx (enhanced)
│   │
│   ├── utils/
│   │   └── imageUtils.ts (new)
│   │
│   └── pages/admin/
│       └── Content.tsx (updated - new editors)
│
└── supabase/migrations/
    └── [timestamp]_enhanced_content_tables.sql
```

---

## Deployment Checklist

- [ ] Run database migration
- [ ] Upload sample images
- [ ] Test all editors
- [ ] Test frontend display
- [ ] Verify mobile responsive
- [ ] Performance test
- [ ] Documentation updated
- [ ] Deploy to production

---

**Next Steps:** Proceed with Phase 1 implementation to solve image display issues.
