import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  LeaderboardEntry,
  Achievement
} from '../types';
import { 
  CATEGORIES,
  STARTER_ACHIEVEMENTS,
  AVATAR_GALLERY,
  ADMIN_AVATAR_URL,
  ADMIN_EMAIL
} from '../constants';
import { DynamicBackground } from '../components/DynamicBackground';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Trophy, 
  Settings, 
  BarChart3, 
  Flame, 
  History, 
  Calendar, 
  HelpCircle, 
  Loader2 
} from 'lucide-react';
import { 
  auth, 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  handleFirestoreError, 
  OperationType,
  updateProfile,
  storage,
  ref,
  uploadBytes,
  getDownloadURL
} from '../firebase';
import { getAvatar } from '../lib/utils';

interface ProfilePageProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  user: any;
  handleLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  isDarkMode, 
  setIsDarkMode, 
  isMuted, 
  setIsMuted,
  user,
  handleLogout
}) => {
  const navigate = useNavigate();
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(STARTER_ACHIEVEMENTS);
  const [isFetchingScores, setIsFetchingScores] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL && photoURL !== ADMIN_AVATAR_URL) {
      setPhotoURL(ADMIN_AVATAR_URL);
    }
  }, [user?.email]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let newPhotoURL = photoURL;
      if (selectedFile) {
        const storageRef = ref(storage, `profiles/${user.uid}/${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        newPhotoURL = await getDownloadURL(storageRef);
      }
      await updateProfile(user, { displayName, photoURL: newPhotoURL });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const unlockBadge = (badgeId: string) => {
    setAchievements(prev => prev.map(a => a.id === badgeId ? { ...a, unlocked: true } : a));
    setUnlockedBadge(badgeId);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePlaceholderClick = (feature: string) => {
    alert(`${feature} coming soon!`);
  };

  const userGender = 'male';
  const getUserProfilePhoto = () => {
    return getAvatar(user?.photoURL, userGender);
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    setIsFetchingScores(true);
    const q = query(
      collection(db, 'scores'), 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setUserScores(scores);
      setIsFetchingScores(false);
    }, (error) => {
      setIsFetchingScores(false);
      handleFirestoreError(error, OperationType.LIST, 'scores');
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const filteredScores = userScores.filter(score => (filterCategory === 'All' || 
    (CATEGORIES.find(c => c.title === filterCategory)?.subcategories.includes(score.category) || score.category === filterCategory)) && 
    (filterDifficulty === 'All' || score.difficulty === filterDifficulty));

  return (
    <div className={`min-h-screen flex selection:bg-emerald-500/30 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <DynamicBackground isDarkMode={isDarkMode} />
      
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Profile Photo URL</label>
                <input type="text" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} />
                <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="mt-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Choose an Avatar</label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_GALLERY.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setPhotoURL(avatar)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        photoURL === avatar 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <img src={avatar} alt="Avatar" className="w-full aspect-square object-cover rounded-lg" />
                    </button>
                  ))}
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      onClick={() => setPhotoURL(ADMIN_AVATAR_URL)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        photoURL === ADMIN_AVATAR_URL 
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <img src={ADMIN_AVATAR_URL} alt="Admin Avatar" className="w-full aspect-square object-cover rounded-lg" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 px-4 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <header className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto w-full">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              isDarkMode ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm border border-gray-100'
            }`}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-yellow-400' : 'bg-white border-gray-200 text-indigo-600'}`}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold">{user?.displayName}</p>
                <button onClick={handleLogout} className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Logout</button>
              </div>
              <img src={getUserProfilePhoto()} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-emerald-500" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto w-full px-6 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <img src={getUserProfilePhoto()} alt="Profile" className="w-24 h-24 rounded-3xl border-4 border-emerald-500/20" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Trophy size={16} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
                      {user?.displayName}
                      {user?.email === 'beqaparkosadze@gmail.com' && (
                        <>
                          <span className="text-blue-500 text-lg">✓</span>
                          <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">Founder</span>
                          <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">Grandmaster</span>
                        </>
                      )}
                    </h2>
                    <p className="text-sm opacity-60">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-emerald-500" />
                  My Achievements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${achievement.unlocked ? (isDarkMode ? 'bg-gray-800 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/20') : (isDarkMode ? 'bg-gray-950 border-gray-800 opacity-50 grayscale' : 'bg-gray-100 border-gray-200 opacity-50 grayscale')}`}>
                      <span className="text-3xl mb-2">{achievement.icon}</span>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toast Notification */}
              {showToast && (
                <div className="fixed bottom-6 right-6 p-4 bg-emerald-500 text-white rounded-xl shadow-2xl font-bold">
                  New Badge Unlocked: {achievements.find(a => a.id === unlockedBadge)?.title}!
                </div>
              )}

              <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-emerald-500" />
                  Account Settings
                </h3>
                <div className="space-y-3">
                  <button onClick={() => setIsEditModalOpen(true)} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500/10 transition-colors">Edit Profile</button>
                  <button onClick={() => handlePlaceholderClick('Notification Preferences')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500/10 transition-colors">Notification Preferences</button>
                  <button onClick={() => handlePlaceholderClick('Privacy & Security')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-500/10 transition-colors">Privacy & Security</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors">Sign Out</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <BarChart3 size={20} className="text-blue-500 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-wider opacity-50">Total Quizzes</p>
                  <p className="text-4xl font-bold">{userScores.length}</p>
                </div>
                <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <Trophy size={20} className="text-emerald-500 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-wider opacity-50">Avg. Score</p>
                  <p className="text-4xl font-bold">
                    {userScores.length > 0 
                      ? Math.round((userScores.reduce((acc, s) => acc + s.score, 0) / userScores.reduce((acc, s) => acc + s.totalQuestions, 0)) * 100)
                      : 0}%
                  </p>
                </div>
                <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <Flame size={20} className="text-amber-500 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-wider opacity-50">Best Score</p>
                  <p className="text-4xl font-bold">
                    {userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0}
                  </p>
                </div>
              </div>

              <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <History size={22} className="text-emerald-500" />
                    Quiz History
                  </h3>
                  <div className="flex items-center gap-4">
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-50 bg-gray-50/50'}`}>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-50">Category</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-50">Difficulty</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-50">Score</th>
                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest opacity-50">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {isFetchingScores ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                      ) : filteredScores.length > 0 ? (
                        filteredScores.map((score) => (
                          <tr key={score.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="px-8 py-5 font-bold">{score.category}</td>
                            <td className="px-8 py-5 uppercase text-[10px] font-black tracking-widest">{score.difficulty}</td>
                            <td className="px-8 py-5 font-bold">{score.score} / {score.totalQuestions}</td>
                            <td className="px-8 py-5 text-xs opacity-60">
                              {score.timestamp?.toDate ? score.timestamp.toDate().toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="px-8 py-20 text-center opacity-50">No history found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
