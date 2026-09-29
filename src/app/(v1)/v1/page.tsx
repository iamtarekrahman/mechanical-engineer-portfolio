import { ScanLine } from "@/legacy/v1/components/ScanLine";
import { Hero } from "@/legacy/v1/components/Hero";
import { About } from "@/legacy/v1/components/About";
import { Experience } from "@/legacy/v1/components/Experience";
import { FeaturedProject } from "@/legacy/v1/components/FeaturedProject";
import { Certifications } from "@/legacy/v1/components/Certifications";
import { EducationSection } from "@/legacy/v1/components/EducationSection";
import { Skills } from "@/legacy/v1/components/Skills";
import { AffiliationsAwards } from "@/legacy/v1/components/AffiliationsAwards";
import { Contact } from "@/legacy/v1/components/Contact";
import { GearMechanism } from "@/legacy/v1/components/GearMechanism";
import { ChainMechanism } from "@/legacy/v1/components/ChainMechanism";
import { TopNav } from "@/legacy/v1/components/TopNav";

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
