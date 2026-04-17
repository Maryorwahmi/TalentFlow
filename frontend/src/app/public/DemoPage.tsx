import { Link } from 'react-router-dom';

export const DemoPage = () => {
  const demoVideoUrl = '/demo/talentflow-demo.mp4';
  return (
    <section className="bg-white px-6 py-16 text-[#0D1442]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Product Demo</p>
          <h1 className="mb-5 text-4xl font-bold md:text-5xl">See how TalentFlow works in a real learning workflow</h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
            Watch the real TalentFlow product walkthrough and see learner, instructor, and admin flows in one pass.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="rounded-lg bg-[#0D1442] px-5 py-3 font-semibold text-white">
              Request a Live Demo
            </Link>
            <Link to="/pricing" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-[#0D1442]">
              View Pricing
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <video className="aspect-video w-full rounded-2xl bg-[#0D1442]" controls poster="/images/landing-hero.png">
            <source src={demoVideoUrl} type="video/mp4" />
          </video>
          <p className="mt-4 text-sm text-slate-600">The demo page now points to a real MP4 asset path and is ready for the final exported walkthrough video.</p>
        </div>
      </div>
    </section>
  );
};

export default DemoPage;
