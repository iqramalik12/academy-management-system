import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentsAPI, quizzesAPI, quizResultsAPI, supportTicketsAPI, batchesAPI } from '../../services/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  Users,
  CalendarCheck,
  Award,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, qRes, rRes, tRes, bRes] = await Promise.all([
        studentsAPI.getAll(),
        quizzesAPI.getAll(),
        quizResultsAPI.getAll(),
        supportTicketsAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setStudents(sRes.data);
      setQuizzes(qRes.data);
      setResults(rRes.data);
      setTickets(tRes.data);
      setBatches(bRes.data);
    } catch (err) {
      console.error('Error loading teacher data:', err);
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

  const teacherBatches = batches.filter((b) => b.teacher.toLowerCase().includes('david') || b.teacher.toLowerCase().includes('emily') || b.teacher.toLowerCase().includes(user?.name?.toLowerCase() || ''));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-200 block mb-1">
            Faculty Portal
          </span>
          <h2 className="text-xl font-bold tracking-tight">Welcome, {user?.name}!</h2>
          <p className="text-xs text-indigo-100 mt-1">
            Manage attendance roll calls, construct MCQ assessments, and support your students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/teacher/attendance')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-800 text-xs font-bold shadow-xs hover:bg-indigo-50 transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={students.length}
          subtitle="Enrolled learners"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('/teacher/students')}
        />
        <StatCard
          title="Active Quizzes"
          value={quizzes.length}
          subtitle="Course MCQ tests"
          icon={<Award className="w-5 h-5" />}
          color="purple"
          onClick={() => onNavigate('/teacher/quizzes')}
        />
        <StatCard
          title="Submissions"
          value={results.length}
          subtitle="Completed student tests"
          icon={<BookOpen className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('/teacher/quizzes')}
        />
        <StatCard
          title="Student Inquiries"
          value={tickets.length}
          subtitle="Support queries"
          icon={<MessageSquare className="w-5 h-5" />}
          color="amber"
          onClick={() => onNavigate('/teacher/tickets')}
        />
      </div>

      {/* Teacher Cohorts & Recent Student Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Your Scheduled Batches</h3>
              <p className="text-[11px] text-slate-400 font-medium">Cohorts and lab timings</p>
            </div>
            <button
              onClick={() => onNavigate('/teacher/attendance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Take Roll Call</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b._id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{b.batchName}</h4>
                  <p className="text-[11px] text-indigo-600 font-medium">{b.course}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {b.classTime} | Room: {b.roomNumber}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/teacher/attendance')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Attendance
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Scores */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Test Submissions</h3>
              <p className="text-[11px] text-slate-400 font-medium">Live auto-evaluated student marks</p>
            </div>
            <button
              onClick={() => onNavigate('/teacher/quizzes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>All Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {results.slice(0, 5).map((r) => (
              <div
                key={r._id}
                className="p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{r.studentName}</span>
                  <span className="text-[11px] text-slate-400">{r.quizTitle}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-indigo-600 block">
                    {r.score} / {r.totalQuestions} ({r.percentage}%)
                  </span>
                  <Badge status={r.result} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
