import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { 
  LeaderboardEntry, 
  QuizCategory, 
  AppState, 
  Difficulty, 
  CategoryCardProps 
} from './types';
import { 
  AGE_GROUPS, 
  CATEGORIES, 
  DIFFICULTY_CONFIG, 
  SOUNDS 
} from './constants';
import { DynamicBackground } from './components/DynamicBackground';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LegalModal } from './components/LegalModal';
import { CategoryCard } from './components/CategoryCard';
import { ToggleSwitch } from './components/ToggleSwitch';
import { getAvatar } from './lib/utils';

  import logo from './logo.png';

import { 
  BookOpen, 
  GraduationCap, 
  Baby, 
  HelpCircle, 
  X, 
  Search,
  ChevronRight,
  Backpack,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  Home,
  Moon,
  Pencil,
  Atom,
  Sparkles,
  Timer,
  Compass,
  Globe,
  Palette,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Flame,
  Sun,
  Wand2,
  Calculator,
  Music,
  Hourglass,
  Film,
  LogIn,
  LogOut,
  Users,
  Loader2,
  Settings,
  History,
  BarChart3,
  UserCircle,
  ArrowLeft,
  Calendar,
  Rocket,
  Leaf,
  Cpu,
  Utensils,
  Waves,
  Pyramid,
  Languages,
  Lightbulb,
  Ghost,
  Bird,
  CloudUpload
} from 'lucide-react';
import * as Icons from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { QUIZ_DATA, Question } from './quizData';
import { Login } from './components/Login';
import { 
  auth, 
  db, 
  googleProvider, 
  facebookProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User,
  where,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  ref,
  uploadBytes,
  getDownloadURL,
  storage
} from './firebase';






