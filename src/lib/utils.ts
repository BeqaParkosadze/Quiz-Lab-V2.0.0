import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAvatar = (photoURL?: string | null, gender: 'male' | 'female' = 'male') => {
  if (photoURL) {
    return photoURL;
  }
  return gender === 'male' ? './avatar_male.png' : './avatar_female.png';
};
