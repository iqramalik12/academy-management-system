import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentsAPI, attendanceAPI, feesAPI, quizzesAPI, quizResultsAPI, supportTicketsAPI } from '../../services/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  CalendarCheck,
  CreditCard,
  Award,
  Bot,
  HelpCircle,
  User,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [attendance, setAttendance] = useState<any | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      // Find current student by user email
      const sRes = await studentsAPI.getAll({ search: user?.email });
      const currentStudent = sRes.data.find(
        (s: any) => s.email.toLowerCase() === user?.email.toLowerCase()
      ) || sRes.data[0];

      setStudent(currentStudent);

      if (currentStudent) {
        const [aRes, qRes, rRes, tRes] = await Promise.all([
          attendanceAPI.getStudentSummary(currentStudent._id),
          quizzesAPI.getAll({ course: currentStudent.course }),
          quizResultsAPI.getByStudent(currentStudent._id),
          supportTicketsAPI.getAll(),
        ]);
        setAttendance(aRes.data);
        setQuizzes(qRes.data);
        setResults(rRes.data);
        setTickets(tRes.data);
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedQuizIds = new Set(results.map((r) => r.quizId));
  const pendingQuizzesCount = quizzes.filter((q) => !completedQuizIds.has(q._id)).length;
  const recentResult = results.length > 0 ? results[0] : null;

  return (
    <div className="space-y-6">
      {/* Student Welcome Hero with AI Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-200 block mb-1">
            Student Portal
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Hello, {student?.studentName || user?.name}!
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            Enrolled in <span className="font-bold underline">{student?.course}</span> ({student?.batch})
          </p>
        </div>

        <button
          onClick={() => onNavigate('/student/ai-support')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-800 text-xs font-bold shadow-xs hover:bg-indigo-50 transition-all transform hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>Ask Student AI Assistant</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendance?.percentage ?? 100}%`}
          subtitle={`${attendance?.presentCount || 0} Present / ${attendance?.totalClasses || 0} Classes`}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('/student/attendance')}
        />
        <StatCard
          title="Remaining Fee"
          value={`$${student?.remainingFee ?? 0}`}
          subtitle={`Paid $${student?.paidFee || 0} of $${student?.totalFee || 0}`}
          icon={<CreditCard className="w-5 h-5" />}
          color={student?.remainingFee > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('/student/fees')}
        />
        <StatCard
          title="Available Tests"
          value={pendingQuizzesCount}
          subtitle={`${results.length} completed`}
          icon={<Award className="w-5 h-5" />}
          color="purple"
          onClick={() => onNavigate('/student/quizzes')}
        />
        <StatCard
          title="My Tickets"
          value={tickets.length}
          subtitle="Support inquiries"
          icon={<HelpCircle className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('/student/tickets')}
        />
      </div>

      {/* 6 Quick Action Navigation Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Access Services
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('/student/attendance')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-center group"
          >
            <CalendarCheck className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Attendance</span>
            <span className="text-[10px] text-slate-400">Class history</span>
          </button>

          <button
            onClick={() => onNavigate('/student/fees')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-center group"
          >
            <CreditCard className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Fees Status</span>
            <span className="text-[10px] text-slate-400">Paid & balance</span>
          </button>

          <button
            onClick={() => onNavigate('/student/quizzes')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-center group"
          >
            <Award className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Quizzes</span>
            <span className="text-[10px] text-slate-400">Attempt MCQs</span>
          </button>

          <button
            onClick={() => onNavigate('/student/ai-support')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 transition-all text-center group"
          >
            <Bot className="w-5 h-5 text-indigo-700 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-indigo-900">AI Support</span>
            <span className="text-[10px] text-indigo-500 font-semibold">24/7 Chatbot</span>
          </button>

          <button
            onClick={() => onNavigate('/student/tickets')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-700 transition-all text-center group"
          >
            <HelpCircle className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Support</span>
            <span className="text-[10px] text-slate-400">Help tickets</span>
          </button>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-center">
            <User className="w-5 h-5 text-slate-500 mb-1.5" />
            <span className="text-xs font-bold text-slate-800">Student ID</span>
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
              {student?._id || 'STD-01'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Quiz Performance & AI Assistant Prompt Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Latest Quiz Result</h3>
              <p className="text-[11px] text-slate-400 font-medium">Automatic grade score</p>
            </div>
            <button
              onClick={() => onNavigate('/student/quizzes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentResult ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{recentResult.quizTitle}</span>
                <Badge status={recentResult.result} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Correct Answers:</span>
                <span className="font-bold text-slate-800">
                  {recentResult.score} / {recentResult.totalQuestions} ({recentResult.percentage}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Submitted On:</span>
                <span className="text-slate-400">
                  {new Date(recentResult.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No quizzes attempted yet. Check out available tests!
            </div>
          )}
        </div>

        {/* AI Support Teaser */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl border border-indigo-100/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-800 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold">Student AI Academic Assistant</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Need immediate answers about your tuition balance, class schedule, quiz scores, or attendance records? Your academy AI is ready.
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-white border border-indigo-100/60 text-slate-700 font-medium">
                💬 "What is my remaining fee balance?"
              </div>
              <div className="p-2 rounded-lg bg-white border border-indigo-100/60 text-slate-700 font-medium">
                💬 "What is my attendance rate this month?"
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={() => onNavigate('/student/ai-support')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch AI Support Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
