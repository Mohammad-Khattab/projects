import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, Linkedin, Github, Send, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { portfolioContent } from "../data/content";

export function Contact() {
  const socialLinks = [
    { icon: Mail, label: "Email", href: `mailto:${portfolioContent.contact.email}`, color: "from-red-500 to-red-600" },
    { icon: Linkedin, label: "LinkedIn", href: portfolioContent.contact.linkedin, color: "from-blue-500 to-blue-600" },
    { icon: Github, label: "GitHub", href: portfolioContent.contact.github, color: "from-gray-700 to-gray-900" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! This is a demo form.');
  };

  return (
    <section id="contact" className="relative py-12 lg:py-20 px-4 bg-[#ECF0F1] overflow-hidden">
      {/* Large Background Text */}
      <div className="absolute top-10 right-0 text-[15rem] font-black text-white/50 leading-none pointer-events-none select-none">
        CONTACT
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-6 mb-4">
            <span className="text-[#7F8C8D] text-sm font-bold uppercase tracking-[0.3em]">Let's Connect</span>
            <div className="h-px w-24 bg-[#7F8C8D]" />
          </div>
          <h2 className="text-4xl lg:text-8xl font-black text-[#2C3E50] leading-none mb-4 lg:mb-6">
            GET IN<br />TOUCH
          </h2>
          <p className="text-base lg:text-xl text-[#7F8C8D] max-w-2xl font-light">
            Have a project in mind or want to collaborate? Drop me a message!
          </p>
        </motion.div>
        
        {/* Grid Layout - Diagonal Split */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Form (Takes 3 columns) */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl p-5 lg:p-10 shadow-xl border-4 border-[#2C3E50]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2 uppercase tracking-wider">
                      Your Name
                    </label>
                    <Input 
                      placeholder="John Doe" 
                      required 
                      className="border-2 border-[#BDC3C7] focus:border-[#2C3E50] rounded-xl py-6 text-lg"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-bold text-[#2C3E50] mb-2 uppercase tracking-wider">
                      Your Email
                    </label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      className="border-2 border-[#BDC3C7] focus:border-[#2C3E50] rounded-xl py-6 text-lg"
                    />
                  </motion.div>
                </div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-[#2C3E50] mb-2 uppercase tracking-wider">
                    Your Message
                  </label>
                  <Textarea 
                    placeholder="Tell me about your project..." 
                    rows={6} 
                    required 
                    className="border-2 border-[#BDC3C7] focus:border-[#2C3E50] rounded-xl text-lg resize-none"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full bg-[#2C3E50] hover:bg-[#34495E] text-white py-7 text-lg font-bold rounded-xl group"
                  >
                    <Send className="mr-2 w-5 h-5 group-hover:rotate-45 transition-transform" />
                    Send Message
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
          
          {/* Right - Social Links (Takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Social Cards */}
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              
              return (
                <motion.a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, x: -10 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent group-hover:border-[#2C3E50] transition-all duration-300 relative">
                    {/* Available Badge - Only on Email */}
                    {link.label === "Email" && (
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-white rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        Available for Projects
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-[#2C3E50] mb-1">{link.label}</h4>
                        <p className="text-sm text-[#7F8C8D] font-medium">Connect on {link.label}</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-[#7F8C8D] group-hover:text-[#2C3E50] group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-20 w-32 h-32 border-4 border-[#BDC3C7] rounded-full" />
      <motion.div
        className="absolute top-32 right-[30%] w-20 h-20 bg-[#7F8C8D]/20 rounded-lg"
        animate={{ rotate: [0, 180, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}