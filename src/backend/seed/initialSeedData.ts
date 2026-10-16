import bcrypt from 'bcryptjs';

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  createdAt: string;
}

export interface StudentItem {
  _id: string;
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
  createdAt: string;
}

export interface TeacherItem {
  _id: string;
  teacherName: string;
  email: string;
  phone: string;
  subject: string;
  joiningDate: string;
  userId?: string;
  createdAt: string;
}

export interface CourseItem {
  _id: string;
  courseName: string;
  description: string;
  duration: string;
  fee: number;
  assignedTeacher: string;
  createdAt: string;
}

export interface BatchItem {
  _id: string;
  batchName: string;
  course: string;
  teacher: string;
  startDate: string;
  classTime: string;
  roomNumber: string;
  createdAt: string;
}

export interface AttendanceItem {
  _id: string;
  batch: string;
  date: string;
  records: Array<{
    studentId: string;
    studentName: string;
    status: 'Present' | 'Absent';
  }>;
  markedBy: string;
  createdAt: string;
}

export interface FeeItem {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank' | 'Easypaisa' | 'JazzCash';
  createdAt: string;
}

export interface QuizItem {
  _id: string;
  quizTitle: string;
  course: string;
  description: string;
  timeLimit: number;
  questions: Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
  }>;
  createdBy: string;
  createdAt: string;
}

export interface QuizResultItem {
  _id: string;
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
  createdAt: string;
}

