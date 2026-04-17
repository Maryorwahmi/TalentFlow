const faqs = [
  {
    question: 'Who can use TalentFlow?',
    answer:
      'TalentFlow is built for learners taking courses, instructors managing teaching content, and admins coordinating teams, reporting, and platform oversight.',
  },
  {
    question: 'Do learners receive certificates?',
    answer:
      'Yes. When a learner completes a certificate-enabled course and reaches the required progress threshold, TalentFlow issues a completion certificate.',
  },
  {
    question: 'Can instructors create and manage their own courses?',
    answer:
      'Yes. Instructors can create courses, organize modules and lessons, review submissions, and track learner performance from their dashboard.',
  },
  {
    question: 'Does TalentFlow support team learning?',
    answer:
      'Yes. Admins can allocate learners to teams, coordinate collaboration, share announcements, and monitor engagement across the platform.',
  },
  {
    question: 'How do I request a demo?',
    answer:
      'Use the contact page or the demo page to request a walkthrough. We can tailor the demo around learner, instructor, or enterprise workflows.',
  },
];

export const FAQPage = () => {
  return (
    <section className="bg-slate-50 px-6 py-16 text-[#0D1442]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Frequently asked questions</h1>
          <p className="text-lg text-slate-600">
            Everything you need to know about getting started with TalentFlow.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">{faq.question}</h2>
              <p className="leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQPage;
