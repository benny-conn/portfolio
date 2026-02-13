# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Next.js showcasing Benny Conn's work as a founder, programmer, and jazz trombonist. The site features an audio player for jazz recordings, project showcases, and contact functionality.

## Development Commands

- `yarn dev` - Start development server at http://localhost:3000 (user runs this, not Claude)
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint code linting

**Note**: The user will handle running `yarn dev` and other development commands. Claude should not attempt to run these commands.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Package Manager**: Yarn 4.5.0
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React icons and Radix UI icons

### Project Structure
```
app/                    # Next.js app router pages
├── page.js            # Homepage with hero section
├── layout.js          # Root layout with fonts and providers
├── Work.js            # Portfolio projects showcase
├── Contact.js         # Contact form (uses Formspree)
├── ContactButton.js   # Reusable contact button
├── MyWorkButton.js    # Navigation button to work section
└── globals.css        # Global styles and CSS variables

components/            # Reusable components
├── AudioPlayer.js     # Audio player with playlist support
├── FeatureCard.js     # Project feature display cards
└── ui/               # shadcn/ui components
    ├── button.jsx    # Button component
    ├── input.jsx     # Input component
    └── ...           # Other UI primitives

hooks/                 # Custom React hooks
└── use-toast.js      # Toast notification hook

lib/                   # Utility libraries
└── utils.js          # Tailwind class utilities

public/               # Static assets
├── audio/            # Audio files for music player
├── *.png, *.jpg      # Images for projects and portraits
└── *.svg            # Technology logos and icons
```

### Key Features

#### Audio Player System
- Context-based audio state management in `AudioPlayer.js`
- Supports playlists with track navigation
- Fixed bottom player with progress bar and volume control
- Client-side rendering with dynamic imports for SSR compatibility

#### Custom Styling
- Uses Alte Haas fonts (regular and bold variants)
- Custom brand color: `#FFDD00` (yellow)
- Dark mode enabled by default
- Responsive design with mobile-first approach

#### Project Showcase
Four main projects highlighted in `Work.js`:
1. **Curation Events** - Creative corporate event planning agency (Co-Founder & Creative Director)
2. **Gig App** - Full-stack musician platform (React Native, Go, PostgreSQL)
3. **Gallery** - Art sharing platform backend (Go, GraphQL, GCP)
4. **Minecraft Plugins** - Java/Kotlin game modifications

#### Contact Form
- Integrated with Formspree for form handling
- Form action: `https://formspree.io/f/mrbzwrzv`

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.js` - Tailwind CSS configuration with custom colors and fonts
- `jsconfig.json` - Path aliases (`@/*` points to project root)
- `next.config.mjs` - Next.js configuration (minimal)
- `.eslintrc.json` - ESLint configuration extending Next.js defaults

## Development Notes

- Uses `@` alias for imports from project root
- All components use JSX (not TSX) as indicated by `"tsx": false` in components.json
- Audio files are served from `/public/audio/` directory
- Images are optimized using Next.js Image component
- Forms use native HTML form submission to external service
- No custom API routes - static site with external form handling