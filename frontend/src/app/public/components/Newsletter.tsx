import { Button } from '@/shared/forms/Button';

export const NewsLetter = () => {
  return (
    <section className="bg-gray-100 py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-600 mb-8">Subscribe to our newsletter for latest courses and updates</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000066]"
          />
          <Button btnText="Subscribe" className="sm:w-auto" />
        </div>
      </div>
    </section>
  );
};

export default NewsLetter;
