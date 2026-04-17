export const HowItWorks = () => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Sign Up', desc: 'Create your account' },
            { step: '2', title: 'Choose Course', desc: 'Select your learning path' },
            { step: '3', title: 'Learn & Build', desc: 'Complete lessons and projects' },
            { step: '4', title: 'Get Certified', desc: 'Earn your certificate' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-[#000066] text-white rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
