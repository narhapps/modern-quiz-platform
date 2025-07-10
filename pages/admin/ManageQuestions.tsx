
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Question, Subject } from '../../types';
import * as api from '../../services/firebase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogCloseButton } from '../../components/ui/Dialog';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { PlusCircle, Edit, Trash2, ArrowLeft, FileJson, CheckCircle } from 'lucide-react';

type DialogMode = 'add' | 'edit';

const ManageQuestions: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<DialogMode>('add');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [questionForm, setQuestionForm] = useState({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
    const [bulkJson, setBulkJson] = useState('');
    const [error, setError] = useState('');

    const fetchSubjectAndQuestions = useCallback(async () => {
        if (!subjectId) return;
        setLoading(true);
        try {
            const [subjectData, questionsData] = await Promise.all([
                api.getSubjectById(subjectId),
                api.getQuestionsForSubject(subjectId)
            ]);
            if (!subjectData) {
                navigate('/admin/subjects');
                return;
            }
            setSubject(subjectData);
            setQuestions(questionsData);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, [subjectId, navigate]);

    useEffect(() => {
        fetchSubjectAndQuestions();
    }, [fetchSubjectAndQuestions]);
    
    const handleOpenDialog = (mode: DialogMode, question: Question | null = null) => {
        setDialogMode(mode);
        setError('');
        if (mode === 'edit' && question) {
            setSelectedQuestion(question);
            setQuestionForm({
                questionText: question.questionText,
                options: [...question.options],
                correctAnswer: question.correctAnswer,
            });
        } else {
            setSelectedQuestion(null);
            setQuestionForm({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
        }
        setIsDialogOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index?: number) => {
        const { name, value } = e.target;
        if (name === 'option') {
            const newOptions = [...questionForm.options];
            if(index !== undefined) newOptions[index] = value;
            setQuestionForm(prev => ({ ...prev, options: newOptions, correctAnswer: newOptions.includes(prev.correctAnswer) ? prev.correctAnswer : '' }));
        } else {
            setQuestionForm(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId) return;
        setError('');
        if (!questionForm.questionText || questionForm.options.some(opt => !opt) || !questionForm.correctAnswer) {
            setError('All fields including all options and a correct answer are required.');
            return;
        }
        if (!questionForm.options.includes(questionForm.correctAnswer)) {
            setError('The correct answer must be one of the options.');
            return;
        }

        const questionData = { subjectId, ...questionForm };

        try {
            if (dialogMode === 'edit' && selectedQuestion) {
                await api.updateQuestion(selectedQuestion.id, questionData);
            } else {
                await api.createQuestion(questionData);
            }
            setIsDialogOpen(false);
            fetchSubjectAndQuestions();
        } catch (err: any) {
            setError(err.message || 'Failed to save question.');
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await api.deleteQuestion(questionId);
            fetchSubjectAndQuestions();
        }
    };

    const handleBulkUpload = async () => {
        if (!subjectId) return;
        setError('');
        try {
            const parsedQuestions = JSON.parse(bulkJson);
            if (!Array.isArray(parsedQuestions)) throw new Error('JSON must be an array.');

            for (const q of parsedQuestions) {
                if (!q.questionText || !q.options || !q.correctAnswer || !Array.isArray(q.options) || q.options.length < 2) {
                    throw new Error('Each question object must have questionText, options (array), and correctAnswer.');
                }
                await api.createQuestion({
                    subjectId,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                });
            }
            setIsBulkDialogOpen(false);
            setBulkJson('');
            fetchSubjectAndQuestions();
        } catch (err: any) {
            setError(`Bulk upload failed: ${err.message}`);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    
    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate('/admin/subjects')} className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subjects
            </Button>
            <div className="flex items-center justify-between">
                <div >
                    <h1 className="text-3xl font-bold tracking-tight">Manage Questions</h1>
                    <p className="text-muted-foreground">For subject: {subject?.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsBulkDialogOpen(true)}><FileJson className="mr-2 h-4 w-4"/> Bulk Add</Button>
                    <Button onClick={() => handleOpenDialog('add')}><PlusCircle className="mr-2 h-4 w-4" /> Add Question</Button>
                </div>
            </div>
            {questions.length > 0 ? (
                questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>{index + 1}. {q.questionText}</span>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <Button variant="secondary" size="icon" onClick={() => handleOpenDialog('edit', q)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                {q.options.map((opt, i) => (
                                    <div key={i} className={`p-2 rounded-md ${opt === q.correctAnswer ? 'bg-green-100 text-green-800 flex items-center gap-2' : 'bg-muted'}`}>
                                       {opt === q.correctAnswer && <CheckCircle className="h-4 w-4"/>}
                                       {opt}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No Questions Found</h3>
                    <p className="text-muted-foreground mt-2">Add the first question for this subject.</p>
                </div>
            )}

            {/* Add/Edit Question Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogCloseButton onClick={() => setIsDialogOpen(false)} />
                    <DialogHeader><DialogTitle>{dialogMode === 'add' ? 'Add' : 'Edit'} Question</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <textarea name="questionText" placeholder="Question Text" value={questionForm.questionText} onChange={handleFormChange} required className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        {questionForm.options.map((opt, i) => (
                            <Input key={i} name="option" placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => handleFormChange(e, i)} required />
                        ))}
                        <div>
                            <label className="text-sm font-medium">Correct Answer</label>
                            <select name="correctAnswer" value={questionForm.correctAnswer} onChange={handleFormChange} required className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="" disabled>Select correct answer</option>
                                {questionForm.options.filter(o => o).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <DialogFooter><Button type="submit">Save Question</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Add Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogContent>
                     <DialogCloseButton onClick={() => setIsBulkDialogOpen(false)} />
                     <DialogHeader>
                        <DialogTitle>Bulk Add Questions</DialogTitle>
                        <DialogDescription>
                            Paste a JSON array of questions. Each object needs: questionText, options (array), and correctAnswer.
                        </DialogDescription>
                     </DialogHeader>
                     <div className="py-4 space-y-2">
                        <textarea 
                            value={bulkJson}
                            onChange={(e) => setBulkJson(e.target.value)}
                            placeholder={`[
  {
    "questionText": "What is 2+2?",
    "options": ["3", "4", "5"],
    "correctAnswer": "4"
  }
]`}
                            className="w-full h-48 p-2 border rounded-md font-mono text-xs"
                        />
                         {error && <p className="text-sm text-destructive">{error}</p>}
                     </div>
                     <DialogFooter>
                        <Button onClick={handleBulkUpload}>Upload Questions</Button>
                     </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageQuestions;