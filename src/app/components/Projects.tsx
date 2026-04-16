import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { portfolioContent } from "../data/content";
import { useRef, useState } from "react";

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <section id="projects" ref={containerRef} className="relative py-32 px-4 bg-white overflow-hidden">
      {/* Large Background Text */}
      <motion.div
        className="absolute top-32 left-0 text-[20rem] font-black text-[#ECF0F1] leading-none pointer-events-none select-none whitespace-nowrap"
        style={{ x }}
      >
        PROJECTS PORTFOLIO WORK
      </motion.div>

      <div className="relative max-w-[1600px] mx-auto">
        {/* Section Header - Right Aligned */}
        <motion.div
          className="flex flex-col items-end mb-20"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-6 mb-4">
            <div className="h-px w-24 bg-[#7F8C8D]" />
            <span className="text-[#7F8C8D] text-sm font-bold uppercase tracking-[0.3em]">Selected Works</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black text-[#2C3E50] leading-none text-right">
            FEATURED<br />PROJECTS
          </h2>
        </motion.div>
        
        {/* Magazine Grid - Asymmetric */}
        <div className="space-y-32">
          {portfolioContent.projects.map((project, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                className={`grid md:grid-cols-12 gap-8 items-center ${isEven ? '' : 'md:grid-flow-dense'}`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image Side */}
                <div className={`md:col-span-7 ${isEven ? '' : 'md:col-start-6'} relative group cursor-pointer`}>
                  <motion.div
                    className="relative rounded-3xl overflow-visible"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Decorative Frame - Always visible, no hover animation */}
                    <div className="absolute -inset-4 border-4 border-[#2C3E50] rounded-3xl -z-10" />
                    
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                        <ImageWithFallback
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </a>
                    
                    {/* Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/90 to-[#7F8C8D]/90 flex items-center justify-center rounded-3xl"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-white text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <ArrowUpRight className="w-16 h-16 mx-auto mb-4" />
                          <p className="text-xl font-bold uppercase tracking-wider">View Project</p>
                        </motion.div>
                      </a>
                    </motion.div>
                    
                    {/* Project Number */}
                    <div className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl font-black text-[#2C3E50]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className={`md:col-span-5 ${isEven ? '' : 'md:col-start-1 md:row-start-1'} space-y-6`}>
                  {/* Category Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="bg-[#7F8C8D] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
                      Case Study
                    </Badge>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-4xl lg:text-5xl font-black text-[#2C3E50] leading-tight"
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 }}
                  >
                    {project.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    className="text-lg text-[#7F8C8D] leading-relaxed"
                    initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.4 }}
                  >
                    {project.description}
                  </motion.p>

                  {/* Tags */}
                  <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5 }}
                  >
                    {project.tags.map((tag, tagIdx) => (
                      <motion.div
                        key={tagIdx}
                        className="px-4 py-2 border-2 border-[#2C3E50] rounded-full text-sm font-bold text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white transition-colors cursor-default"
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {tag}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Decorative Line */}
                  <motion.div
                    className="h-1 bg-[#2C3E50] rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100px" }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          {/* More Projects Grid */}
          <AnimatePresence>
            {showMoreProjects && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ 
                  opacity: 1, 
                  maxHeight: 2000,
                }}
                exit={{ opacity: 0, maxHeight: 0 }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeInOut"
                }}
                className="overflow-hidden mb-8"
              >
                <div className="py-4">
                  <h3 className="text-3xl font-black text-[#2C3E50] mb-8">More Projects</h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {portfolioContent.moreProjects?.map((project, index) => (
                      <motion.a
                        key={index}
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-2xl overflow-hidden shadow-xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <ImageWithFallback
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] via-[#2C3E50]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          
                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h4 className="text-2xl font-black mb-2">{project.title}</h4>
                            <p className="text-sm text-white/80 mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Arrow Icon */}
                          <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-5 h-5 text-[#2C3E50]" />
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className="px-12 py-6 bg-[#2C3E50] text-white text-xl font-bold rounded-full hover:bg-[#34495E] transition-colors group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMoreProjects(!showMoreProjects)}
          >
            {showMoreProjects ? 'Show Less' : 'View More Projects'}
            <ArrowUpRight className={`inline-block ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${showMoreProjects ? 'rotate-180' : ''}`} />
          </motion.button>
        </motion.div>
      </div>

      {/* Geometric Accent */}
      <div className="absolute bottom-20 right-20 w-40 h-40 border-8 border-[#ECF0F1] rounded-full -z-0" />
    </section>
  );
}