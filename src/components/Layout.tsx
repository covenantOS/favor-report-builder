import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  LayoutDashboard, Share2, Mail, Newspaper, Heart,
  GitCompare, Shield, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/social', label: 'Social Media', icon: Share2 },
  { to: '/mail', label: 'Direct Mail', icon: Mail },
  { to: '/email', label: 'Newsletters', icon: Newspaper },
  { to: '/thankyou', label: 'Thank You', icon: Heart },
  { to: '/compare', label: 'Compare', icon: GitCompare },
];

const ADMIN_ITEMS = [
  { to: '/admin', label: 'Admin', icon: Shield },
];

export function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLink = (item: { to: string; label: string; icon: React.ComponentType<{ size?: number }> }) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`
      }
    >
      <item.icon size={18} />
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary flex flex-col transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <div>
            <div className="text-white font-semibold text-sm">Favor International</div>
            <div className="text-white/50 text-xs">Report Dashboard</div>
          </div>
          <button className="lg:hidden ml-auto text-white/70" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(navLink)}
          {user?.role === 'admin' && (
            <>
              <div className="border-t border-white/10 my-3" />
              {ADMIN_ITEMS.map(navLink)}
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name || user?.username}</div>
              <div className="text-white/50 text-xs capitalize">{user?.role}</div>
            </div>
            <button onClick={logout} className="text-white/50 hover:text-white" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="ml-3 font-semibold text-gray-800">Favor Reports</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
