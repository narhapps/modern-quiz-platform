
export type Role = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  subjectsAccess: string[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  timerEnabled: boolean;
  timerDuration: number; // in minutes
}

export interface Question {
  id: string;
  subjectId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  userName?: string; // For admin view
  subjectId: string;
  subjectName?: string; // For admin view
  score: number;
  totalQuestions: number;
  date: number; // timestamp
  timeTaken: number; // in seconds
}
