import clsx from 'clsx';
import { useState, type ButtonHTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/shared/state/auth';
import { useSearchContext } from '@/shared/state/search';
import { NotificationBell } from '@/shared/components/NotificationBell';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  exact?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

interface ShellProps {
  navSections: NavSection[];
  searchPlaceholder: string;
  primaryAction?: {
    label: string;
    to: string;
  };
  children: ReactNode;
  onSearchChange?: (query: string) => void;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  loading?: boolean;
}

interface LinkButtonProps {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  className?: string;
}

function buttonBase(variant: NonNullable<ButtonProps['variant']>) {
  const styles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#08107b] text-white border-[#08107b] hover:bg-[#060b59] focus-visible:ring-[#08107b]',
    secondary:
      'bg-white text-[#20244f] border-[#aeb3d5] hover:bg-[#f6f7fe] focus-visible:ring-[#6b72af]',
    danger:
      'bg-[#fff2f2] text-[#af2424] border-[#e9b1b1] hover:bg-[#ffe6e6] focus-visible:ring-[#d96d6d]',
    success:
      'bg-[#e7f8eb] text-[#1e7c3b] border-[#9fd7ae] hover:bg-[#d9f2e0] focus-visible:ring-[#4ea96d]',
    ghost:
      'bg-transparent text-[#20244f] border-transparent hover:bg-[#f4f5fb] focus-visible:ring-[#6b72af]',
  };

  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    styles[variant],
  );
}

