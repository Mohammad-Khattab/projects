import Navbar from "@/components/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import AboutSection from "@/components/about/AboutSection";
import ProjectsSection from "@/components/projects/ProjectsSection";
import ContactSection from "@/components/contact/ContactSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function Home() {
  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <ErrorBoundary name="Navbar">       <Navbar />          </ErrorBoundary>
      <ErrorBoundary name="HeroSection">  <HeroSection />     </ErrorBoundary>
      <ErrorBoundary name="AboutSection"> <AboutSection />    </ErrorBoundary>
      <ErrorBoundary name="Projects">     <ProjectsSection /> </ErrorBoundary>
      <ErrorBoundary name="Contact">      <ContactSection />  </ErrorBoundary>
      <ErrorBoundary name="Footer">       <Footer />          </ErrorBoundary>
    </main>
  );
}
