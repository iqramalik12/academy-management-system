import React, { useState, useEffect } from 'react';
import { quizResultsAPI } from '../../services/api.ts';
import { Badge } from '../../components/Badge.tsx';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, Award, HelpCircle } from 'lucide-react';

interface StudentQuizAttemptProps {
  quiz: any;
  onBack: () => void;
  onCompleted: () => void;
}

export const StudentQuizAttempt: React.FC<StudentQuizAttemptProps> = ({
  quiz,
  onBack,
  onCompleted,
}) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>((quiz.timeLimit || 10) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qIndex: number, optionLetter: string) => {
    if (result) return;
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optionLetter,
    }));
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await quizResultsAPI.submit({
        quizId: quiz._id,
        answers,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions?.length || 0;

  if (result) {
    const isPassed = result.result === 'Passed';
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-1">
            {isPassed ? 'Quiz Successfully Passed!' : 'Assessment Completed'}
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Your results have been automatically graded and recorded in the database.
          </p>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
              <span className="text-xl font-extrabold text-slate-800">
                {result.score} / {result.totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Percentage</span>
              <span className="text-xl font-extrabold text-indigo-600">
                {result.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <div className="mt-1">
                <Badge status={result.result} />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 mb-6 text-left p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-bold text-slate-800">{result.totalQuestions}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Correct Answers:</span>
              <span>{result.correctAnswers}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>Wrong / Unanswered:</span>
              <span>{result.wrongAnswers}</span>
            </div>
          </div>

          <button
            onClick={onCompleted}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-xs transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Test</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Time Remaining: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quiz Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
          {quiz.course}
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-2 mb-1">{quiz.quizTitle}</h2>
        <p className="text-xs text-slate-500">{quiz.description}</p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {quiz.questions?.map((q: any, idx: number) => {
          const selected = answers[idx];
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{q.question}</h4>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { letter: 'A', text: q.optionA },
                  { letter: 'B', text: q.optionB },
                  { letter: 'C', text: q.optionC },
                  { letter: 'D', text: q.optionD },
                ].map(({ letter, text }) => {
                  const isChecked = selected === letter;
                  return (
                    <label
                      key={letter}
                      onClick={() => handleSelectAnswer(idx, letter)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 font-bold'
                          : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-500 border-slate-300'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="flex-1">{text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-lg flex items-center justify-between">
        <div className="text-xs text-slate-600">
          Answered <span className="font-bold text-indigo-600">{answeredCount}</span> of{' '}
          <span className="font-bold text-slate-800">{totalQuestions}</span> questions
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50"
        >
          {submitting ? 'Calculating Result...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
};
