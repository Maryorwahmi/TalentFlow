export const PrivacyPolicyPage = () => {
  return (
    <section className="bg-white px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-[#0B1035]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: April 13, 2026</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            This Privacy Policy explains how TalentFlow collects, uses, and protects your information when you use our
            platform.
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>Account information such as name, email, and role.</li>
            <li>Learning activity and platform usage data.</li>
          </ul>

          <h2>2. How We Use Information</h2>
          <ul>
            <li>To provide authentication, course access, and account features.</li>
            <li>To improve the platform and communicate important updates.</li>
          </ul>

          <h2>3. Email</h2>
          <p>
            We may send verification emails, password reset emails, and service notifications. You can contact support
            if you need help managing your account.
          </p>

          <h2>4. Data Security</h2>
          <p>We take reasonable measures to protect your data, but no method of transmission is 100% secure.</p>

          <h2>5. Contact</h2>
          <p>If you have questions about this policy, please reach out via the Contact page.</p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyPage;

