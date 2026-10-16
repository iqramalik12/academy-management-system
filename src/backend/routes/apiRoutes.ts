import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../services/store.ts';
import { authenticate, authorize, generateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { askAcademyAi, StudentContextData } from '../services/geminiAiService.ts';

const router = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await store.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    // Attach student or teacher profile reference if exists
    let studentId: string | undefined;
    let teacherId: string | undefined;

    if (user.role === 'student') {
      const student = await store.students.findByEmail(user.email);
      if (student) studentId = student._id;
    } else if (user.role === 'teacher') {
      const teacher = await store.teachers.findByEmail(user.email);
      if (teacher) teacherId = teacher._id;
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId,
      teacherId,
    };

    const token = generateToken(payload);

    res.json({
      success: true,
      token,
      user: payload,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/auth/register
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student', phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    const existing = await store.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await store.users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role as 'admin' | 'teacher' | 'student',
      phone,
    });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    res.status(201).json({
      success: true,
      token,
      user: payload,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/auth/me
router.get('/auth/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const user = await store.users.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let extra: any = {};
    if (user.role === 'student') {
      const student = await store.students.findByEmail(user.email);
      if (student) extra.student = student;
    } else if (user.role === 'teacher') {
      const teacher = await store.teachers.findByEmail(user.email);
      if (teacher) extra.teacher = teacher;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      ...extra,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 2. DASHBOARD ANALYTICS (ADMIN)
// ==========================================

router.get('/dashboard/stats', authenticate, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const totalStudents = await store.students.count();
    const totalTeachers = await store.teachers.count();
    const totalCourses = await store.courses.count();
    const totalBatches = await store.batches.count();
    const totalQuizzes = await store.quizzes.count();
    const openTickets = await store.supportTickets.countOpen();

    const allStudents = await store.students.find();
    const pendingFees = allStudents.reduce((acc, s) => acc + (s.remainingFee || 0), 0);
    const recentStudents = allStudents.slice(-5).reverse();

    const allPayments = await store.fees.find();
    const recentPayments = allPayments.slice(0, 5);

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalBatches,
      totalQuizzes,
      pendingFees,
      openTickets,
      recentStudents,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 3. STUDENT MANAGEMENT (ADMIN / TEACHER)
// ==========================================

// GET /api/students
router.get('/students', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, course, batch } = req.query;
    const students = await store.students.find({
      search: search as string,
      course: course as string,
      batch: batch as string,
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/students
router.post('/students', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const {
      studentName,
      email,
      phone,
      gender,
      address,
      course,
      batch,
      admissionDate,
      totalFee,
      paidFee = 0,
    } = req.body;

    if (!studentName || !email || !phone || !course || !batch || !admissionDate || totalFee === undefined) {
      res.status(400).json({ message: 'All required student fields must be provided.' });
      return;
    }

    const existing = await store.students.findByEmail(email);
    if (existing) {
      res.status(400).json({ message: 'A student with this email already exists.' });
      return;
    }

    // Auto-create or link user account for student login
    let user = await store.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      user = await store.users.create({
        name: studentName,
        email: email.toLowerCase(),
        password: defaultPasswordHash,
        role: 'student',
        phone,
      });
    }

    const student = await store.students.create({
      studentName,
      email: email.toLowerCase(),
      phone,
      gender: gender || 'Male',
      address: address || '',
      course,
      batch,
      admissionDate,
      totalFee: Number(totalFee),
      paidFee: Number(paidFee),
      remainingFee: Math.max(0, Number(totalFee) - Number(paidFee)),
      userId: user._id,
    });

    // If initial payment was made, add fee record
    if (Number(paidFee) > 0) {
      await store.fees.create({
        studentId: student._id,
        studentName: student.studentName,
        studentEmail: student.email,
        totalFee: student.totalFee,
        paidFee: student.paidFee,
        remainingFee: student.remainingFee,
        paymentAmount: Number(paidFee),
        paymentDate: admissionDate,
        paymentMethod: 'Cash',
      });
    }

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/students/:id
router.get('/students/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = await store.students.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/students/:id
router.put('/students/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const updated = await store.students.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE /api/students/:id
router.delete('/students/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const success = await store.students.findByIdAndDelete(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 4. TEACHER MANAGEMENT (ADMIN)
// ==========================================

// GET /api/teachers
router.get('/teachers', authenticate, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const teachers = await store.teachers.find(search as string);
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/teachers
router.post('/teachers', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { teacherName, email, phone, subject, joiningDate } = req.body;
    if (!teacherName || !email || !phone || !subject || !joiningDate) {
      res.status(400).json({ message: 'All teacher fields are required.' });
      return;
    }

    const existing = await store.teachers.findByEmail(email);
    if (existing) {
      res.status(400).json({ message: 'A teacher with this email already exists.' });
      return;
    }

    // Auto-create user account if not exists
    let user = await store.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      user = await store.users.create({
        name: teacherName,
        email: email.toLowerCase(),
        password: defaultPasswordHash,
        role: 'teacher',
        phone,
      });
    }

    const teacher = await store.teachers.create({
      teacherName,
      email: email.toLowerCase(),
      phone,
      subject,
      joiningDate,
      userId: user._id,
    });

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/teachers/:id
router.put('/teachers/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const updated = await store.teachers.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Teacher not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE /api/teachers/:id
router.delete('/teachers/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const success = await store.teachers.findByIdAndDelete(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Teacher not found.' });
      return;
    }
    res.json({ message: 'Teacher deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 5. COURSE MANAGEMENT (ADMIN)
// ==========================================

// GET /api/courses
router.get('/courses', authenticate, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const courses = await store.courses.find(search as string);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/courses
router.post('/courses', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { courseName, description, duration, fee, assignedTeacher } = req.body;
    if (!courseName || !duration || fee === undefined) {
      res.status(400).json({ message: 'Course name, duration, and fee are required.' });
      return;
    }
    const course = await store.courses.create({
      courseName,
      description: description || '',
      duration,
      fee: Number(fee),
      assignedTeacher: assignedTeacher || 'Unassigned',
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/courses/:id
router.put('/courses/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const updated = await store.courses.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE /api/courses/:id
router.delete('/courses/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const success = await store.courses.findByIdAndDelete(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }
    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 6. BATCH MANAGEMENT (ADMIN)
// ==========================================

// GET /api/batches
router.get('/batches', authenticate, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const batches = await store.batches.find(search as string);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/batches
router.post('/batches', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { batchName, course, teacher, startDate, classTime, roomNumber } = req.body;
    if (!batchName || !course || !teacher || !startDate || !classTime || !roomNumber) {
      res.status(400).json({ message: 'All batch fields are required.' });
      return;
    }
    const batch = await store.batches.create({
      batchName,
      course,
      teacher,
      startDate,
      classTime,
      roomNumber,
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/batches/:id
router.put('/batches/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const updated = await store.batches.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Batch not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE /api/batches/:id
router.delete('/batches/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const success = await store.batches.findByIdAndDelete(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Batch not found.' });
      return;
    }
    res.json({ message: 'Batch deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 7. ATTENDANCE MANAGEMENT
// ==========================================

// GET /api/attendance
router.get('/attendance', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batch, date, studentId } = req.query;
    const records = await store.attendance.find({
      batch: batch as string,
      date: date as string,
      studentId: studentId as string,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/attendance (Mark attendance for batch + date)
router.post('/attendance', authenticate, authorize('admin', 'teacher'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { batch, date, records } = req.body;
    if (!batch || !date || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ message: 'Batch, date, and student attendance records are required.' });
      return;
    }

    // Prevent duplicate attendance for the same batch and date
    const existing = await store.attendance.findOne({ batch, date });
    if (existing) {
      res.status(400).json({ message: `Attendance for '${batch}' on date ${date} has already been marked.` });
      return;
    }

    const created = await store.attendance.create({
      batch,
      date,
      records,
      markedBy: req.user?.name || 'Teacher',
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/attendance/:id
router.put('/attendance/:id', authenticate, authorize('admin', 'teacher'), async (req: Request, res: Response) => {
  try {
    const updated = await store.attendance.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Attendance record not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/attendance/student/:studentId (Calculate student attendance summary)
router.get('/attendance/student/:studentId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = await store.students.findById(req.params.studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }

    const allBatchAttendance = await store.attendance.find({ batch: student.batch });
    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;
    const history: Array<{ date: string; batch: string; status: 'Present' | 'Absent'; markedBy: string }> = [];

    for (const record of allBatchAttendance) {
      const studentEntry = record.records.find(r => r.studentId === student._id);
      if (studentEntry) {
        totalClasses++;
        if (studentEntry.status === 'Present') {
          presentCount++;
        } else {
          absentCount++;
        }
        history.push({
          date: record.date,
          batch: record.batch,
          status: studentEntry.status,
          markedBy: record.markedBy,
        });
      }
    }

    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

    res.json({
      studentId: student._id,
      studentName: student.studentName,
      batch: student.batch,
      totalClasses,
      presentCount,
      absentCount,
      percentage,
      history: history.sort((a, b) => b.date.localeCompare(a.date)),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 8. FEE MANAGEMENT (ADMIN)
// ==========================================

// GET /api/fees
router.get('/fees', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, studentId } = req.query;
    if (studentId) {
      const fees = await store.fees.findByStudentId(studentId as string);
      res.json(fees);
      return;
    }
    const fees = await store.fees.find(search as string);
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/fees (Add payment)
router.post('/fees', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { studentId, paymentAmount, paymentMethod, paymentDate } = req.body;
    if (!studentId || !paymentAmount || !paymentMethod || !paymentDate) {
      res.status(400).json({ message: 'Student ID, payment amount, method, and date are required.' });
      return;
    }

    const amount = Number(paymentAmount);
    if (amount <= 0) {
      res.status(400).json({ message: 'Payment amount must be greater than zero.' });
      return;
    }

    const student = await store.students.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }

    // Do not allow payment greater than remaining fee
    if (amount > student.remainingFee) {
      res.status(400).json({
        message: `Payment amount ($${amount}) cannot exceed the remaining fee balance of $${student.remainingFee}.`,
      });
      return;
    }

    const newPaidFee = student.paidFee + amount;
    const newRemainingFee = Math.max(0, student.totalFee - newPaidFee);

    // Update student fee totals
    await store.students.findByIdAndUpdate(student._id, {
      paidFee: newPaidFee,
      remainingFee: newRemainingFee,
    });

    // Create payment transaction
    const feeRecord = await store.fees.create({
      studentId: student._id,
      studentName: student.studentName,
      studentEmail: student.email,
      totalFee: student.totalFee,
      paidFee: newPaidFee,
      remainingFee: newRemainingFee,
      paymentAmount: amount,
      paymentDate,
      paymentMethod,
    });

    res.status(201).json({
      message: 'Payment recorded successfully.',
      feeRecord,
      updatedStudent: {
        totalFee: student.totalFee,
        paidFee: newPaidFee,
        remainingFee: newRemainingFee,
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 9. QUIZ SYSTEM (ADMIN / TEACHER / STUDENT)
// ==========================================

// GET /api/quizzes
router.get('/quizzes', authenticate, async (req: Request, res: Response) => {
  try {
    const { search, course } = req.query;
    const quizzes = await store.quizzes.find(search as string, course as string);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/quizzes
router.post('/quizzes', authenticate, authorize('admin', 'teacher'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizTitle, course, description, timeLimit, questions } = req.body;
    if (!quizTitle || !course || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ message: 'Quiz title, course, and at least one question are required.' });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
        res.status(400).json({ message: `Question ${i + 1} is missing fields or correct answer.` });
        return;
      }
    }

    const quiz = await store.quizzes.create({
      quizTitle,
      course,
      description: description || '',
      timeLimit: Number(timeLimit) || 10,
      questions,
      createdBy: req.user?.name || 'Instructor',
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/quizzes/:id
router.get('/quizzes/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const quiz = await store.quizzes.findById(req.params.id);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/quizzes/:id
router.put('/quizzes/:id', authenticate, authorize('admin', 'teacher'), async (req: Request, res: Response) => {
  try {
    const updated = await store.quizzes.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// DELETE /api/quizzes/:id
router.delete('/quizzes/:id', authenticate, authorize('admin', 'teacher'), async (req: Request, res: Response) => {
  try {
    const success = await store.quizzes.findByIdAndDelete(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 10. QUIZ RESULTS (STUDENT / TEACHER / ADMIN)
// ==========================================

// POST /api/quiz-results (Student submits quiz)
router.post('/quiz-results', authenticate, authorize('student'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId, answers } = req.body;
    // answers is an object mapping questionIndex -> 'A' | 'B' | 'C' | 'D'
    if (!quizId || !answers) {
      res.status(400).json({ message: 'Quiz ID and answers are required.' });
      return;
    }

    const quiz = await store.quizzes.findById(quizId);
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found.' });
      return;
    }

    const student = await store.students.findByEmail(req.user!.email);
    if (!student) {
      res.status(404).json({ message: 'Student record not found.' });
      return;
    }

    // Prevent duplicate submission for the same quiz
    const alreadySubmitted = await store.quizResults.findOne({ quizId, studentId: student._id });
    if (alreadySubmitted) {
      res.status(400).json({ message: 'You have already submitted this quiz once.' });
      return;
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q, idx) => {
      const studentAnswer = answers[idx];
      if (studentAnswer && studentAnswer.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correctCount++;
      }
    });

    const wrongCount = totalQuestions - correctCount;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const resultStatus = percentage >= 60 ? 'Passed' : 'Failed';

    const savedResult = await store.quizResults.create({
      quizId: quiz._id,
      quizTitle: quiz.quizTitle,
      course: quiz.course,
      studentId: student._id,
      studentName: student.studentName,
      studentEmail: student.email,
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      score: correctCount,
      percentage,
      result: resultStatus,
      submittedAt: new Date().toISOString(),
    });

    res.status(201).json(savedResult);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/quiz-results (All results for admin/teacher)
router.get('/quiz-results', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quizId, studentId } = req.query;
    const results = await store.quizResults.find({
      quizId: quizId as string,
      studentId: studentId as string,
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/quiz-results/student/:studentId
router.get('/quiz-results/student/:studentId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const results = await store.quizResults.find({ studentId: req.params.studentId });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 11. STUDENT SUPPORT TICKET SYSTEM
// ==========================================

// GET /api/support/tickets
router.get('/support/tickets', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let filter: any = {
      status: status as string,
      search: search as string,
    };

    if (req.user?.role === 'student') {
      const student = await store.students.findByEmail(req.user.email);
      if (student) {
        filter.studentId = student._id;
      }
    }

    const tickets = await store.supportTickets.find(filter);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/support/tickets
router.post('/support/tickets', authenticate, authorize('student'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, category, priority = 'Medium', message } = req.body;
    if (!subject || !category || !message) {
      res.status(400).json({ message: 'Subject, category, and message are required.' });
      return;
    }

    const student = await store.students.findByEmail(req.user!.email);
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const newTicket = await store.supportTickets.create({
      student: {
        id: student._id,
        name: student.studentName,
        email: student.email,
      },
      course: student.course,
      subject,
      category,
      priority,
      message,
      status: 'Pending',
    });

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// GET /api/support/tickets/:id
router.get('/support/tickets/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = await store.supportTickets.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }

    // Student can only see their own ticket
    if (req.user?.role === 'student') {
      const student = await store.students.findByEmail(req.user.email);
      if (student && ticket.student.id !== student._id) {
        res.status(403).json({ message: 'Access denied to this ticket.' });
        return;
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// POST /api/support/tickets/:id/reply
router.post('/support/tickets/:id/reply', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ message: 'Reply message cannot be empty.' });
      return;
    }

    const ticket = await store.supportTickets.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }

    // Role check for replying
    const sender = req.user?.name || 'Academy Staff';
    const senderRole = req.user?.role || 'admin';

    const updated = await store.supportTickets.addReply(req.params.id, {
      sender,
      senderRole,
      message: message.trim(),
    });

    // If teacher or admin replied and status was Pending, move to In Progress
    if (senderRole !== 'student' && ticket.status === 'Pending') {
      await store.supportTickets.updateStatus(req.params.id, 'In Progress');
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// PUT /api/support/tickets/:id/status
router.put('/support/tickets/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      res.status(400).json({ message: 'Valid status is required.' });
      return;
    }

    const ticket = await store.supportTickets.findById(req.params.id);
    if (!ticket) {
      res.status(404).json({ message: 'Support ticket not found.' });
      return;
    }

    // Student can only close their own ticket
    if (req.user?.role === 'student') {
      const student = await store.students.findByEmail(req.user.email);
      if (student && ticket.student.id !== student._id) {
        res.status(403).json({ message: 'Access denied.' });
        return;
      }
      if (status !== 'Closed') {
        res.status(403).json({ message: 'Students can only mark tickets as Closed.' });
        return;
      }
    }

    const updated = await store.supportTickets.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// ==========================================
// 12. STUDENT AI SUPPORT CHATBOT
// ==========================================

// POST /api/ai-support/chat
router.post('/ai-support/chat', authenticate, authorize('student'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ message: 'Message is required.' });
      return;
    }

    const student = await store.students.findByEmail(req.user!.email);
    if (!student) {
      res.status(404).json({ message: 'Student record not found.' });
      return;
    }

    // Retrieve student attendance summary
    const allBatchAttendance = await store.attendance.find({ batch: student.batch });
    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;

    for (const record of allBatchAttendance) {
      const entry = record.records.find(r => r.studentId === student._id);
      if (entry) {
        totalClasses++;
        if (entry.status === 'Present') presentCount++;
        else absentCount++;
      }
    }
    const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

    // Retrieve student quiz results
    const quizResults = await store.quizResults.find({ studentId: student._id });
    const recentQuiz = quizResults.length > 0 ? quizResults[0] : null;

    // Retrieve batch timing
    const batches = await store.batches.find();
    const batchInfo = batches.find(b => b.batchName === student.batch);

    // Retrieve academy courses
    const courses = await store.courses.find();
    const availableCourses = courses.map(c => ({
      name: c.courseName,
      duration: c.duration,
      fee: c.fee,
    }));

    // Available quizzes in this student's course not yet submitted
    const courseQuizzes = await store.quizzes.find(undefined, student.course);
    const submittedQuizIds = new Set(quizResults.map(r => r.quizId));
    const availableQuizzesCount = courseQuizzes.filter(q => !submittedQuizIds.has(q._id)).length;

    const studentContext: StudentContextData = {
      studentName: student.studentName,
      email: student.email,
      course: student.course,
      batch: student.batch,
      classTime: batchInfo?.classTime,
      roomNumber: batchInfo?.roomNumber,
      totalFee: student.totalFee,
      paidFee: student.paidFee,
      remainingFee: student.remainingFee,
      attendance: {
        totalClasses,
        presentCount,
        absentCount,
        percentage: attendancePercentage,
      },
      recentQuizResult: recentQuiz
        ? {
            quizTitle: recentQuiz.quizTitle,
            score: recentQuiz.score,
            totalQuestions: recentQuiz.totalQuestions,
            percentage: recentQuiz.percentage,
            result: recentQuiz.result,
            submittedAt: recentQuiz.submittedAt,
          }
        : null,
      availableQuizzesCount,
      availableCourses,
    };

    const aiResponse = await askAcademyAi(message.trim(), studentContext);
    res.json(aiResponse);
  } catch (error) {
    console.error('AI chat route error:', error);
    res.json({
      answer: 'AI Support is temporarily unavailable. Please create a support ticket or contact the academy.',
      showTicketButton: true,
      isFallback: true,
    });
  }
});

export default router;