function TalentFlowMark() {
  return (
    <Link className="inline-flex items-center gap-1.5" to="/">
      <span className="relative block h-3.5 w-3.5">
        <span className="absolute left-0 top-0 h-0 w-0 border-b-[7px] border-l-[4px] border-r-[4px] border-b-[#08107b] border-l-transparent border-r-transparent" />
        <span className="absolute bottom-0 left-[2px] h-[7px] w-[9px] rounded-sm bg-[#f08a2c]" />
      </span>
      <span className="text-[15px] font-bold leading-none text-[#08107b]">
        Talent <span className="text-[#f08a2c]">Flow</span>
      </span>
    </Link>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  const navigate = useNavigate();

  const linkMap: Record<string, string> = {
    // Platform
    'Features': '/how-it-works',
    'How it Works': '/how-it-works',
    'Course Catalog': '/catalog',
    'Certificates': '/learner/certificates',

    // Roles
    'For Learners': '/learner',
    'For Instructors': '/instructor',
    'For Admins': '/admin',

    // Support
    'Help Centre': '/contact',
    'Contact Us': '/contact',
    'FAQs': '/contact',

    // Company
    'About TalentFlow': '/about',
    'Privacy Policy': '/privacy',
    'Terms of Service': '/terms',
  };

  return (
    <div>
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#2f356f]">{title}</h4>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link}>
            <button
              onClick={() => navigate(linkMap[link] || '/')}
              className="text-[10px] text-[#5b618f] hover:text-[#ff7a18] transition-colors cursor-pointer hover:underline"
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TalentFlowShell({ navSections, searchPlaceholder, primaryAction, children, onSearchChange }: ShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { searchQuery, setSearchQuery } = useSearchContext();

  useEffect(() => {
    setAvatarError(false);
  }, [user?.profilePicture]);

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setUserMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#1d2040]">
      <div className="mx-auto flex w-full max-w-[1220px] gap-3 px-3 py-4 md:px-4">
        <aside
          className={clsx(
            'fixed inset-y-4 left-3 z-30 w-[168px] rounded-sm border border-[#dfe2f1] bg-white p-3 shadow-sm md:static md:inset-auto md:shadow-none',
            mobileNavOpen ? 'block' : 'hidden md:block',
          )}
        >
          <TalentFlowMark />

          <nav aria-label="Primary navigation" className="mt-4 space-y-4">
            {navSections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-[#2f356f]">
                  {section.label}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const active = item.exact
                      ? location.pathname === item.to
                      : location.pathname.startsWith(item.to);
                    return (
                      <li key={item.to}>
                        <Link
                          className={clsx(
                            'flex items-center gap-2 rounded-sm px-2 py-1.5 text-[10px] font-medium transition-colors',
                            active
                              ? 'bg-[#ebedf5] text-[#0c1248]'
                              : 'text-[#2f356f] hover:bg-[#f4f5fb]',
                          )}
                          onClick={() => setMobileNavOpen(false)}
                          to={item.to}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {mobileNavOpen && (
          <button
            aria-label="Close navigation menu"
            className="fixed inset-0 z-20 bg-black/25 md:hidden"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
        )}

        <section className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-sm border border-[#dfe2f1] bg-white">
          <header className="flex h-10 items-center justify-between border-b border-[#e6e8f3] bg-[#f8f9fc] px-4">
            <button
              aria-label="Open navigation menu"
              className="inline-flex h-7 items-center rounded-md border border-[#d7dcef] bg-white px-2 text-[10px] text-[#32396f] md:hidden"
              onClick={() => setMobileNavOpen(true)}
              type="button"
            >
              Menu
            </button>

            <div className="hidden md:block" />

            <div className="w-full max-w-[230px] md:mx-auto">
              <div className="flex h-7 items-center gap-2 rounded-md border border-[#daddef] bg-white px-2">
                <svg className="h-3 w-3 text-[#9aa0c2]" fill="none" viewBox="0 0 24 24">
                  <path
                    d="m21 21-4.3-4.3m1.6-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
                <input
                  aria-label={searchPlaceholder}
                  className="w-full border-none bg-transparent p-0 text-[10px] text-[#4b5182] placeholder:text-[#9aa0c2] focus:outline-none focus:ring-0"
                  placeholder={searchPlaceholder}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 relative" ref={userMenuRef}>
              {primaryAction && (
                <Link className={buttonBase('secondary')} to={primaryAction.to}>
                  {primaryAction.label}
                </Link>
              )}
              <NotificationBell />
              
              {/* User Menu */}
              <button
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="Open user menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[#6c7197] transition hover:border-[#d9dced] hover:bg-white"
                title="User menu"
                type="button"
              >
                {user?.profilePicture && !avatarError ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName || 'avatar'}
                    onError={() => setAvatarError(true)}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ff7a18] text-white font-semibold">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-10 z-50 min-w-48 rounded-lg border border-gray-200 bg-white shadow-lg" role="menu">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-gray-50 border-b border-gray-200"
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <Settings size={16} />
                    <span className="text-[12px]">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 text-[12px]"
                    role="menuitem"
                    type="button"
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

          <footer className="border-t border-[#e6e8f3] bg-[#fafbff] px-4 py-5 md:px-8">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
              <div>
                <TalentFlowMark />
                <p className="mt-2 max-w-[190px] text-[10px] text-[#5b618f]">
                  The official learning management platform for TalentFlow innovation internship programme.
                </p>
              </div>
              <FooterColumn links={['Features', 'How it Works', 'Course Catalog', 'Certificates']} title="Platform" />
              <FooterColumn links={['For Learners', 'For Instructors', 'For Admins']} title="Roles" />
              <FooterColumn links={['Features', 'Help Centre', 'Contact Us', 'FAQs']} title="Support" />
              <FooterColumn links={['Features', 'About TalentFlow', 'Privacy Policy', 'Terms of Service']} title="Company" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#eceef7] pt-3 text-[9px] text-[#7f84ad]">
              <p>(c) 2026 TalentFlow Inc. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span>Terms of Service</span>
                <span>Cookie Policy</span>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

export function ActionButton({
  children,
  className,
  loading = false,
  type = 'button',
  variant = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonBase(variant), className)}
      disabled={loading || rest.disabled}
      type={type}
      {...rest}
    >
      {loading && (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  );
}

export function LinkButton({ to, children, variant = 'primary', className }: LinkButtonProps) {
  return (
    <Link className={clsx(buttonBase(variant), className)} to={to}>
      {children}
    </Link>
  );
}

export function PageHeading({
  action,
  subtitle,
  title,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-[30px] md:text-[32px] font-semibold tracking-tight text-[#1d245d] leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[10px] sm:text-[11px] text-[#7a80a9]">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 sm:flex-shrink w-full sm:w-auto">{action}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-md border border-[#e1e4f2] bg-white p-4', className)}>{children}</div>;
}

export function StatCard({
  value,
  title,
  tone = 'default',
}: {
  title: string;
  value: string;
  tone?: 'default' | 'rose' | 'blue' | 'amber';
}) {
  const toneMap: Record<NonNullable<typeof tone>, string> = {
    default: 'bg-white',
    rose: 'bg-[#fff2f4]',
    blue: 'bg-[#eef3ff]',
    amber: 'bg-[#fff4e7]',
  };

  return (
    <Card className={clsx('py-2 sm:py-3', toneMap[tone])}>
      <p className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-[#202663]">{value}</p>
      <p className="text-center text-[9px] sm:text-[10px] text-[#8c91b0] mt-1">{title}</p>
    </Card>
  );
}

export function TabButton({
  active = false,
  children,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={clsx(
        'rounded-md border px-3 sm:px-2.5 py-2 sm:py-1 text-xs sm:text-[10px] font-semibold transition-colors whitespace-nowrap',
        active
          ? 'border-[#09107b] bg-[#09107b] text-white'
          : 'border-[#d7dbef] bg-white text-[#555c88] hover:bg-[#f5f6fd]',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'primary' | 'warning';
}) {
  const tones: Record<NonNullable<typeof tone>, string> = {
    neutral: 'border-[#d6d9ea] bg-white text-[#4d557f]',
    success: 'border-[#9cd4ae] bg-[#e7f8eb] text-[#1f7b3a]',
    primary: 'border-[#8891cf] bg-[#0a1179] text-white',
    warning: 'border-[#e9cda8] bg-[#fff4e7] text-[#a16920]',
  };

  return (
    <span className={clsx('inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold', tones[tone])}>
      {label}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full rounded-full bg-[#e3e6f2]">
        <div className="h-1.5 rounded-full bg-[#2bb08a]" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
      <span className="w-8 text-right text-[10px] font-semibold text-[#5e6491]">{value}%</span>
    </div>
  );
}

export function CircleAvatar({ initials, tone = 'neutral' }: { initials: string; tone?: 'neutral' | 'primary' | 'soft' }) {
  const toneMap: Record<NonNullable<typeof tone>, string> = {
    neutral: 'bg-[#d9dcea] text-[#2f356f]',
    primary: 'bg-[#0a1179] text-white',
    soft: 'bg-[#f0f2fb] text-[#2f356f]',
  };

  return (
    <span
      className={clsx(
        'inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold',
        toneMap[tone],
      )}
    >
      {initials}
    </span>
  );
}

export function NavDot({ active = false }: { active?: boolean }) {
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-[#d0d4e8]">
      <span className={clsx('block h-1.5 w-1.5 rounded-full', active ? 'bg-[#f08a2c]' : 'bg-[#4e5584]')} />
    </span>
  );
}
