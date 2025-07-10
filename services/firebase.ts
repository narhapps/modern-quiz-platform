
import type { User, Subject, Question, QuizResult, Role } from '../types';

// In-memory database
let db = {
  users: [
    { id: 'admin1', name: 'Admin User', email: 'admin@quiz.com', role: 'admin', subjectsAccess: [] },
    { id: 'student1', name: 'Alice', email: 'alice@quiz.com', role: 'student', subjectsAccess: ['subj1'] },
    { id: 'student2', name: 'Bob', email: 'bob@quiz.com', role: 'student', subjectsAccess: [] },
  ] as User[],
  subjects: [
    { id: 'subj1', name: 'Modern History', description: 'A quiz on world history from the 18th century onwards.', timerEnabled: true, timerDuration: 15 },
    { id: 'subj2', name: 'React Fundamentals', description: 'Test your knowledge on the core concepts of React.', timerEnabled: false, timerDuration: 30 },
  ] as Subject[],
  questions: [
    { id: 'q1', subjectId: 'subj1', questionText: 'When did World War II end?', options: ['1942', '1945', '1950', '1939'], correctAnswer: '1945' },
    { id: 'q2', subjectId: 'subj1', questionText: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], correctAnswer: 'George Washington' },
    { id: 'q3', subjectId: 'subj2', questionText: 'What is JSX?', options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS preprocessor', 'A database query language'], correctAnswer: 'A syntax extension for JavaScript' },
    { id: 'q4', subjectId: 'subj2', questionText: 'Which hook is used for state management in functional components?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctAnswer: 'useState' },
  ] as Question[],
  quizResults: [
      { id: 'res1', userId: 'student1', subjectId: 'subj1', score: 1, totalQuestions: 2, date: Date.now() - 24 * 60 * 60 * 1000, timeTaken: 300 },
  ] as QuizResult[],
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth ---
export const signIn = async (email: string): Promise<User> => {
    await simulateDelay(500);
    const user = db.users.find(u => u.email === email);
    if (user) {
        localStorage.setItem('quizAppUser', JSON.stringify(user));
        return user;
    }
    throw new Error('User not found.');
};

export const signOut = async () => {
    await simulateDelay(200);
    localStorage.removeItem('quizAppUser');
};

export const getAuthenticatedUser = (): User | null => {
    const userStr = localStorage.getItem('quizAppUser');
    return userStr ? JSON.parse(userStr) : null;
};


// --- User Management (Admin) ---
export const getUsers = async (role?: Role): Promise<User[]> => {
    await simulateDelay(500);
    if (role) {
        return db.users.filter(u => u.role === role);
    }
    return db.users;
};

export const enrollStudent = async (name: string, email: string): Promise<User> => {
    await simulateDelay(500);
    if (db.users.some(u => u.email === email)) {
        throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
        id: `student${Date.now()}`,
        name,
        email,
        role: 'student',
        subjectsAccess: [],
    };
    db.users.push(newUser);
    return newUser;
};

export const removeUser = async (userId: string): Promise<void> => {
    await simulateDelay(500);
    db.users = db.users.filter(u => u.id !== userId);
    // Also remove their quiz results
    db.quizResults = db.quizResults.filter(r => r.userId !== userId);
};

// --- Subject Management (Admin) ---
export const getSubjects = async (): Promise<Subject[]> => {
    await simulateDelay(500);
    return [...db.subjects];
};

export const getSubjectById = async (id: string): Promise<Subject | undefined> => {
    await simulateDelay(300);
    return db.subjects.find(s => s.id === id);
}

export const createSubject = async (data: Omit<Subject, 'id'>): Promise<Subject> => {
    await simulateDelay(500);
    const newSubject: Subject = {
        ...data,
        id: `subj${Date.now()}`,
    };
    db.subjects.push(newSubject);
    return newSubject;
};

export const updateSubject = async (subjectId: string, data: Partial<Subject>): Promise<Subject> => {
    await simulateDelay(500);
    const subjectIndex = db.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex === -1) throw new Error('Subject not found');
    db.subjects[subjectIndex] = { ...db.subjects[subjectIndex], ...data };
    return db.subjects[subjectIndex];
};

export const deleteSubject = async (subjectId: string): Promise<void> => {
    await simulateDelay(500);
    db.subjects = db.subjects.filter(s => s.id !== subjectId);
    db.questions = db.questions.filter(q => q.subjectId !== subjectId);
    db.quizResults = db.quizResults.filter(r => r.subjectId !== subjectId);
};

// --- Student Access Management (Admin) ---
export const updateUserAccess = async (userId: string, subjectIds: string[]): Promise<void> => {
    await simulateDelay(400);
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.subjectsAccess = subjectIds;
    } else {
        throw new Error("User not found");
    }
};

