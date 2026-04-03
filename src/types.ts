import * as React from 'react';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  score: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  timestamp: any;
}

export interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  iconColor?: string;
  subcategories: string[];
  ageGroups: string[];
}

export type AppState = 'landing' | 'quiz' | 'results' | 'profile' | 'login';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface CategoryCardProps {
  cat: QuizCategory;
  idx: number;
  onClick: () => void;
}
