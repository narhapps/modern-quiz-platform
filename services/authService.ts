import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import type { User } from "../types";
import { auth } from "./firebase";

// Login using Firebase Auth
export const signIn = async (email: string, password: string): Promise<User> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser: FirebaseUser = cred.user;

  const user: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Student',
    email: firebaseUser.email || '',
    role: 'student', // For now — we'll pull from Firestore later
    subjectsAccess: [],
  };

  localStorage.setItem('quizAppUser', JSON.stringify(user));
  return user;
};

// Logout
export const signOut = async () => {
  await firebaseSignOut(auth);
  localStorage.removeItem('quizAppUser');
};

// Get currently logged in user from local storage
export const getAuthenticatedUser = (): User | null => {
  const userStr = localStorage.getItem('quizAppUser');
  return userStr ? JSON.parse(userStr) : null;
};
