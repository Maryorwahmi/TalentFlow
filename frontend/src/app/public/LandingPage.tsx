import { HeroSection } from '@/app/public/components/HeroSection';
import { useNavigate } from 'react-router-dom';
import { CourseCatalog } from '@/app/public/components/CourseCatalog';
import { FeatureSection } from '@/app/public/components/FeatureSection';
import { HowItWorks } from '@/app/public/components/HowItWorks';
import { ProgrammeRoles } from '@/app/public/components/ProgrammeRoles';
import { TestimonialsSection } from '@/app/public/components/TestimonialsSection';
import { CTASection } from '@/app/public/components/CTASection';

export const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <HeroSection
        title="Learn. Build. Get Certified."
        highlightedWord="Build."
        description="TalentFlow is your all-in-one learning platform. Access courses, track progress, collaborate with teammates, and earn certificates — all in one place."
        ctaPrimaryText="Get Started"
        ctaSecondaryText="Watch Demo"
        imageSrc="/images/landing-hero.png"
        onPrimaryClick={() => navigate('/signup')}
        onSecondaryClick={() => navigate('/demo')}
      />
      <CourseCatalog />
      <FeatureSection />
      <HowItWorks />
      <ProgrammeRoles />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default LandingPage;
