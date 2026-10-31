import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { GraduationCap, LogOut, Menu, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenProfile }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'student':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-500 rounded-lg md:hidden hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Academy OS
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Management & AI Support</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {user && (
          <button
            onClick={onOpenProfile}
            title="My Profile"
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 leading-none">{user.name}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal truncate max-w-[140px] block">
                {user.email}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
