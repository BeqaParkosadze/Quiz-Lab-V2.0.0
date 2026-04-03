import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_EMAIL } from '../constants';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Loader2, Save, Users, BookOpen } from 'lucide-react';

export const AdminPage = ({ user, isDarkMode }: { user: any, isDarkMode: boolean }) => {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizQuestions, setQuizQuestions] = useState('');
  const [bulkQuestions, setBulkQuestions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'scores'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const userMap = new Map();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!userMap.has(data.userId)) {
            userMap.set(data.userId, {
              userName: data.userName,
              userId: data.userId,
              scores: []
            });
          }
          userMap.get(data.userId).scores.push(data.score);
        });
        setUsers(Array.from(userMap.values()));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddQuiz = async () => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
        title: quizTitle,
        category: quizCategory,
        difficulty: quizDifficulty,
        questions: JSON.parse(quizQuestions),
        createdAt: new Date()
      });
      alert('Quiz added successfully!');
      setQuizTitle('');
      setQuizCategory('');
      setQuizQuestions('');
    } catch (error) {
      console.error('Error adding quiz:', error);
      alert('Failed to add quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkImport = async () => {
    setIsBulkImporting(true);
    try {
      const questions = JSON.parse(bulkQuestions);
      if (!Array.isArray(questions)) throw new Error('Invalid format');
      
      for (const q of questions) {
        await addDoc(collection(db, 'quizzes'), {
          ...q,
          createdAt: new Date()
        });
      }
      alert('Bulk import successful!');
      setBulkQuestions('');
    } catch (error) {
      console.error('Bulk import error:', error);
      alert('Bulk import failed. Ensure it is a valid JSON array.');
    } finally {
      setIsBulkImporting(false);
    }
  };

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen size={20} /> Add New Quiz
          </h2>
          <input type="text" placeholder="Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="w-full p-3 mb-4 rounded-xl border bg-transparent" />
          <input type="text" placeholder="Category" value={quizCategory} onChange={(e) => setQuizCategory(e.target.value)} className="w-full p-3 mb-4 rounded-xl border bg-transparent" />
          <select value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)} className="w-full p-3 mb-4 rounded-xl border bg-transparent">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <textarea placeholder="Questions (JSON array)" value={quizQuestions} onChange={(e) => setQuizQuestions(e.target.value)} className="w-full p-3 mb-4 rounded-xl border bg-transparent h-40" />
          <button onClick={handleAddQuiz} disabled={isSaving} className="w-full p-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Quiz</>}
          </button>
          
          <h3 className="text-lg font-bold mt-8 mb-4">Bulk Import</h3>
          <textarea placeholder="Paste 50 questions JSON array here" value={bulkQuestions} onChange={(e) => setBulkQuestions(e.target.value)} className="w-full p-3 mb-4 rounded-xl border bg-transparent h-40" />
          <button onClick={handleBulkImport} disabled={isBulkImporting} className="w-full p-3 rounded-xl bg-purple-500 text-white font-bold flex items-center justify-center gap-2">
            {isBulkImporting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Bulk Import</>}
          </button>
        </div>

        <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={20} /> User Management
          </h2>
          {loadingUsers ? <Loader2 className="animate-spin" /> : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-2">User Name</th>
                  <th className="pb-2">Scores</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.userId} className="border-t border-gray-800">
                    <td className="py-2">{u.userName}</td>
                    <td className="py-2">{u.scores.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
