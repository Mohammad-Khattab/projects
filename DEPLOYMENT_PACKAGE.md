# Mohammad Khattab Portfolio - Complete Code Package

This document contains all the essential code files for your portfolio website.

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── IndustrialHero.tsx
│   │   │   ├── Expertise.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   └── ui/ (pre-built components)
│   │   ├── data/
│   │   │   └── content.ts
│   │   └── App.tsx
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   ├── theme.css
│   │   └── fonts.css
│   └── imports/ (your project images)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Package Dependencies

See package.json below for all dependencies. Key packages:
- React 18.3.1
- Vite 6.3.5
- Tailwind CSS 4.1.12
- Motion (Framer Motion) 12.23.24
- Lucide React (icons)
- Radix UI components

## 🎨 Color Palette (Modern Professional)

- Primary Dark: `#2C3E50`
- Secondary Dark: `#34495E`
- Gray: `#7F8C8D`
- Light Gray: `#BDC3C7`
- Background: `#ECF0F1`

## 📝 How to Customize Content

**All content can be edited in one place:** `/src/app/data/content.ts`

You can update:
- Your name, title, and description
- Expertise areas and skills
- Project details and links
- About section info
- Contact information

**No need to touch component code!**

## 🌐 Deployment Instructions

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Go to vercel.com
3. Import your repository
4. Deploy (auto-configured)

### Option 2: Netlify
1. Push code to GitHub
2. Go to netlify.com
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `dist`

### Option 3: GitHub Pages
```bash
npm install --save-dev gh-pages
```
Add to package.json:
```json
"homepage": "https://Mohammad-Khattab.github.io/portfolio",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
Run: `npm run deploy`

## 📧 Contact Information in Code

Currently configured with:
- Email: mmd1032007@gmail.com
- LinkedIn: linkedin.com/in/mohammad-khattab-0137b93ab
- GitHub: github.com/Mohammad-Khattab

Update these in `/src/app/data/content.ts`

## 🎯 Features Included

✅ Responsive design (mobile, tablet, desktop)
✅ Smooth scroll animations (bidirectional)
✅ Modern professional color scheme
✅ Project showcase with links
✅ Contact section with social links
✅ SEO-friendly structure
✅ Fast performance with Vite
✅ Titillium Web font throughout
✅ Unique asymmetric layouts

## 📋 Files Checklist

Essential files you need:
- [x] package.json
- [x] vite.config.ts
- [x] tsconfig.json
- [x] index.html
- [x] All component files
- [x] content.ts (your data)
- [x] All style files
- [x] Project images

## 🔧 Troubleshooting

**Build errors?**
- Make sure Node.js version is 18+
- Delete node_modules and package-lock.json
- Run `npm install` again

**Images not loading?**
- Check image paths in content.ts
- Ensure images are in /src/imports/

**Styling issues?**
- Clear browser cache
- Check that all CSS files are imported

---

## 📄 File Contents Below

The complete code for each file is provided in the sections below.
