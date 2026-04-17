import { useState } from 'react';
import { Button } from '@/shared/forms/Button';
import { API_BASE_URL } from '@/shared/api/config';

export const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        setSending(true);
        setStatus(null);

        const resp = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!resp.ok) throw new Error('Failed to send message');

        setStatus('Message sent - thanks!');
        setFormData({ name: '', email: '', message: '' });
      } catch (err) {
        console.error(err);
        setStatus('Failed to send message - please try again later.');
      } finally {
        setSending(false);
      }
    })();
  };

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status ? <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">{status}</div> : null}

          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#000066]"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#000066]"
            required
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#000066]"
            required
          />
          <Button type="submit" btnText={sending ? 'Sending...' : 'Send Message'} disabled={sending} />
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
