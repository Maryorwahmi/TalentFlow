import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/shared/forms/Input';
import { Form } from '@/shared/forms/Form';
import { Button } from '@/shared/forms/Button';
import AuthPage from './AuthPage';
import { useAuthStore } from '@/shared/state/auth';
import { UserRole } from '@/shared/types';
import { API_ORIGIN } from '@/shared/api/config';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const startOAuth = (provider: 'google' | 'apple') => {
    window.location.href = `${API_ORIGIN}/api/v1/auth/oauth/${provider}`;
  };

  const getDefaultDashboardPath = (role?: string) => {
    if (role === UserRole.ADMIN) return '/admin';
    if (role === UserRole.INSTRUCTOR) return '/instructor';
    return '/learner';
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      const state = location.state as any;
      const fromPath = state?.from?.pathname as string | undefined;
      const role = useAuthStore.getState().user?.role;
      const fallbackPath = getDefaultDashboardPath(role);
      navigate(fromPath ?? fallbackPath, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login failed:', err);
    }
  };

  return (
    <AuthPage sectionImage="/images/login-bg.png" sectionImageAlt="Students learning together">
      <Form header="Welcome back" subText="Sign in to continue to TalentFlow" onSubmit={handleUserLogin}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="space-y-1">
          <label className="text-[13px] font-semibold text-[#1d245d]">Email Address</label>
          <Input
            type="email"
            id="email"
            placeholder="Adacc15@gmail.com"
            value={email}
            action={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[13px] font-semibold text-[#1d245d]">Password</label>
          <Input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            action={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <label htmlFor="remember" className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#08107b]"
            />
            <span className="text-xs sm:text-sm text-gray-600">Remember me for 30 days</span>
          </label>
          <Link to="/forgot-password" className="text-xs sm:text-sm font-semibold text-[#08107b] hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          btnText={isLoading ? 'Signing in...' : 'Log in'}
          icon={!isLoading && <ArrowRight size={18} />}
          disabled={isLoading}
        />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-xs whitespace-nowrap text-gray-500">or continue with</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <button
          type="button"
          onClick={() => startOAuth('google')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => startOAuth('apple')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="h-5 w-5 fill-black" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.91 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.48-2.9 3.2l-.35-.28z"/>
            <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#08107b] hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-[#08107b] hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#08107b] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Form>
    </AuthPage>
  );
};
