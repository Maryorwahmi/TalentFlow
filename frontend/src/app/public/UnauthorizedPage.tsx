import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-14">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-gray-500">403</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to access this page. If you think this is a mistake, sign in with the correct
          account.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="rounded-md bg-[#07107b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#050c5e]"
          >
            Go to login
          </Link>
          <Link
            to="/"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;

