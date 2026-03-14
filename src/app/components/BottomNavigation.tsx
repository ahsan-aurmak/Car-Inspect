import { useNavigate, useLocation } from 'react-router';
import { Home, Plus, History, User } from 'lucide-react';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/inspection-type', icon: Plus, label: 'Inspect' },
    { path: '/reports-history', icon: History, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/inspection-type' && location.pathname.includes('/inspection')) ||
           (path === '/reports-history' && location.pathname.includes('/report/'));
  };

  return (
    <div className="bottom-navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={24} />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}