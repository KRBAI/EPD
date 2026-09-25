export interface BrailleChar {
  letter: string;
  dots: number[]; // e.g. [1, 2]
  word: string;
  unicode: string;
  perkinsGuide: {
    leftHand: number[];  // dots among [3, 2, 1]
    rightHand: number[]; // dots among [4, 5, 6]
  };
  fingerHint: string;
  childFriendlyExample: string; // Sensory explanation understandable by a blind child (touch, sound, taste)
  buttonInstructions: string;   // Exact instructions telling how to press the buttons
}

export type AppMode = 'lessons' | 'discovery' | 'practice';
export type LetterRange = 'A-J' | 'A-T' | 'A-Z';
export type ThemeMode = 'dark' | 'yellow-black' | 'light';

export interface LessonLevel {
  id: number;
  unit: number;
  title: string;
  subtitle: string;
  badgeEmoji: string;
  letters: string[];
  targetWord?: string; // For word levels
  description: string;
  requiredXp: number;
  totalSteps: number;
  unlockedByDefault?: boolean;
}

export interface UserStats {
  xp: number;
  streak: number;
  completedLevels: number[];
  starsPerLevel: Record<number, number>;
  hearts: number;
  totalKeystrokes: number;
}
