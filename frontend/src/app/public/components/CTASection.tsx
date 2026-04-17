export const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-[#000066] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
        <p className="text-lg mb-8 opacity-90">Join thousands of learners already transforming their careers with TalentFlow.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-[#000066] px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Get Started
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-[#000066]">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
