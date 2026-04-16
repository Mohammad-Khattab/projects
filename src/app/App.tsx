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