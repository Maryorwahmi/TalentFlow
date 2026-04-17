import { useMemo, useRef, useState } from 'react';
import { Mail, RotateCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/forms/Button';
import authService from '@/shared/api/auth.service';
import { useAuthStore } from '@/shared/state/auth';
import { UserRole } from '@/shared/types';

export const EmailVerification = ({ email: emailProp = 'your email' }: { email?: string }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  const email = useMemo(() => {
    const state = location.state as any;
    return state?.email || new URLSearchParams(location.search).get('email') || emailProp;
  }, [emailProp, location.search, location.state]);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultDashboardPath = (role?: string) => {
    if (role === UserRole.ADMIN) return '/admin';
    if (role === UserRole.INSTRUCTOR) return '/instructor';
    return '/learner';
  };

  const handleVerifyEmail = async () => {
    const otpCode = otp.join('');
    setError(null);

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setVerifying(true);
    try {
      const response = await authService.verifyEmail(otpCode, email);
      const updatedUser = response?.data?.user;

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      const role = updatedUser?.role || useAuthStore.getState().user?.role;
      navigate(getDefaultDashboardPath(role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setError(null);
    setResending(true);
    try {
      await authService.resendVerificationEmail(email);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleUseDifferentEmail = () => {
    navigate('/signup');
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.trim();
    if (!/^\d$/.test(value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? value : d))]);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative overflow-hidden bg-gray-100 p-4">
      <div className="absolute inset-0 z-0 opacity-40 blur-2xl">
        <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-3xl bg-gray-400 shadow-2xl">
          <img src="/images/email-verification.png" alt="" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[460px] rounded-xl border border-indigo-100 bg-white shadow-2xl">
          <div className="flex h-40 items-center justify-center rounded-t-xl bg-[#F3F4F6]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg">
              <Mail className="text-[#000066]" size={28} />
            </div>
          </div>

          <div className="justify-center px-8 pb-8 pt-10 text-center">
            <h2 className="mb-4 text-2xl font-extrabold text-[#000033]">Check your inbox</h2>
            <p className="mb-8 px-4 text-sm leading-relaxed text-gray-500">
              We've sent a 6-digit verification code to <br />
              <span className="font-bold text-[#000066]">{email}.</span>
              <br />
              Please enter it below to verify your account.
            </p>
            {error ? <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

            <div className="mb-8 flex gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el!)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="h-14 w-12 rounded-xl border-2 border-gray-100 bg-[#F9FAFB] text-center text-xl font-bold transition-all focus:border-[#000066] focus:bg-white focus:outline-none sm:h-16 sm:w-14"
                />
              ))}
            </div>

            <Button action={handleVerifyEmail} btnText={verifying ? 'Verifying...' : 'Verify Email'} className="mb-4" disabled={verifying} />

            <div className="space-y-3">
              <button
                onClick={handleResendCode}
                type="button"
                disabled={resending}
                className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <RotateCw size={16} />
                <span>{resending ? 'Resending...' : 'Resend Code'}</span>
              </button>

              <button
                onClick={handleUseDifferentEmail}
                type="button"
                className="w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Use Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
