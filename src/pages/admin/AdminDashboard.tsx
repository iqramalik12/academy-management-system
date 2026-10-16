import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Award,
  DollarSign,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Clock,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
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

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Academy Overview & Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time synchronization across enrolled students, courses, fees, and support.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/students')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/tickets')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Support Tickets ({stats?.openTickets || 0})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled active learners"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('/admin/students')}
        />
        <StatCard
          title="Total Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Certified academy faculty"
          icon={<GraduationCap className="w-5 h-5" />}
          color="purple"
          onClick={() => onNavigate('/admin/teachers')}
        />
        <StatCard
          title="Pending Fees"
          value={`$${stats?.pendingFees?.toLocaleString() || 0}`}
          subtitle="Outstanding student balance"
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
          onClick={() => onNavigate('/admin/fees')}
        />
        <StatCard
          title="Open Tickets"
          value={stats?.openTickets || 0}
          subtitle="Requires staff attention"
          icon={<MessageSquare className="w-5 h-5" />}
          color="rose"
          onClick={() => onNavigate('/admin/tickets')}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Courses Offered"
          value={stats?.totalCourses || 0}
          subtitle="Active curriculum pathways"
          icon={<BookOpen className="w-5 h-5" />}
          color="indigo"
          onClick={() => onNavigate('/admin/courses')}
        />
        <StatCard
          title="Class Batches"
          value={stats?.totalBatches || 0}
          subtitle="Scheduled cohorts"
          icon={<Layers className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('/admin/batches')}
        />
        <StatCard
          title="MCQ Quizzes"
          value={stats?.totalQuizzes || 0}
          subtitle="Assessment modules"
          icon={<Award className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('/admin/quizzes')}
        />
      </div>

      {/* Recent Students & Recent Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Enrollments</h3>
              <p className="text-[11px] text-slate-400 font-medium">Latest admitted academy students</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Course</th>
                  <th className="pb-2 text-right">Fee Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recentStudents?.map((s: any) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-medium text-slate-800">
                      <div>{s.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.batch}</div>
                    </td>
                    <td className="py-2.5 text-slate-600 truncate max-w-[150px]">{s.course}</td>
                    <td className="py-2.5 text-right font-semibold">
                      {s.remainingFee > 0 ? (
                        <span className="text-amber-600">${s.remainingFee}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
              <p className="text-[11px] text-slate-400 font-medium">Verified fee submissions</p>
            </div>
            <button
              onClick={() => onNavigate('/admin/fees')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Fees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.recentPayments?.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-medium text-slate-800">{p.studentName}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{p.paymentDate}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      +${p.paymentAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
