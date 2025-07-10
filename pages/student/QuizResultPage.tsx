
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { QuizResult, Question } from '../../types';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { CheckCircle, XCircle, Clock, Percent, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const QuizResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);

  const { result, subjectName, questions, answers } = (location.state as { 
    result: QuizResult, 
    subjectName: string, 
    questions: Question[], 
    answers: Record<string, string> 
  }) || {};

  if (!result) {
    React.useEffect(() => {
        navigate('/student/dashboard');
    }, [navigate]);
    return null;
  }

  const { score, totalQuestions, timeTaken } = result;
  const incorrect = totalQuestions - score;
  const percentage = Math.round((score / totalQuestions) * 100);

  const data = [
    { name: 'Correct', value: score },
    { name: 'Incorrect', value: incorrect },
  ];
  const COLORS = ['#16a34a', '#dc2626'];

  const getFeedback = () => {
    if (percentage === 100) return { title: "Perfect Score!", message: "Outstanding! You're a true master of this subject.", icon: Award, color: 'text-yellow-500' };
    if (percentage >= 80) return { title: "Excellent Work!", message: "You have a strong understanding of the material.", icon: Award, color: 'text-green-500' };
    if (percentage >= 50) return { title: "Good Job!", message: "You passed! A little more practice will make you an expert.", icon: Award, color: 'text-blue-500' };
    return { title: "Keep Trying!", message: "Don't give up. Review the material and try again.", icon: XCircle, color: 'text-red-500' };
  };

  const feedback = getFeedback();
  const FeedbackIcon = feedback.icon;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3">
             <FeedbackIcon className={`h-10 w-10 ${feedback.color}`} />
             <CardTitle className="text-3xl">{feedback.title}</CardTitle>
          </div>
          <CardDescription className="text-lg">{feedback.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">Your score for</p>
                <p className="text-2xl font-bold">{subjectName}</p>
                <p className="text-6xl font-extrabold text-primary mt-2">{score}<span className="text-3xl text-muted-foreground">/{totalQuestions}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" >
                                {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4 text-lg">
                    <div className="flex items-center justify-between p-3 rounded-md bg-green-50">
                        <div className="flex items-center gap-3 font-medium text-green-700"><CheckCircle /> Correct Answers</div>
                        <span className="font-bold">{score}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-md bg-red-50">
                        <div className="flex items-center gap-3 font-medium text-red-700"><XCircle /> Incorrect Answers</div>
                        <span className="font-bold">{incorrect}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                        <div className="flex items-center gap-3 font-medium text-blue-700"><Percent /> Percentage</div>
                        <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md bg-indigo-50">
                        <div className="flex items-center gap-3 font-medium text-indigo-700"><Clock /> Time Taken</div>
                        <span className="font-bold">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
                <Button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</Button>
                 {questions && answers && (
                    <Button variant="outline" onClick={() => setShowReview(!showReview)}>
                        {showReview ? 'Hide Review' : 'Review Answers'}
                    </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/student/history')}>View My History</Button>
            </div>
        </CardContent>
      </Card>

      {showReview && questions && answers && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Answer Review</CardTitle>
                <CardDescription>See how you did on each question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const wasAnswered = userAnswer !== undefined;

                    return (
                        <div key={question.id} className="p-4 border rounded-lg bg-background">
                            <p className="font-semibold">{index + 1}. {question.questionText}</p>
                            <div className="mt-4 space-y-2 text-sm">
                                {question.options.map(option => {
                                    const isUserChoice = option === userAnswer;
                                    const isCorrectChoice = option === question.correctAnswer;
                                    
                                    let optionClass = "flex items-center gap-3 p-3 border rounded-md ";
                                    let icon = <div className="h-5 w-5 flex-shrink-0" />;

                                    if (isCorrectChoice) {
                                        optionClass += "bg-green-100 border-green-300 text-green-900";
                                        icon = <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />;
                                    } else if (isUserChoice) { // User choice but not correct
                                        optionClass += "bg-red-100 border-red-300 text-red-900";
                                        icon = <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />;
                                    } else {
                                        optionClass += "bg-gray-50 border-gray-200";
                                    }

                                    return (
                                        <div key={option} className={optionClass}>
                                            {icon}
                                            <span>{option}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {!wasAnswered && (
                                <p className="mt-3 text-sm text-yellow-600 font-medium">You did not answer this question. The correct answer is highlighted above.</p>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
        )}
    </div>
  );
};

export default QuizResultPage;
