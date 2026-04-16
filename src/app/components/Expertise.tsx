import { Card } from "./ui/card";
import { Factory, Brain, Code } from "lucide-react";
import { motion } from "motion/react";
import { portfolioContent } from "../data/content";

export function Expertise() {
  const icons = [Factory, Brain, Code];

  return (
    <section id="expertise" className="relative py-32 px-4 bg-[#ECF0F1] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 border-[3px] border-[#2C3E50] rounded-full" />
        <div className="absolute bottom-20 right-20 w-80 h-80 border-[#2C3E50]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto">
        {/* Section Header - Offset Left */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-6 mb-4">
            <div className="w-24 h-1 bg-[#2C3E50]" />
            <h2 className="text-6xl font-black text-[#2C3E50] tracking-tight">
              EXPERTISE
            </h2>
          </div>
          <p className="text-xl text-[#7F8C8D] ml-[136px] max-w-2xl">
            Engineering Innovation Through AI & Design
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Large Featured Card - Industrial Engineering */}
          <motion.div
            className="md:col-span-7 md:row-span-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full bg-gradient-to-br from-[#2C3E50] to-[#34495E] border-0 shadow-2xl rounded-3xl overflow-hidden group">
              <div className="relative h-full p-10 flex flex-col">
                {/* Background Icon */}
                <div className="absolute top-0 right-0 w-96 h-96 opacity-5 transform translate-x-20 -translate-y-20">
                  {icons[0] && <Factory className="w-full h-full" />}
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      {icons[0] && <Factory className="w-10 h-10 text-white" />}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4">
                      {portfolioContent.expertise[0].title}
                    </h3>
                    <p className="text-xl text-white/80 leading-relaxed">
                      {portfolioContent.expertise[0].description}
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="mt-auto">
                    <div className="h-1 w-20 bg-white/30 mb-8" />
                    <div className="grid grid-cols-1 gap-4">
                      {portfolioContent.expertise[0].skills.map((skill, idx) => (
                        <motion.div
                          key={idx}
                          className="px-6 py-5 bg-white/10 backdrop-blur-sm rounded-2xl text-lg font-bold text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-default"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          whileHover={{ x: 10, scale: 1.02 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-white rounded-full" />
                            {skill}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Medium Card - AI & Programming */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full bg-white border-4 border-[#2C3E50] shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
              <div className="relative h-full p-8 flex flex-col">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                  {icons[1] && <Brain className="w-full h-full" />}
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#2C3E50] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#34495E] transition-colors duration-500">
                      {icons[1] && <Brain className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="text-3xl font-black text-[#2C3E50] mb-3">
                      {portfolioContent.expertise[1].title}
                    </h3>
                    <p className="text-[#7F8C8D] leading-relaxed">
                      {portfolioContent.expertise[1].description}
                    </p>
                  </div>

                  {/* Skills List */}
                  <div className="mt-auto space-y-2">
                    {portfolioContent.expertise[1].skills.map((skill, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3 group/skill"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-[#2C3E50] rounded-full group-hover/skill:scale-150 transition-transform" />
                        <span className="text-sm font-semibold text-[#2C3E50] group-hover/skill:translate-x-2 transition-transform">
                          {skill}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bottom Card - Project Management */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full bg-white border-4 border-[#2C3E50] shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
              <div className="relative h-full p-8">
                {/* Background Icon */}
                <div className="absolute bottom-0 right-0 w-48 h-48 opacity-5 transform translate-x-10 translate-y-10">
                  {icons[2] && <Code className="w-full h-full" />}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#2C3E50] rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500">
                      {icons[2] && <Code className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="text-3xl font-black text-[#2C3E50] mb-3">
                      {portfolioContent.expertise[2].title}
                    </h3>
                    <p className="text-[#7F8C8D] leading-relaxed mb-6">
                      {portfolioContent.expertise[2].description}
                    </p>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {portfolioContent.expertise[2].skills.map((skill, idx) => (
                      <motion.span
                        key={idx}
                        className="px-4 py-2 bg-[#ECF0F1] rounded-lg text-sm font-semibold text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white transition-colors cursor-default flex items-center gap-2"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        whileHover={{ x: 10 }}
                      >
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}