import {
  getInitialSeedData,
  UserItem,
  StudentItem,
  TeacherItem,
  CourseItem,
  BatchItem,
  AttendanceItem,
  FeeItem,
  QuizItem,
  QuizResultItem,
  SupportTicketItem,
} from '../seed/initialSeedData.ts';
import { isMongoConnected } from '../config/db.ts';
import {
  UserModel,
  StudentModel,
  TeacherModel,
  CourseModel,
  BatchModel,
  AttendanceModel,
  FeeModel,
  QuizModel,
  QuizResultModel,
  SupportTicketModel,
} from '../models/index.ts';

// In-memory collections state
let seed = getInitialSeedData();
let users: UserItem[] = [...seed.users];
let students: StudentItem[] = [...seed.students];
let teachers: TeacherItem[] = [...seed.teachers];
let courses: CourseItem[] = [...seed.courses];
let batches: BatchItem[] = [...seed.batches];
let attendance: AttendanceItem[] = [...seed.attendance];
let fees: FeeItem[] = [...seed.fees];
let quizzes: QuizItem[] = [...seed.quizzes];
let quizResults: QuizResultItem[] = [...seed.quizResults];
let supportTickets: SupportTicketItem[] = [...seed.supportTickets];

let ticketCounter = 1003;

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const store = {
  // Sync seed into MongoDB if connected and empty
  async initMongoSync() {
    if (!isMongoConnected()) return;
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('🌱 [Database] Seeding initial data into connected MongoDB...');
        await UserModel.insertMany(users);
        await StudentModel.insertMany(students);
        await TeacherModel.insertMany(teachers);
        await CourseModel.insertMany(courses);
        await BatchModel.insertMany(batches);
        await AttendanceModel.insertMany(attendance);
        await FeeModel.insertMany(fees);
        await QuizModel.insertMany(quizzes);
        await QuizResultModel.insertMany(quizResults);
        await SupportTicketModel.insertMany(supportTickets);
        console.log('✅ [Database] MongoDB seed completed successfully.');
      }
    } catch (err) {
      console.warn('⚠️ [Database] Error syncing seed to MongoDB:', (err as Error).message);
    }
  },

  // USERS
  users: {
    async find(filter: Partial<UserItem> = {}): Promise<UserItem[]> {
      if (isMongoConnected()) {
        try {
          return await UserModel.find(filter).lean();
        } catch (_) {}
      }
      return users.filter(u => {
        for (const key in filter) {
          if ((u as any)[key] !== (filter as any)[key]) return false;
        }
        return true;
      });
    },
    async findOne(filter: Partial<UserItem>): Promise<UserItem | null> {
      if (isMongoConnected()) {
        try {
          return await UserModel.findOne(filter).lean();
        } catch (_) {}
      }
      const list = await this.find(filter);
      return list[0] || null;
    },
    async findById(id: string): Promise<UserItem | null> {
      if (isMongoConnected()) {
        try {
          return await UserModel.findById(id).lean();
        } catch (_) {}
      }
      return users.find(u => u._id === id) || null;
    },
    async create(data: Omit<UserItem, '_id' | 'createdAt'>): Promise<UserItem> {
      const newItem: UserItem = {
        _id: generateId('usr'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await UserModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      users.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<UserItem>): Promise<UserItem | null> {
      if (isMongoConnected()) {
        try {
          return await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      users[idx] = { ...users[idx], ...updates };
      return users[idx];
    },
  },

  // STUDENTS
  students: {
    async find(query: { search?: string; course?: string; batch?: string } = {}): Promise<StudentItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (query.course) filter.course = query.course;
          if (query.batch) filter.batch = query.batch;
          if (query.search) {
            filter.$or = [
              { studentName: { $regex: query.search, $options: 'i' } },
              { email: { $regex: query.search, $options: 'i' } },
              { phone: { $regex: query.search, $options: 'i' } },
            ];
          }
          return await StudentModel.find(filter).lean();
        } catch (_) {}
      }
      return students.filter(s => {
        if (query.course && s.course !== query.course) return false;
        if (query.batch && s.batch !== query.batch) return false;
        if (query.search) {
          const term = query.search.toLowerCase();
          const match =
            s.studentName.toLowerCase().includes(term) ||
            s.email.toLowerCase().includes(term) ||
            s.phone.includes(term) ||
            s.course.toLowerCase().includes(term) ||
            s.batch.toLowerCase().includes(term);
          if (!match) return false;
        }
        return true;
      });
    },
    async findById(id: string): Promise<StudentItem | null> {
      if (isMongoConnected()) {
        try {
          return await StudentModel.findById(id).lean();
        } catch (_) {}
      }
      return students.find(s => s._id === id) || null;
    },
    async findByEmail(email: string): Promise<StudentItem | null> {
      if (isMongoConnected()) {
        try {
          return await StudentModel.findOne({ email: email.toLowerCase() }).lean();
        } catch (_) {}
      }
      return students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async findByUserId(userId: string): Promise<StudentItem | null> {
      if (isMongoConnected()) {
        try {
          return await StudentModel.findOne({ userId }).lean();
        } catch (_) {}
      }
      return students.find(s => s.userId === userId) || null;
    },
    async create(data: Omit<StudentItem, '_id' | 'createdAt'>): Promise<StudentItem> {
      const remainingFee = Math.max(0, Number(data.totalFee) - Number(data.paidFee || 0));
      const newItem: StudentItem = {
        _id: generateId('std'),
        ...data,
        totalFee: Number(data.totalFee),
        paidFee: Number(data.paidFee || 0),
        remainingFee,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await StudentModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      students.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<StudentItem>): Promise<StudentItem | null> {
      if (updates.totalFee !== undefined || updates.paidFee !== undefined) {
        const existing = await this.findById(id);
        const total = Number(updates.totalFee !== undefined ? updates.totalFee : (existing?.totalFee || 0));
        const paid = Number(updates.paidFee !== undefined ? updates.paidFee : (existing?.paidFee || 0));
        updates.remainingFee = Math.max(0, total - paid);
      }
      if (isMongoConnected()) {
        try {
          return await StudentModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = students.findIndex(s => s._id === id);
      if (idx === -1) return null;
      students[idx] = { ...students[idx], ...updates };
      return students[idx];
    },
    async findByIdAndDelete(id: string): Promise<boolean> {
      if (isMongoConnected()) {
        try {
          await StudentModel.findByIdAndDelete(id);
        } catch (_) {}
      }
      const initialLength = students.length;
      students = students.filter(s => s._id !== id);
      return students.length < initialLength;
    },
    async count(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await StudentModel.countDocuments();
        } catch (_) {}
      }
      return students.length;
    },
  },

  // TEACHERS
  teachers: {
    async find(search?: string): Promise<TeacherItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (search) {
            filter.$or = [
              { teacherName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { subject: { $regex: search, $options: 'i' } },
            ];
          }
          return await TeacherModel.find(filter).lean();
        } catch (_) {}
      }
      if (!search) return teachers;
      const term = search.toLowerCase();
      return teachers.filter(t =>
        t.teacherName.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term)
      );
    },
    async findById(id: string): Promise<TeacherItem | null> {
      if (isMongoConnected()) {
        try {
          return await TeacherModel.findById(id).lean();
        } catch (_) {}
      }
      return teachers.find(t => t._id === id) || null;
    },
    async findByEmail(email: string): Promise<TeacherItem | null> {
      if (isMongoConnected()) {
        try {
          return await TeacherModel.findOne({ email: email.toLowerCase() }).lean();
        } catch (_) {}
      }
      return teachers.find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async create(data: Omit<TeacherItem, '_id' | 'createdAt'>): Promise<TeacherItem> {
      const newItem: TeacherItem = {
        _id: generateId('tch'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await TeacherModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      teachers.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<TeacherItem>): Promise<TeacherItem | null> {
      if (isMongoConnected()) {
        try {
          return await TeacherModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = teachers.findIndex(t => t._id === id);
      if (idx === -1) return null;
      teachers[idx] = { ...teachers[idx], ...updates };
      return teachers[idx];
    },
    async findByIdAndDelete(id: string): Promise<boolean> {
      if (isMongoConnected()) {
        try {
          await TeacherModel.findByIdAndDelete(id);
        } catch (_) {}
      }
      const initialLength = teachers.length;
      teachers = teachers.filter(t => t._id !== id);
      return teachers.length < initialLength;
    },
    async count(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await TeacherModel.countDocuments();
        } catch (_) {}
      }
      return teachers.length;
    },
  },

  // COURSES
  courses: {
    async find(search?: string): Promise<CourseItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (search) {
            filter.$or = [
              { courseName: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ];
          }
          return await CourseModel.find(filter).lean();
        } catch (_) {}
      }
      if (!search) return courses;
      const term = search.toLowerCase();
      return courses.filter(c =>
        c.courseName.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    },
    async findById(id: string): Promise<CourseItem | null> {
      if (isMongoConnected()) {
        try {
          return await CourseModel.findById(id).lean();
        } catch (_) {}
      }
      return courses.find(c => c._id === id) || null;
    },
    async create(data: Omit<CourseItem, '_id' | 'createdAt'>): Promise<CourseItem> {
      const newItem: CourseItem = {
        _id: generateId('crs'),
        ...data,
        fee: Number(data.fee),
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await CourseModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      courses.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<CourseItem>): Promise<CourseItem | null> {
      if (updates.fee !== undefined) updates.fee = Number(updates.fee);
      if (isMongoConnected()) {
        try {
          return await CourseModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = courses.findIndex(c => c._id === id);
      if (idx === -1) return null;
      courses[idx] = { ...courses[idx], ...updates };
      return courses[idx];
    },
    async findByIdAndDelete(id: string): Promise<boolean> {
      if (isMongoConnected()) {
        try {
          await CourseModel.findByIdAndDelete(id);
        } catch (_) {}
      }
      const len = courses.length;
      courses = courses.filter(c => c._id !== id);
      return courses.length < len;
    },
    async count(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await CourseModel.countDocuments();
        } catch (_) {}
      }
      return courses.length;
    },
  },

  // BATCHES
  batches: {
    async find(search?: string): Promise<BatchItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (search) {
            filter.$or = [
              { batchName: { $regex: search, $options: 'i' } },
              { course: { $regex: search, $options: 'i' } },
              { teacher: { $regex: search, $options: 'i' } },
            ];
          }
          return await BatchModel.find(filter).lean();
        } catch (_) {}
      }
      if (!search) return batches;
      const term = search.toLowerCase();
      return batches.filter(b =>
        b.batchName.toLowerCase().includes(term) ||
        b.course.toLowerCase().includes(term) ||
        b.teacher.toLowerCase().includes(term)
      );
    },
    async findById(id: string): Promise<BatchItem | null> {
      if (isMongoConnected()) {
        try {
          return await BatchModel.findById(id).lean();
        } catch (_) {}
      }
      return batches.find(b => b._id === id) || null;
    },
    async create(data: Omit<BatchItem, '_id' | 'createdAt'>): Promise<BatchItem> {
      const newItem: BatchItem = {
        _id: generateId('batch'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await BatchModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      batches.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<BatchItem>): Promise<BatchItem | null> {
      if (isMongoConnected()) {
        try {
          return await BatchModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = batches.findIndex(b => b._id === id);
      if (idx === -1) return null;
      batches[idx] = { ...batches[idx], ...updates };
      return batches[idx];
    },
    async findByIdAndDelete(id: string): Promise<boolean> {
      if (isMongoConnected()) {
        try {
          await BatchModel.findByIdAndDelete(id);
        } catch (_) {}
      }
      const len = batches.length;
      batches = batches.filter(b => b._id !== id);
      return batches.length < len;
    },
    async count(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await BatchModel.countDocuments();
        } catch (_) {}
      }
      return batches.length;
    },
  },

  // ATTENDANCE
  attendance: {
    async find(filter: { batch?: string; date?: string; studentId?: string } = {}): Promise<AttendanceItem[]> {
      if (isMongoConnected()) {
        try {
          const query: any = {};
          if (filter.batch) query.batch = filter.batch;
          if (filter.date) query.date = filter.date;
          if (filter.studentId) query['records.studentId'] = filter.studentId;
          return await AttendanceModel.find(query).lean();
        } catch (_) {}
      }
      return attendance.filter(a => {
        if (filter.batch && a.batch !== filter.batch) return false;
        if (filter.date && a.date !== filter.date) return false;
        if (filter.studentId && !a.records.some(r => r.studentId === filter.studentId)) return false;
        return true;
      });
    },
    async findOne(filter: { batch: string; date: string }): Promise<AttendanceItem | null> {
      if (isMongoConnected()) {
        try {
          return await AttendanceModel.findOne(filter).lean();
        } catch (_) {}
      }
      return attendance.find(a => a.batch === filter.batch && a.date === filter.date) || null;
    },
    async create(data: Omit<AttendanceItem, '_id' | 'createdAt'>): Promise<AttendanceItem> {
      const newItem: AttendanceItem = {
        _id: generateId('att'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await AttendanceModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      attendance.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<AttendanceItem>): Promise<AttendanceItem | null> {
      if (isMongoConnected()) {
        try {
          return await AttendanceModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = attendance.findIndex(a => a._id === id);
      if (idx === -1) return null;
      attendance[idx] = { ...attendance[idx], ...updates };
      return attendance[idx];
    },
  },

  // FEES
  fees: {
    async find(search?: string): Promise<FeeItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (search) {
            filter.$or = [
              { studentName: { $regex: search, $options: 'i' } },
              { studentEmail: { $regex: search, $options: 'i' } },
              { paymentMethod: { $regex: search, $options: 'i' } },
            ];
          }
          return await FeeModel.find(filter).sort({ createdAt: -1 }).lean();
        } catch (_) {}
      }
      let list = [...fees].reverse();
      if (!search) return list;
      const term = search.toLowerCase();
      return list.filter(f =>
        f.studentName.toLowerCase().includes(term) ||
        f.studentEmail.toLowerCase().includes(term) ||
        f.paymentMethod.toLowerCase().includes(term)
      );
    },
    async findByStudentId(studentId: string): Promise<FeeItem[]> {
      if (isMongoConnected()) {
        try {
          return await FeeModel.find({ studentId }).sort({ createdAt: -1 }).lean();
        } catch (_) {}
      }
      return fees.filter(f => f.studentId === studentId);
    },
    async create(data: Omit<FeeItem, '_id' | 'createdAt'>): Promise<FeeItem> {
      const newItem: FeeItem = {
        _id: generateId('fee'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await FeeModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      fees.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<FeeItem>): Promise<FeeItem | null> {
      if (isMongoConnected()) {
        try {
          return await FeeModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = fees.findIndex(f => f._id === id);
      if (idx === -1) return null;
      fees[idx] = { ...fees[idx], ...updates };
      return fees[idx];
    },
  },

  // QUIZZES
  quizzes: {
    async find(search?: string, course?: string): Promise<QuizItem[]> {
      if (isMongoConnected()) {
        try {
          const filter: any = {};
          if (course) filter.course = course;
          if (search) {
            filter.$or = [
              { quizTitle: { $regex: search, $options: 'i' } },
              { course: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ];
          }
          return await QuizModel.find(filter).lean();
        } catch (_) {}
      }
      return quizzes.filter(q => {
        if (course && q.course !== course) return false;
        if (search) {
          const term = search.toLowerCase();
          return q.quizTitle.toLowerCase().includes(term) || q.course.toLowerCase().includes(term);
        }
        return true;
      });
    },
    async findById(id: string): Promise<QuizItem | null> {
      if (isMongoConnected()) {
        try {
          return await QuizModel.findById(id).lean();
        } catch (_) {}
      }
      return quizzes.find(q => q._id === id) || null;
    },
    async create(data: Omit<QuizItem, '_id' | 'createdAt'>): Promise<QuizItem> {
      const newItem: QuizItem = {
        _id: generateId('quiz'),
        ...data,
        timeLimit: Number(data.timeLimit) || 10,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await QuizModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      quizzes.push(newItem);
      return newItem;
    },
    async findByIdAndUpdate(id: string, updates: Partial<QuizItem>): Promise<QuizItem | null> {
      if (updates.timeLimit) updates.timeLimit = Number(updates.timeLimit);
      if (isMongoConnected()) {
        try {
          return await QuizModel.findByIdAndUpdate(id, updates, { new: true }).lean();
        } catch (_) {}
      }
      const idx = quizzes.findIndex(q => q._id === id);
      if (idx === -1) return null;
      quizzes[idx] = { ...quizzes[idx], ...updates };
      return quizzes[idx];
    },
    async findByIdAndDelete(id: string): Promise<boolean> {
      if (isMongoConnected()) {
        try {
          await QuizModel.findByIdAndDelete(id);
        } catch (_) {}
      }
      const len = quizzes.length;
      quizzes = quizzes.filter(q => q._id !== id);
      return quizzes.length < len;
    },
    async count(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await QuizModel.countDocuments();
        } catch (_) {}
      }
      return quizzes.length;
    },
  },

  // QUIZ RESULTS
  quizResults: {
    async find(filter: { quizId?: string; studentId?: string } = {}): Promise<QuizResultItem[]> {
      if (isMongoConnected()) {
        try {
          return await QuizResultModel.find(filter).sort({ createdAt: -1 }).lean();
        } catch (_) {}
      }
      let list = [...quizResults].reverse();
      return list.filter(r => {
        if (filter.quizId && r.quizId !== filter.quizId) return false;
        if (filter.studentId && r.studentId !== filter.studentId) return false;
        return true;
      });
    },
    async findOne(filter: { quizId: string; studentId: string }): Promise<QuizResultItem | null> {
      if (isMongoConnected()) {
        try {
          return await QuizResultModel.findOne(filter).lean();
        } catch (_) {}
      }
      return quizResults.find(r => r.quizId === filter.quizId && r.studentId === filter.studentId) || null;
    },
    async create(data: Omit<QuizResultItem, '_id' | 'createdAt'>): Promise<QuizResultItem> {
      const newItem: QuizResultItem = {
        _id: generateId('res'),
        ...data,
        createdAt: new Date().toISOString(),
      };
      if (isMongoConnected()) {
        try {
          const doc = await QuizResultModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      quizResults.push(newItem);
      return newItem;
    },
  },

  // SUPPORT TICKETS
  supportTickets: {
    async find(filter: { studentId?: string; status?: string; search?: string } = {}): Promise<SupportTicketItem[]> {
      if (isMongoConnected()) {
        try {
          const query: any = {};
          if (filter.studentId) query['student.id'] = filter.studentId;
          if (filter.status && filter.status !== 'All') query.status = filter.status;
          if (filter.search) {
            query.$or = [
              { ticketId: { $regex: filter.search, $options: 'i' } },
              { subject: { $regex: filter.search, $options: 'i' } },
              { message: { $regex: filter.search, $options: 'i' } },
            ];
          }
          return await SupportTicketModel.find(query).sort({ createdAt: -1 }).lean();
        } catch (_) {}
      }
      let list = [...supportTickets].reverse();
      return list.filter(t => {
        if (filter.studentId && t.student.id !== filter.studentId) return false;
        if (filter.status && filter.status !== 'All' && t.status !== filter.status) return false;
        if (filter.search) {
          const term = filter.search.toLowerCase();
          const match =
            t.ticketId.toLowerCase().includes(term) ||
            t.subject.toLowerCase().includes(term) ||
            t.message.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term) ||
            t.student.name.toLowerCase().includes(term);
          if (!match) return false;
        }
        return true;
      });
    },
    async findById(id: string): Promise<SupportTicketItem | null> {
      if (isMongoConnected()) {
        try {
          return await SupportTicketModel.findById(id).lean();
        } catch (_) {}
      }
      return supportTickets.find(t => t._id === id || t.ticketId === id) || null;
    },
    async create(data: Omit<SupportTicketItem, '_id' | 'ticketId' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<SupportTicketItem> {
      const ticketId = `TICKET-${ticketCounter++}`;
      const now = new Date().toISOString();
      const newItem: SupportTicketItem = {
        _id: generateId('tkt'),
        ticketId,
        ...data,
        replies: [],
        createdAt: now,
        updatedAt: now,
      };
      if (isMongoConnected()) {
        try {
          const doc = await SupportTicketModel.create(newItem);
          return doc.toObject();
        } catch (_) {}
      }
      supportTickets.push(newItem);
      return newItem;
    },
    async addReply(ticketId: string, reply: { sender: string; senderRole: 'admin' | 'teacher' | 'student'; message: string }): Promise<SupportTicketItem | null> {
      const now = new Date().toISOString();
      const replyObj = {
        id: generateId('rep'),
        ...reply,
        createdAt: now,
      };
      if (isMongoConnected()) {
        try {
          return await SupportTicketModel.findOneAndUpdate(
            { $or: [{ _id: ticketId }, { ticketId }] },
            { $push: { replies: replyObj }, $set: { updatedAt: new Date() } },
            { new: true }
          ).lean();
        } catch (_) {}
      }
      const ticket = supportTickets.find(t => t._id === ticketId || t.ticketId === ticketId);
      if (!ticket) return null;
      ticket.replies.push(replyObj);
      ticket.updatedAt = now;
      return ticket;
    },
    async updateStatus(ticketId: string, status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed'): Promise<SupportTicketItem | null> {
      const now = new Date().toISOString();
      if (isMongoConnected()) {
        try {
          return await SupportTicketModel.findOneAndUpdate(
            { $or: [{ _id: ticketId }, { ticketId }] },
            { $set: { status, updatedAt: new Date() } },
            { new: true }
          ).lean();
        } catch (_) {}
      }
      const ticket = supportTickets.find(t => t._id === ticketId || t.ticketId === ticketId);
      if (!ticket) return null;
      ticket.status = status;
      ticket.updatedAt = now;
      return ticket;
    },
    async countOpen(): Promise<number> {
      if (isMongoConnected()) {
        try {
          return await SupportTicketModel.countDocuments({ status: { $in: ['Pending', 'In Progress'] } });
        } catch (_) {}
      }
      return supportTickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    },
  },
};
