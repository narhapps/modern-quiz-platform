
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../../types';
import * as api from '../../services/firebase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogCloseButton } from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { PlusCircle, Edit, Trash2, ListOrdered } from 'lucide-react';

type DialogMode = 'add' | 'edit';

const ManageSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', timerEnabled: false, timerDuration: 15 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError('Failed to load subjects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenDialog = (mode: DialogMode, subject: Subject | null = null) => {
    setDialogMode(mode);
    setError('');
    if (mode === 'edit' && subject) {
      setSelectedSubject(subject);
      setSubjectForm({
        name: subject.name,
        description: subject.description,
        timerEnabled: subject.timerEnabled,
        timerDuration: subject.timerDuration,
      });
    } else {
      setSelectedSubject(null);
      setSubjectForm({ name: '', description: '', timerEnabled: false, timerDuration: 15 });
    }
    setIsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setSubjectForm(prev => ({ ...prev, [name]: checked }));
    } else {
        setSubjectForm(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!subjectForm.name) {
      setError('Subject name is required.');
      return;
    }
    
    try {
      if (dialogMode === 'edit' && selectedSubject) {
        await api.updateSubject(selectedSubject.id, subjectForm);
      } else {
        await api.createSubject(subjectForm);
      }
      setIsDialogOpen(false);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject.');
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? All associated questions and results will also be deleted.')) {
      try {
        await api.deleteSubject(subjectId);
        fetchSubjects();
      } catch (err) {
        alert('Failed to delete subject.');
      }
    }
  };
  
  const handleManageQuestions = (subjectId: string) => {
      navigate(`/admin/subjects/${subjectId}/questions`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
        <Button onClick={() => handleOpenDialog('add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Subject
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : subjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                    Timer: {subject.timerEnabled ? `${subject.timerDuration} minutes` : 'Disabled'}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleManageQuestions(subject.id)}><ListOrdered className="h-4 w-4 mr-1" /> Questions</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenDialog('edit', subject)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSubject(subject.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Subjects Found</h3>
            <p className="text-muted-foreground mt-2">Get started by creating a new subject.</p>
            <Button className="mt-4" onClick={() => handleOpenDialog('add')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Subject
            </Button>
         </div>
      )}

      {/* Add/Edit Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogCloseButton onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Create New Subject' : 'Edit Subject'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <Input name="name" placeholder="Subject Name" value={subjectForm.name} onChange={handleFormChange} required />
              <textarea name="description" placeholder="Subject Description" value={subjectForm.description} onChange={handleFormChange} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="timerEnabled" name="timerEnabled" checked={subjectForm.timerEnabled} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                <label htmlFor="timerEnabled">Enable Timer</label>
              </div>
              {subjectForm.timerEnabled && (
                <Input type="number" name="timerDuration" placeholder="Duration in minutes" value={subjectForm.timerDuration} onChange={handleFormChange} min="1" />
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">{dialogMode === 'add' ? 'Create' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSubjects;
