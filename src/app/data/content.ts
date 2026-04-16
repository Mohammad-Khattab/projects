// =====================================================
// PORTFOLIO CONTENT CONFIGURATION
// =====================================================
// Edit this file to customize your portfolio content
// No need to touch the component files!
// =====================================================

// Import project screenshots
import snakeGameImg from "../../imports/Screenshot_2026-04-16_185225.png";
import dashboardImg from "../../imports/Screenshot_2026-04-16_185254.png";
import cafeLImg from "../../imports/Screenshot_2026-04-16_185310.png";
import medConnectImg from "../../imports/Screenshot_2026-04-16_185334.png";
import portfolioImg from "../../imports/Screenshot_2026-04-16_185349.png";

export const portfolioContent = {
  // HERO SECTION
  hero: {
    name: "Mohammad Khattab",
    title: "Engineering Innovation",
    subtitle: "Industrial Engineering Student | AI Enthusiast | Web Developer",
    description: "Disciplined Industrial Engineering student combining leadership, AI-driven workflows, and web development expertise",
    profileImage: "https://images.unsplash.com/photo-1775645792585-39d1bd78662a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlbmdpbmVlciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjMzMjY3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  // EXPERTISE SECTION
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

  // PROJECTS SECTION
  projects: [
    {
      title: "Analytics Dashboard",
      description: "Professional workspace setup showcasing real-time business analytics and data visualization on modern laptop display.",
      image: "https://images.unsplash.com/photo-1774292476423-c3ee7ea107b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkYXNoYm9hcmQlMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzc2MzU2MjE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tags: ["Data Visualization", "React", "Analytics"],
      link: "https://mmkl.vercel.app/"
    },
    {
      title: "Cafe Website",
      description: "Professional cafe website featuring elegant design, menu showcase, and seamless user experience.",
      image: cafeLImg,
      tags: ["Web Design", "UI/UX", "Business Website"],
      link: "https://zghairon.vercel.app/"
    },
    {
      title: "Mediconnect",
      description: "Telehealth platform connecting patients with healthcare providers through modern web technology.",
      image: medConnectImg,
      tags: ["Healthcare Tech", "Web Development", "Full-Stack"],
      link: "https://telehealth-five-delta.vercel.app/"
    },
    {
      title: "Portfolio Website",
      description: "Personal portfolio showcasing projects, skills, and professional experience with modern design principles.",
      image: portfolioImg,
      tags: ["Portfolio", "React", "Web Design"],
      link: "https://portfolio-xi-woad-2g6d05xctk.vercel.app/"
    }
  ],

  // MORE PROJECTS (Secondary)
  moreProjects: [
    {
      title: "MKLL Snake Game",
      description: "Interactive classic snake game built with modern web technologies, featuring smooth gameplay and responsive design.",
      image: snakeGameImg,
      tags: ["Web Development", "Game Design", "JavaScript"],
      link: "https://mmkl-snake.vercel.app/"
    }
  ],

  // ABOUT SECTION
  about: {
    description: "Disciplined Industrial Engineering student at German Jordanian University with a strong foundation in leadership, project management, and AI-driven workflows. Expert in coordinating teamwork, organizing tasks, and applying structured problem-solving methodologies to engineering challenges. Passionate about leveraging technology to optimize systems and create innovative solutions.",
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

  // CONTACT SECTION
  contact: {
    email: "mmd1032007@gmail.com",
    linkedin: "https://linkedin.com/in/mohammad-khattab-0137b93ab",
    github: "https://github.com/Mohammad-Khattab"
  }
};