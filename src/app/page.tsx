import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import BlogHighlights from "@/components/home/BlogHighlights";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <BlogHighlights />
      <ContactSection />
    </>
  );
}
