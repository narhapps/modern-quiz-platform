
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageQuestions from './pages/admin/ManageQuestions';
import ViewResults from './pages/admin/ViewResults';
import StudentDashboard from './pages/student/StudentDashboard';
import QuizPage from './pages/student/QuizPage';
import QuizResultPage from './pages/student/QuizResultPage';
import QuizHistoryPage from './pages/student/QuizHistoryPage';
import LoadingSpinner from './components/shared/LoadingSpinner';

const ProtectedRoute = ({ role }: { role: 'admin' | 'student' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== role) {
    // If wrong role, redirect to their default page or login
    const defaultPath = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
       <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="subjects/:subjectId/questions" element={<ManageQuestions />} />
            <Route path="results" element={<ViewResults />} />
          </Route>
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="quiz/:subjectId" element={<QuizPage />} />
            <Route path="quiz/result" element={<QuizResultPage />} />
            <Route path="history" element={<QuizHistoryPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} replace />} />
      </Routes>
    </div>
  );
};

export default App;
