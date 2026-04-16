import { Award, GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { portfolioContent } from "../data/content";
import { useRef } from "react";

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const highlights = [
    {
      icon: GraduationCap,
      title: "Education",
      items: portfolioContent.about.education,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Briefcase,
      title: "Experience",
      items: portfolioContent.about.experience,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Award,
      title: "Achievements",
      items: portfolioContent.about.achievements,
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <section id="about" ref={containerRef} className="relative py-32 px-4 bg-[#2C3E50] overflow-hidden">
      {/* Rotating Circle Background */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[2px] border-white/5 rounded-full"
        style={{ rotate }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[2px] border-white/5 rounded-full"
        style={{ rotate: useTransform(rotate, (v) => -v) }}
      />

      <div className="relative max-w-[1600px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#7F8C8D]" />
            <span className="text-[#7F8C8D] text-sm font-bold uppercase tracking-[0.3em]">Who I Am</span>
            <div className="h-px w-16 bg-[#7F8C8D]" />
          </div>
          <h2 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-none">
            ABOUT ME
          </h2>
          <motion.p
            className="text-xl lg:text-2xl text-[#BDC3C7] max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3 }}
          >
            {portfolioContent.about.description}
          </motion.p>
        </motion.div>
        
        {/* Split Layout - Three Column Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                {/* Card */}
                <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/10 overflow-hidden group-hover:border-white/30 transition-all duration-500">
                  {/* Gradient Overlay on Hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${highlight.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-3xl font-black text-white mb-6 leading-tight">
                      {highlight.title}
                    </h3>

                    {/* Items List */}
                    <ul className="space-y-4">
                      {highlight.items.map((item, idx) => (
                        <motion.li
                          key={idx}
                          className="text-[#BDC3C7] font-medium flex items-start gap-3 group/item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                          <Sparkles className="w-4 h-4 text-[#7F8C8D] mt-1 flex-shrink-0 group-hover/item:text-white transition-colors" />
                          <span className="group-hover/item:text-white transition-colors">
                            {item}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px]" />
                  
                  {/* Number */}
                  <div className="absolute bottom-4 right-4 text-7xl font-black text-white/5 leading-none group-hover:text-white/10 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Statement */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="inline-block px-8 py-4 bg-white/5 backdrop-blur-sm rounded-full border-2 border-white/10">
            <p className="text-[#ECF0F1] text-lg font-semibold">
              🚀 Currently available for new opportunities
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 right-20 w-20 h-20 bg-[#7F8C8D]/20 rounded-full blur-xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 left-40 w-32 h-32 bg-[#BDC3C7]/10 rounded-full blur-2xl"
        animate={{ y: [0, 40, 0], scale: [1, 0.8, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}