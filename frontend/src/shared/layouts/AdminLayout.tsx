import { Outlet } from 'react-router-dom';
import { NavDot, TalentFlowShell, type NavSection } from '@/shared/ui/talentFlow';
import { SearchProvider, useSearchContext } from '@/shared/state/search';

const adminNavSections: NavSection[] = [
  {
    label: 'Manage',
    items: [
      { label: 'Dashboard', to: '/admin', icon: <NavDot />, exact: true },
      { label: 'Users', to: '/admin/users', icon: <NavDot /> },
      { label: 'Courses', to: '/admin/courses', icon: <NavDot /> },
      { label: 'Team Allocation', to: '/admin/team-allocation', icon: <NavDot /> },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Notifications', to: '/admin/notifications', icon: <NavDot /> },
      { label: 'Analytics', to: '/admin/analytics', icon: <NavDot /> },
      { label: 'Announcement', to: '/admin/announcements', icon: <NavDot /> },
      { label: 'Settings', to: '/admin/settings', icon: <NavDot /> },
      { label: 'Profile', to: '/admin/profile', icon: <NavDot /> },
    ],
  },
];

function AdminLayoutContent() {
  const { setSearchQuery } = useSearchContext();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <TalentFlowShell 
      navSections={adminNavSections} 
      searchPlaceholder="Search users, teams, courses..."
      onSearchChange={handleSearchChange}
    >
      <Outlet />
    </TalentFlowShell>
  );
}

export function AdminLayout() {
  return (
    <SearchProvider>
      <AdminLayoutContent />
    </SearchProvider>
  );
}

export default AdminLayout;
