
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Subject } from '../../types';
import * as api from '../../services/firebase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogCloseButton } from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { UserPlus, Trash2, KeyRound } from 'lucide-react';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [studentAccess, setStudentAccess] = useState<string[]>([]);
  const [error, setError] = useState('');

  const fetchStudentsAndSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const [studentData, subjectData] = await Promise.all([
        api.getUsers('student'),
        api.getSubjects()
      ]);
      setStudents(studentData);
      setAllSubjects(subjectData);
    } catch (err) {
      setError('Failed to load data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentsAndSubjects();
  }, [fetchStudentsAndSubjects]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newStudentName || !newStudentEmail) {
      setError('Name and email are required.');
      return;
    }
    try {
      await api.enrollStudent(newStudentName, newStudentEmail);
      setNewStudentName('');
      setNewStudentEmail('');
      setIsAddDialogOpen(false);
      fetchStudentsAndSubjects();
    } catch (err: any) {
      setError(err.message || 'Failed to add student.');
    }
  };

  const handleDeleteStudent = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
      try {
        await api.removeUser(userId);
        fetchStudentsAndSubjects();
      } catch (err) {
        alert('Failed to remove student.');
      }
    }
  };
  
  const handleOpenAccessDialog = (student: User) => {
    setSelectedStudent(student);
    setStudentAccess(student.subjectsAccess);
    setIsAccessDialogOpen(true);
  };

  const handleAccessChange = (subjectId: string) => {
    setStudentAccess(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };
  
  const handleUpdateAccess = async () => {
    if (!selectedStudent) return;
    try {
      await api.updateUserAccess(selectedStudent.id, studentAccess);
      setIsAccessDialogOpen(false);
      setSelectedStudent(null);
      fetchStudentsAndSubjects();
    } catch (err) {
      alert('Failed to update access.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Enroll Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Subjects Access</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="bg-background border-b">
                      <td className="px-6 py-4 font-medium text-foreground">{student.name}</td>
                      <td className="px-6 py-4">{student.email}</td>
                      <td className="px-6 py-4">{student.subjectsAccess.length}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <Button variant="outline" size="sm" onClick={() => handleOpenAccessDialog(student)}>
                           <KeyRound className="h-4 w-4" />
                         </Button>
                         <Button variant="destructive" size="sm" onClick={() => handleDeleteStudent(student.id)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p className="text-center py-8 text-muted-foreground">No students found.</p>}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
           <DialogCloseButton onClick={() => setIsAddDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>Add a new student to the platform. They will receive credentials to log in.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent}>
            <div className="space-y-4 py-4">
              <Input placeholder="Student Name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} />
              <Input type="email" placeholder="Student Email" value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">Enroll Student</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Manage Access Dialog */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent>
           <DialogCloseButton onClick={() => setIsAccessDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Manage Access for {selectedStudent?.name}</DialogTitle>
            <DialogDescription>Select the subjects this student can access.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-60 overflow-y-auto">
            {allSubjects.map(subject => (
              <div key={subject.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id={`access-${subject.id}`}
                  checked={studentAccess.includes(subject.id)}
                  onChange={() => handleAccessChange(subject.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`access-${subject.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {subject.name}
                </label>
              </div>
            ))}
            {allSubjects.length === 0 && <p className="text-muted-foreground text-sm">No subjects available. Create subjects first.</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateAccess}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudents;
