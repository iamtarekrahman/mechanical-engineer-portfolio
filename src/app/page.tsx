import { ScanLine } from "@/components/ScanLine";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { FeaturedProject } from "@/components/FeaturedProject";
import { Certifications } from "@/components/Certifications";
import { EducationSection } from "@/components/EducationSection";
import { Skills } from "@/components/Skills";
import { AffiliationsAwards } from "@/components/AffiliationsAwards";
import { Contact } from "@/components/Contact";
import { GearMechanism } from "@/components/GearMechanism";
import { ChainMechanism } from "@/components/ChainMechanism";
import { TopNav } from "@/components/TopNav";

export default function Page() {
  return (
    <>
      <span id="top" className="sr-only" aria-hidden="true" />
      <TopNav />
      <ScanLine />
      <main>
        <GearMechanism />
        <ChainMechanism />
        <Hero />
        <About />
        <Experience />
        <FeaturedProject />
        <Certifications />
        <EducationSection />
        <Skills />
        <AffiliationsAwards />
        <Contact />
      </main>
    </>
  );
}