export default function App() {
  // Navigation & Category State
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeAgeGroup, setActiveAgeGroup] = useState('kids');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>({
    'Email-New Quizzes': true,
    'Email-Leaderboard Changes': false,
    'Email-Friend Challenges': true,
    'Push Notifications-New Quizzes': true,
    'Push Notifications-Leaderboard Changes': true,
    'Push Notifications-Friend Challenges': false,
    'SMS Notifications-New Quizzes': false,
    'SMS Notifications-Leaderboard Changes': false,
    'SMS Notifications-Friend Challenges': false,
    'Show Quiz History': true,
    'Two-Factor Authentication': false,
  });
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
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

  const userGender = 'male'; // Placeholder as requested
  const getUserProfilePhoto = () => {
    return getAvatar(auth.currentUser?.photoURL, userGender);
  };

  // ... (rest of state) ...

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [userName, setUserName] = useState<string>(localStorage.getItem('quiz_user_name') || '');
  const [quizError, setQuizError] = useState<string | null>(null);

  // Firebase State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<{ title: string, content: string } | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userScores, setUserScores] = useState<LeaderboardEntry[]>([]);
  const filteredScores = userScores.filter(score => (filterCategory === 'All' || 
                                             (CATEGORIES.find(c => c.title === filterCategory)?.subcategories.includes(score.category) || score.category === filterCategory)) && 
                                             (filterDifficulty === 'All' || score.difficulty === filterDifficulty));
  const [isFetchingScores, setIsFetchingScores] = useState(false);
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>([]);

  // Quiz State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [comboMessage, setComboMessage] = useState('');
  const [showComboLost, setShowComboLost] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null); // For keyboard navigation
  const [lastCorrectTime, setLastCorrectTime] = useState<number | null>(null);
  const [timedStreak, setTimedStreak] = useState(0);
  const [showTimedStreak, setShowTimedStreak] = useState(false);
  const [quizSummary, setQuizSummary] = useState<Array<{
    question: string;
    selectedOption: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    category: string;
  }>>([]);
  const [showImagePromptModal, setShowImagePromptModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudioRef.current = new Audio(SOUNDS.correct);
    incorrectAudioRef.current = new Audio(SOUNDS.incorrect);
    tickAudioRef.current = new Audio(SOUNDS.tick);
    
    return () => {
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
    };
  }, [appState, isMuted]);

  // Sound Effects
  const playSound = (type: keyof typeof SOUNDS) => {
    if (isMuted) return;
    
    let audio: HTMLAudioElement | null = null;
    if (type === 'correct') audio = correctAudioRef.current;
    else if (type === 'incorrect') audio = incorrectAudioRef.current;
    else if (type === 'tick') audio = tickAudioRef.current;
    else {
      audio = new Audio(SOUNDS[type]);
    }
    
    if (audio) {
      audio.currentTime = 0;
      audio.volume = type === 'tick' ? 0.2 : 0.4;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load local scores on mount
  useEffect(() => {
    const saved = localStorage.getItem('quiz_local_scores');
    if (saved) {
      try {
        setLocalScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local scores", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
      });
      setLeaderboard(entries);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scores');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  useEffect(() => {
    if (!user) {
      setUserScores([]);
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
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const saveScore = async () => {
    const newScoreEntry: Omit<LeaderboardEntry, 'id'> = {
      userId: user?.uid || 'local-user',
      userName: user?.displayName || userName || 'Guest',
      userPhoto: user?.photoURL,
      score: correctCount,
      totalQuestions: activeQuestions.length,
      category: selectedSubcategory || 'General',
      difficulty: difficulty,
      timestamp: Date.now()
    };

    // Always save locally
    const updatedLocalScores = [
      { ...newScoreEntry, id: `local-${Date.now()}` } as LeaderboardEntry,
      ...localScores
    ].slice(0, 50); // Keep last 50 local scores
    
    setLocalScores(updatedLocalScores);
    localStorage.setItem('quiz_local_scores', JSON.stringify(updatedLocalScores));

    if (!user || isSavingScore) return;
    setIsSavingScore(true);
    try {
      await addDoc(collection(db, 'scores'), {
        ...newScoreEntry,
        timestamp: serverTimestamp()
      });
      setIsSavingScore(false);
      setIsLeaderboardOpen(true);
    } catch (error) {
      setIsSavingScore(false);
      handleFirestoreError(error, OperationType.WRITE, 'scores');
    }
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];

  const handleGenerateAIImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGeneratingImage(true);
    setGenerationError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a clean, modern, and minimalist SVG illustration for a quiz question. 
        Topic: "${currentQuestion.questionText}"
        User's specific request: "${imagePrompt}"
        The SVG should:
        1. Use a viewBox (e.g., "0 0 200 200") and no fixed width/height.
        2. Be stylized, minimalist, and professional, matching a clean SaaS aesthetic.
        3. Use a limited color palette (e.g., shades of gray, primary accent color).
        4. Be self-contained (no external links).
        5. Return ONLY the raw SVG code, no markdown backticks, no explanations.`,
      });

      let svgCode = response.text?.trim() || '';
      
      // Basic cleanup in case the model includes markdown
      if (svgCode.includes('```')) {
        svgCode = svgCode.replace(/```svg|```xml|```/g, '').trim();
      }
      
      if (svgCode && svgCode.startsWith('<svg')) {
        const updatedQuestions = [...activeQuestions];
        updatedQuestions[currentQuestionIndex] = {
          ...currentQuestion,
          questionImage: svgCode
        };
        setActiveQuestions(updatedQuestions);
        setShowImagePromptModal(false);
        setImagePrompt('');
      } else {
        setGenerationError("The AI didn't return a valid SVG. Please try a different prompt.");
      }
    } catch (error) {
      console.error("Error generating SVG:", error);
      setGenerationError("Failed to generate image. Please check your connection and try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== 'quiz') return;

      if (!isAnswered) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          setSelectedOptionIndex(prev => (prev === null || prev === 0 ? 3 : prev - 1));
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          setSelectedOptionIndex(prev => (prev === null || prev === 3 ? 0 : prev + 1));
        } else if (e.key === 'Enter' && selectedOptionIndex !== null) {
          handleOptionClick(currentQuestion.options[selectedOptionIndex]);
        } else if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          handleOptionClick(currentQuestion.options[idx]);
        }
      } else {
        if (e.key === 'Enter') {
          nextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, isAnswered, selectedOptionIndex, currentQuestion]);

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setDifficulty('medium');
  };

  const handleCategoryClick = (cat: QuizCategory) => {
    console.log('Category Clicked:', cat.id);
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    } else {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'quiz_complete', { score: correctCount });
      }
      setAppState('results');
    }
  };

  const getFireStyles = (streak: number) => {
    if (streak >= 7) return "text-purple-500 animate-pulse drop-shadow-[0_0_25px_rgba(168,85,247,0.8)] scale-125";
    if (streak >= 5) return "text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.7)] scale-115";
    if (streak >= 3) return "text-orange-500 animate-[pulse_2s_infinite] drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]";
    return "text-slate-400 opacity-30";
  };

  const renderQuestionImage = (image: string) => {
    if (image.startsWith('<svg')) {
      return <div className="w-full h-full p-8" dangerouslySetInnerHTML={{ __html: image }} />;
    }
    
    // Handle Lucide Icon name
    const iconName = image.charAt(0).toUpperCase() + image.slice(1);
    const IconComponent = (Icons as any)[iconName];
    
    if (IconComponent) {
      return <IconComponent size={120} className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />;
    }
    
    return <HelpCircle size={80} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />;
  };

  const handleOptionClick = (option: string, isTimeout = false) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(option);
    setIsAnswered(true);
    
    const currentQuestion = activeQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    setQuizSummary(prev => [...prev, {
      question: currentQuestion.question,
      selectedOption: isTimeout ? null : option,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      category: selectedSubcategory || 'General'
    }]);

    if (!isTimeout) playSound('click');
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      playSound('correct');

      // Timed Streak Logic
      const now = Date.now();
      if (lastCorrectTime && now - lastCorrectTime < 5000) {
        const newTimedStreak = timedStreak + 1;
        setTimedStreak(newTimedStreak);
        if (newTimedStreak >= 2) {
          setShowTimedStreak(true);
          setTimeout(() => setShowTimedStreak(false), 1500);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          });
        }
      } else {
        setTimedStreak(1);
      }
      setLastCorrectTime(now);
      
      if (newStreak === 3 || newStreak === 5 || newStreak === 7) {
        const message = newStreak === 3 ? "COMBO x3! 🔥" : newStreak === 5 ? "UNSTOPPABLE x5! ⚡" : "GOD MODE x7! 🌌";
        const soundKey = `streak${newStreak}` as keyof typeof SOUNDS;
        setComboMessage(message);
        setShowCombo(true);
        playSound(soundKey);
        setTimeout(() => setShowCombo(false), 1500);
      }
    } else {
      setIncorrectCount(prev => prev + 1);
      if (currentStreak >= 3) {
        setShowComboLost(true);
        playSound('comboLost');
        setTimeout(() => setShowComboLost(false), 1500);
      }
      setCurrentStreak(0);
      playSound('incorrect');
    }

    if (isTimeout) {
      setTimeout(nextQuestion, 1500);
    }
  };

  useEffect(() => {
    if (appState === 'quiz' && !isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 5) playSound('tick');
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleOptionClick('', true); // Auto-submit as incorrect and move on
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, isAnswered, timeLeft, currentQuestionIndex, activeQuestions.length]);

  const startQuiz = () => {
    if (!selectedSubcategory) {
      console.error("No subcategory selected");
      return;
    }
    setQuizError(null);
    
    const questions = [...(QUIZ_DATA[selectedSubcategory] || [])];
    
    if (questions.length === 0) {
      console.error("No questions found for subcategory:", selectedSubcategory);
      setQuizError("Coming Soon");
      return;
    }

    // 1. Shuffle
    const shuffledPool = [...questions].sort(() => Math.random() - 0.5);
    
    // 2. Difficulty Logic
    const config = DIFFICULTY_CONFIG[difficulty];
    const selected = shuffledPool.slice(0, config.questions);
    setActiveQuestions(selected);
    
    // 3. Reset state and Start
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCurrentStreak(0);
    setSelectedOption(null);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time); 
    setTimedStreak(0);
    setQuizSummary([]);
    setLastCorrectTime(null);
    setAppState('quiz');
    handleCloseModal();
    if ((window as any).gtag) {
      (window as any).gtag('event', 'quiz_start', { category_name: selectedSubcategory });
    }
  };

  const resetToHome = () => {
    setAppState('landing');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setQuizError(null);
    setCurrentStreak(0);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Loading...</div>;
  }

  if (appState === 'login') {
    return <Login onLoginSuccess={() => setAppState('landing')} onBackToHome={() => setAppState('landing')} />;
  }

  return (
    <div className={`min-h-screen flex selection:bg-emerald-500/30 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <DynamicBackground 
        isDarkMode={isDarkMode} 
      />
      
      {/* Global Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
        entries={leaderboard} 
        isDarkMode={isDarkMode}
        currentUser={user}
      />

      <LegalModal 
        isOpen={!!activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        title={activeLegalModal?.title || ''}
        content={activeLegalModal?.content || ''}
        isDarkMode={isDarkMode}
      />

      {appState === 'admin' && (
        <AdminPage 
          user={user}
          isDarkMode={isDarkMode}
        />
      )}

      {appState === 'landing' && (
        <LandingPage 
          isDarkMode={isDarkMode}
          user={user}
          appState={appState}
          setAppState={setAppState}
          activeAgeGroup={activeAgeGroup}
          setActiveAgeGroup={setActiveAgeGroup}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleCategoryClick={handleCategoryClick}
          getUserProfilePhoto={getUserProfilePhoto}
          handleLogout={handleLogout}
          setIsMuted={setIsMuted}
          isMuted={isMuted}
          setIsDarkMode={setIsDarkMode}
          setIsLeaderboardOpen={setIsLeaderboardOpen}
          setActiveLegalModal={setActiveLegalModal}
          selectedDashboardCategory={selectedDashboardCategory}
          setSelectedDashboardCategory={setSelectedDashboardCategory}
        />
      )}

      {appState === 'profile' && user && (
        <>
          {isNotificationModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-xl font-bold mb-6">Notification Settings</h3>
                <div className="space-y-6">
                  {['Email', 'Push Notifications', 'SMS Notifications'].map((category) => (
                    <div key={category}>
                      <h4 className="font-bold mb-2">{category}</h4>
                      <div className="space-y-2">
                        {['New Quizzes', 'Leaderboard Changes', 'Friend Challenges'].map((option) => (
                          <div key={option} className="flex items-center justify-between">
                            <span className="text-sm">{option}</span>
                            <ToggleSwitch isOn={!!notificationSettings[`${category}-${option}`]} onToggle={() => setNotificationSettings(prev => ({ ...prev, [`${category}-${option}`]: !prev[`${category}-${option}`] }))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setIsNotificationModalOpen(false)} className="w-full mt-8 px-4 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Close</button>
              </div>
            </div>
          )}
          {isPrivacyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-xl font-bold mb-6">Privacy & Security</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">Profile Visibility</label>
                    <select className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Show Quiz History</span>
                    <ToggleSwitch isOn={!!notificationSettings['Show Quiz History']} onToggle={() => setNotificationSettings(prev => ({ ...prev, 'Show Quiz History': !prev['Show Quiz History'] }))} />
                  </div>
                  <button className="w-full px-4 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors">Change Password</button>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Two-Factor Authentication</span>
                    <ToggleSwitch isOn={!!notificationSettings['Two-Factor Authentication']} onToggle={() => setNotificationSettings(prev => ({ ...prev, 'Two-Factor Authentication': !prev['Two-Factor Authentication'] }))} />
                  </div>
                </div>
                <button onClick={() => setIsPrivacyModalOpen(false)} className="w-full mt-8 px-4 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Close</button>
              </div>
            </div>
          )}
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
                    <label className="block text-sm font-bold mb-1">Profile Photo</label>
                    <input type="file" id="photo-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <label htmlFor="photo-upload" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-bold bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer">
                      <CloudUpload size={18} />
                      Upload Profile Photo
                    </label>
                    {selectedFile && <p className="text-xs mt-2 text-emerald-500">{selectedFile.name}</p>}
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
              onClick={() => setAppState('landing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isDarkMode ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm border border-gray-100'
              }`}
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-yellow-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-sm'}`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.displayName}</p>
                  <button onClick={handleLogout} className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} hover:text-rose-500 font-bold uppercase tracking-widest`}>Logout</button>
                </div>
                <img src={getUserProfilePhoto()} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-emerald-500" referrerPolicy="no-referrer" />
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Sidebar */}
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
                      <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.displayName}</h2>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                    </div>
                    <div className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Member Since</p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Settings size={20} className="text-emerald-500" />
                    Account Settings
                  </h3>
                  <div className="space-y-3">
                    <button onClick={() => setIsEditModalOpen(true)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      Edit Profile
                    </button>
                    <button onClick={() => setIsNotificationModalOpen(true)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      Notification Preferences
                    </button>
                    <button onClick={() => setIsPrivacyModalOpen(true)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      Privacy & Security
                    </button>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & History */}
              <div className="lg:col-span-2 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <BarChart3 size={20} />
                      </div>
                      <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Total Quizzes</p>
                    </div>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userScores.length}</p>
                  </div>
                  <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Trophy size={20} />
                      </div>
                      <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Avg. Score</p>
                    </div>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userScores.length > 0 
                        ? Math.round((userScores.reduce((acc, s) => acc + s.score, 0) / userScores.reduce((acc, s) => acc + s.totalQuestions, 0)) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className={`p-6 rounded-3xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Flame size={20} />
                      </div>
                      <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Best Score</p>
                    </div>
                    <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0}
                    </p>
                  </div>
                </div>

                {/* History Table */}
                <div className={`rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <History size={22} className="text-emerald-500" />
                      Quiz History
                    </h3>
                    <div className="flex items-center gap-4">
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
                      </select>
                      <select 
                        value={filterDifficulty} 
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        <option value="All">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                        {userScores.length} Sessions
                      </span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-50 bg-gray-50/50'}`}>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Difficulty</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Score</th>
                          <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {isFetchingScores ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium`}>Loading your history...</p>
                              </div>
                            </td>
                          </tr>
                        ) : userScores.length > 0 ? (
                          userScores
                            .filter(score => (filterCategory === 'All' || 
                                             (CATEGORIES.find(c => c.title === filterCategory)?.subcategories.includes(score.category) || score.category === filterCategory)) && 
                                             (filterDifficulty === 'All' || score.difficulty === filterDifficulty))
                            .map((score) => (
                            <tr key={score.id} className={`group transition-colors ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50/50'}`}>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <HelpCircle size={16} />
                                  </div>
                                  <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{score.category}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                  score.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                  score.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}>
                                  {score.difficulty}
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{score.score}</span>
                                  <span className="text-xs text-gray-400">/ {score.totalQuestions}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                  <Calendar size={14} />
                                  <span className="text-xs font-medium">
                                    {score.timestamp?.toDate ? score.timestamp.toDate().toLocaleDateString() : 'Recent'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                  <History size={32} />
                                </div>
                                <div className="space-y-1">
                                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No history yet</p>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Complete your first quiz to see your stats here!</p>
                                </div>
                                <button 
                                  onClick={() => setAppState('landing')}
                                  className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                                >
                                  Start a Quiz
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        </>
      )}

      {appState === 'quiz' && (
        <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
          {/* Low Time Flash Overlay */}
          <AnimatePresence>
            {timeLeft <= 5 && !isAnswered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 bg-red-600 pointer-events-none z-0"
              />
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <div className={`absolute top-0 left-0 w-full h-2 z-50 transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            />
          </div>

          {/* Quiz Top Bar */}
          <header className={`p-6 lg:px-12 flex justify-between items-center m-6 rounded-3xl border transition-all duration-500 shadow-sm relative z-10 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <button onClick={resetToHome} className={`p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <Home size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
            </button>
            <div className="text-center">
              <p className={`text-xs font-semibold tracking-wider uppercase mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Quiz Progress</p>
              <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Question {currentQuestionIndex + 1} <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-lg font-medium`}>/ {activeQuestions.length}</span></h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-sm'}`}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </motion.button>
              </div>
              <div className="flex items-center gap-8">
                {/* Persistent Combo Meter */}
                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-500 ${currentStreak >= 3 ? 'border-orange-400 bg-orange-500/10' : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <motion.div
                  animate={currentStreak >= 3 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Flame className={`transition-all duration-500 ${getFireStyles(currentStreak)}`} size={24} />
                </motion.div>
                <div className="text-left">
                  <p className={`text-[10px] font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Streak</p>
                  <p className={`text-xl font-bold leading-none ${currentStreak >= 3 ? 'text-orange-500' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{currentStreak}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all duration-500 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} ${timeLeft <= 5 ? 'text-red-500 border-red-500/50' : isDarkMode ? 'text-emerald-400 border-emerald-400/30' : 'text-emerald-600 border-emerald-600/30'}`}>
                <Timer size={20} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
                <span className="font-mono text-xl font-bold">{timeLeft}s</span>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className={`text-[10px] font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Correct</p>
                  <p className="text-xl font-bold text-emerald-500">{correctCount}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Mistakes</p>
                  <p className="text-xl font-bold text-rose-500">{incorrectCount}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

          <main className="flex-1 px-6 py-8 flex items-center justify-center relative z-10">
            <div className="max-w-4xl w-full space-y-12 relative">
              {/* Combo Overlay */}
              <AnimatePresence>
                {showCombo && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 50 }}
                    animate={{ scale: 1.5, opacity: 1, y: -100 }}
                    exit={{ scale: 2, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                  >
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-10 py-4 rounded-full font-black text-6xl shadow-[0_0_50px_rgba(249,115,22,0.6)] border-4 border-white italic tracking-tighter">
                      {comboMessage}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Combo Lost Overlay */}
              <AnimatePresence>
                {showComboLost && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                  >
                    <div className="text-rose-500 font-black text-7xl italic tracking-tighter drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                      COMBO LOST!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timed Streak Overlay */}
              <AnimatePresence>
                {showTimedStreak && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                    exit={{ scale: 2, opacity: 0, rotate: 20 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                  >
                    <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-8 py-3 rounded-2xl font-black text-4xl shadow-[0_0_40px_rgba(16,185,129,0.5)] border-2 border-white flex items-center gap-3">
                      <Zap size={32} fill="white" className="animate-pulse" />
                      SPEED STREAK x{timedStreak}!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Visual Countdown Bar */}
                <div className={`w-full h-3 rounded-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <motion.div 
                    className={`h-full ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / DIFFICULTY_CONFIG[difficulty].time) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>

                {/* Question Image & AI Generation */}
                <div className="flex flex-col items-center gap-6">
                  {currentQuestion.questionImage && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-48 h-48 rounded-3xl border flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    >
                      {renderQuestionImage(currentQuestion.questionImage)}
                    </motion.div>
                  )}
                  
                  <button
                    onClick={() => setShowImagePromptModal(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
                    }`}
                  >
                    <Wand2 size={16} />
                    {currentQuestion.questionImage ? 'Regenerate Illustration' : 'Generate Illustration'}
                  </button>
                </div>

                <h3 className={`text-3xl lg:text-4xl font-bold text-center leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentQuestion.questionText}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedOption;
                    const isKeyboardSelected = idx === selectedOptionIndex;
                    
                    let buttonClass = "w-full p-6 rounded-2xl text-lg font-semibold transition-all duration-200 border text-left flex justify-between items-center ";
                    
                    if (!isAnswered) {
                      if (isKeyboardSelected) {
                        buttonClass += isDarkMode 
                          ? "bg-gray-800 border-emerald-500 text-white ring-2 ring-emerald-500/20"
                          : "bg-gray-50 border-emerald-500 text-gray-900 ring-4 ring-emerald-500/10";
                      } else {
                        buttonClass += isDarkMode 
                          ? "bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800 text-white"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 shadow-sm";
                      }
                    } else {
                      if (isCorrect) {
                        buttonClass += isDarkMode 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/20" 
                          : "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/10";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += isDarkMode 
                          ? "bg-rose-500/20 border-rose-500 text-rose-400 ring-4 ring-rose-500/20" 
                          : "bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-500/10";
                      } else {
                        buttonClass += isDarkMode 
                          ? "bg-gray-900 border-gray-800 text-gray-600 opacity-40"
                          : "bg-gray-50 border-gray-200 text-gray-400 opacity-40";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!isAnswered ? { scale: 1.02, y: -4 } : {}}
                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                        animate={isAnswered ? (
                          isCorrect ? { 
                            scale: [1, 1.04, 1],
                            boxShadow: [
                              "0 0 0px rgba(16,185,129,0)", 
                              "0 0 40px rgba(16,185,129,0.4)", 
                              "0 0 0px rgba(16,185,129,0)"
                            ]
                          } : (isSelected ? {
                            x: [0, -10, 10, -10, 10, 0],
                            transition: { duration: 0.4 }
                          } : {})
                        ) : {}}
                        transition={isAnswered && isCorrect ? { 
                          repeat: 2,
                          duration: 0.6,
                          ease: "easeInOut"
                        } : { duration: 0.3 }}
                        onClick={() => handleOptionClick(option)}
                        disabled={isAnswered}
                        className={buttonClass}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-sm opacity-60 font-medium">Option {idx + 1}</span>
                          <span className="text-lg font-bold">{option}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {isAnswered && isCorrect && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Correct</span>
                              <CheckCircle2 size={28} className="text-emerald-500" />
                            </div>
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1">Your Choice</span>
                              <AlertCircle size={28} className="text-rose-500" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <button 
                      onClick={nextQuestion}
                      className={`px-12 py-5 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 ${isDarkMode ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-white border-gray-900'}`}
                    >
                      {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ChevronRight size={20} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      {appState === 'results' && (
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <header className="p-6 md:p-10 flex justify-between items-center max-w-7xl mx-auto w-full">
            <button 
              onClick={resetToHome}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isDarkMode ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm border border-gray-100'
              }`}
            >
              <Home size={18} />
              Home
            </button>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-yellow-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-sm'}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`max-w-xl w-full rounded-3xl p-10 text-center space-y-8 border shadow-xl relative overflow-y-auto max-h-[85vh] custom-scrollbar ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm ${isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}
              >
                <Trophy size={40} />
              </motion.div>

              <div className="space-y-2 mb-8">
                <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userName ? `${userName}, Quiz Completed!` : "Quiz Completed!"}
                </h2>
                <div className="flex justify-center mt-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {(() => {
                      const score = (correctCount / activeQuestions.length) * 10;
                      if (score === 10) return 'Perfect Score';
                      if (score >= 8) return 'Great Job';
                      if (score >= 5) return 'Good Effort';
                      return 'Keep Practicing';
                    })()}
                  </span>
                </div>
              </div>

              <div className={`grid grid-cols-3 gap-4 p-6 rounded-2xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-emerald-500">{correctCount}</p>
                  <p className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct</p>
                </div>
                <div className="space-y-1 border-x border-gray-200 dark:border-gray-700">
                  <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round((correctCount / activeQuestions.length) * 100)}%</p>
                  <p className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-rose-500">{incorrectCount}</p>
                  <p className={`text-xs font-semibold tracking-wider uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mistakes</p>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="space-y-6 mb-8 text-left">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <BarChart3 size={20} className="text-indigo-500" />
                    Performance Analysis
                  </h3>
                </div>

                {/* Category Accuracy */}
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(
                    quizSummary.reduce((acc, curr) => {
                      if (!acc[curr.category]) acc[curr.category] = { correct: 0, total: 0 };
                      acc[curr.category].total += 1;
                      if (curr.isCorrect) acc[curr.category].correct += 1;
                      return acc;
                    }, {} as Record<string, { correct: number, total: number }>)
                  ).map(([cat, stats]) => {
                    const s = stats as { correct: number, total: number };
                    return (
                      <div key={cat} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cat}</span>
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {Math.round((s.correct / s.total) * 100)}%
                          </span>
                        </div>
                        <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.correct / s.total) * 100}%` }}
                            className={`h-full rounded-full ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Question Breakdown */}
                <div className="space-y-3">
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Question Breakdown</h4>
                  <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {quizSummary.map((item, idx) => (
                        <div 
                          key={idx}
                          className={`p-4 flex gap-4 border-b last:border-0 ${isDarkMode ? 'border-gray-700 hover:bg-gray-800/80' : 'border-gray-100 hover:bg-gray-50/80'} transition-colors`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            item.isCorrect 
                              ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                              : (isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600')
                          }`}>
                            {item.isCorrect ? <CheckCircle2 size={16} /> : <X size={16} />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm font-medium leading-tight ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {item.question}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <p className="text-xs">
                                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Your answer: </span>
                                <span className={item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}>
                                  {item.selectedOption || 'Timed out'}
                                </span>
                              </p>
                              {!item.isCorrect && (
                                <p className="text-xs">
                                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Correct: </span>
                                  <span className="text-emerald-500">{item.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetToHome}
                    className={`flex-1 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                  >
                    <Home size={20} /> Home
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (selectedCategory) {
                        setAppState('difficulty');
                      } else {
                        resetToHome();
                      }
                    }}
                    className={`flex-1 py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    <RotateCcw size={20} /> Play Again
                  </motion.button>
                </div>

                {user ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveScore}
                    disabled={isSavingScore}
                    className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 border-2 ${
                      isSavingScore 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-emerald-500/20'
                    }`}
                  >
                    {isSavingScore ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        Saving to Leaderboard...
                      </>
                    ) : (
                      <>
                        <Trophy size={24} />
                        Save to Leaderboard
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 border-2 ${
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <LogIn size={24} />
                    Login to Save Score
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )}

      {/* Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row h-full md:h-[32rem] ${
                isDarkMode 
                  ? `bg-gray-900 border-gray-800` 
                  : `bg-white border-gray-200`
              }`}
            >
              {/* Left Side - Visual */}
              <div className={`w-full md:w-2/5 ${selectedCategory.color} p-8 md:p-10 flex flex-col justify-between relative overflow-hidden`}>
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-gray-900 hover:bg-black/20 transition-colors md:hidden"
                >
                  <X size={20} />
                </button>

                <div className="relative z-10 flex flex-col h-full justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-black/10 backdrop-blur-sm flex items-center justify-center text-gray-900 shadow-sm mb-6">
                    {React.cloneElement(selectedCategory.icon as React.ReactElement, { size: 32 })}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">{selectedCategory.title}</h2>
                    <p className="text-gray-800 text-base leading-relaxed">{selectedCategory.description}</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className={`flex-1 p-8 md:p-10 flex flex-col overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="flex justify-end hidden md:flex mb-2">
                  <button 
                    onClick={handleCloseModal}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Select Your Challenge</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCategory.subcategories.map((sub, i) => (
                      <motion.button
                        key={sub}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          console.log("Subcategory selected:", sub);
                          setSelectedSubcategory(sub);
                        }}
                        className={`p-4 rounded-xl text-left transition-all duration-200 border font-semibold text-sm ${
                          selectedSubcategory === sub 
                            ? isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-900 border-gray-900 text-white'
                            : isDarkMode 
                              ? 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        {sub}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className={`text-xs font-semibold tracking-wider uppercase mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Difficulty Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDifficulty(level)}
                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-200 border ${
                          difficulty === level
                            ? isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-900 border-gray-900 text-white'
                            : isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${difficulty === level ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white' : isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                          {DIFFICULTY_CONFIG[level].icon}
                        </div>
                        <div className="text-center">
                          <span className="block text-xs font-bold uppercase tracking-wider mb-0.5">{DIFFICULTY_CONFIG[level].label}</span>
                          <span className={`text-[10px] font-medium ${difficulty === level ? 'text-gray-300' : 'text-gray-400'}`}>
                            {DIFFICULTY_CONFIG[level].questions} Qs • {DIFFICULTY_CONFIG[level].time}s
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                  <div className={`mt-auto pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Timer size={14} />
                        <span className="text-[10px] font-semibold tracking-wider uppercase">{DIFFICULTY_CONFIG[difficulty].time}s Per Question</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <HelpCircle size={14} />
                        <span className="text-[10px] font-semibold tracking-wider uppercase">{DIFFICULTY_CONFIG[difficulty].questions} Questions</span>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCloseModal}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                          isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 border-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={selectedSubcategory ? { scale: 1.05 } : {}}
                        whileTap={selectedSubcategory ? { scale: 0.95 } : {}}
                        onClick={startQuiz}
                        disabled={!selectedSubcategory}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                          selectedSubcategory 
                            ? isDarkMode ? 'bg-white text-gray-900 border-white hover:bg-gray-100' : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
                            : isDarkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100'
                        }`}
                      >
                        {selectedSubcategory ? 'Start Quiz' : 'Select Topic'}
                      </motion.button>
                    </div>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Image Generation Modal */}
      <AnimatePresence>
        {showImagePromptModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div 
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => !isGeneratingImage && setShowImagePromptModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-8 border shadow-2xl ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <Wand2 size={20} />
                  </div>
                  <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Illustration</h3>
                </div>
                <button 
                  onClick={() => setShowImagePromptModal(false)}
                  disabled={isGeneratingImage}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Describe the illustration you want for this question. The AI will generate a custom SVG for you.
                </p>

                <div className="relative min-h-[128px] flex items-center justify-center">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}
                      >
                        <Wand2 size={32} />
                      </motion.div>
                      <div className="space-y-2">
                        <p className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Generating your masterpiece...</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>This usually takes a few seconds</p>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g., A minimalist line drawing of a telescope looking at stars..."
                      className={`w-full h-32 p-4 rounded-xl border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  )}
                </div>

                {generationError && (
                  <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{generationError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowImagePromptModal(false)}
                    disabled={isGeneratingImage}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateAIImage}
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                      !imagePrompt.trim() || isGeneratingImage
                        ? isDarkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isGeneratingImage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


