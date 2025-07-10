
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Question, Subject } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/firebase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Timer, ArrowLeft, ArrowRight } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectData, questionsData] = await Promise.all([
          api.getSubjectById(subjectId),
          api.getQuestionsForSubject(subjectId)
        ]);
        if (!subjectData || questionsData.length === 0) {
          navigate('/student/dashboard');
          return;
        }
        setSubject(subjectData);
        setQuestions(questionsData);
        if (subjectData.timerEnabled) {
          setTimeLeft(subjectData.timerDuration * 60);
        }
        setStartTime(Date.now());
      } catch (error) {
        console.error("Failed to load quiz", error);
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId, navigate]);

  const handleQuizSubmit = useCallback(async () => {
    if (!user || !subject) return;

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await api.submitQuiz({
        userId: user.id,
        subjectId: subject.id,
        score,
        totalQuestions: questions.length,
        date: Date.now(),
        timeTaken,
      });
      navigate('/student/quiz/result', { state: { result, subjectName: subject.name, questions, answers } });
    } catch (error) {
      console.error("Failed to submit quiz", error);
      alert('There was an error submitting your quiz. Please try again.');
    }
  }, [user, subject, questions, answers, startTime, navigate]);
  
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
        if (timeLeft === 0) {
            handleQuizSubmit();
        }
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime! - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, handleQuizSubmit]);


  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{subject?.name}</CardTitle>
              <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-red-500 font-semibold bg-red-100 px-3 py-1.5 rounded-full">
                <Timer className="h-5 w-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-4 border-t border-b">
            <p className="text-lg font-semibold mb-6">{currentQuestion.questionText}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index}>
                  <label 
                    className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      className="hidden"
                    />
                    <span className="ml-3 text-md">{option}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleQuizSubmit}>Submit Quiz</Button>
            ) : (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;
