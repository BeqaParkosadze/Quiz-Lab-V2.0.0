import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Users } from 'lucide-react';
import { User } from '../firebase';
import { LeaderboardEntry } from '../types';
import { getAvatar } from '../lib/utils';

export const LeaderboardModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  entries: LeaderboardEntry[], 
  isDarkMode: boolean,
  currentUser: User | null
}> = ({ isOpen, onClose, entries, isDarkMode, currentUser }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
        >
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden border shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-800/50 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Leaderboard</h3>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Top 50 Quiz Masters Worldwide</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3">
              {entries.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                    <Users size={32} />
                  </div>
                  <p className="text-gray-700 font-medium">No scores recorded yet. Be the first!</p>
                </div>
              ) : (
                entries.map((entry, index) => {
                  const isCurrentUser = currentUser?.uid === entry.userId;
                  const rank = index + 1;
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isCurrentUser 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                          : isDarkMode ? 'bg-gray-800/40 border-gray-800 hover:bg-gray-800/60' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 text-center font-black text-lg ${
                          rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-gray-500'
                        }`}>
                          {rank}
                        </div>
                        <div className="relative">
                          <img src={getAvatar(entry.userPhoto)} alt={entry.userName} className="w-10 h-10 rounded-xl object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                          {rank <= 3 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-0.5 shadow-sm">
                              <Trophy size={10} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-sm flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {entry.userName} 
                            {entry.userEmail === 'beqaparkosadze@gmail.com' && (
                              <>
                                <span className="text-blue-500">✓</span>
                                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">Founder</span>
                              </>
                            )}
                            {isCurrentUser && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full ml-1">YOU</span>}
                          </p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium uppercase tracking-wider`}>{entry.category} • {entry.difficulty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          {entry.userEmail === 'beqaparkosadze@gmail.com' ? '999,999' : entry.score} <span className="text-xs font-medium opacity-50">/ {entry.totalQuestions}</span>
                        </p>
                        <p className={`text-[9px] ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium`}>
                          {entry.timestamp?.toDate ? new Date(entry.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {!currentUser && (
              <div className="p-6 bg-emerald-500/5 border-t border-emerald-500/10 text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-700'} mb-3`}>Sign in to save your own scores and join the ranks!</p>
                <button 
                  onClick={onClose}
                  className="text-emerald-500 font-bold text-sm hover:underline"
                >
                  Close and Play
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
