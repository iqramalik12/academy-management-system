import React, { useState, useEffect } from 'react';
import { studentsAPI, coursesAPI, batchesAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const StudentsManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    gender: 'Male',
    address: '',
    course: '',
    batch: '',
    admissionDate: new Date().toISOString().split('T')[0],
    totalFee: 800,
    paidFee: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes, bRes] = await Promise.all([
        studentsAPI.getAll({ search }),
        coursesAPI.getAll(),
        batchesAPI.getAll(),
      ]);
      setStudents(sRes.data);
      setCourses(cRes.data);
      setBatches(bRes.data);
      if (cRes.data.length > 0 && !formData.course) {
        setFormData(prev => ({
          ...prev,
          course: cRes.data[0].courseName,
          totalFee: cRes.data[0].fee || 800,
        }));
      }
      if (bRes.data.length > 0 && !formData.batch) {
        setFormData(prev => ({ ...prev, batch: bRes.data[0].batchName }));
      }
    } catch (err) {
      console.error('Error loading students data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await studentsAPI.getAll({ search });
      setStudents(res.data);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      studentName: '',
      email: '',
      phone: '',
      gender: 'Male',
      address: '',
      course: courses[0]?.courseName || 'Full-Stack Web Development',
      batch: batches[0]?.batchName || 'Web Dev Morning (Batch-A)',
      admissionDate: new Date().toISOString().split('T')[0],
      totalFee: courses[0]?.fee || 800,
      paidFee: 0,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.studentName,
      email: student.email,
      phone: student.phone,
      gender: student.gender || 'Male',
      address: student.address || '',
      course: student.course,
      batch: student.batch,
      admissionDate: student.admissionDate,
      totalFee: student.totalFee,
      paidFee: student.paidFee,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openDetailModal = (student: any) => {
    setViewingStudent(student);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"?`)) {
      try {
        await studentsAPI.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting student');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.studentName || !formData.email || !formData.phone) {
      setFormError('Name, email, and phone are mandatory.');
      return;
    }

    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent._id, formData);
      } else {
        await studentsAPI.create(formData);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save student.');
    }
  };

  const calculatedRemaining = Math.max(0, Number(formData.totalFee) - Number(formData.paidFee));

  return (
    <div className="space-y-6">
      {/* Top bar with Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Student Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Enroll new students, update records, and monitor fee clearance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60 bg-white"
            />
          </form>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or add a new student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Course & Batch</th>
                  <th className="py-3 px-4">Fee Overview</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">Admitted: {s.admissionDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{s.email}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-indigo-600 font-semibold">{s.course}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{s.batch}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>Total: <span className="font-semibold">${s.totalFee}</span></div>
                      <div className="text-[11px]">
                        Paid: <span className="text-emerald-600 font-semibold">${s.paidFee}</span> | Due:{' '}
                        <span className="text-amber-600 font-semibold">${s.remainingFee}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={s.remainingFee === 0 ? 'Paid' : s.paidFee > 0 ? 'Partial' : 'Pending'} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openDetailModal(s)}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(s)}
                        title="Edit Student"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.studentName)}
                        title="Delete Student"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="Alex Johnson"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@academy.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0201"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="742 Evergreen Terrace, Springfield"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => {
                  const selCourse = courses.find(c => c.courseName === e.target.value);
                  setFormData({
                    ...formData,
                    course: e.target.value,
                    totalFee: selCourse ? selCourse.fee : formData.totalFee,
                  });
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {courses.map(c => (
                  <option key={c._id} value={c.courseName}>
                    {c.courseName} (${c.fee})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch *</label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {batches.map(b => (
                  <option key={b._id} value={b.batchName}>
                    {b.batchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee ($)</label>
              <input
                type="number"
                min="0"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Fee ($)</label>
              <input
                type="number"
                min="0"
                max={formData.totalFee}
                value={formData.paidFee}
                onChange={(e) => setFormData({ ...formData, paidFee: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Auto-calculated remaining fee banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Calculated Remaining Fee:</span>
            <span className="font-bold text-base text-indigo-700">${calculatedRemaining}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
            >
              {editingStudent ? 'Save Changes' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Details View Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Full Details"
        maxWidth="md"
      >
        {viewingStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {viewingStudent.studentName[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{viewingStudent.studentName}</h4>
                <p className="text-[11px] text-indigo-700 font-medium">{viewingStudent.course}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-medium">{viewingStudent.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                <span className="font-medium">{viewingStudent.phone}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                <span className="font-medium">{viewingStudent.gender}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch</span>
                <span className="font-medium">{viewingStudent.batch}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
              <span className="font-medium">{viewingStudent.address || 'N/A'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Course Fee:</span>
                <span className="font-bold">${viewingStudent.totalFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paid to date:</span>
                <span className="font-bold text-emerald-400">${viewingStudent.paidFee}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-700">
                <span className="font-semibold text-slate-200">Remaining Balance:</span>
                <span className="font-bold text-amber-400">${viewingStudent.remainingFee}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