// --- Question Management (Admin) ---
export const getQuestionsForSubject = async (subjectId: string): Promise<Question[]> => {
    await simulateDelay(500);
    return db.questions.filter(q => q.subjectId === subjectId);
};

export const createQuestion = async (data: Omit<Question, 'id'>): Promise<Question> => {
    await simulateDelay(500);
    const newQuestion: Question = {
        ...data,
        id: `q${Date.now()}`,
    };
    db.questions.push(newQuestion);
    return newQuestion;
};

export const updateQuestion = async (questionId: string, data: Partial<Question>): Promise<Question> => {
    await simulateDelay(500);
    const questionIndex = db.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');
    db.questions[questionIndex] = { ...db.questions[questionIndex], ...data };
    return db.questions[questionIndex];
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
    await simulateDelay(500);
    db.questions = db.questions.filter(q => q.id !== questionId);
};


// --- Student Portal ---
export const getStudentSubjects = async (userId: string): Promise<Subject[]> => {
    await simulateDelay(500);
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('Student not found');
    return db.subjects.filter(s => user.subjectsAccess.includes(s.id));
};

export const submitQuiz = async (result: Omit<QuizResult, 'id'>): Promise<QuizResult> => {
    await simulateDelay(600);
    const newResult: QuizResult = {
        ...result,
        id: `res${Date.now()}`,
    };
    db.quizResults.push(newResult);
    return newResult;
}

export const getStudentQuizHistory = async (userId: string): Promise<QuizResult[]> => {
    await simulateDelay(500);
    const results = db.quizResults.filter(r => r.userId === userId);
    return results.map(r => {
        const subject = db.subjects.find(s => s.id === r.subjectId);
        return {
            ...r,
            subjectName: subject?.name || 'Unknown Subject',
        }
    }).sort((a, b) => b.date - a.date);
}

// --- Admin Results ---
export const getAllQuizResults = async (): Promise<QuizResult[]> => {
    await simulateDelay(700);
    return db.quizResults.map(r => {
         const subject = db.subjects.find(s => s.id === r.subjectId);
         const user = db.users.find(u => u.id === r.userId);
         return {
            ...r,
            subjectName: subject?.name || 'Deleted Subject',
            userName: user?.name || 'Deleted User'
         }
    }).sort((a,b) => b.date - a.date);
}

// --- Dashboard Stats ---
export const getAdminDashboardStats = async () => {
    await simulateDelay(400);
    const studentCount = db.users.filter(u => u.role === 'student').length;
    const subjectCount = db.subjects.length;
    const totalAttempts = db.quizResults.length;
    
    const subjectAttempts = db.subjects.map(s => {
        const attempts = db.quizResults.filter(r => r.subjectId === s.id);
        const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
        const totalPossibleScore = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
        return {
            name: s.name,
            attempts: attempts.length,
            averageScore: totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0
        }
    });

    return { studentCount, subjectCount, totalAttempts, subjectAttempts };
}

export const getStudentDashboardStats = async (userId: string) => {
    await simulateDelay(400);
    const history = await getStudentQuizHistory(userId);
    const recentQuizzes = history.slice(0, 5);
    const subjectsTaken = new Set(history.map(h => h.subjectId)).size;
    const averageScore = history.length > 0 ? (history.reduce((acc, curr) => acc + (curr.score/curr.totalQuestions), 0) / history.length) * 100 : 0;
    
    return { recentQuizzes, subjectsTaken, averageScore: Math.round(averageScore) };
}
