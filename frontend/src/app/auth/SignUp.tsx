import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/shared/forms/Input';
import { Form } from '@/shared/forms/Form';
import { Button } from '@/shared/forms/Button';
import AuthPage from './AuthPage';
import { useAuthStore } from '@/shared/state/auth';
import { API_ORIGIN } from '@/shared/api/config';

export const SignUp = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const userTypes = ['Learner', 'Instructor', 'Admin'];
  const disciplines = ['UI/UX Design', 'Data Science', 'Backend Development', 'Project Management', 'Graphics Design', 'Frontend Development', 'Marketing', 'Product Management', 'Other'];

  const startOAuth = (provider: 'google' | 'apple') => {
    window.location.href = `${API_ORIGIN}/api/v1/auth/oauth/${provider}`;
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [learnerType, setLearnerType] = useState(userTypes[0]);
  const [discipline, setDiscipline] = useState(disciplines[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const roleMap: { [key: string]: string } = {
        'Learner': 'learner',
        'Instructor': 'instructor',
        'Admin': 'admin'
      };

      await signup({
        firstName,
        lastName,
        email,
        password,
        role: roleMap[learnerType] || 'learner'
      });

      // Navigate to email verification
      navigate('/email-verification', { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <AuthPage sectionImage="/images/signup-bg.png" sectionImageAlt="Laptop with earbuds">
      <Form header="Create your account" subText="Start your learning journey today" onSubmit={handleSubmit}>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            id="firstName"
            placeholder="Ada"
            inputLength={40}
            action={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            type="text"
            value={lastName}
            id="lastName"
            placeholder="Okonkwo"
            inputLength={40}
            action={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          id="email"
          placeholder="you@example.com"
          action={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative flex-1 space-y-2">
            <label htmlFor="learner_type" className="mb-2 block text-sm font-semibold text-navy-900">
              I am a
            </label>
            <select
              id="learner_type"
              value={learnerType}
              onChange={(e) => setLearnerType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 pr-8 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              {userTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-[2.5rem] h-5 w-5 text-[#000066]" />
          </div>

          <div className="relative flex-1 space-y-2">
            <label htmlFor="discipline" className="mb-2 block text-sm font-semibold text-navy-900">
              Discipline / Field
            </label>
            <select
              id="discipline"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 pr-8 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            >
              {disciplines.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-[2.5rem] h-5 w-5 text-[#000066]" />
          </div>
        </div>

        <Input
          label="Password"
          type="password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          value={password}
          id="password"
          placeholder="••••••••"
          action={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
          value={confirmPassword}
          id="confirmPassword"
          placeholder="••••••••"
          action={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <label htmlFor="terms" className="flex items-start space-x-2 sm:space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 flex-shrink-0"
          />
          <span className="text-xs sm:text-sm text-gray-600">
            I agree to the{' '}
            <Link to="/terms" className="font-semibold text-[#000066] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-semibold text-[#000066] hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button type="submit" btnText={isLoading ? 'Creating Account...' : 'Create Account'} disabled={isLoading} />

        <div className="flex items-center gap-2">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-xs text-gray-500">or continue with</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <button
          type="button"
          onClick={() => startOAuth('google')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => startOAuth('apple')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="h-5 w-5 fill-black" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.91 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.48-2.9 3.2l-.35-.28z" />
            <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#000066] hover:underline">
            Sign in
          </Link>
        </p>
      </Form>
    </AuthPage>
  );
};

export default SignUp;