export interface SupportTicketItem {
  _id: string;
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
  replies: Array<{
    id?: string;
    sender: string;
    senderRole: 'admin' | 'teacher' | 'student';
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Generate pre-hashed password for "password123"
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export function getInitialSeedData() {
  const users: UserItem[] = [
    {
      _id: 'usr_admin_1',
      name: 'Dr. Sarah Jenkins',
      email: 'admin@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'admin',
      phone: '+1 555-0101',
      createdAt: '2026-01-10T08:00:00.000Z',
    },
    {
      _id: 'usr_teach_1',
      name: 'Prof. David Miller',
      email: 'teacher@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'teacher',
      phone: '+1 555-0102',
      createdAt: '2026-01-12T09:00:00.000Z',
    },
    {
      _id: 'usr_teach_2',
      name: 'Ms. Emily Vance',
      email: 'emily.vance@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'teacher',
      phone: '+1 555-0103',
      createdAt: '2026-01-15T09:30:00.000Z',
    },
    {
      _id: 'usr_stud_1',
      name: 'Alex Johnson',
      email: 'student@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0201',
      createdAt: '2026-02-01T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_2',
      name: 'Sophia Chen',
      email: 'sophia.c@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0202',
      createdAt: '2026-02-02T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_3',
      name: 'Michael Brown',
      email: 'michael.b@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0203',
      createdAt: '2026-02-03T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_4',
      name: 'Emma Davis',
      email: 'emma.d@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0204',
      createdAt: '2026-02-04T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_5',
      name: 'James Wilson',
      email: 'james.w@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0205',
      createdAt: '2026-02-05T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_6',
      name: 'Olivia Martinez',
      email: 'olivia.m@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0206',
      createdAt: '2026-02-06T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_7',
      name: 'Daniel Taylor',
      email: 'daniel.t@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0207',
      createdAt: '2026-02-07T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_8',
      name: 'Mia Anderson',
      email: 'mia.a@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0208',
      createdAt: '2026-02-08T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_9',
      name: 'Ethan Thomas',
      email: 'ethan.t@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0209',
      createdAt: '2026-02-09T10:00:00.000Z',
    },
    {
      _id: 'usr_stud_10',
      name: 'Ava Jackson',
      email: 'ava.j@academy.com',
      password: DEMO_PASSWORD_HASH,
      role: 'student',
      phone: '+1 555-0210',
      createdAt: '2026-02-10T10:00:00.000Z',
    },
  ];

  const teachers: TeacherItem[] = [
    {
      _id: 'tch_1',
      teacherName: 'Prof. David Miller',
      email: 'teacher@academy.com',
      phone: '+1 555-0102',
      subject: 'Full-Stack Web Development',
      joiningDate: '2025-08-15',
      userId: 'usr_teach_1',
      createdAt: '2026-01-12T09:00:00.000Z',
    },
    {
      _id: 'tch_2',
      teacherName: 'Ms. Emily Vance',
      email: 'emily.vance@academy.com',
      phone: '+1 555-0103',
      subject: 'Python & Data Science',
      joiningDate: '2025-09-01',
      userId: 'usr_teach_2',
      createdAt: '2026-01-15T09:30:00.000Z',
    },
  ];

  const courses: CourseItem[] = [
    {
      _id: 'crs_1',
      courseName: 'Full-Stack Web Development',
      description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB with modern architectural best practices.',
      duration: '16 Weeks',
      fee: 800,
      assignedTeacher: 'Prof. David Miller',
      createdAt: '2026-01-15T10:00:00.000Z',
    },
    {
      _id: 'crs_2',
      courseName: 'Python & Data Science Essentials',
      description: 'Comprehensive Python programming covering Pandas, NumPy, Data Visualization, and basic AI fundamentals.',
      duration: '12 Weeks',
      fee: 750,
      assignedTeacher: 'Ms. Emily Vance',
      createdAt: '2026-01-16T10:00:00.000Z',
    },
    {
      _id: 'crs_3',
      courseName: 'UI/UX Design & Frontend Prototyping',
      description: 'User-centered design principles, wireframing in Figma, accessibility standards, and responsive frontend UI.',
      duration: '8 Weeks',
      fee: 550,
      assignedTeacher: 'Prof. David Miller',
      createdAt: '2026-01-18T10:00:00.000Z',
    },
  ];

  const batches: BatchItem[] = [
    {
      _id: 'batch_1',
      batchName: 'Web Dev Morning (Batch-A)',
      course: 'Full-Stack Web Development',
      teacher: 'Prof. David Miller',
      startDate: '2026-02-15',
      classTime: '09:00 AM - 11:00 AM (Mon - Thu)',
      roomNumber: 'Lab 201',
      createdAt: '2026-01-20T10:00:00.000Z',
    },
    {
      _id: 'batch_2',
      batchName: 'Data Science Evening (Batch-B)',
      course: 'Python & Data Science Essentials',
      teacher: 'Ms. Emily Vance',
      startDate: '2026-02-20',
      classTime: '05:00 PM - 07:00 PM (Mon - Thu)',
      roomNumber: 'Hall 105',
      createdAt: '2026-01-22T10:00:00.000Z',
    },
  ];

  const students: StudentItem[] = [
    {
      _id: 'std_1',
      studentName: 'Alex Johnson',
      email: 'student@academy.com',
      phone: '+1 555-0201',
      gender: 'Male',
      address: '742 Evergreen Terrace, Springfield',
      course: 'Full-Stack Web Development',
      batch: 'Web Dev Morning (Batch-A)',
      admissionDate: '2026-02-01',
      totalFee: 800,
      paidFee: 600,
      remainingFee: 200,
      userId: 'usr_stud_1',
      createdAt: '2026-02-01T10:00:00.000Z',
    },
    {
      _id: 'std_2',
      studentName: 'Sophia Chen',
      email: 'sophia.c@academy.com',
      phone: '+1 555-0202',
      gender: 'Female',
      address: '124 Conch Street, Pacific Grove',
      course: 'Full-Stack Web Development',
      batch: 'Web Dev Morning (Batch-A)',
      admissionDate: '2026-02-02',
      totalFee: 800,
      paidFee: 800,
      remainingFee: 0,
      userId: 'usr_stud_2',
      createdAt: '2026-02-02T10:00:00.000Z',
    },
    {
      _id: 'std_3',
      studentName: 'Michael Brown',
      email: 'michael.b@academy.com',
      phone: '+1 555-0203',
      gender: 'Male',
      address: '42 Wallaby Way, Sydney Park',
      course: 'Full-Stack Web Development',
      batch: 'Web Dev Morning (Batch-A)',
      admissionDate: '2026-02-03',
      totalFee: 800,
      paidFee: 400,
      remainingFee: 400,
      userId: 'usr_stud_3',
      createdAt: '2026-02-03T10:00:00.000Z',
    },
    {
      _id: 'std_4',
      studentName: 'Emma Davis',
      email: 'emma.d@academy.com',
      phone: '+1 555-0204',
      gender: 'Female',
      address: '221B Baker St, London City',
      course: 'Full-Stack Web Development',
      batch: 'Web Dev Morning (Batch-A)',
      admissionDate: '2026-02-04',
      totalFee: 800,
      paidFee: 800,
      remainingFee: 0,
      userId: 'usr_stud_4',
      createdAt: '2026-02-04T10:00:00.000Z',
    },
    {
      _id: 'std_5',
      studentName: 'James Wilson',
      email: 'james.w@academy.com',
      phone: '+1 555-0205',
      gender: 'Male',
      address: '10 Downing Court, Metro',
      course: 'Full-Stack Web Development',
      batch: 'Web Dev Morning (Batch-A)',
      admissionDate: '2026-02-05',
      totalFee: 800,
      paidFee: 500,
      remainingFee: 300,
      userId: 'usr_stud_5',
      createdAt: '2026-02-05T10:00:00.000Z',
    },
    {
      _id: 'std_6',
      studentName: 'Olivia Martinez',
      email: 'olivia.m@academy.com',
      phone: '+1 555-0206',
      gender: 'Female',
      address: '350 Fifth Avenue, New York',
      course: 'Python & Data Science Essentials',
      batch: 'Data Science Evening (Batch-B)',
      admissionDate: '2026-02-06',
      totalFee: 750,
      paidFee: 750,
      remainingFee: 0,
      userId: 'usr_stud_6',
      createdAt: '2026-02-06T10:00:00.000Z',
    },
    {
      _id: 'std_7',
      studentName: 'Daniel Taylor',
      email: 'daniel.t@academy.com',
      phone: '+1 555-0207',
      gender: 'Male',
      address: '88 King Street, Toronto West',
      course: 'Python & Data Science Essentials',
      batch: 'Data Science Evening (Batch-B)',
      admissionDate: '2026-02-07',
      totalFee: 750,
      paidFee: 400,
      remainingFee: 350,
      userId: 'usr_stud_7',
      createdAt: '2026-02-07T10:00:00.000Z',
    },
    {
      _id: 'std_8',
      studentName: 'Mia Anderson',
      email: 'mia.a@academy.com',
      phone: '+1 555-0208',
      gender: 'Female',
      address: '15 High Street, Edinburgh',
      course: 'Python & Data Science Essentials',
      batch: 'Data Science Evening (Batch-B)',
      admissionDate: '2026-02-08',
      totalFee: 750,
      paidFee: 750,
      remainingFee: 0,
      userId: 'usr_stud_8',
      createdAt: '2026-02-08T10:00:00.000Z',
    },
    {
      _id: 'std_9',
      studentName: 'Ethan Thomas',
      email: 'ethan.t@academy.com',
      phone: '+1 555-0209',
      gender: 'Male',
      address: '77 Ocean Drive, Miami Beach',
      course: 'Python & Data Science Essentials',
      batch: 'Data Science Evening (Batch-B)',
      admissionDate: '2026-02-09',
      totalFee: 750,
      paidFee: 300,
      remainingFee: 450,
      userId: 'usr_stud_9',
      createdAt: '2026-02-09T10:00:00.000Z',
    },
    {
      _id: 'std_10',
      studentName: 'Ava Jackson',
      email: 'ava.j@academy.com',
      phone: '+1 555-0210',
      gender: 'Female',
      address: '101 Pine Boulevard, Seattle',
      course: 'Python & Data Science Essentials',
      batch: 'Data Science Evening (Batch-B)',
      admissionDate: '2026-02-10',
      totalFee: 750,
      paidFee: 750,
      remainingFee: 0,
      userId: 'usr_stud_10',
      createdAt: '2026-02-10T10:00:00.000Z',
    },
  ];

  const attendance: AttendanceItem[] = [
    {
      _id: 'att_1',
      batch: 'Web Dev Morning (Batch-A)',
      date: '2026-03-02',
      records: [
        { studentId: 'std_1', studentName: 'Alex Johnson', status: 'Present' },
        { studentId: 'std_2', studentName: 'Sophia Chen', status: 'Present' },
        { studentId: 'std_3', studentName: 'Michael Brown', status: 'Present' },
        { studentId: 'std_4', studentName: 'Emma Davis', status: 'Present' },
        { studentId: 'std_5', studentName: 'James Wilson', status: 'Absent' },
      ],
      markedBy: 'Prof. David Miller',
      createdAt: '2026-03-02T11:00:00.000Z',
    },
    {
      _id: 'att_2',
      batch: 'Web Dev Morning (Batch-A)',
      date: '2026-03-03',
      records: [
        { studentId: 'std_1', studentName: 'Alex Johnson', status: 'Present' },
        { studentId: 'std_2', studentName: 'Sophia Chen', status: 'Present' },
        { studentId: 'std_3', studentName: 'Michael Brown', status: 'Absent' },
        { studentId: 'std_4', studentName: 'Emma Davis', status: 'Present' },
        { studentId: 'std_5', studentName: 'James Wilson', status: 'Present' },
      ],
      markedBy: 'Prof. David Miller',
      createdAt: '2026-03-03T11:00:00.000Z',
    },
    {
      _id: 'att_3',
      batch: 'Web Dev Morning (Batch-A)',
      date: '2026-03-04',
      records: [
        { studentId: 'std_1', studentName: 'Alex Johnson', status: 'Present' },
        { studentId: 'std_2', studentName: 'Sophia Chen', status: 'Present' },
        { studentId: 'std_3', studentName: 'Michael Brown', status: 'Present' },
        { studentId: 'std_4', studentName: 'Emma Davis', status: 'Present' },
        { studentId: 'std_5', studentName: 'James Wilson', status: 'Present' },
      ],
      markedBy: 'Prof. David Miller',
      createdAt: '2026-03-04T11:00:00.000Z',
    },
    {
      _id: 'att_4',
      batch: 'Web Dev Morning (Batch-A)',
      date: '2026-03-05',
      records: [
        { studentId: 'std_1', studentName: 'Alex Johnson', status: 'Absent' },
        { studentId: 'std_2', studentName: 'Sophia Chen', status: 'Present' },
        { studentId: 'std_3', studentName: 'Michael Brown', status: 'Present' },
        { studentId: 'std_4', studentName: 'Emma Davis', status: 'Present' },
        { studentId: 'std_5', studentName: 'James Wilson', status: 'Present' },
      ],
      markedBy: 'Prof. David Miller',
      createdAt: '2026-03-05T11:00:00.000Z',
    },
    {
      _id: 'att_5',
      batch: 'Data Science Evening (Batch-B)',
      date: '2026-03-02',
      records: [
        { studentId: 'std_6', studentName: 'Olivia Martinez', status: 'Present' },
        { studentId: 'std_7', studentName: 'Daniel Taylor', status: 'Present' },
        { studentId: 'std_8', studentName: 'Mia Anderson', status: 'Present' },
        { studentId: 'std_9', studentName: 'Ethan Thomas', status: 'Present' },
        { studentId: 'std_10', studentName: 'Ava Jackson', status: 'Present' },
      ],
      markedBy: 'Ms. Emily Vance',
      createdAt: '2026-03-02T19:00:00.000Z',
    },
  ];

  const fees: FeeItem[] = [
    {
      _id: 'fee_1',
      studentId: 'std_1',
      studentName: 'Alex Johnson',
      studentEmail: 'student@academy.com',
      totalFee: 800,
      paidFee: 600,
      remainingFee: 200,
      paymentAmount: 600,
      paymentDate: '2026-02-01',
      paymentMethod: 'Bank',
      createdAt: '2026-02-01T10:15:00.000Z',
    },
    {
      _id: 'fee_2',
      studentId: 'std_2',
      studentName: 'Sophia Chen',
      studentEmail: 'sophia.c@academy.com',
      totalFee: 800,
      paidFee: 800,
      remainingFee: 0,
      paymentAmount: 800,
      paymentDate: '2026-02-02',
      paymentMethod: 'Easypaisa',
      createdAt: '2026-02-02T11:00:00.000Z',
    },
    {
      _id: 'fee_3',
      studentId: 'std_3',
      studentName: 'Michael Brown',
      studentEmail: 'michael.b@academy.com',
      totalFee: 800,
      paidFee: 400,
      remainingFee: 400,
      paymentAmount: 400,
      paymentDate: '2026-02-03',
      paymentMethod: 'Cash',
      createdAt: '2026-02-03T09:30:00.000Z',
    },
    {
      _id: 'fee_4',
      studentId: 'std_7',
      studentName: 'Daniel Taylor',
      studentEmail: 'daniel.t@academy.com',
      totalFee: 750,
      paidFee: 400,
      remainingFee: 350,
      paymentAmount: 400,
      paymentDate: '2026-02-07',
      paymentMethod: 'JazzCash',
      createdAt: '2026-02-07T12:00:00.000Z',
    },
  ];

  const quizzes: QuizItem[] = [
    {
      _id: 'quiz_1',
      quizTitle: 'HTML5 & CSS3 Core Fundamentals',
      course: 'Full-Stack Web Development',
      description: 'Assessment covering semantic HTML tags, modern CSS layout models (Flexbox & Grid), and responsive design principles.',
      timeLimit: 10,
      questions: [
        {
          question: 'What does HTML stand for?',
          optionA: 'Hyper Text Markup Language',
          optionB: 'High Text Machine Language',
          optionC: 'Hyper Tool Multi Language',
          optionD: 'Home Text Markup Language',
          correctAnswer: 'A',
        },
        {
          question: 'Which CSS property is used to create a flexible container layout?',
          optionA: 'float: left',
          optionB: 'display: flex',
          optionC: 'align-items: center',
          optionD: 'position: fixed',
          correctAnswer: 'B',
        },
        {
          question: 'Which HTML element is used to define semantic navigation links?',
          optionA: '<navigate>',
          optionB: '<links>',
          optionC: '<nav>',
          optionD: '<menu-bar>',
          correctAnswer: 'C',
        },
        {
          question: 'In the CSS Box Model, what sits immediately between the content and the border?',
          optionA: 'Margin',
          optionB: 'Padding',
          optionC: 'Outline',
          optionD: 'Gap',
          correctAnswer: 'B',
        },
        {
          question: 'Which HTML5 input type provides built-in browser email format validation?',
          optionA: 'type="text"',
          optionB: 'type="mail"',
          optionC: 'type="email"',
          optionD: 'type="address"',
          correctAnswer: 'C',
        },
      ],
      createdBy: 'Prof. David Miller',
      createdAt: '2026-02-25T10:00:00.000Z',
    },
    {
      _id: 'quiz_2',
      quizTitle: 'JavaScript ES6+ and DOM Manipulation',
      course: 'Full-Stack Web Development',
      description: 'Testing modern ES6 syntax, arrow functions, promises, array methods, and event handling.',
      timeLimit: 12,
      questions: [
        {
          question: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
          optionA: 'var',
          optionB: 'let',
          optionC: 'const',
          optionD: 'static',
          correctAnswer: 'C',
        },
        {
          question: 'What is the output of typeof null in JavaScript?',
          optionA: '"undefined"',
          optionB: '"object"',
          optionC: '"null"',
          optionD: '"boolean"',
          correctAnswer: 'B',
        },
        {
          question: 'Which method creates a new array populated with the results of calling a provided function on every element?',
          optionA: 'forEach()',
          optionB: 'map()',
          optionC: 'filter()',
          optionD: 'reduce()',
          correctAnswer: 'B',
        },
        {
          question: 'How do you handle asynchronous operations cleanly with modern JavaScript syntax?',
          optionA: 'try / catch with async / await',
          optionB: 'goto and label',
          optionC: 'sync / wait',
          optionD: 'setTimeout nesting only',
          correctAnswer: 'A',
        },
      ],
      createdBy: 'Prof. David Miller',
      createdAt: '2026-02-28T14:00:00.000Z',
    },
    {
      _id: 'quiz_3',
      quizTitle: 'Python Data Structures & Functions',
      course: 'Python & Data Science Essentials',
      description: 'Covers Python lists, dictionaries, tuples, sets, list comprehensions, and function definitions.',
      timeLimit: 15,
      questions: [
        {
          question: 'Which built-in Python collection type is ordered and immutable?',
          optionA: 'List',
          optionB: 'Dictionary',
          optionC: 'Tuple',
          optionD: 'Set',
          correctAnswer: 'C',
        },
        {
          question: 'Which keyword is used to create a function in Python?',
          optionA: 'function',
          optionB: 'def',
          optionC: 'func',
          optionD: 'define',
          correctAnswer: 'B',
        },
        {
          question: 'What is the correct syntax for a list comprehension squaring numbers from 0 to 4?',
          optionA: '[x^2 for x in range(5)]',
          optionB: '[x**2 for x in range(5)]',
          optionC: 'list(x**2, range(5))',
          optionD: '{x**2 in range(5)}',
          correctAnswer: 'B',
        },
      ],
      createdBy: 'Ms. Emily Vance',
      createdAt: '2026-03-01T15:00:00.000Z',
    },
  ];

  const quizResults: QuizResultItem[] = [
    {
      _id: 'res_1',
      quizId: 'quiz_1',
      quizTitle: 'HTML5 & CSS3 Core Fundamentals',
      course: 'Full-Stack Web Development',
      studentId: 'std_1',
      studentName: 'Alex Johnson',
      studentEmail: 'student@academy.com',
      totalQuestions: 5,
      correctAnswers: 4,
      wrongAnswers: 1,
      score: 4,
      percentage: 80,
      result: 'Passed',
      submittedAt: '2026-03-01T11:20:00.000Z',
      createdAt: '2026-03-01T11:20:00.000Z',
    },
    {
      _id: 'res_2',
      quizId: 'quiz_1',
      quizTitle: 'HTML5 & CSS3 Core Fundamentals',
      course: 'Full-Stack Web Development',
      studentId: 'std_2',
      studentName: 'Sophia Chen',
      studentEmail: 'sophia.c@academy.com',
      totalQuestions: 5,
      correctAnswers: 5,
      wrongAnswers: 0,
      score: 5,
      percentage: 100,
      result: 'Passed',
      submittedAt: '2026-03-01T11:30:00.000Z',
      createdAt: '2026-03-01T11:30:00.000Z',
    },
  ];

  const supportTickets: SupportTicketItem[] = [
    {
      _id: 'tkt_1',
      ticketId: 'TICKET-1001',
      student: {
        id: 'std_1',
        name: 'Alex Johnson',
        email: 'student@academy.com',
      },
      course: 'Full-Stack Web Development',
      subject: 'Inquiry regarding payment receipt for Bank Transfer',
      category: 'Fee Issue',
      priority: 'Medium',
      message: 'Hello, I submitted $600 via Bank transfer last week. Can you confirm if my remaining balance of $200 has an installment plan?',
      status: 'In Progress',
      replies: [
        {
          id: 'rep_1',
          sender: 'Dr. Sarah Jenkins',
          senderRole: 'admin',
          message: 'Hello Alex, your $600 payment was confirmed and recorded. You can pay the remaining $200 before the midterm exam.',
          createdAt: '2026-02-02T14:30:00.000Z',
        },
        {
          id: 'rep_2',
          sender: 'Alex Johnson',
          senderRole: 'student',
          message: 'Thank you Dr. Jenkins, that is very helpful!',
          createdAt: '2026-02-02T16:00:00.000Z',
        },
      ],
      createdAt: '2026-02-02T11:00:00.000Z',
      updatedAt: '2026-02-02T16:00:00.000Z',
    },
    {
      _id: 'tkt_2',
      ticketId: 'TICKET-1002',
      student: {
        id: 'std_3',
        name: 'Michael Brown',
        email: 'michael.b@academy.com',
      },
      course: 'Full-Stack Web Development',
      subject: 'Correction for attendance on March 3rd',
      category: 'Attendance Issue',
      priority: 'High',
      message: 'My attendance for Tuesday March 3rd was recorded as absent, but I attended the second half of the class after medical appointment.',
      status: 'Pending',
      replies: [],
      createdAt: '2026-03-03T16:00:00.000Z',
      updatedAt: '2026-03-03T16:00:00.000Z',
    },
  ];

  return {
    users,
    students,
    teachers,
    courses,
    batches,
    attendance,
    fees,
    quizzes,
    quizResults,
    supportTickets,
  };
}
