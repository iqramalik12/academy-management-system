import React, { useState, useEffect } from 'react';
import { coursesAPI, teachersAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Search, Plus, Edit2, Trash2, BookOpen, Clock, DollarSign, User } from 'lucide-react';

export const CoursesManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    courseName: '',
    description: '',
    duration: '12 Weeks',
    fee: 750,
    assignedTeacher: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, tRes] = await Promise.all([
        coursesAPI.getAll({ search }),
        teachersAPI.getAll(),
      ]);
      setCourses(cRes.data);
      setTeachers(tRes.data);
      if (tRes.data.length > 0 && !formData.assignedTeacher) {
        setFormData(prev => ({ ...prev, assignedTeacher: tRes.data[0].teacherName }));
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openAdd = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '',
      description: '',
      duration: '12 Weeks',
      fee: 750,
      assignedTeacher: teachers[0]?.teacherName || 'Prof. David Miller',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      description: course.description,
      duration: course.duration,
      fee: course.fee,
      assignedTeacher: course.assignedTeacher,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete course "${name}"?`)) {
      try {
        await coursesAPI.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting course');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.courseName || !formData.duration || formData.fee === undefined) {
      setFormError('Course name, duration, and fee are required.');
      return;
    }
    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse._id, formData);
      } else {
        await coursesAPI.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save course.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Course Management</h2>
          <p className="text-xs text-slate-500 font-medium">
            Define curriculum programs, durations, tuition fees, and assigned faculty.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
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
            <span>Add Course</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No courses available</p>
            <p className="text-xs text-slate-400 mt-1">Add your academy programs to get started.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {course.duration}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(course)}
                      className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id, course.courseName)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{course.courseName}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                  {course.description || 'Comprehensive curriculum program designed for modern skills.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Instructor</span>
                  <span className="text-xs font-semibold text-slate-700">{course.assignedTeacher}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tuition Fee</span>
                  <span className="text-base font-extrabold text-indigo-600">${course.fee}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Full-Stack Web Development"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of curriculum modules and learning objectives..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration *</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="16 Weeks"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Fee ($) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
            <select
              value={formData.assignedTeacher}
              onChange={(e) => setFormData({ ...formData, assignedTeacher: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {teachers.map(t => (
                <option key={t._id} value={t.teacherName}>
                  {t.teacherName} ({t.subject})
                </option>
              ))}
            </select>
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
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
