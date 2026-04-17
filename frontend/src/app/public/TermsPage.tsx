export const TermsPage = () => {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-[#0B1035]">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: April 13, 2026</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            These Terms of Service govern your access to and use of TalentFlow. By creating an account or using the
            platform, you agree to these terms.
          </p>

          <h2>1. Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You agree to provide accurate information during registration.</li>
          </ul>

          <h2>2. Acceptable Use</h2>
          <ul>
            <li>Do not misuse the platform, attempt unauthorized access, or disrupt services.</li>
            <li>Do not upload illegal content or infringe intellectual property rights.</li>
          </ul>

          <h2>3. Content and Courses</h2>
          <p>
            Course content may be provided by TalentFlow or instructors. You may not copy, resell, or redistribute
            content without permission.
          </p>

          <h2>4. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms or applicable laws.</p>

          <h2>5. Contact</h2>
          <p>If you have questions about these terms, please contact us via the Contact page.</p>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;

