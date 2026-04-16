# 🚀 Mohammad Khattab Portfolio - Complete Code Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Customization](#customization)
5. [Deployment](#deployment)
6. [All Source Code](#all-source-code)

---

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build for production
npm run build
```

Your site will be running at `http://localhost:5173`

---

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── IndustrialHero.tsx      # Hero section with MKLL branding
│   │   │   ├── Expertise.tsx           # Bento grid expertise cards
│   │   │   ├── Projects.tsx            # Magazine-style projects
│   │   │   ├── About.tsx               # About section with timeline
│   │   │   ├── Contact.tsx             # Contact form + social links
│   │   │   ├── Footer.tsx              # Footer with navigation
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   └── ui/                     # Shadcn UI components
│   │   ├── data/
│   │   │   └── content.ts              # ⭐ EDIT THIS FILE TO UPDATE CONTENT
│   │   └── App.tsx                     # Main app component
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── theme.css
│   │   └── fonts.css
│   └── imports/                        # Your project images
├── package.json
├── vite.config.ts
└── index.html
```

---

## 💻 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Steps

1. **Create a new folder for your project:**
```bash
mkdir mohammad-portfolio
cd mohammad-portfolio
```

2. **Copy all files from this guide into the appropriate folders**

3. **Install dependencies:**
```bash
npm install
```

4. **Start development server:**
```bash
npm run dev
```

---

## 🎨 Customization

### ✨ Easy Content Updates (NO CODE CHANGES NEEDED!)

**Edit `/src/app/data/content.ts` to customize:**

#### Update Your Name & Title
```typescript
hero: {
  name: "Your Name",
  title: "Your Professional Title",
  subtitle: "Your Tagline",
  // ...
}
```

#### Update Projects
```typescript
projects: [
  {
    title: "Your Project Name",
    description: "Project description",
    image: "https://your-image-url.com/image.jpg",
    tags: ["React", "TypeScript", "etc"],
    link: "https://your-project-link.com"
  },
  // Add more projects...
]
```

#### Update Contact Info
```typescript
contact: {
  email: "your-email@example.com",
  linkedin: "https://linkedin.com/in/your-profile",
  github: "https://github.com/your-username"
}
```

### 🎨 Color Palette

Current "Modern Professional" theme:
- `#2C3E50` - Primary Dark
- `#34495E` - Secondary Dark
- `#7F8C8D` - Gray
- `#BDC3C7` - Light Gray
- `#ECF0F1` - Background

To change colors, search and replace these hex codes in all component files.

---

## 🌐 Deployment

### Option 1: Vercel (Recommended - 2 minutes)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - Click "Deploy"

**That's it!** Your site will be live at `https://your-project.vercel.app`

### Option 2: Netlify

1. Push to GitHub (same as above)

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - "Add new site" → "Import from Git"
   - Select your repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy"

### Option 3: GitHub Pages

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "homepage": "https://YOUR-USERNAME.github.io/portfolio",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

Deploy:
```bash
npm run deploy
```

---

## 📦 All Source Code

### `/package.json`
```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "canvas-confetti": "1.9.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

### `/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

### `/src/app/App.tsx`
```tsx
import { IndustrialHero } from "./components/IndustrialHero";
import { Expertise } from "./components/Expertise";
import { Projects } from "./components/Projects";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen scroll-smooth">
      <IndustrialHero />
      <Expertise />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
```

### `/src/styles/index.css`
```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';
```

### `/src/styles/fonts.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700;900&display=swap');
```

### `/src/styles/tailwind.css`
```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';

@import 'tw-animate-css';

html {
  scroll-behavior: smooth;
}
```

---

## 🎯 Key Features

✅ **Responsive Design** - Works on all devices
✅ **Smooth Animations** - Bidirectional scroll animations
✅ **Easy to Customize** - Edit one file (content.ts) to update everything
✅ **Modern Stack** - React, Vite, Tailwind CSS 4
✅ **Professional Design** - Unique asymmetric layouts
✅ **SEO Friendly** - Semantic HTML structure
✅ **Fast Performance** - Optimized with Vite
✅ **Clean Code** - Well organized and commented

---

## 📧 Support

Having issues? Check:
1. Node.js version is 18+
2. All dependencies installed (`npm install`)
3. No console errors in browser DevTools
4. Image paths are correct in content.ts

---

## 📝 License

This is your personal portfolio - feel free to use and modify as needed!

---

## 🎉 Deployment Checklist

Before deploying:
- [ ] Update all content in `/src/app/data/content.ts`
- [ ] Replace placeholder images with your actual project screenshots
- [ ] Update contact information (email, LinkedIn, GitHub)
- [ ] Test on mobile, tablet, and desktop
- [ ] Run `npm run build` to check for errors
- [ ] Update README with your custom info

After deploying:
- [ ] Test all links work correctly
- [ ] Verify contact form behavior
- [ ] Check loading speed
- [ ] Share your portfolio URL! 🚀

---

**Need the component code?** 
All component files (IndustrialHero.tsx, Expertise.tsx, Projects.tsx, About.tsx, Contact.tsx, Footer.tsx) are already in your `/src/app/components/` folder. The code from those files is ready to use as-is.

The most important file to customize is `/src/app/data/content.ts` - that's where all your personal information, projects, and content lives!

---

**Ready to deploy? Start with Vercel - it's the easiest!** 🚀
