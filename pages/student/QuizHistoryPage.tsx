
import React, { useState, useEffect } from 'react';
import type { QuizResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const QuizHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await api.getStudentQuizHistory(user.id);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch quiz history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Quiz History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Completed Quizzes</CardTitle>
          <CardDescription>A log of all your past quiz attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Percentage</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((result) => (
                    <tr key={result.id} className="bg-background border-b">
                      <td className="px-6 py-4 font-medium">{result.subjectName}</td>
                      <td className="px-6 py-4">{result.score} / {result.totalQuestions}</td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {Math.round((result.score / result.totalQuestions) * 100)}%
                      </td>
                      <td className="px-6 py-4">{new Date(result.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="text-center py-8 text-muted-foreground">You haven't completed any quizzes yet.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistoryPage;
