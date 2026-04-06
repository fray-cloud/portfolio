import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import JustFunSection from "@/components/home/JustFunSection";
import BlogHighlights from "@/components/home/BlogHighlights";
import ContactSection from "@/components/home/ContactSection";

function SectionBg({
  alt,
  children,
}: {
  alt?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={alt ? { background: "var(--section-alt)" } : undefined}>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <SectionBg>
        <AboutSection />
      </SectionBg>
      <SectionBg alt>
        <ExperienceSection />
      </SectionBg>
      <SectionBg>
        <ProjectsSection />
      </SectionBg>
      <SectionBg alt>
        <JustFunSection />
      </SectionBg>
      <SectionBg>
        <BlogHighlights />
      </SectionBg>
      <SectionBg alt>
        <ContactSection />
      </SectionBg>
    </>
  );
}
