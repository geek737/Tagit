# Content Management System - Implementation Guide

## Overview
This document provides a comprehensive guide to the CMS implementation, addressing all requirements including color management, content recovery, and backend integration.

---

## 1. Color Management System

### Default Colors Configuration
The system now includes a **Reset to Defaults** function that restores original colors:

```typescript
const DEFAULT_COLORS = {
  primary_color: '#FF6B35',    // Orange
  secondary_color: '#7C3AED',  // Purple
  accent_color: '#FF6B35',     // Orange
  background_color: '#FFFFFF', // White
  text_color: '#1F2937'        // Dark Gray
};
```

### Color Reset Functionality

**Location:** `/admin/appearance`

**Features:**
- **Cancel Changes**: Reloads last saved colors from database
- **Reset to Defaults**: Restores original default colors (shown above)
- **Save Color Scheme**: Saves current colors to database

**Implementation:**
```typescript
const handleResetToDefaults = async () => {
  // Confirms with user
  if (!confirm('Are you sure you want to reset...')) return;

  // Updates database with default values
  for (const [key, value] of Object.entries(DEFAULT_COLORS)) {
    await supabase
      .from('site_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
  }

  // Updates UI
  setSettings(DEFAULT_COLORS);
  toast.success('Colors reset to default values');
};
```

---

## 2. Content Recovery & Migration

### Database Population Status

All existing content has been migrated to the database:

| Content Type | Count | Status |
|-------------|-------|--------|
| Services | 6 | ✓ Populated |
| Projects | 3 | ✓ Populated |
| Team Members | 3 | ✓ Populated |
| Testimonials | 3 | ✓ Populated |
| Media Files | 16 | ✓ Populated |

### Services Data
```sql
1. Web Design - Creating beautiful websites
2. Branding - Unique brand identities
3. Content Creation - Compelling content
4. Graphic Design - Stunning visuals
5. Digital Marketing - Strategic campaigns
6. Social Media - Community management
```

### Projects Data
```sql
1. Moujda Project - Branding & Web Design
2. Blendimmo - Real estate platform
3. Promotional Campaign - Marketing materials
```

### Team Members Data
```sql
1. Creative Director - UI/UX, Branding, Strategy
2. Marketing Specialist - SEO, Social Media, Analytics
3. Web Developer - React, Node.js, TypeScript
```

---

## 3. Media Library Integration

### Asset Categories

All assets are organized in the media library:

- **Logo**: Tagit brand logo
- **Hero**: Hero section images
- **Icons**: Service icons (6 total)
- **Projects**: Project showcase images (3 total)
- **Team**: Team member photos (3 total)
- **Backgrounds**: Section backgrounds

### Accessing Media Library

**Location:** `/admin/media`

**Features:**
- Upload new images with automatic compression
- Filter by category
- Preview images
- Delete unwanted files
- Organized by section

---

## 4. Content Management Per Section

### Hero Section
**Path:** `/admin/content` → Hero Tab

**Editable Fields:**
- Headline text
- Subtext/description
- CTA button text and URL
- Button styling (3 colors)
- Background color
- Background image

### Services Section
**Path:** `/admin/content` → Services Tab

**Features:**
- Add/remove services
- Edit title and description
- Upload custom icons
- Reorder services
- Toggle visibility

**Current Services:**
All 6 services are pre-loaded with descriptions and icons.

### Projects Section
**Path:** `/admin/content` → Projects Tab

**Features:**
- Add/remove projects
- Edit title, category, description
- Upload project images
- Reorder with arrow buttons
- Project categories

**Current Projects:**
All 3 projects are pre-loaded with images and descriptions.

### Team Section
**Path:** `/admin/content` → Team Tab

**Features:**
- Add/remove team members
- Upload profile photos
- Edit name and role
- Add multiple skills (badges)
- Flexible grid layout

**Current Team:**
All 3 team members are pre-loaded with roles and skills.

### Testimonials Section
**Path:** `/admin/content` → Testimonials Tab

**Features:**
- Add/remove testimonials
- Edit author information
- Star rating system (1-5)
- Author photo upload
- Company details

**Current Testimonials:**
3 sample testimonials are pre-loaded.

### Contact Section
**Path:** `/admin/content` → Contact Tab

**Features:**
- Add/remove contact methods
- Edit labels and values
- Icon selection
- Contact types: email, phone, address

### Footer Section
**Path:** `/admin/content` → Footer Tab

**Features:**
- Social media links management
- Footer content editing
- Copyright information
- Multiple content sections

