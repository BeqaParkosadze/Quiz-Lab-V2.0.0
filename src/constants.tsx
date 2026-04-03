import * as React from 'react';
import { 
  Baby, 
  Backpack, 
  GraduationCap, 
  Globe, 
  Hourglass, 
  Palette, 
  Music, 
  Film, 
  Calculator, 
  Atom, 
  BookOpen, 
  Compass, 
  Wand2, 
  Rocket, 
  Leaf, 
  Cpu, 
  Zap, 
  Utensils, 
  Waves, 
  Pyramid, 
  Languages, 
  Lightbulb,
  Shield,
  Flame
} from 'lucide-react';
import { QuizCategory, Achievement } from './types';

export const AGE_GROUPS = [
  { id: 'kids', label: 'For Kids', icon: <Baby size={24} />, color: 'amber' },
  { id: 'teens', label: 'For Teens', icon: <Backpack size={24} />, color: 'emerald' },
  { id: 'adults', label: 'For Adults', icon: <GraduationCap size={24} />, color: 'indigo' },
];

export const DASHBOARD_CATEGORIES = ['All', 'Football', 'History', 'Geography', 'Science', 'Mystery'];

export const ADMIN_EMAIL = 'beqaparkosadze@gmail.com';

export const STARTER_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', title: 'First Blood', description: 'Unlocks after the first quiz completed.', icon: '🩸', unlocked: false },
  { id: 'perfect-score', title: 'Perfect Score', description: 'Unlocks after getting 100% on any quiz.', icon: '🎯', unlocked: false },
  { id: 'history-buff', title: 'History Buff', description: 'Unlocks after completing 3 History quizzes.', icon: '📜', unlocked: false },
  { id: 'quiz-master', title: 'Quiz Master', description: 'Unlocks after completing 10 quizzes.', icon: '🏆', unlocked: false },
];

