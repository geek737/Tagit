# TagTik - Project Documentation

## Overview
TagTik is a marketing and branding agency website built with React, TypeScript, and a fullstack architecture on Replit. The project was successfully migrated from Lovable to Replit's fullstack JavaScript template.

## Recent Changes (November 6, 2025)
- **Migration from Lovable to Replit**: Successfully converted the project from a Lovable/Vite frontend-only setup to Replit's fullstack template
- **Backend Integration**: Added Express server with Vite middleware for development
- **Fixed Express Route Issues**: Updated server configuration to work with latest Express version (using middleware instead of `app.get('*')`)
- **Vite Configuration**: Configured `allowedHosts` for Replit's dynamic domains (`.replit.dev`, `.repl.co`)
- **Router Migration**: Migrated from react-router-dom to wouter for better integration with the fullstack template
- **Tailwind Configuration Fix**: Fixed Tailwind content paths to point to `./client/src/**/*.{ts,tsx}` for proper CSS application
- **Services Section Background**: Added custom background image for desktop (md breakpoint and above) while keeping gradient background for mobile devices

## Project Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Router**: Wouter (replaced react-router-dom)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query v5)

### Backend (Server)
- **Framework**: Express
- **Dev Server**: tsx watch for hot reload
- **Middleware**: Vite middleware for development
- **Port**: 5000 (required for Replit webview)

### Directory Structure
```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities (queryClient, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── assets/        # Images and static assets
│   │   ├── App.tsx        # Main app component
│   │   ├── entry-client.tsx  # Client entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── index.html         # HTML template
├── server/                # Backend application
│   ├── index.ts           # Server entry point
│   ├── vite.ts            # Vite middleware setup
│   ├── routes.ts          # API routes
│   └── storage.ts         # Storage interface
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models (currently minimal)
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Key Features
- **Marketing Website**: Professional landing page with hero section, about section, and services showcase
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Component Library**: shadcn/ui components for consistent UI
- **Dark Theme**: Full dark mode styling

## Available Scripts
- `npm run dev` - Start development server with hot reload (port 5000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technical Notes

### Vite Configuration
The Vite config includes special settings for Replit:
- `server.allowedHosts`: Configured to allow `.replit.dev` and `.repl.co` domains
- `server.host`: Set to `0.0.0.0` to accept external connections
- Root directory set to `./client` for proper file resolution
- Build output configured to `../dist/public`

### Storage Strategy
Currently using in-memory storage (MemStorage). Can be upgraded to PostgreSQL database if persistence is needed.

## Deployment
The project is configured for Replit's autoscale deployment:
- Build command: `npm run build`
- Start command: `npm run start`
- Deployment target: autoscale (stateless web application)

## Current State
✅ Project successfully migrated and running
✅ Server running on port 5000
✅ Frontend displaying correctly
✅ All routes configured properly
✅ Vite configuration optimized for Replit

## Next Steps
The project is ready for further development. You can now:
- Add new features to the frontend
- Implement backend API routes as needed
- Add database integration if persistence is required
- Extend the component library
- Add more pages using wouter routing