---

## 5. Appearance Management

### Global Color Scheme
**Path:** `/admin/appearance` → Colors Tab

Configure 5 main colors with live preview

### Section Backgrounds
**Path:** `/admin/appearance` → Section Backgrounds Tab

**Per-Section Controls:**
- Background color picker
- Background image upload
- Live preview
- Remove image option

---

## 6. Technical Implementation

### Database Schema

**Main Tables:**
- `sections` - Section configuration
- `section_content` - Dynamic section content
- `services` - Service items
- `projects` - Portfolio projects
- `team_members` - Team information
- `testimonials` - Client testimonials
- `media_library` - All media assets
- `buttons` - Button configurations
- `contact_info` - Contact methods
- `footer_content` - Footer sections
- `social_media` - Social links
- `site_settings` - Global settings

### Security

**Row Level Security (RLS):**
- All tables have RLS enabled
- Public read access for display
- Full access for admin operations
- No authentication required for public content

---

## 7. Usage Instructions

### Admin Access
1. Navigate to `/admin/login`
2. Login: **admin** / **admin**
3. Access dashboard

### Managing Content

**To Edit Services:**
1. Go to `/admin/content`
2. Click "Services" tab
3. Click on any service to edit
4. Upload new icon or edit text
5. Click "Save All Services"

**To Add Project:**
1. Go to `/admin/content`
2. Click "Projects" tab
3. Click "Add Project"
4. Fill in details and upload image
5. Click "Save All Projects"

**To Manage Team:**
1. Go to `/admin/content`
2. Click "Team" tab
3. Add/edit members
4. Upload photos
5. Add skills by typing and pressing Enter
6. Click "Save All Team Members"

**To Reset Colors:**
1. Go to `/admin/appearance`
2. Click "Colors" tab
3. Click "Reset to Defaults" button
4. Confirm action
5. Colors will reset to original defaults

---

## 8. Image Management

### Uploading Images

**Method 1: Via Media Library**
1. Go to `/admin/media`
2. Click "Upload Media"
3. Select image
4. Choose category
5. Add alt text
6. Click "Upload"

**Method 2: Direct Upload in Editors**
- Each content editor has inline upload
- Images automatically compressed if > 5MB
- Stored as base64 in database

### Image Optimization
- Automatic compression for large files
- Max dimensions: 1920x1080
- Quality: 80%
- Supported formats: PNG, JPG, GIF, WebP

---

## 9. Troubleshooting

### Colors Not Applying
**Solution:**
- Frontend components need to read from `site_settings` table
- Add color fetching in main components
- Apply inline styles with database colors

### Content Not Showing
**Solution:**
- Verify data in database tables
- Check `is_visible` column is `true`
- Ensure RLS policies allow public read

### Images Not Loading
**Solution:**
- Verify base64 data in database
- Check file paths in media_library table
- Use media upload dialog for new images

---

## 10. Next Steps

### To Make Colors Apply Globally:

1. **Create Color Context:**
```typescript
// client/src/contexts/ColorContext.tsx
export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({});

  useEffect(() => {
    loadColors();
  }, []);

  return (
    <ColorContext.Provider value={colors}>
      {children}
    </ColorContext.Provider>
  );
};
```

2. **Use in Components:**
```typescript
const { primary_color, accent_color } = useColors();

<button style={{ backgroundColor: accent_color }}>
  Click Me
</button>
```

### To Connect Frontend to Database:

Update each section component to fetch from database instead of hardcoded data.

**Example for Services:**
```typescript
const ServicesSection = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_visible', true)
      .order('display_order')
      .then(({ data }) => setServices(data || []));
  }, []);

  return (
    <div>
      {services.map(service => (
        <ServiceCard key={service.id} {...service} />
      ))}
    </div>
  );
};
```

---

## Summary

✅ **Completed:**
- Color reset functionality with default values
- All existing content migrated to database
- Media library populated with 16 assets
- Full CRUD operations for all sections
- Comprehensive admin interface
- Image upload and management system

✅ **Available Features:**
- 8 section editors (Hero, About, Services, Projects, Team, Testimonials, Contact, Footer)
- Global color scheme management
- Per-section background customization
- Media library with categories
- Dynamic content management

📝 **Remaining:**
- Connect frontend components to database
- Implement color context for global application
- Add real-time preview functionality

---

For questions or issues, refer to the specific section documentation above or check the implementation files in `/client/src/pages/admin/` and `/client/src/components/admin/content/`.
