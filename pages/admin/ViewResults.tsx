
import React, { useState, useEffect } from 'react';
import type { QuizResult } from '../../types';
import * as api from '../../services/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const ViewResults: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await api.getAllQuizResults();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Student Attempts</CardTitle>
          <CardDescription>A log of all quizzes completed on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="bg-background border-b">
                      <td className="px-6 py-4 font-medium">{result.userName}</td>
                      <td className="px-6 py-4">{result.subjectName}</td>
                      <td className="px-6 py-4 font-semibold">{result.score} / {result.totalQuestions}</td>
                      <td className="px-6 py-4">{new Date(result.date).toLocaleString()}</td>
                      <td className="px-6 py-4">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length === 0 && <p className="text-center py-8 text-muted-foreground">No quiz results found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewResults;
