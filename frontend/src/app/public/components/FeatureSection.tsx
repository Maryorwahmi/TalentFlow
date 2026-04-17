import { BadgeCheck, BookOpen, Hammer } from 'lucide-react';

export const FeatureSection = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Why TalentFlow?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Learn from Experts',
              desc: 'Top instructors teaching real-world skills',
              Icon: BookOpen,
            },
            {
              title: 'Get Certified',
              desc: 'Earn recognized certificates on completion',
              Icon: BadgeCheck,
            },
            {
              title: 'Build Projects',
              desc: 'Apply knowledge through hands-on projects',
              Icon: Hammer,
            },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-[#FF7A18] rounded-full mx-auto mb-4 flex items-center justify-center">
                <feature.Icon aria-hidden className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
