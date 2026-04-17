import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/shared/api/auth.service';
import { useAuthStore } from '@/shared/state/auth';
import { UserRole } from '@/shared/types';

function parseParams(source: string) {
  const value = source.startsWith('#') ? source.slice(1) : source;
  return new URLSearchParams(value);
}

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = parseParams(window.location.hash || window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (!accessToken || !refreshToken) {
          throw new Error('Missing login tokens from OAuth callback.');
        }

        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessToken', accessToken);

        const user = await authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        const role = user?.role;
        if (role === UserRole.ADMIN) navigate('/admin', { replace: true });
        else if (role === UserRole.INSTRUCTOR) navigate('/instructor', { replace: true });
        else navigate('/learner', { replace: true });
      } catch (e: any) {
        setError(e?.message || 'OAuth login failed.');
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-neutral-900">{error ? 'Login failed' : 'Signing you in...'}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {error ? error : 'Please wait while we complete your authentication.'}
        </p>
        {error ? (
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#000066] px-4 py-2 text-sm font-semibold text-white hover:bg-[#000044]"
          >
            Back to login
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthCallback;

