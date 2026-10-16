import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  CalendarCheck,
  CreditCard,
  HelpCircle,
  Bot,
  MessageSquare,
  Award,
  X,
} from 'lucide-react';

interface NavLinkItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) => {
  const { user } = useAuth();
  if (!user) return null;

  const adminLinks: NavLinkItem[] = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Students', path: '/admin/students', icon: <Users className="w-4 h-4" /> },
    { name: 'Teachers', path: '/admin/teachers', icon: <GraduationCap className="w-4 h-4" /> },
    { name: 'Courses', path: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Batches', path: '/admin/batches', icon: <Layers className="w-4 h-4" /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: 'Fee Management', path: '/admin/fees', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Quiz System', path: '/admin/quizzes', icon: <Award className="w-4 h-4" /> },
    { name: 'Support Tickets', path: '/admin/tickets', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const teacherLinks: NavLinkItem[] = [
    { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Mark Attendance', path: '/teacher/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: 'Quizzes & Results', path: '/teacher/quizzes', icon: <Award className="w-4 h-4" /> },
    { name: 'Assigned Students', path: '/teacher/students', icon: <Users className="w-4 h-4" /> },
    { name: 'Student Queries', path: '/teacher/tickets', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const studentLinks: NavLinkItem[] = [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'My Attendance', path: '/student/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { name: 'Fees & Invoices', path: '/student/fees', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Quizzes & Tests', path: '/student/quizzes', icon: <Award className="w-4 h-4" /> },
    { name: 'AI Student Support', path: '/student/ai-support', icon: <Bot className="w-4 h-4" />, highlight: true },
    { name: 'Support Tickets', path: '/student/tickets', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  let links = adminLinks;
  if (user.role === 'teacher') links = teacherLinks;
  if (user.role === 'student') links = studentLinks;

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-40 w-64 h-full md:h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-3 mb-2 md:hidden border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-2 mb-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Portal
            </p>
            <p className="text-xs font-semibold text-slate-700 capitalize">
              {user.role} Control Panel
            </p>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : link.highlight
                      ? 'text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100/70 font-bold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : link.highlight ? 'text-indigo-600' : 'text-slate-500'}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </div>
                  {link.highlight && !isActive && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-indigo-200 text-indigo-800 rounded-md">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-xl text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-800">System Connected</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              AI Support & Database operational
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
