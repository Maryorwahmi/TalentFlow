import { useState } from 'react';
import { X, Shield, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/forms/Button';
import { Input } from '@/shared/forms/Input';
import AuthPage from './AuthPage';
import authService from '@/shared/api/auth.service';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthPage sectionImage="/images/logos/Full Logo Horizontal.svg" sectionImageAlt="Talent Flow logo">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <Shield className="text-emerald-600" size={32} />
            </div>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-2 text-gray-600">
            We've sent a password reset link to <span className="font-semibold text-[#000066]">{email}</span>
          </p>
          <p className="mb-8 text-sm text-gray-500">
            Please check your inbox and follow the link to reset your password. The link expires in 24 hours.
          </p>
          
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-left">
            <p className="text-sm text-[#1e3a8a]">
              💡 <span className="font-medium">Tip:</span> Don't see the email? Check your spam or junk folder.
            </p>
          </div>

          <Button btnText="Back to login" action={() => navigate('/login')} />
          
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="mt-4 text-sm font-medium text-[#08107b] hover:underline"
          >
            Try with a different email
          </button>
        </div>
      </AuthPage>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b-2 border-gray-50 px-6 py-4">
          <div className="rounded-lg bg-yellow-50 p-1.5">
            <Shield className="h-5 w-5 text-yellow-600" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-gray-800">Security</h2>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-[#F1F5F9] p-1 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-6 w-6 text-[#047857]" />
          </button>
        </div>

        <div className="px-8 py-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <span className="text-3xl">🔑</span>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">Forgot Password?</h1>

          <p className="mb-8 px-4 text-base leading-relaxed text-[#475569]">
            No worries, it happens! Enter your email address below and we'll send you a link to reset
            your password.
          </p>

          <form onSubmit={handleSubmit} className="text-left">
            {error ? <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}
            <div className="mb-6">
              <Input
                label="E-mail"
                type="email"
                id="email"
                placeholder="admin@gmail.com"
                value={email}
                action={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" btnText={loading ? 'Sending...' : 'Send Reset Link'} disabled={loading} />
          </form>

          <Link
            to="/login"
            className="mt-4 block text-center font-bold text-indigo-900 hover:underline"
          >
            I remember my password
          </Link>

          <div className="mt-6">
            <Button
              icon={<ArrowLeft size={18} />}
              className="bg-transparent font-bold text-[#64748B] shadow-none hover:bg-transparent"
              btnText="Back to login"
              action={() => window.history.back()}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 px-8 pb-8 pt-6">
          <p className="text-center text-[14px] leading-tight text-[#94A3B8]">
            If you don't see the email in your inbox, please check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
