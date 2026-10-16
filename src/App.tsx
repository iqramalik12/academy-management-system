import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';

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
    // Role protection: prevent accessing another role's pages
    if (!path.startsWith(`/${user.role}`)) {
      setCurrentPath(`/${user.role}`);
      return;
    }
    setCurrentPath(path);
  };

  const renderCurrentView = () => {
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
        case '/student/ai-support':
          return <StudentAiSupport onNavigateToTickets={() => navigateTo('/student/tickets')} />;
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
      <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
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
