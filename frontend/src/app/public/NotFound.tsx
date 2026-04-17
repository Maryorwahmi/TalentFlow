import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
        <p className="mb-8 text-gray-600">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-[#000066] px-6 py-3 font-semibold text-white hover:bg-[#000044]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
