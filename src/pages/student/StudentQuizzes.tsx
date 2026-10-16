import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { studentsAPI, quizzesAPI, quizResultsAPI } from '../../services/api.ts';
import { Badge } from '../../components/Badge.tsx';
import { StudentQuizAttempt } from './StudentQuizAttempt.tsx';
import { Award, Clock, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const StudentQuizzes: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<any | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active quiz attempt state
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const sRes = await studentsAPI.getAll({ search: user?.email });
      const current = sRes.data.find(
        (s: any) => s.email.toLowerCase() === user?.email.toLowerCase()
      ) || sRes.data[0];

      setStudent(current);
      if (current) {
        const [qRes, rRes] = await Promise.all([
          quizzesAPI.getAll({ course: current.course }),
          quizResultsAPI.getByStudent(current._id),
        ]);
        setQuizzes(qRes.data);
        setResults(rRes.data);
      }
    } catch (err) {
      console.error('Error loading student quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeQuiz) {
    return (
      <StudentQuizAttempt
        quiz={activeQuiz}
        onBack={() => setActiveQuiz(null)}
        onCompleted={() => {
          setActiveQuiz(null);
          loadData();
        }}
      />
    );
  }

  const completedMap = new Map();
  results.forEach((r) => completedMap.set(r.quizId, r));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Quizzes & Assessments</h2>
        <p className="text-xs text-slate-500 font-medium">
          Attempt MCQ tests for <span className="font-bold">{student?.course}</span> and inspect your grading.
        </p>
      </div>

      {/* Available Tests Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Course Assessment Modules
        </h3>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading assessments...</div>
        ) : quizzes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No quizzes available</p>
            <p className="text-xs text-slate-400 mt-1">Your instructor will publish assessments soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const previousResult = completedMap.get(quiz._id);
              const isCompleted = !!previousResult;

              return (
                <div
                  key={quiz._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {quiz.course}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Available
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{quiz.quizTitle}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                      {quiz.description || 'MCQ evaluation covering key curriculum concepts.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-slate-700">
                          {quiz.questions?.length || 0} Questions
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-700">{quiz.timeLimit} Mins</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center justify-between w-full text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Your Score</span>
                          <span className="font-extrabold text-slate-800">
                            {previousResult.score}/{previousResult.totalQuestions} ({previousResult.percentage}%)
                          </span>
                        </div>
                        <Badge status={previousResult.result} />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveQuiz(quiz)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quiz Submission Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 font-bold text-xs text-slate-800 bg-slate-50/50">
          My Completed Assessment History
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed assessments yet. Take one of the available quizzes above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Quiz Title</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Grade Result</th>
                  <th className="py-3 px-4 text-right">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.quizTitle}</td>
                    <td className="py-3 px-4 text-slate-500">{r.course}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-indigo-600">
                      {r.score} / {r.totalQuestions}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{r.percentage}%</td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={r.result} />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(r.submittedAt).toLocaleDateString()}
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
