import { useState } from 'react';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/forms/Button';
import { Input } from '@/shared/forms/Input';
import AuthPage from './AuthPage';
import authService from '@/shared/api/auth.service';

export const SetNewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = new URLSearchParams(location.search).get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password, confirmPassword);
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validation Logic
  const validations = {
    length: password.length >= 8,
    numberOrSymbol: /[0-9!@#$%^&*]/.test(password),
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };

  const strengthScore = Object.values(validations).filter(Boolean).length;
  const strengthText = strengthScore === 3 ? 'Strong' : strengthScore === 2 ? 'Medium' : 'Weak';
  const strengthColor =
    strengthScore === 3 ? 'bg-emerald-500' : strengthScore === 2 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <AuthPage sectionImage="/images/logos/Full Logo Horizontal.svg" sectionImageAlt="Talent Flow logo">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#0A0E27]">Set a New Password</h1>
          <p className="px-4 text-sm leading-relaxed text-gray-400">
            Your new password must be different from previous passwords to ensure maximum security.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-2">
            <Input
              label="New Password"
              type="password"
              value={password}
              id="password"
              placeholder="Enter at least 8 characters"
              action={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Password Strength
              </span>
              <span
                className={`text-xs font-bold ${
                  strengthScore === 3 ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                {strengthText}
              </span>
            </div>

            <div className="mb-4 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-1.5 transition-all duration-500 ${strengthColor}`}
                style={{ width: `${(strengthScore / 3) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {validations.length ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
                <span className="text-xs text-gray-600">At least 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                {validations.mixedCase ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
                <span className="text-xs text-gray-600">Mixed case letters (a-z, A-Z)</span>
              </div>
              <div className="flex items-center space-x-2">
                {validations.numberOrSymbol ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-gray-300" />
                )}
                <span className="text-xs text-gray-600">Number or symbol (!@#$%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              id="confirmPassword"
              placeholder="Re-enter your password"
              action={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" btnText={loading ? 'Updating...' : 'Update Password'} icon={<ShieldCheck size={18} />} disabled={loading} />
        </form>

        {!token ? (
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/forgot-password" className="font-semibold text-[#08107b] hover:underline">
              Request a new reset link
            </Link>
          </p>
        ) : null}
      </div>
    </AuthPage>
  );
};

export default SetNewPassword;
