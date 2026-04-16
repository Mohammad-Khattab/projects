import { motion } from "motion/react";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#2C3E50] text-white py-12 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-64 h-64 border-2 border-white rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 border-2 border-white" />
      </div>

      <div className="relative max-w-[1600px] mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-10 border-b border-white/10">
          {/* Logo */}
          <motion.div
            className="text-4xl font-black flex items-center gap-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
          >
            <span className="tracking-tight">MK</span>
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            <span className="tracking-tight">LL</span>
          </motion.div>

          {/* Quick Links */}
          <motion.nav
            className="flex items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
          >
            {['Home', 'Expertise', 'Projects', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[#BDC3C7] hover:text-white transition-colors uppercase text-sm font-bold tracking-wider relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </motion.nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p
            className="text-[#BDC3C7] text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.2 }}
          >
            © {new Date().getFullYear()} Mohammad Khattab. All rights reserved.
          </motion.p>

          <motion.div
            className="flex items-center gap-2 text-[#BDC3C7] text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3 }}
          >
            <span>Crafted with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.div>
            <span>using React & Tailwind CSS</span>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#7F8C8D]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </footer>
  );
}