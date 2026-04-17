import { Link } from 'react-router-dom';

const pricingPlans = [
  {
    name: 'Learner',
    price: 'Free',
    description: 'Start learning, track progress, and earn certificates at your own pace.',
    features: ['Course discovery', 'Progress tracking', 'Certificates on completion', 'Discussion access'],
    ctaLabel: 'Start Learning',
    ctaTo: '/signup',
  },
  {
    name: 'Instructor',
    price: 'Custom',
    description: 'Create, manage, and grow engaging courses for your learners.',
    features: ['Create and publish courses', 'Review submissions', 'Manage learners', 'Course analytics'],
    ctaLabel: 'Talk to Sales',
    ctaTo: '/contact',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Train teams with structured learning paths, analytics, and internal collaboration.',
    features: ['Team allocation', 'Admin analytics', 'Announcements', 'Role-based oversight'],
    ctaLabel: 'Book a Demo',
    ctaTo: '/demo',
  },
];

export const PricingPage = () => {
  return (
    <section className="bg-white px-6 py-16 text-[#0D1442]">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Simple pricing for every stage of growth</h1>
          <p className="text-lg text-slate-600">
            TalentFlow supports individual learners, hands-on instructors, and organizations building structured
            upskilling programs.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">{plan.name}</p>
              <h2 className="mb-4 text-3xl font-bold">{plan.price}</h2>
              <p className="mb-6 min-h-20 text-slate-600">{plan.description}</p>
              <ul className="mb-8 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                to={plan.ctaTo}
                className="inline-flex rounded-lg bg-[#0D1442] px-5 py-3 font-semibold text-white transition hover:bg-[#17205f]"
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
