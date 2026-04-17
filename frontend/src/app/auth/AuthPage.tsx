import { ReactNode } from 'react';
import { NavBar } from '@/shared/layouts/PublicLayout';

interface AuthPageProps {
  sectionImage?: string;
  sectionImageAlt?: string;
  children: ReactNode;
}

export const AuthPage = ({
  sectionImage,
  sectionImageAlt = 'Authentication illustration',
  children,
}: AuthPageProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <div className="flex flex-1 flex-col md:flex-row pt-20">
        {sectionImage && (
          <div className="hidden overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 md:flex md:w-1/2 items-center justify-center p-10">
            <img src={sectionImage} alt={sectionImageAlt} className="max-h-full max-w-full object-contain" />
          </div>
        )}

        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen md:min-h-auto">{children}</div>
      </div>
    </div>
  );
};

AuthPage.displayName = 'AuthPage';

export default AuthPage;
