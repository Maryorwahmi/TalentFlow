import { Link } from 'react-router-dom';

const audienceCards = [
  { role: 'Learners', desc: 'Upskill and earn certificates', to: '/catalog' },
  { role: 'Instructors', desc: 'Teach and build your courses', to: '/how-it-works' },
  { role: 'Enterprises', desc: 'Train your workforce', to: '/demo' },
];

export const ProgrammeRoles = () => {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-4xl font-bold">For Everyone</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {audienceCards.map((item) => (
            <div key={item.role} className="rounded-lg bg-gray-50 p-8">
              <h3 className="mb-4 text-2xl font-bold">{item.role}</h3>
              <p className="mb-6 text-gray-600">{item.desc}</p>
              <Link to={item.to} className="inline-flex rounded-lg bg-[#000066] px-4 py-2 text-white hover:bg-[#000044]">
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgrammeRoles;
