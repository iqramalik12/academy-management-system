import React, { useState, useEffect } from 'react';
import { quizzesAPI, quizResultsAPI, coursesAPI } from '../../services/api.ts';
import { Modal } from '../../components/Modal.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  Award,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Search,
  CheckCircle,
  HelpCircle,
  Users,
} from 'lucide-react';

interface QuestionForm {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export const QuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results'>('quizzes');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    quizTitle: '',
    course: '',
    description: '',
    timeLimit: 10,
    questions: [
      {
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A' as const,
      },
    ] as QuestionForm[],
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qRes, rRes, cRes] = await Promise.all([
        quizzesAPI.getAll({ search }),
        quizResultsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setQuizzes(qRes.data);
      setResults(rRes.data);
      setCourses(cRes.data);
      if (cRes.data.length > 0 && !formData.course) {
        setFormData(prev => ({ ...prev, course: cRes.data[0].courseName }));
      }
    } catch (err) {
      console.error('Error loading quizzes data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddQuizModal = () => {
    setFormData({
      quizTitle: '',
      course: courses[0]?.courseName || 'Full-Stack Web Development',
      description: '',
      timeLimit: 10,
      questions: [
        {
          question: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
        },
      ],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const addQuestionField = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
        },
      ],
    }));
  };

  const removeQuestionField = (index: number) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      (updated[index] as any)[field] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete quiz "${title}"?`)) {
      try {
        await quizzesAPI.delete(id);
        loadData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting quiz');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.quizTitle || !formData.course) {
      setFormError('Quiz title and course are required.');
      return;
    }

    // Validate each question
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setFormError(`Question #${i + 1} has incomplete text or options.`);
        return;
      }
    }

    try {
      await quizzesAPI.create(formData);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Quiz & Assessment Hub</h2>
          <p className="text-xs text-slate-500 font-medium">
            Create MCQ quizzes, configure auto-evaluation, and review student test submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'quizzes' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Active Quizzes ({quizzes.length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'results' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Student Results ({results.length})
            </button>
          </div>

          {activeTab === 'quizzes' && (
            <button
              onClick={openAddQuizModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quiz</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'quizzes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No quizzes available</p>
              <p className="text-xs text-slate-400 mt-1">Create an MCQ quiz for your course.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                      {quiz.course}
                    </span>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id, quiz.quizTitle)}
                      title="Delete Quiz"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{quiz.quizTitle}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {quiz.description || 'Multiple choice test covering core course syllabus.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold text-slate-700">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-slate-700">{quiz.timeLimit} Mins</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-normal">Author: {quiz.createdBy}</span>
                  <span className="text-[11px] text-slate-500">
                    Submissions: {results.filter((r) => r.quizId === quiz._id).length}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Results Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
            All Student Quiz Submissions
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No students have attempted quizzes yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 text-center">Score</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-center">Outcome</th>
                    <th className="py-3 px-4 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {results.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{res.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{res.studentEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{res.quizTitle}</td>
                      <td className="py-3 px-4 text-slate-500">{res.course}</td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-700">
                        {res.score} / {res.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{res.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge status={res.result} />
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {new Date(res.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Interactive MCQ Quiz Builder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create MCQ Assessment Quiz"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title *</label>
              <input
                type="text"
                required
                value={formData.quizTitle}
                onChange={(e) => setFormData({ ...formData, quizTitle: e.target.value })}
                placeholder="e.g. JavaScript ES6+ Core Assessment"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course *</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c.courseName}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief assessment instructions..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time Limit (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* MCQ Question List */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Questions ({formData.questions.length})
              </h4>
              <button
                type="button"
                onClick={addQuestionField}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {formData.questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Question #{idx + 1}</span>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestionField(idx)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                  placeholder="e.g. What does HTML stand for?"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Option A</label>
                    <input
                      type="text"
                      required
                      value={q.optionA}
                      onChange={(e) => updateQuestion(idx, 'optionA', e.target.value)}
                      placeholder="Option A..."
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Option B</label>
                    <input
                      type="text"
                      required
                      value={q.optionB}
                      onChange={(e) => updateQuestion(idx, 'optionB', e.target.value)}
                      placeholder="Option B..."
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Option C</label>
                    <input
                      type="text"
                      required
                      value={q.optionC}
                      onChange={(e) => updateQuestion(idx, 'optionC', e.target.value)}
                      placeholder="Option C..."
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Option D</label>
                    <input
                      type="text"
                      required
                      value={q.optionD}
                      onChange={(e) => updateQuestion(idx, 'optionD', e.target.value)}
                      placeholder="Option D..."
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <span className="text-[11px] text-slate-500">Select Correct Answer:</span>
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <label key={letter} className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`correctAnswer_${idx}`}
                        value={letter}
                        checked={q.correctAnswer === letter}
                        onChange={() => updateQuestion(idx, 'correctAnswer', letter)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Option {letter}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              Save & Publish Quiz
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
