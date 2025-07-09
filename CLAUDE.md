# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Next.js showcasing Benny Conn's work as a programmer and jazz trombonist. The site features an audio player for jazz recordings, project showcases, and contact functionality.

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
- **Markdown**: Remark with rehype pipeline for blog posts

### Project Structure
```
app/                    # Next.js app router pages
├── page.js            # Homepage with hero section
├── layout.js          # Root layout with fonts and providers
├── Work.js            # Portfolio projects showcase
├── Contact.js         # Contact form (uses Formspree)
├── ContactButton.js   # Reusable contact button
├── MyWorkButton.js    # Navigation button to work section
├── BlogButton.js      # Navigation button to blog
├── blog/              # Blog pages
│   ├── page.js        # Blog listing page
│   └── [slug]/        # Individual blog post pages
│       └── page.js    # Blog post component
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
├── utils.js          # Tailwind class utilities
└── blog.js           # Blog markdown processing utilities

content/               # Content files
└── blog/             # Blog posts in markdown format

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
Three main projects highlighted in `Work.js`:
1. **Gig App** - Full-stack musician platform (React Native, Go, PostgreSQL)
2. **Gallery** - Art sharing platform backend (Go, GraphQL, GCP)
3. **Minecraft Plugins** - Java/Kotlin game modifications

#### Contact Form
- Integrated with Formspree for form handling
- Form action: `https://formspree.io/f/mrbzwrzv`

#### Blog System
- Markdown-based blog posts stored in `content/blog/`
- Uses remark-rehype pipeline for processing markdown to HTML
- Automatic table of contents generation with `rehype-toc`
- Heading anchor links with `rehype-slug`
- Support for frontmatter metadata (title, date, excerpt, tags)
- Responsive design with sticky TOC on individual post pages

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

### Blog Content Management

To add new blog posts:
1. Create a new `.md` file in `content/blog/`
2. Add frontmatter with metadata:
   ```markdown
   ---
   title: "Your Post Title"
   date: "2024-01-15"
   excerpt: "Brief description"
   tags: ["tag1", "tag2"]
   ---
   ```
3. Write content in markdown with headings for automatic TOC generation
4. The blog system will automatically generate slugs and handle routing