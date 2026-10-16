import { GoogleGenAI } from '@google/genai';

export interface StudentContextData {
  studentName: string;
  email: string;
  course: string;
  batch: string;
  classTime?: string;
  roomNumber?: string;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  attendance: {
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    percentage: number;
  };
  recentQuizResult?: {
    quizTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    result: string;
    submittedAt: string;
  } | null;
  availableQuizzesCount: number;
  availableCourses: Array<{ name: string; duration: string; fee: number }>;
}

export interface AiChatResponse {
  answer: string;
  showTicketButton?: boolean;
  isFallback?: boolean;
}

export async function askAcademyAi(
  userQuestion: string,
  context: StudentContextData
): Promise<AiChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return {
      answer:
        'AI Support is temporarily unavailable. Please create a support ticket or contact the academy.',
      showTicketButton: true,
      isFallback: true,
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const modelName = process.env.AI_MODEL || 'gemini-3.8-flash';

    const systemInstruction = `You are the friendly, dedicated Academy Student Support AI Assistant for our Academy Management System.
Your job is to assist the student with questions about their attendance, fees, quizzes, course schedule, batch info, and academy procedures.

=== AUTHENTICATED STUDENT RECORD ===
Student Name: ${context.studentName}
Email: ${context.email}
Enrolled Course: ${context.course}
Batch: ${context.batch}
Schedule: ${context.classTime || 'Mon-Thu'} in ${context.roomNumber || 'Assigned Room'}

=== ACADEMY FEE DETAILS ===
Total Fee: $${context.totalFee}
Paid Fee: $${context.paidFee}
Remaining Fee Balance: $${context.remainingFee}

=== ACADEMY ATTENDANCE DETAILS ===
Total Classes Marked: ${context.attendance.totalClasses}
Present: ${context.attendance.presentCount}
Absent: ${context.attendance.absentCount}
Attendance Percentage: ${context.attendance.percentage}%

=== QUIZ DETAILS ===
Recent Completed Quiz: ${
      context.recentQuizResult
        ? `${context.recentQuizResult.quizTitle} - Score: ${context.recentQuizResult.score}/${context.recentQuizResult.totalQuestions} (${context.recentQuizResult.percentage}%, Status: ${context.recentQuizResult.result})`
        : 'No quizzes attempted yet.'
    }
Available Quizzes to Attempt: ${context.availableQuizzesCount}

=== ACADEMY COURSES OFFERED ===
${context.availableCourses
  .map(c => `- ${c.name} (${c.duration}, Fee: $${c.fee})`)
  .join('\n')}

=== STRICT RULES ===
1. Use ONLY the authenticated student data provided above. NEVER invent or hallucinate attendance numbers, fee balances, or dates.
2. Provide concise, clear, and beginner-friendly answers (typically 2-4 sentences or clean bullet points).
3. If the student asks how to check attendance, explain they can visit the "Attendance" tab on their dashboard where their complete history is listed.
4. If the student asks how to pay fees, mention they can contact the admin desk or pay via Bank, Cash, Easypaisa, or JazzCash.
5. If the student has a dispute or needs a manual change (e.g. incorrect attendance or payment correction), advise them to click "Create Support Ticket" in the Student Support section.
6. Never disclose private information belonging to other students.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userQuestion,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const text = response.text || '';
    if (!text.trim()) {
      return {
        answer:
          'AI Support is temporarily unavailable. Please create a support ticket or contact the academy.',
        showTicketButton: true,
        isFallback: true,
      };
    }

    return {
      answer: text.trim(),
      showTicketButton: false,
      isFallback: false,
    };
  } catch (error) {
    console.warn('⚠️ [Gemini AI Service] AI request error:', (error as Error).message);
    return {
      answer:
        'AI Support is temporarily unavailable. Please create a support ticket or contact the academy.',
      showTicketButton: true,
      isFallback: true,
    };
  }
}
