# 📦 Complete Portfolio Source Code

This document contains **EVERY FILE** you need for your portfolio website.

## 🗂️ File-by-File Code

Copy each section below into its respective file path.

---

## Main Configuration Files

### `/package.json`
```json
{
  "name": "mohammad-khattab-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.487.0",
    "motion": "^12.23.24",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.2.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.12",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.7.0",
    "tailwindcss": "^4.1.12",
    "typescript": "^5.8.0",
    "vite": "^6.3.5"
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

### `/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### `/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Mohammad Khattab - Industrial Engineering Student | AI Enthusiast | Web Developer" />
    <title>Mohammad Khattab | Portfolio</title>
  </head>
  <body style="font-family: 'Titillium Web', sans-serif;">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `/src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## Style Files

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

html {
  scroll-behavior: smooth;
}

* {
  font-family: 'Titillium Web', sans-serif;
}
```

### `/src/styles/theme.css`
```css
:root {
  --font-family: 'Titillium Web', sans-serif;
}

body {
  font-family: var(--font-family);
}
```

---

## Component Files

### `/src/app/App.tsx`

See content.ts file first - that's where you customize everything!

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

### 📝 `/src/app/data/content.ts` - **EDIT THIS TO CUSTOMIZE YOUR PORTFOLIO!**

This is the MOST IMPORTANT file - edit this to change all your content without touching component code!

```typescript
export const portfolioContent = {
  // HERO SECTION - Your main introduction
  hero: {
    name: "Mohammad Khattab",
    title: "Engineering Innovation",
    subtitle: "Industrial Engineering Student | AI Enthusiast | Web Developer",
    description: "Disciplined Industrial Engineering student combining leadership, AI-driven workflows, and web development expertise",
    profileImage: "https://images.unsplash.com/photo-1775645792585-39d1bd78662a", // Replace with your image
  },

  // EXPERTISE SECTION - Your skills
  expertise: [
    {
      title: "Industrial Engineering",
      description: "Engineering problem solving, technical documentation, systems optimization, and structured methodologies.",
      skills: ["Problem Solving", "Systems Optimization", "Technical Documentation", "Process Analysis", "Data Analysis"]
    },
    {
      title: "AI & Programming",
      description: "Prompt engineering, programming fundamentals, and AI-driven workflow optimization.",
      skills: ["Prompt Engineering (Gemini)", "Python Programming", "C Programming", "AI Workflows", "Computer Science"]
    },
    {
      title: "Project Management",
      description: "Project initiation, lifecycle management, task planning, and comprehensive documentation.",
      skills: ["Project Initiation", "Task Planning", "Documentation", "Team Coordination", "Lifecycle Management"]
    }
  ],

  // PROJECTS SECTION - Your portfolio projects
  projects: [
    {
      title: "Analytics Dashboard",
      description: "Professional workspace setup showcasing real-time business analytics and data visualization.",
      image: "https://images.unsplash.com/photo-1774292476423-c3ee7ea107b9", // Replace with your screenshot
      tags: ["Data Visualization", "React", "Analytics"],
      link: "https://your-project-link.com"
    },
    {
      title: "Cafe Website",
      description: "Professional cafe website featuring elegant design, menu showcase, and seamless user experience.",
      image: "https://your-image-url.com", // Replace with your screenshot
      tags: ["Web Design", "UI/UX", "Business Website"],
      link: "https://your-project-link.com"
    },
    // Add more projects here
  ],

  // MORE PROJECTS (Optional secondary projects)
  moreProjects: [
    {
      title: "Another Project",
      description: "Description of your project",
      image: "https://your-image-url.com",
      tags: ["Tag1", "Tag2"],
      link: "https://your-link.com"
    }
  ],

  // ABOUT SECTION - Your background
  about: {
    description: "Disciplined Industrial Engineering student at German Jordanian University with a strong foundation in leadership, project management, and AI-driven workflows.",
    education: [
      "B.S. Industrial Engineering - German Jordanian University (Expected 2030)",
      "High School Diploma - Islamic Educational College (GPA: 4.00/4.00)",
      "Advanced Placement: Computer Science & Psychology"
    ],
    experience: [
      "AP Ambassador - Islamic Educational College (Sep 2024 - Jun 2025)",
      "Assistant Coach - GreenHat Center (Jun 2024 - Jul 2024)",
      "Google Certified Project Management Professional (2026)"
    ],
    achievements: [
      "GPA: 91.9/100 - German Jordanian University",
      "Gemini Certified University Student - Google for Education",
      "Google Project Management Certifications (3x)"
    ]
  },

  // CONTACT SECTION - Your contact info
  contact: {
    email: "mmd1032007@gmail.com",  // Change to your email
    linkedin: "https://linkedin.com/in/mohammad-khattab-0137b93ab",  // Change to your LinkedIn
    github: "https://github.com/Mohammad-Khattab"  // Change to your GitHub
  }
};
```

---

## 🎯 Next Steps

1. **Copy the code above** into the respective files
2. **Edit `/src/app/data/content.ts`** with your information
3. **Add your project screenshots** to `/src/imports/` folder
4. **Install dependencies**: `npm install`
5. **Run locally**: `npm run dev`
6. **Deploy to Vercel/Netlify** (see deployment guide)

---

## 🚀 Quick Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main

# 2. Go to vercel.com, import your repo, and click Deploy!
```

---

## 📸 Adding Your Project Images

Place your images in `/src/imports/` folder, then update content.ts:

```typescript
// Import at top of content.ts
import myProject from "../../imports/my-project.png";

// Use in projects array
{
  title: "My Project",
  image: myProject,  // Use imported image
  // or
  image: "https://unsplash.com/...",  // Use URL
}
```

---

## ✅ Component Files

The full component code (IndustrialHero, Expertise, Projects, About, Contact, Footer) is already in your project at `/src/app/components/`. These files are ready to use - you don't need to create them manually. They're reading data from `content.ts`, so just edit that file to customize!

---

## 🎨 Color Customization

Current palette (Modern Professional):
- Primary: `#2C3E50`
- Secondary: `#34495E`
- Gray: `#7F8C8D`
- Light Gray: `#BDC3C7`
- Background: `#ECF0F1`

To change: Search and replace these colors in component files.

---

## 📦 Minimal Dependencies Version

If you want a lighter version, here's package.json with ONLY what's needed:

```json
{
  "name": "portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.487.0",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.7.0",
    "@tailwindcss/vite": "^4.1.12",
    "tailwindcss": "^4.1.12",
    "vite": "^6.3.5"
  }
}
```

---

**That's everything you need!** 🎉

The complete working portfolio is now in your hands. Just customize `content.ts` and deploy!