export const CATEGORIES: QuizCategory[] = [
  {
    id: 'geography',
    title: 'Geography',
    description: 'Explore the world\'s wonders and landmarks.',
    icon: <Globe />,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    subcategories: ['Continents', 'Oceans', 'Flags', 'Landmarks'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'history',
    title: 'History',
    description: 'Travel back in time to discover our past.',
    icon: <Hourglass />,
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
    subcategories: ['Ancient Egypt', 'World Wars', 'Renaissance', 'Modern History'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'art',
    title: 'Art',
    description: 'Unleash your creativity and learn about masterpieces.',
    icon: <Palette />,
    color: 'bg-pink-100',
    iconColor: 'text-pink-600',
    subcategories: ['Art History', 'Famous Painters', 'Techniques'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'music',
    title: 'Music',
    description: 'Feel the rhythm and explore musical history.',
    icon: <Music />,
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    subcategories: ['Music Theory', 'Instruments', 'Genres'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'cinema',
    title: 'Cinema & Series',
    description: 'Lights, camera, action! Test your movie knowledge.',
    icon: <Film />,
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
    subcategories: ['Film Classics', 'Modern Cinema', 'TV Shows'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'math',
    title: 'Math',
    description: 'Challenge your brain with numbers and logic.',
    icon: <Calculator />,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    subcategories: ['Basic Math', 'Algebra', 'Geometry', 'Calculus'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'science',
    title: 'Science',
    description: 'Discover the laws of nature and the universe.',
    icon: <Atom />,
    color: 'bg-teal-100',
    iconColor: 'text-teal-600',
    subcategories: ['Physics', 'Chemistry', 'Biology', 'Astronomy'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'literature',
    title: 'Literature',
    description: 'Dive into classic novels, poetry, and mythology.',
    icon: <BookOpen />,
    color: 'bg-rose-100',
    iconColor: 'text-rose-600',
    subcategories: ['Classic Novels', 'Poetry', 'Mythology', 'Authors'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'general-knowledge',
    title: 'General Knowledge',
    description: 'Test your trivia skills on a variety of topics.',
    icon: <Compass />,
    color: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    subcategories: ['Trivia', 'Pop Culture', 'Inventions', 'Sports'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'mythology',
    title: 'Mythology',
    description: 'Explore the myths and legends of ancient cultures.',
    icon: <Wand2 />,
    color: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    subcategories: ['Greek', 'Norse', 'Egyptian', 'Folklore'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'space',
    title: 'Space',
    description: 'Journey through the stars and planets.',
    icon: <Rocket />,
    color: 'bg-slate-100',
    iconColor: 'text-slate-600',
    subcategories: ['Solar System', 'Black Holes', 'Space Missions', 'Galaxies'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'nature',
    title: 'Nature',
    description: 'Learn about the wonders of the natural world.',
    icon: <Leaf />,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    subcategories: ['Wildlife', 'Plants', 'Ecosystems', 'Conservation'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'technology',
    title: 'Technology',
    description: 'Discover the world of computers and innovation.',
    icon: <Cpu />,
    color: 'bg-gray-100',
    iconColor: 'text-gray-600',
    subcategories: ['Coding', 'AI', 'Hardware', 'Internet'],
    ageGroups: ['teens', 'adults']
  },
  {
    id: 'sports',
    title: 'Sports',
    description: 'Test your knowledge of games and athletics.',
    icon: <Zap />,
    color: 'bg-orange-100',
    iconColor: 'text-orange-600',
    subcategories: ['Olympics', 'Football', 'Basketball', 'Extreme Sports'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'food',
    title: 'Food & Cooking',
    description: 'A delicious journey through global cuisines.',
    icon: <Utensils />,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    subcategories: ['Cuisines', 'Nutrition', 'Baking', 'Ingredients'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'ocean',
    title: 'Ocean Life',
    description: 'Dive deep into the mysteries of the sea.',
    icon: <Waves />,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    subcategories: ['Marine Biology', 'Coral Reefs', 'Deep Sea', 'Sharks'],
    ageGroups: ['kids', 'teens', 'adults']
  },
  {
    id: 'ancient-civilizations',
    title: 'Ancient Civilizations',
    description: 'Uncover the secrets of the past.',
    icon: <Pyramid />,
    color: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    subcategories: ['Maya', 'Rome', 'Greece', 'Mesopotamia'],
    ageGroups: ['teens', 'adults']
  },
  {
    id: 'languages',
    title: 'Languages',
    description: 'Explore the diversity of human speech.',
    icon: <Languages />,
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    subcategories: ['Etymology', 'Grammar', 'World Languages', 'Idioms'],
    ageGroups: ['teens', 'adults']
  },
  {
    id: 'inventions',
    title: 'Inventions',
    description: 'Meet the brilliant minds who changed the world.',
    icon: <Lightbulb />,
    color: 'bg-amber-100',
    iconColor: 'text-amber-600',
    subcategories: ['Famous Inventors', 'Medical Breakthroughs', 'Industrial Revolution'],
    ageGroups: ['kids', 'teens', 'adults']
  }
];

export const DIFFICULTY_CONFIG = {
  easy: { questions: 5, time: 45, icon: <Shield size={18} />, label: 'Easy' },
  medium: { questions: 10, time: 30, icon: <Zap size={18} />, label: 'Medium' },
  hard: { questions: 15, time: 15, icon: <Flame size={18} />, label: 'Hard' },
};

export const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  ambient: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  streak: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  streak3: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  streak5: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  streak7: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  comboLost: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
};

export const AVATAR_GALLERY = [
  'https://api.dicebear.com/9.x/bottts/svg?seed=Robot',
  'https://api.dicebear.com/9.x/ninja/svg?seed=Ninja',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Astronaut',
  'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Fox',
  'https://api.dicebear.com/9.x/pixel-art/svg?seed=Wizard',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Gamer',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Ninja2',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Robot2',
];

export const ADMIN_AVATAR_URL = 'https://api.dicebear.com/9.x/thumbs/svg?seed=AdminCrown';
