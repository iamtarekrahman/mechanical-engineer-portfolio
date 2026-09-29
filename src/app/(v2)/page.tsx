import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { FeaturedProject } from "@/components/FeaturedProject";
import { Certifications } from "@/components/Certifications";
import { EducationSection } from "@/components/EducationSection";
import { Skills } from "@/components/Skills";
import { AffiliationsAwards } from "@/components/AffiliationsAwards";
import { Contact } from "@/components/Contact";
import { TopNav } from "@/components/TopNav";
import { EnergyGarden } from "@/components/EnergyGarden";
import { TextHighlighter } from "@/components/TextHighlighter";

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopNav />
      <main id="main">
        <Hero />
        <EnergyGarden />
        <FeaturedProject />
        <Experience />
        <Skills />
        <Certifications />
        <EducationSection />
        <About />
        <AffiliationsAwards />
        <Contact />
      </main>
      <TextHighlighter />
    </>
  );
}
