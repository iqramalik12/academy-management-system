import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student', required: true },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IStudent extends Document {
  studentName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  course: string;
  batch: string;
  admissionDate: string;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  userId?: string;
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  studentName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  address: { type: String, default: '' },
  course: { type: String, required: true },
  batch: { type: String, required: true },
  admissionDate: { type: String, required: true },
  totalFee: { type: Number, required: true, min: 0 },
  paidFee: { type: Number, required: true, min: 0, default: 0 },
  remainingFee: { type: Number, required: true, min: 0 },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const StudentModel = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export interface ITeacher extends Document {
  teacherName: string;
  email: string;
  phone: string;
  subject: string;
  joiningDate: string;
  userId?: string;
  createdAt: Date;
}

const TeacherSchema = new Schema<ITeacher>({
  teacherName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  joiningDate: { type: String, required: true },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const TeacherModel = mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export interface ICourse extends Document {
  courseName: string;
  description: string;
  duration: string;
  fee: number;
  assignedTeacher: string;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  courseName: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  duration: { type: String, required: true },
  fee: { type: Number, required: true, min: 0 },
  assignedTeacher: { type: String, default: 'Unassigned' },
  createdAt: { type: Date, default: Date.now },
});

export const CourseModel = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export interface IBatch extends Document {
  batchName: string;
  course: string;
  teacher: string;
  startDate: string;
  classTime: string;
  roomNumber: string;
  createdAt: Date;
}

const BatchSchema = new Schema<IBatch>({
  batchName: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  teacher: { type: String, required: true },
  startDate: { type: String, required: true },
  classTime: { type: String, required: true },
  roomNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const BatchModel = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

export interface IAttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent';
}

export interface IAttendance extends Document {
  batch: string;
  date: string;
  records: IAttendanceRecord[];
  markedBy: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  batch: { type: String, required: true },
  date: { type: String, required: true },
  records: [{
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
  }],
  markedBy: { type: String, default: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate attendance for the same batch and date
AttendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export interface IFee extends Document {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank' | 'Easypaisa' | 'JazzCash';
  createdAt: Date;
}

const FeeSchema = new Schema<IFee>({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  totalFee: { type: Number, required: true },
  paidFee: { type: Number, required: true },
  remainingFee: { type: Number, required: true },
  paymentAmount: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank', 'Easypaisa', 'JazzCash'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FeeModel = mongoose.models.Fee || mongoose.model<IFee>('Fee', FeeSchema);

export interface IQuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface IQuiz extends Document {
  quizTitle: string;
  course: string;
  description: string;
  timeLimit: number; // in minutes
  questions: IQuizQuestion[];
  createdBy: string;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  quizTitle: { type: String, required: true },
  course: { type: String, required: true },
  description: { type: String, default: '' },
  timeLimit: { type: Number, required: true, default: 10 },
  questions: [{
    question: { type: String, required: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  }],
  createdBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

export const QuizModel = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export interface IQuizResult extends Document {
  quizId: string;
  quizTitle: string;
  course: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  result: 'Passed' | 'Failed';
  submittedAt: string;
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  course: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  result: { type: String, enum: ['Passed', 'Failed'], required: true },
  submittedAt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid duplicate submissions per student per quiz
QuizResultSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export const QuizResultModel = mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);

export interface ISupportTicketReply {
  id?: string;
  sender: string;
  senderRole: 'admin' | 'teacher' | 'student';
  message: string;
  createdAt: string;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course?: string;
  subject: string;
  category: 'Fee Issue' | 'Attendance Issue' | 'Course Query' | 'Teacher Query' | 'Quiz Issue' | 'Technical Problem' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  message: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  replies: ISupportTicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>({
  ticketId: { type: String, required: true, unique: true },
  student: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  course: { type: String, default: '' },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['Fee Issue', 'Attendance Issue', 'Course Query', 'Teacher Query', 'Quiz Issue', 'Technical Problem', 'Other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    required: true,
  },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    default: 'Pending',
    required: true,
  },
  replies: [{
    sender: { type: String, required: true },
    senderRole: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    message: { type: String, required: true },
    createdAt: { type: String, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
