import React, { useState, useEffect } from 'react';
import { batchesAPI, studentsAPI, attendanceAPI } from '../../services/api.ts';
import { Badge } from '../../components/Badge.tsx';
import { CalendarCheck, CheckCircle2, XCircle, Search, AlertCircle, Save } from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [pastRecords, setPastRecords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    initBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadBatchStudentsAndHistory();
    }
  }, [selectedBatch, selectedDate]);

  const initBatches = async () => {
    try {
      setLoading(true);
      const res = await batchesAPI.getAll();
      setBatches(res.data);
      if (res.data.length > 0) {
        setSelectedBatch(res.data[0].batchName);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBatchStudentsAndHistory = async () => {
    try {
      setLoading(true);
      setNotification(null);
      const [sRes, aRes] = await Promise.all([
        studentsAPI.getAll({ batch: selectedBatch }),
        attendanceAPI.get({ batch: selectedBatch }),
      ]);
      setStudents(sRes.data);
      setPastRecords(aRes.data);

      // Check if attendance already exists for this batch and date
      const existing = aRes.data.find(
        (a: any) => a.batch === selectedBatch && a.date === selectedDate
      );

      const initialMap: Record<string, 'Present' | 'Absent'> = {};
      if (existing) {
        existing.records.forEach((r: any) => {
          initialMap[r.studentId] = r.status;
        });
        setNotification({
          type: 'success',
          message: `Attendance for date ${selectedDate} is already recorded. You can review or edit if necessary.`,
        });
      } else {
        // Default everyone to 'Present' for convenience
        sRes.data.forEach((s: any) => {
          initialMap[s._id] = 'Present';
        });
      }
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const markAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent'> = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      setNotification({ type: 'error', message: 'No students enrolled in this batch to mark.' });
      return;
    }

    try {
      setSaving(true);
      setNotification(null);
      const records = students.map((s) => ({
        studentId: s._id,
        studentName: s.studentName,
        status: attendanceMap[s._id] || 'Present',
      }));

      await attendanceAPI.mark({
        batch: selectedBatch,
        date: selectedDate,
        records,
      });

      setNotification({
        type: 'success',
        message: `Attendance successfully saved for ${selectedBatch} on ${selectedDate}!`,
      });
      loadBatchStudentsAndHistory();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit attendance.',
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((v) => v === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === 'Absent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Attendance Tracker</h2>
          <p className="text-xs text-slate-500 font-medium">
            Take roll call, prevent duplicate records, and track daily attendance rates.
          </p>
        </div>
      </div>

      {/* Filter and Control Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white min-w-[220px]"
            >
              {batches.map((b) => (
                <option key={b._id} value={b.batchName}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('Absent')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold text-slate-800">
            Batch Roster ({students.length} Enrolled)
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-emerald-600">Present: {presentCount}</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-rose-600">Absent: {absentCount}</span>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students are currently enrolled in {selectedBatch}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Toggle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {students.map((student, idx) => {
                  const status = attendanceMap[student._id] || 'Present';
                  const isPresent = status === 'Present';
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.studentName}</td>
                      <td className="py-3 px-4 text-slate-500">{student.email}</td>
                      <td className="py-3 px-4">
                        <Badge status={status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleStatus(student._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
