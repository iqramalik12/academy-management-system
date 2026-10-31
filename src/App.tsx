import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { Bot, X } from 'lucide-react';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { StudentsManagement } from './pages/admin/StudentsManagement.tsx';
import { TeachersManagement } from './pages/admin/TeachersManagement.tsx';
import { CoursesManagement } from './pages/admin/CoursesManagement.tsx';
import { BatchesManagement } from './pages/admin/BatchesManagement.tsx';
import { AttendanceManagement } from './pages/admin/AttendanceManagement.tsx';
import { FeeManagement } from './pages/admin/FeeManagement.tsx';
import { QuizManagement } from './pages/admin/QuizManagement.tsx';
import { SupportTicketsManagement } from './pages/admin/SupportTicketsManagement.tsx';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard.tsx';
import { TeacherAttendance } from './pages/teacher/TeacherAttendance.tsx';
import { TeacherQuizzes } from './pages/teacher/TeacherQuizzes.tsx';
import { TeacherStudents } from './pages/teacher/TeacherStudents.tsx';
import { TeacherSupportTickets } from './pages/teacher/TeacherSupportTickets.tsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { StudentAttendance } from './pages/student/StudentAttendance.tsx';
import { StudentFees } from './pages/student/StudentFees.tsx';
import { StudentQuizzes } from './pages/student/StudentQuizzes.tsx';
import { StudentAiSupport } from './pages/student/StudentAiSupport.tsx';
import { StudentSupportTickets } from './pages/student/StudentSupportTickets.tsx';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Sync role-based default path
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultRolePath = `/${user.role}`;
      // Verify if currentPath matches role
      if (!currentPath || !currentPath.startsWith(`/${user.role}`)) {
        setCurrentPath(defaultRolePath);
      }
    }
  }, [isAuthenticated, user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const navigateTo = (path: string) => {
    // AI support lives in the floating widget, not a page
    if (path === '/student/ai-support') {
      setIsChatOpen(true);
      return;
    }
    // Role protection: prevent accessing another role's pages
    if (!path.startsWith(`/${user.role}`)) {
      setCurrentPath(`/${user.role}`);
      return;
    }
    setCurrentPath(path);
  };

  const renderCurrentView = () => {
    if (currentPath === `/${user.role}/profile`) {
      return <ProfilePage />;
    }

    // Admin Views
    if (user.role === 'admin') {
      switch (currentPath) {
        case '/admin/students':
          return <StudentsManagement />;
        case '/admin/teachers':
          return <TeachersManagement />;
        case '/admin/courses':
          return <CoursesManagement />;
        case '/admin/batches':
          return <BatchesManagement />;
        case '/admin/attendance':
          return <AttendanceManagement />;
        case '/admin/fees':
          return <FeeManagement />;
        case '/admin/quizzes':
          return <QuizManagement />;
        case '/admin/tickets':
          return <SupportTicketsManagement />;
        case '/admin':
        default:
          return <AdminDashboard onNavigate={navigateTo} />;
      }
    }

    // Teacher Views
    if (user.role === 'teacher') {
      switch (currentPath) {
        case '/teacher/attendance':
          return <TeacherAttendance />;
        case '/teacher/quizzes':
          return <TeacherQuizzes />;
        case '/teacher/students':
          return <TeacherStudents />;
        case '/teacher/tickets':
          return <TeacherSupportTickets />;
        case '/teacher':
        default:
          return <TeacherDashboard onNavigate={navigateTo} />;
      }
    }

    // Student Views
    if (user.role === 'student') {
      switch (currentPath) {
        case '/student/attendance':
          return <StudentAttendance />;
        case '/student/fees':
          return <StudentFees />;
        case '/student/quizzes':
          return <StudentQuizzes />;
        case '/student/tickets':
          return <StudentSupportTickets />;
        case '/student':
        default:
          return <StudentDashboard onNavigate={navigateTo} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenProfile={() => navigateTo(`/${user.role}/profile`)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath={currentPath}
          onNavigate={navigateTo}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>
      </div>

      {user.role === 'student' && (
        <>
          {/* Kept mounted while closed so the conversation survives toggling */}
          <div
            className={`fixed z-50 bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[min(560px,calc(100vh-8rem))] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden ${
              isChatOpen ? '' : 'hidden'
            }`}
          >
            <StudentAiSupport
              onClose={() => setIsChatOpen(false)}
              onNavigateToTickets={() => {
                setIsChatOpen(false);
                navigateTo('/student/tickets');
              }}
            />
          </div>
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className="fixed z-50 bottom-6 right-4 md:right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
            title="AI Student Support"
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </button>
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
