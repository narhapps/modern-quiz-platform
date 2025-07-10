
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject, QuizResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/firebase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { ArrowRight, BookOpen, Percent, History } from 'lucide-react';

interface DashboardStats {
  recentQuizzes: QuizResult[];
  subjectsTaken: number;
  averageScore: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectsData, statsData] = await Promise.all([
          api.getStudentSubjects(user.id),
          api.getStudentDashboardStats(user.id)
        ]);
        setSubjects(subjectsData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load student dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStartQuiz = (subjectId: string) => {
    navigate(`/student/quiz/${subjectId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Ready to test your knowledge? Select a subject to begin.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects Taken</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.subjectsTaken || 0}</div>
            </CardContent>
        </Card>
      </div>


      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Quizzes</h2>
        {subjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {subjects.map((subject) => (
              <Card key={subject.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{subject.name}</CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="text-sm text-muted-foreground mb-4">
                        Timer: {subject.timerEnabled ? `${subject.timerDuration} minutes` : 'Not timed'}
                    </div>
                  <Button onClick={() => handleStartQuiz(subject.id)} className="w-full mt-auto">
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No subjects have been assigned to you yet. Please contact an administrator.</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {stats && stats.recentQuizzes.length > 0 ? (
              <ul className="space-y-4">
                {stats.recentQuizzes.map(result => (
                   <li key={result.id} className="flex items-center justify-between">
                     <div>
                       <p className="font-semibold">{result.subjectName}</p>
                       <p className="text-sm text-muted-foreground">{new Date(result.date).toLocaleDateString()}</p>
                     </div>
                     <p className="font-bold text-lg">{result.score}/{result.totalQuestions}</p>
                   </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">You have not completed any quizzes yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
