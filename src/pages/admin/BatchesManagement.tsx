import React, { useState, useEffect } from 'react';
import { batchesAPI, coursesAPI, teachersAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Search, Plus, Edit2, Trash2, Layers, Calendar, Clock, MapPin } from 'lucide-react';

export const BatchesManagement: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    batchName: '',
    course: '',
    teacher: '',
    startDate: new Date().toISOString().split('T')[0],
    classTime: '09:00 AM - 11:00 AM (Mon - Thu)',
    roomNumber: 'Lab 201',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes, tRes] = await Promise.all([
        batchesAPI.getAll({ search }),
        coursesAPI.getAll(),
        teachersAPI.getAll(),
      ]);
      setBatches(bRes.data);
      setCourses(cRes.data);
      setTeachers(tRes.data);
      if (cRes.data.length > 0 && !formData.course) {
        setFormData(prev => ({ ...prev, course: cRes.data[0].courseName }));
      }
      if (tRes.data.length > 0 && !formData.teacher) {
        setFormData(prev => ({ ...prev, teacher: tRes.data[0].teacherName }));
      }
    } catch (err) {
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openAdd = () => {
    setEditingBatch(null);
    setFormData({
      batchName: '',
      course: courses[0]?.courseName || 'Full-Stack Web Development',
      teacher: teachers[0]?.teacherName || 'Prof. David Miller',
      startDate: new Date().toISOString().split('T')[0],
      classTime: '09:00 AM - 11:00 AM (Mon - Thu)',
      roomNumber: 'Lab 201',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (batch: any) => {
    setEditingBatch(batch);
    setFormData({
      batchName: batch.batchName,
      course: batch.course,
      teacher: batch.teacher,
      startDate: batch.startDate,
      classTime: batch.classTime,
      roomNumber: batch.roomNumber,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete batch "${name}"?`)) {
      try {
        await batchesAPI.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting batch');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.batchName || !formData.course || !formData.teacher || !formData.roomNumber) {
      setFormError('All fields are mandatory.');
      return;
    }
    try {
      if (editingBatch) {
        await batchesAPI.update(editingBatch._id, formData);
      } else {
        await batchesAPI.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save batch.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Batch Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Schedule cohorts, assign lab rooms, dates, and instructors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60 bg-white"
            />
          </form>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading cohorts...</div>
        ) : batches.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No batches created</p>
            <p className="text-xs text-slate-400 mt-1">Create a batch cohort to assign students and track attendance.</p>
          </div>
        ) : (
          batches.map((batch) => (
            <div
              key={batch._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {batch.course}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(batch)}
                      className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(batch._id, batch.batchName)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-3">{batch.batchName}</h3>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{batch.classTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Location: {batch.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Cohort Start Date: {batch.startDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Instructor</span>
                <span className="font-bold text-slate-800">{batch.teacher}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? 'Edit Batch Details' : 'Create New Cohort Batch'}
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Identifier *</label>
            <input
              type="text"
              required
              value={formData.batchName}
              onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
              placeholder="e.g. Web Dev Morning (Batch-A)"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {courses.map(c => (
                  <option key={c._id} value={c.courseName}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instructor *</label>
              <select
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {teachers.map(t => (
                  <option key={t._id} value={t.teacherName}>
                    {t.teacherName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Lab *</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="Lab 201"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Schedule & Time *</label>
            <input
              type="text"
              required
              value={formData.classTime}
              onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
              placeholder="09:00 AM - 11:00 AM (Mon - Thu)"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
            >
              {editingBatch ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
