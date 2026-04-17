const testimonials = [
  {
    name: 'Amara Okafor',
    quote:
      'TalentFlow helped me move from self-learning to structured growth. The projects felt practical and the certificate boosted my confidence.',
  },
  {
    name: 'David Mensah',
    quote:
      'The course flow was clear, the assignments were realistic, and I could actually track my progress without guessing what to do next.',
  },
  {
    name: 'Chioma Adebayo',
    quote:
      'I liked how easy it was to learn, ask questions, and stay accountable. It feels like a proper learning environment, not just a video library.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-4xl font-bold">What Learners Say</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-lg bg-white p-8">
              <div className="mb-4 flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">&#9733;</span>
                ))}
              </div>
              <p className="mb-4 text-gray-600">"{testimonial.quote}"</p>
              <p className="font-bold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
