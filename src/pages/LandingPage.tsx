import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  CheckCircle2, 
  Globe, 
  Hourglass, 
  Palette, 
  Music, 
  Search, 
  X, 
  Trophy, 
  LogOut, 
  LogIn, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon,
  Shield
} from 'lucide-react';
import { CATEGORIES, AGE_GROUPS, DASHBOARD_CATEGORIES } from '../constants';
import { CategoryCard } from '../components/CategoryCard';
import { FooterLink } from '../components/FooterLink';
import logo from '../logo.png';

export const LandingPage = ({ isDarkMode, user, appState, setAppState, activeAgeGroup, setActiveAgeGroup, searchQuery, setSearchQuery, handleCategoryClick, getUserProfilePhoto, handleLogout, setIsMuted, isMuted, setIsDarkMode, setIsLeaderboardOpen, setActiveLegalModal, selectedDashboardCategory, setSelectedDashboardCategory }: any) => {
  const openLegalModal = (title: string, content: string) => {
    setActiveLegalModal({ title, content });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-screen relative z-10 overflow-hidden">
      {/* Sidebar */}
          <aside className={`hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r backdrop-blur-2xl transition-all duration-500 z-20 ${isDarkMode ? 'bg-gray-950/40 border-gray-800/50' : 'bg-white/40 border-gray-200/50'}`}>
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
              <p className={`px-4 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Category Hub</p>
              {user?.email === 'beqaparkosadze@gmail.com' && (
                <button
                  onClick={() => setAppState('admin')}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-lg bg-emerald-500/10 group-hover:scale-110`}>
                    <Shield size={24} />
                  </div>
                  <span className="font-bold text-sm">Admin Panel</span>
                </button>
              )}
              {CATEGORIES.filter(cat => cat.ageGroups.includes(activeAgeGroup)).slice(0, 5).map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ x: 8, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  whileTap={{ scale: 0.95, x: 4 }}
                  onClick={() => { console.log('Category clicked:', cat.id); handleCategoryClick(cat); }}
                  title={cat.title}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-lg ${cat.color} ${cat.iconColor} group-hover:scale-110`}>
                    {React.cloneElement(cat.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <span className="font-bold text-sm">{cat.title}</span>
                </motion.button>
              ))}
            </div>

            <div className="p-6 border-t border-gray-800/10">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-xs font-bold text-emerald-500 mb-1">Pro Tip</p>
                <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Choose a category and difficulty to start your journey.</p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-auto lg:h-screen overflow-y-auto">
            {/* Header */}
            <header className="p-4 md:px-10 md:py-6 flex justify-between items-center w-full relative z-30">
              {/* Logo Area (Left) */}
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setAppState('landing')}>
                <img 
                  src={logo} 
                  alt="Quiz Lab" 
                  className="h-12 md:h-20 w-auto drop-shadow-2xl transition-transform hover:scale-105" 
                />
                <div className="flex flex-col">
                  <span className={`text-2xl md:text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Quiz Lab
                  </span>
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-40" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 md:gap-2 mr-1 md:mr-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-yellow-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-sm'}`}
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </motion.button>
                </div>

                <button 
                  onClick={() => setIsLeaderboardOpen(true)}
                  className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-emerald-400 hover:bg-gray-800' : 'bg-white border-gray-200 text-emerald-600 hover:bg-gray-50 shadow-sm'}`}
                >
                  <Trophy size={14} />
                  Leaderboard
                </button>

                {user ? (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAppState('profile')} className="relative group">
                      <div className={`w-9 h-9 rounded-xl border-2 border-emerald-500/20 hover:border-emerald-500 transition-all backdrop-blur-md overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-900/5'}`}>
                        <img src={getUserProfilePhoto()} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className={`hidden md:block p-2 rounded-xl border transition-all duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500 hover:text-rose-500 hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:text-rose-500 hover:bg-gray-50 shadow-sm'}`}
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAppState('login')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl'}`}
                  >
                    <LogIn size={14} />
                    Login
                  </button>
                )}
              </div>
            </header>

            {/* Immersive Hero Section */}
            <section className="px-6 md:px-12 pt-2 pb-8 overflow-hidden">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-left space-y-6 max-w-2xl lg:pr-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`inline-block px-4 py-1.5 rounded-full border text-[9px] font-black tracking-[0.2em] uppercase shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800 text-emerald-400' : 'bg-white border-gray-200 text-emerald-700'}`}
                  >
                    The Ultimate Quiz Playground
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter leading-tight break-words whitespace-normal ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Quiz Lab: The Ultimate <br />
                    <span className="text-neon-gradient">AI-Powered Trivia & Knowledge Platform</span>
                  </motion.h1>
                  <p className={`text-base md:text-lg leading-relaxed max-w-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Engage with interactive brain teasers and multiple-choice knowledge tests. Join our competitive leaderboard challenges or try our AI-generated quizzes for students and professionals.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button 
                      onClick={() => document.getElementById('categories-grid')?.scrollIntoView({ behavior: 'smooth' })}
                      className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-2xl shadow-emerald-500/20'}`}
                    >
                      Start Free AI Quiz Now
                    </button>
                    {!user && (
                      <button 
                        onClick={() => setAppState('login')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20'}`}
                      >
                        Get Started
                      </button>
                    )}
                    <button 
                      onClick={() => setIsLeaderboardOpen(true)}
                      className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                    >
                      View Rankings
                    </button>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="hidden lg:block relative"
                >
                  {/* Why Choose Quiz Lab? Section */}
                  <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-xl'}`}>
                    <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose Quiz Lab?</h2>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Personalized learning experience</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Instant results</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Global trivia community</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`absolute inset-0 blur-3xl rounded-full opacity-20 bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse`} />
                  <div className={`relative p-6 rounded-[2.5rem] border backdrop-blur-sm overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white/40 border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-3">
                      {[Globe, Hourglass, Palette, Music].map((Icon, i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                          className={`aspect-square rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}
                        >
                          <Icon size={40} className={isDarkMode ? 'text-emerald-500/50' : 'text-emerald-600/50'} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Mobile Category Hub */}
            <div className="lg:hidden px-6 mb-8">
              <div className="flex flex-col gap-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Category Hub</p>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {CATEGORIES.filter(cat => cat.ageGroups.includes(activeAgeGroup)).map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(cat)}
                      title={cat.title}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color} ${cat.iconColor}`}>
                        {React.cloneElement(cat.icon as React.ReactElement, { size: 24 })}
                      </div>
                      <span className="font-bold text-[10px] whitespace-nowrap">{cat.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Age Group Tabs */}
            <section className="px-6 md:px-12 mb-12">
              <div className="max-w-6xl mx-auto">
                <div className={`flex flex-col md:flex-row gap-2 p-2 rounded-2xl md:rounded-3xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                  {AGE_GROUPS.map((group) => {
                    const isActive = activeAgeGroup === group.id;
                    return (
                      <button
                        key={group.id}
                        onClick={() => setActiveAgeGroup(group.id)}
                        title={group.label}
                        className={`relative flex-1 px-6 py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 font-bold text-sm uppercase tracking-widest ${isActive ? (isDarkMode ? 'bg-white text-gray-900 shadow-md' : 'bg-slate-900 text-white shadow-md') : (isDarkMode ? 'text-gray-500 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')}`}
                      >
                        <span className={isActive ? 'scale-110 transition-transform' : ''}>{group.icon}</span>
                        {group.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Search Bar & Category Filter Section */}
            <section className="px-6 md:px-12 mb-8">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Search Bar */}
                <div className={`relative group flex items-center p-1 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-900/50 border-gray-800 focus-within:border-emerald-500/50 focus-within:bg-gray-900' : 'bg-white border-gray-200 focus-within:border-emerald-500/50 focus-within:shadow-lg'}`}>
                  <div className="pl-4 text-gray-400">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="Search for quiz categories (e.g. Science, History)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-3 bg-transparent border-none focus:outline-none font-bold text-sm ${isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="pr-4 text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {DASHBOARD_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedDashboardCategory(cat)}
                      className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${selectedDashboardCategory === cat ? (isDarkMode ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white') : (isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Storyflow Grid Section */}
            <section id="categories-grid" className="px-6 md:px-12 pb-32">
              <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {CATEGORIES.filter(cat => {
                      const matchesAge = cat.ageGroups.includes(activeAgeGroup);
                      const matchesSearch = 
                        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cat.description.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = selectedDashboardCategory === 'All' || cat.title === selectedDashboardCategory;
                      return matchesAge && matchesSearch && matchesCategory;
                    }).map((cat, idx) => (
                      <motion.div 
                        key={`${activeAgeGroup}-${cat.id}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      >
                        <CategoryCard 
                          cat={cat} 
                          idx={idx} 
                          onClick={() => { console.log('Category clicked:', cat.id); handleCategoryClick(cat); }}
                          isDarkMode={isDarkMode}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-6 md:px-12 py-12 mt-auto border-t border-gray-800/10">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
                    <BookOpen size={20} />
                  </div>
                  <span className={`text-xl font-serif font-black tracking-tight text-neon-gradient`}>Quiz Lab</span>
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>© 2026 Quiz Lab. All rights reserved.</p>
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
                  <FooterLink onClick={() => openLegalModal('Privacy Policy', 'Our Privacy Policy covers the use of cookies, third-party ads (Google AdSense), and standard data protection measures to ensure your information is safe.')} isDarkMode={isDarkMode}>Privacy</FooterLink>
                  <FooterLink onClick={() => openLegalModal('Terms of Service', 'By using Quiz Lab, you agree to our Terms of Service. This platform is for educational and entertainment purposes. Please use it responsibly.')} isDarkMode={isDarkMode}>Terms</FooterLink>
                  <FooterLink onClick={() => openLegalModal('Contact', 'For inquiries, please contact us at support@quizlab.com. Follow us on social media for updates!')} isDarkMode={isDarkMode}>Contact</FooterLink>
                </div>
              </div>
            </footer>
          </div>
        </div>
  );
};
