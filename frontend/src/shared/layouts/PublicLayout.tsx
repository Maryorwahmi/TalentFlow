import { ReactNode } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/shared/state/auth';
import { NotificationBell } from '@/shared/components/NotificationBell';
import { SearchProvider } from '@/shared/state/search';

export const NavBar = () => {
  const navItems = useMemo(
    () => [
      { name: 'Home', path: '/' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    []
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [avatarError, setAvatarError] = useState(false);
  const isHome = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(!isHome);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Reset avatar error when user updates profilePicture so new images can load
  useEffect(() => {
    setAvatarError(false);
  }, [user?.profilePicture]);

  useEffect(() => {
    setIsScrolled(!isHome);

    if (!isHome) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsProfileOpen(false);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'instructor':
        return '/instructor';
      case 'learner':
      default:
        return '/learner';
    }
  };

  return (
    <header
      className={cn(
        'fixed left-0 top-0 z-40 flex w-full items-center justify-between border-b border-gray-300 px-4 sm:px-6 md:px-8 transition-all duration-300',
        isScrolled ? 'bg-[#EAEAEA] py-3 shadow-md' : 'bg-[#EAEAEA] py-4 shadow-sm'
      )}
    >
      <div className="flex flex-1 justify-start">
        <Link to="/" className="z-50 shrink-0">
          <picture>
            {/* Always use the colored brand logo */}
            <source srcSet="/images/logos/full-logo-horizontal.svg" type="image/svg+xml" />
            <img src="/images/logos/full-logo-horizontal.png" alt="TalentFlow logo" className="h-8 md:h-10 object-contain" />
          </picture>
        </Link>
      </div>

      <nav className="hidden items-center justify-center gap-12 font-medium text-neutral-800 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              'transition-colors duration-200 hover:text-[#FF7A18]',
              location.pathname === item.path && 'text-[#FF7A18]'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 relative">
        {isAuthenticated && user ? (
          <>
            {/* Dashboard Link */}
            <Link 
              to={getDashboardPath()} 
              className="hidden font-semibold text-[#000066] hover:text-[#FF7A18] transition-colors md:block"
            >
              Dashboard
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Menu */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white transition-colors"
              title="User menu"
            >
              {user.profilePicture && !avatarError ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName || 'avatar'}
                  onError={() => setAvatarError(true)}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#FF7A18] flex items-center justify-center text-white font-semibold">
                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="hidden text-[#000066] font-medium md:inline">{user.firstName}</span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-16 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-48">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-50 md:hidden"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-50"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <User size={18} />
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-200 disabled:opacity-50"
                >
                  <LogOut size={18} />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="hidden font-semibold text-[#000066] hover:underline md:block">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-[#FF7A18] px-5 py-2 font-semibold text-white transition hover:bg-[#E66C0B]"
            >
              Sign up
            </Link>
          </>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-neutral-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-16 w-full bg-white shadow-lg md:hidden">
          <nav className="flex flex-col gap-4 p-0">
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                {user.profilePicture && !avatarError ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName || 'avatar'}
                    onError={() => setAvatarError(true)}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#FF7A18] flex items-center justify-center text-white font-semibold">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                <div className="flex-1 pr-4">
                  <div className="font-semibold text-gray-800 truncate">{user.firstName} {user.lastName}</div>
                  {user.email && <div className="text-sm text-gray-500 truncate">{user.email}</div>}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 p-4">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} className="text-gray-800 hover:text-[#FF7A18]" onClick={() => setIsOpen(false)}>
                  {item.name}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  <hr className="my-2" />
                  <Link to={getDashboardPath()} className="text-gray-800 hover:text-[#FF7A18]" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/settings" className="text-gray-800 hover:text-[#FF7A18]" onClick={() => setIsOpen(false)}>
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-left text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link to="/login" className="font-semibold text-[#000066] hover:text-[#FF7A18]" onClick={() => setIsOpen(false)}>
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-[#FF7A18] px-4 py-2 font-semibold text-white text-center transition hover:bg-[#E66C0B]"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold text-gray-800">About</h3>
            <p className="text-sm text-gray-600">TalentFlow is your learning platform for skills and certificates.</p>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-gray-800">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/catalog" className="hover:text-[#FF7A18]">Courses</Link></li>
              <li><Link to="/pricing" className="hover:text-[#FF7A18]">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-[#FF7A18]">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-gray-800">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-[#FF7A18]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF7A18]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold text-gray-800">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/privacy" className="hover:text-[#FF7A18]">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-[#FF7A18]">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2026 TalentFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <SearchProvider>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </div>
    </SearchProvider>
  );
};
