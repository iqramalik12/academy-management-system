import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentsAPI, attendanceAPI } from '../../services/api.ts';
import { StatCard } from '../../components/StatCard.tsx';
import { Badge } from '../../components/Badge.tsx';
import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sRes = await studentsAPI.getAll({ search: user?.email });
      const student = sRes.data.find(
        (s: any) => s.email.toLowerCase() === user?.email.toLowerCase()
      ) || sRes.data[0];

      if (student) {
        const res = await attendanceAPI.getStudentSummary(student._id);
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error loading attendance summary:', err);
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
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Attendance Log</h2>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive breakdown of your class attendance records and percentage.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary?.percentage || 0}%`}
          subtitle="Required: 75% min"
          icon={<CalendarCheck className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title="Total Sessions"
          value={summary?.totalClasses || 0}
          subtitle="Conducted classes"
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Classes Present"
          value={summary?.presentCount || 0}
          subtitle="Attended in person"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Classes Absent"
          value={summary?.absentCount || 0}
          subtitle="Missed roll calls"
          icon={<XCircle className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
          Session Roll Call History
        </div>

        {!summary?.history || summary.history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No attendance records logged yet for this cohort.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Marked By</th>
                  <th className="py-3 px-4 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {summary.history.map((record: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{record.date}</td>
                    <td className="py-3 px-4 text-slate-600">{record.batch}</td>
                    <td className="py-3 px-4 text-slate-500">{record.markedBy || 'Instructor'}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
