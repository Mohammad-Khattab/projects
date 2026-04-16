import { motion, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Factory, Brain, Code, Database, ArrowRight, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { portfolioContent } from "../data/content";
import { useRef } from "react";
import cvFile from "../../imports/Mohammad_Khattab_CV_Final-1.pdf";

export function IndustrialHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const skills = [
    { icon: Factory, title: "Lean Six Sigma", subtitle: "Process Excellence", color: "from-blue-500 to-blue-600" },
    { icon: Brain, title: "Machine Learning", subtitle: "AI Solutions", color: "from-purple-500 to-purple-600" },
    { icon: Code, title: "React/Next.js", subtitle: "Web Development", color: "from-emerald-500 to-emerald-600" },
    { icon: Database, title: "Data Analytics", subtitle: "Insights & Optimization", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div id="home" ref={containerRef} className="relative min-h-screen bg-[#2C3E50] overflow-hidden">
      {/* Floating Navigation - Fixed on scroll */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-8 py-6"
        initial={{ y: 0 }}
        style={{ opacity }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-3xl font-black flex items-center gap-1"
          >
            <span className="tracking-tight">MK</span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="tracking-tight">LL</span>
          </motion.div>
          
          <motion.div 
            className="hidden md:flex items-center gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {['home', 'expertise', 'projects', 'about', 'contact'].map((item, i) => (
              <a 
                key={item}
                href={`#${item}`} 
                className="text-[#BDC3C7] hover:text-white transition-colors uppercase text-sm tracking-wider font-semibold relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </motion.div>
        </div>
      </motion.nav>

      {/* Diagonal Split Layout */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Diagonal Element */}
        <motion.div 
          className="absolute top-0 right-0 w-[60%] h-full bg-[#34495E] origin-top-right"
          style={{ 
            clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
            y
          }}
        />
        
        {/* Main Content Grid - Asymmetric */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 py-32 grid grid-cols-12 gap-12 items-center">
          {/* Left Column - Large Text */}
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Name - Massive and Bold with improved typography */}
              <h1 className="text-[#ECF0F1] mb-10 leading-[0.85]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-[5rem] lg:text-[9rem] font-black tracking-[-0.02em]"
                >
                  MOHAMMAD
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-[5rem] lg:text-[9rem] font-black tracking-[-0.02em] text-[#7F8C8D]"
                >
                  KHATTAB
                </motion.div>
              </h1>

              {/* Subtitle with improved spacing */}
              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <p className="text-2xl lg:text-3xl text-[#ECF0F1] font-light leading-relaxed max-w-xl">
                  {portfolioContent.hero.subtitle}
                </p>
              </motion.div>

              {/* CTA Button - Single */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <Button 
                  size="lg"
                  className="bg-white text-[#2C3E50] hover:bg-[#ECF0F1] px-12 py-8 text-xl font-bold group shadow-2xl"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Work
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  size="lg"
                  className="bg-[#34495E] text-white hover:bg-[#2C3E50] px-12 py-8 text-xl font-bold group shadow-2xl border-2 border-white/20"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = cvFile;
                    link.download = 'Mohammad_Khattab_CV.pdf';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FileText className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                  My CV
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Image and Floating Skills */}
          <div className="col-span-12 lg:col-span-5 relative h-[650px]">
            {/* Main Image - Clean Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute top-8 right-0 w-full max-w-[500px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1763568258143-904ea924ac53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwd2ViJTIwZGV2ZWxvcG1lbnQlMjBjb2RpbmclMjBzY3JlZW58ZW58MXx8fHwxNzc2MzM0OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="AI and Web Development"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/80 via-[#2C3E50]/20 to-transparent" />
            </motion.div>

            {/* Floating Skill Cards - Better positioned */}
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              const positions = [
                { top: '-3rem', left: '-2rem' },
                { bottom: '10rem', left: '-3rem' },
                { top: '6rem', right: '-2rem' },
                { bottom: '-2rem', right: '-2rem' }
              ];
              
              return (
                <motion.div
                  key={index}
                  className="absolute z-20"
                  style={positions[index]}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    opacity: { delay: 1 + index * 0.15, duration: 0.6 },
                    scale: { delay: 1 + index * 0.15, duration: 0.6, type: "spring", stiffness: 150 },
                    y: {
                      delay: 1.6 + index * 0.15,
                      duration: 4 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className={`bg-gradient-to-br ${skill.color} text-white p-5 rounded-xl shadow-2xl border border-white/30`}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 bg-white/25 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{skill.title}</h4>
                        <p className="text-sm text-white/90 font-medium">{skill.subtitle}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geometric Background Accent - Only one square */}
      <motion.div 
        className="absolute bottom-32 left-[15%] w-20 h-20 bg-[#BDC3C7]/10 rounded-lg"
        animate={{ rotate: [0, 90, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-[#BDC3C7] text-xs uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          className="w-6 h-10 border-2 border-[#BDC3C7] rounded-full flex justify-center pt-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div className="w-1 h-2 bg-[#BDC3C7] rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}