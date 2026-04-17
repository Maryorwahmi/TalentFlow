import { HeroSection } from '@/app/public/components/HeroSection';
import { useNavigate } from 'react-router-dom';
import { ContactSection } from '@/app/public/components/ContactSection';
import { NewsLetter } from '@/app/public/components/Newsletter';

export const ContactPage = () => {
  const navigate = useNavigate();
  return (
    <section id="contact">
      <HeroSection
        title="Contact Us"
        highlightedWord="Us"
        description="We'd love to hear from you"
        ctaPrimaryText="Get Started"
        ctaSecondaryText="Watch Demo"
        imageSrc="/images/contact-hero.jpg"
        onPrimaryClick={() => navigate('/signup')}
        onSecondaryClick={() => navigate('/demo')}
      />
      <ContactSection />
      <NewsLetter />
    </section>
  );
};

export default ContactPage;
