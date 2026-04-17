import { HeroSection } from '@/app/public/components/HeroSection';
import { useNavigate } from 'react-router-dom';
import { HowItWorks } from '@/app/public/components/HowItWorks';
import { FeatureSection } from '@/app/public/components/FeatureSection';
import { ProgrammeRoles } from '@/app/public/components/ProgrammeRoles';
import { CTASection } from '@/app/public/components/CTASection';

export const HowItWorksPage = () => {
  const navigate = useNavigate();
  return (
    <section id="how-it-works">
      <HeroSection
        title="How TalentFlow Works."
        highlightedWord="TalentFlow"
        description="Go from learning to certification in few simple steps"
        ctaPrimaryText="Get Started"
        ctaSecondaryText="Watch Demo"
        imageSrc="/images/howitworks-hero.jpg"
        onPrimaryClick={() => navigate('/signup')}
        onSecondaryClick={() => navigate('/demo')}
      />
      <HowItWorks />
      <FeatureSection />
      <ProgrammeRoles />
      <CTASection />
    </section>
  );
};

export default HowItWorksPage;
