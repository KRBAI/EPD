/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Keyboard,
  Settings2,
  Code2,
  Sun,
  Moon,
  Flame,
  Award,
  Map,
  Heart,
  ChevronRight,
  ArrowRight,
  Unlock,
  Eye,
  Hand,
  Play,
  Sparkles,
  Bluetooth,
} from 'lucide-react';
import {
  BRAILLE_ALPHABET,
  LETTERS_A_TO_J,
  LETTERS_A_TO_T,
  LETTERS_A_TO_Z,
  formatDotsDescription,
} from './data/brailleAlphabet';
import { LESSON_LEVELS, SPELLING_WORDS } from './data/lessons';
import { sound } from './utils/soundEngine';
import { BraillePadLogo } from './components/BraillePadLogo';
import { Esp32StatusBadge } from './components/Esp32StatusBadge';
import { Esp32ConnectionModal } from './components/Esp32ConnectionModal';
import { BrailleCell } from './components/BrailleCell';
import { PerkinsKeyboardGuide } from './components/PerkinsKeyboardGuide';
import { DuolingoLevelDrawer } from './components/DuolingoLevelDrawer';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { AppMode, LetterRange, ThemeMode, LessonLevel, UserStats } from './types';

export default function App() {
  // Navigation & Mode State
  const [mode, setMode] = useState<AppMode>('lessons');
  const [range, setRange] = useState<LetterRange>('A-J');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [audioStarted, setAudioStarted] = useState<boolean>(false);

  // Modals & Drawers
  const [isLevelDrawerOpen, setIsLevelDrawerOpen] = useState<boolean>(false);
  const [isLevelCompleteModalOpen, setIsLevelCompleteModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEsp32ModalOpen, setIsEsp32ModalOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAlphabetStrip, setShowAlphabetStrip] = useState<boolean>(false);

  // Audio / App Settings (Default calm & slow voice: 0.75 for 6+ year olds)
  const [speechRate, setSpeechRate] = useState<number>(0.75);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);
  const [infiniteHearts, setInfiniteHearts] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  // Duolingo Progression State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    completedLevels: [],
    starsPerLevel: {},
    hearts: 5,
    totalKeystrokes: 0,
  });

  // Current Target State
  const [targetLetter, setTargetLetter] = useState<string>('a');
  const [discoveredLetter, setDiscoveredLetter] = useState<string>('c');
  const [lastTypedLetter, setLastTypedLetter] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>(
    'Welcome to BraillePad! Press any key or Braille chord to begin.'
  );

  // Word spelling challenge state
  const [currentWordObj, setCurrentWordObj] = useState<{ word: string; letters: string[]; meaning: string } | null>(null);
  const [wordLetterIdx, setWordLetterIdx] = useState<number>(0);

  // Refs for window keydown listener closures
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const targetLetterRef = useRef(targetLetter);
  targetLetterRef.current = targetLetter;
  const currentLevelIdRef = useRef(currentLevelId);
  currentLevelIdRef.current = currentLevelId;
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;
  const audioStartedRef = useRef(audioStarted);
  audioStartedRef.current = audioStarted;
  const isLevelCompleteOpenRef = useRef(isLevelCompleteModalOpen);
  isLevelCompleteOpenRef.current = isLevelCompleteModalOpen;

  // Active level object
  const currentLevel = LESSON_LEVELS.find((l) => l.id === currentLevelId) || LESSON_LEVELS[0];

  // Initialize voices
  useEffect(() => {
    const updateVoices = () => {
      const v = sound.getAvailableVoices();
      setAvailableVoices(v);
      setSelectedVoiceName(sound.getSelectedVoiceName());
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Pick next letter/target within current level
  const pickNextTargetForLevel = useCallback((level: LessonLevel, step: number) => {
    // If it's a word-builder level (Level 9)
    if (level.id === 9) {
      const wordChoice = SPELLING_WORDS[(step - 1) % SPELLING_WORDS.length];
      setCurrentWordObj(wordChoice);
      setWordLetterIdx(0);
      const firstLetter = wordChoice.letters[0];
      const letterInfo = BRAILLE_ALPHABET[firstLetter];
      setTargetLetter(firstLetter);
      setFeedbackStatus('idle');
      setFeedbackMessage(`Spell ${wordChoice.word}: Type letter ${firstLetter.toUpperCase()}. ${letterInfo.buttonInstructions}`);
      sound.speak(
        `Let's spell the word ${wordChoice.word}! Like ${wordChoice.meaning}. First letter is ${firstLetter.toUpperCase()}. ${letterInfo.buttonInstructions}`
      );
      return;
    }

    setCurrentWordObj(null);
    const pool = level.letters;
    let candidates = pool.filter((l) => l !== targetLetterRef.current);
    if (candidates.length === 0) candidates = pool;
    const nextChar = candidates[Math.floor(Math.random() * candidates.length)];
    const letterInfo = BRAILLE_ALPHABET[nextChar];

    setTargetLetter(nextChar);
    setFeedbackStatus('idle');
    setFeedbackMessage(`Type ${nextChar.toUpperCase()} (${letterInfo.word}) — ${letterInfo.buttonInstructions}`);

    // Engaging, slow, warm Montessori-style storytelling and explicit finger instructions
    sound.speak(
      `Let's explore letter ${nextChar.toUpperCase()}! ${nextChar.toUpperCase()} is for ${letterInfo.word}... ${letterInfo.childFriendlyExample}. Here is how to type it: ${letterInfo.buttonInstructions}`
    );
  }, []);

  // Launch a level
  const handleSelectLevel = useCallback((lvl: LessonLevel) => {
    setCurrentLevelId(lvl.id);
    setCurrentStep(1);
    setLastTypedLetter(null);
    setFeedbackStatus('idle');
    setMode('lessons');
    sound.playModeSwitchTone();
    sound.speak(`Welcome to Level ${lvl.id}! ${lvl.title}... ${lvl.description}`, () => {
      pickNextTargetForLevel(lvl, 1);
    });
  }, [pickNextTargetForLevel]);

  // Start audio session
  const startAudioSession = useCallback(() => {
    sound.unlockAudio();
    sound.speechRate = speechRate;
    setAudioStarted(true);
    sound.playModeSwitchTone();
    sound.speak(
      'Welcome to BraillePad! Your keyboard is connected. Listen closely to each story and I will teach you which buttons to press.'
    );
    pickNextTargetForLevel(currentLevel, 1);
  }, [currentLevel, pickNextTargetForLevel, speechRate]);

  // Switch modes
  const handleModeChange = useCallback(
    (newMode: AppMode) => {
      setMode(newMode);
      setLastTypedLetter(null);
      setFeedbackStatus('idle');
      sound.playModeSwitchTone();

      if (newMode === 'discovery') {
        setFeedbackMessage('Discovery mode active. Press any Braille chord to hear its story and dots.');
        sound.speak('Discovery mode! Press any buttons on your Braille keyboard to hear what letter they make.');
      } else if (newMode === 'practice') {
        setFeedbackMessage('Free practice mode. Practice any letter across the selected range.');
        const pool = range === 'A-J' ? LETTERS_A_TO_J : range === 'A-T' ? LETTERS_A_TO_T : LETTERS_A_TO_Z;
        const rand = pool[Math.floor(Math.random() * pool.length)];
        const info = BRAILLE_ALPHABET[rand];
        setTargetLetter(rand);
        sound.speak(`Free practice! Try typing the letter ${rand.toUpperCase()}, as in ${info.word}. ${info.buttonInstructions}`);
      } else {
        sound.speak(`Lessons mode! Level ${currentLevel.id}: ${currentLevel.title}.`);
        pickNextTargetForLevel(currentLevel, currentStep);
      }
    },
    [currentLevel, currentStep, pickNextTargetForLevel, range]
  );

  // Complete level logic
  const handleLevelCompleted = useCallback(() => {
    sound.playLevelCompleteFanfare();
    setIsLevelCompleteModalOpen(true);

    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp + 25,
      completedLevels: Array.from(new Set([...prev.completedLevels, currentLevelIdRef.current])),
      starsPerLevel: {
        ...prev.starsPerLevel,
        [currentLevelIdRef.current]: 3,
      },
    }));

    sound.speak(
      `Hooray! Level ${currentLevel.id} is complete! You earned 25 shiny XP crystals and 3 stars! Press Space to explore the next level!`
    );
  }, [currentLevel.id]);

  // Advance to next level
  const handleAdvanceToNextLevel = useCallback(() => {
    setIsLevelCompleteModalOpen(false);
    const nextLvl = LESSON_LEVELS.find((l) => l.id === currentLevelId + 1);
    if (nextLvl) {
      handleSelectLevel(nextLvl);
    } else {
      sound.speak('Hooray! You are the grand champion of BraillePad! You have mastered all levels!');
    }
  }, [currentLevelId, handleSelectLevel]);

  // Replay current level
  const handleReplayCurrentLevel = useCallback(() => {
    setIsLevelCompleteModalOpen(false);
    setCurrentStep(1);
    pickNextTargetForLevel(currentLevel, 1);
  }, [currentLevel, pickNextTargetForLevel]);

  // Unlock all levels
  const handleUnlockAll = useCallback(() => {
    setUserStats((prev) => ({
      ...prev,
      completedLevels: LESSON_LEVELS.map((l) => l.id),
      starsPerLevel: LESSON_LEVELS.reduce((acc, l) => ({ ...acc, [l.id]: 3 }), {}),
    }));
    sound.playStreakFanfare();
    sound.speak('All learning levels unlocked for parent or teacher practice.');
  }, []);

  // Main Keystroke Handler (ESP32 Bluetooth Keyboard or standard keyboard)
  const handleCharacterInput = useCallback(
    (char: string) => {
      sound.playDotClick();
      const curMode = modeRef.current;
      const letterInfo = BRAILLE_ALPHABET[char];
      if (!letterInfo) return;

      setUserStats((prev) => ({
        ...prev,
        totalKeystrokes: prev.totalKeystrokes + 1,
      }));

      // DISCOVERY MODE
      if (curMode === 'discovery') {
        setDiscoveredLetter(char);
        const dotsText = formatDotsDescription(letterInfo.dots);
        setFeedbackStatus('idle');
        setFeedbackMessage(`${char.toUpperCase()} (${letterInfo.word}) — ${letterInfo.buttonInstructions}`);
        sound.speak(
          `That is letter ${char.toUpperCase()}! ${char.toUpperCase()} is for ${letterInfo.word}... ${letterInfo.childFriendlyExample}. ${letterInfo.buttonInstructions}`
        );
        return;
      }

      // FREE PRACTICE MODE
      if (curMode === 'practice') {
        const target = targetLetterRef.current;
        const targetInfo = BRAILLE_ALPHABET[target];
        setLastTypedLetter(char);

        if (char === target) {
          setFeedbackStatus('success');
          sound.playSuccessTone();
          setUserStats((prev) => ({ ...prev, streak: prev.streak + 1, xp: prev.xp + 5 }));
          setFeedbackMessage(`Awesome! Correct letter is ${char.toUpperCase()}!`);

          const praises = ['Hooray! You did it!', 'Superstar! Exactly right!', 'High five! Perfect!'];
          const p = praises[Math.floor(Math.random() * praises.length)];

          sound.speak(p, () => {
            setTimeout(() => {
              const pool = range === 'A-J' ? LETTERS_A_TO_J : range === 'A-T' ? LETTERS_A_TO_T : LETTERS_A_TO_Z;
              const nextRand = pool.filter((l) => l !== target)[Math.floor(Math.random() * (pool.length - 1))] || pool[0];
              const nextInfo = BRAILLE_ALPHABET[nextRand];
              setTargetLetter(nextRand);
              sound.speak(`Next one! Type the letter ${nextRand.toUpperCase()}, as in ${nextInfo.word}. ${nextInfo.buttonInstructions}`);
            }, 450);
          });
        } else {
          setFeedbackStatus('wrong');
          sound.playGentleRetryTone();
          setUserStats((prev) => ({ ...prev, streak: 0 }));
          setFeedbackMessage(`Good try! You typed ${char.toUpperCase()}. Let's find ${target.toUpperCase()}: ${targetInfo.buttonInstructions}`);
          sound.speak(`Good try! You pressed ${char.toUpperCase()}. Let's find ${target.toUpperCase()} together! ${targetInfo.buttonInstructions}`);
        }
        return;
      }

      // DUOLINGO LESSONS MODE
      const target = targetLetterRef.current;
      const targetInfo = BRAILLE_ALPHABET[target];
      setLastTypedLetter(char);

      if (char === target) {
        // Correct answer
        setFeedbackStatus('success');
        sound.playGemXpSound();

        setUserStats((prev) => {
          const newStreak = prev.streak + 1;
          if (newStreak % 5 === 0) sound.playStreakFanfare();
          return {
            ...prev,
            xp: prev.xp + 10,
            streak: newStreak,
          };
        });

        // Word spelling mode check
        if (currentWordObj) {
          const nextIdx = wordLetterIdx + 1;
          if (nextIdx < currentWordObj.letters.length) {
            setWordLetterIdx(nextIdx);
            const nextChar = currentWordObj.letters[nextIdx];
            const nextInfo = BRAILLE_ALPHABET[nextChar];
            setTargetLetter(nextChar);
            setFeedbackMessage(`Super! Next letter in ${currentWordObj.word} is ${nextChar.toUpperCase()}: ${nextInfo.buttonInstructions}`);
            sound.speak(`Super! The next letter is ${nextChar.toUpperCase()}. ${nextInfo.buttonInstructions}`);
            return;
          }
        }

        // Varied enthusiastic child praises
        const praises = [
          'Hooray! You did it!',
          'Superstar! That is the letter ' + char.toUpperCase() + '!',
          'Awesome job! Your fingers found the exact right buttons!',
          'High five! That was wonderful!',
          'You got it! Outstanding typing!',
        ];
        const randomPraise = praises[Math.floor(Math.random() * praises.length)];
        setFeedbackMessage(`${randomPraise} Correct letter ${char.toUpperCase()}!`);

        // Check if level step is completed
        const nextStep = currentStepRef.current + 1;
        if (nextStep > currentLevel.totalSteps) {
          sound.speak(randomPraise, () => {
            setTimeout(handleLevelCompleted, 400);
          });
        } else {
          setCurrentStep(nextStep);
          sound.speak(randomPraise, () => {
            setTimeout(() => {
              pickNextTargetForLevel(currentLevel, nextStep);
            }, 450);
          });
        }
      } else {
        // Wrong answer: gentle, reassuring guidance
        setFeedbackStatus('wrong');
        sound.playGentleRetryTone();

        setUserStats((prev) => ({
          ...prev,
          streak: 0,
          hearts: infiniteHearts ? prev.hearts : Math.max(0, prev.hearts - 1),
        }));

        const wrongInfo = BRAILLE_ALPHABET[char];
        setFeedbackMessage(
          `You pressed ${char.toUpperCase()} (${formatDotsDescription(wrongInfo.dots)}). To type ${target.toUpperCase()}: ${targetInfo.buttonInstructions}`
        );

        sound.speak(
          `Nice try! You pressed ${char.toUpperCase()}. Let's find ${target.toUpperCase()} together! ${targetInfo.buttonInstructions}`
        );
      }
    },
    [
      currentLevel,
      currentWordObj,
      handleLevelCompleted,
      infiniteHearts,
      pickNextTargetForLevel,
      range,
      wordLetterIdx,
    ]
  );

  // Global Keydown Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, Space continues
      if (isLevelCompleteOpenRef.current) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleAdvanceToNextLevel();
          return;
        }
      }

      // If audio not unlocked yet, first keypress unlocks audio
      if (!audioStartedRef.current) {
        startAudioSession();
        return;
      }

      // Spacebar: Repeat prompt or instruction
      if (e.code === 'Space') {
        e.preventDefault();
        const targetInfo = BRAILLE_ALPHABET[targetLetterRef.current];
        if (targetInfo) {
          sound.speak(
            `Let's type letter ${targetLetterRef.current.toUpperCase()}, as in ${targetInfo.word}. ${targetInfo.buttonInstructions}`
          );
        }
        return;
      }

      // Backspace: Repeat prompt
      if (e.code === 'Backspace') {
        e.preventDefault();
        const targetInfo = BRAILLE_ALPHABET[targetLetterRef.current];
        if (targetInfo) {
          sound.speak(
            `Let's type letter ${targetLetterRef.current.toUpperCase()}, as in ${targetInfo.word}. ${targetInfo.buttonInstructions}`
          );
        }
        return;
      }

      // a-z Keys
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        e.preventDefault();
        handleCharacterInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvanceToNextLevel, handleCharacterInput, startAudioSession]);

  // Dots for visual 6-dot cell
  const currentActiveDots =
    mode === 'discovery'
      ? BRAILLE_ALPHABET[discoveredLetter]?.dots || []
      : BRAILLE_ALPHABET[targetLetter]?.dots || [];

  const currentDisplayLetter =
    mode === 'discovery' ? discoveredLetter : targetLetter;
  const currentLetterInfo = BRAILLE_ALPHABET[currentDisplayLetter];

  // Progress percentage within level
  const progressPercent = Math.min(
    100,
    Math.round(((currentStep - 1) / (currentLevel.totalSteps || 1)) * 100)
  );

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen flex flex-col font-sans transition-colors duration-200 select-none overflow-x-hidden ${
        theme === 'yellow-black'
          ? 'bg-black text-yellow-400'
          : theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#080c15] text-slate-100'
      }`}
    >
      {/* Audio Unlock Splash Modal */}
      {!audioStarted && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center flex flex-col items-center">
            <BraillePadLogo size="lg" showText={false} className="mb-3" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Braille<span className="text-amber-400">Pad</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Connect your <strong>ESP32 Bluetooth Braille keyboard</strong> or standard keyboard.
              A calm, slow, and encouraging audio voice guides children age 6+ through fun tactile stories and exact finger instructions.
            </p>
            <button
              onClick={startAudioSession}
              autoFocus
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              Start Audio Learning Session
            </button>
            <div className="mt-3 text-[11px] text-slate-400">
              (Or press any key on your keyboard to begin immediately)
            </div>
            <button
              onClick={() => setIsEsp32ModalOpen(true)}
              className="mt-4 text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              How do I connect my ESP32-S3 Keyboard?
            </button>
          </div>
        </div>
      )}

      {/* Top Application Header */}
      <header className="h-13 sm:h-14 flex-none border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-3 z-30">
        {/* Brand Logo & Level Roadmap Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BraillePadLogo size="md" className="flex-shrink-0" />

          {/* Level Trigger Button */}
          <button
            onClick={() => setIsLevelDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] sm:text-xs font-bold text-amber-400 hover:border-amber-400/50 transition cursor-pointer min-w-0 truncate"
            title="Open Duolingo Level Roadmap"
          >
            <Map className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Lvl {currentLevel.id}: {currentLevel.title}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </button>

          <Esp32StatusBadge onClick={() => setIsEsp32ModalOpen(true)} className="flex" />
        </div>

        {/* Gamified Stat Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Streak */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-bold"
            title="Practice Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-400" />
            <span>{userStats.streak}</span>
          </div>

          {/* XP Gems */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 text-xs font-bold"
            title="Total XP Gained"
          >
            <span className="text-xs">💎</span>
            <span className="hidden xs:inline">{userStats.xp} XP</span>
            <span className="xs:hidden">{userStats.xp}</span>
          </div>

          {/* Mode Switcher Buttons on md+ */}
          <div className="hidden md:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => handleModeChange('lessons')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'lessons'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lessons
            </button>
            <button
              onClick={() => handleModeChange('discovery')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'discovery'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Discovery
            </button>
            <button
              onClick={() => handleModeChange('practice')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'practice'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Free
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const targetInfo = BRAILLE_ALPHABET[targetLetter];
                if (targetInfo) {
                  sound.speak(
                    `Let's type letter ${targetLetter.toUpperCase()}, as in ${targetInfo.word}. ${targetInfo.buttonInstructions}`
                  );
                }
              }}
              title="Repeat audio prompt"
              aria-label="Repeat voice prompt"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                setTheme(
                  theme === 'dark' ? 'yellow-black' : theme === 'yellow-black' ? 'light' : 'dark'
                )
              }
              title={`Switch contrast theme (Current: ${theme})`}
              aria-label="Toggle theme contrast"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : theme === 'yellow-black' ? (
                <Sun className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-slate-800" />
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              aria-label="Settings"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Duolingo Progress Sub-Bar */}
      {mode === 'lessons' && (
        <div className="h-6 sm:h-7 flex-none bg-slate-950/60 border-b border-slate-800/60 px-3 sm:px-5 flex items-center justify-between gap-3 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold truncate">
            <span className="text-amber-400 font-bold">Lvl {currentLevel.id}:</span>
            <span className="text-slate-300 truncate hidden xs:inline">{currentLevel.title}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-bold">
              Step {currentStep}/{currentLevel.totalSteps}
            </span>
          </div>

          <div className="flex-1 max-w-xs sm:max-w-sm h-1.5 sm:h-2 bg-slate-800/90 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#10b981]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Settings Dropdown Drawer (With Voice Persona & Testing) */}
      {showSettings && (
        <div className="flex-none p-3 px-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Speed slider with clear child 6+ indicator */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Child Pace:</span>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={speechRate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSpeechRate(val);
                  sound.speechRate = val;
                }}
                className="w-20 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-slate-300 text-[11px]">{speechRate.toFixed(2)}x</span>
            </div>

            {/* Test Voice Sample Button */}
            <button
              onClick={() => sound.previewVoice()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold"
              title="Listen to a voice preview"
            >
              <Play className="w-3 h-3 text-amber-400" />
              <span>Test Voice</span>
            </button>

            {/* Device Voice Selector if multiple available */}
            {availableVoices.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">Voice:</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    sound.setVoiceByName(e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-0.5 max-w-[140px] truncate"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name.replace('Microsoft ', '').replace('Online (Natural)', '(Natural)')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                const next = !soundEffects;
                setSoundEffects(next);
                sound.soundEffectsEnabled = next;
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
            >
              {soundEffects ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
              <span>FX: {soundEffects ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowAlphabetStrip(!showAlphabetStrip)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
            >
              <Eye className="w-3 h-3 text-sky-400" />
              <span>Alphabet Strip: {showAlphabetStrip ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEsp32ModalOpen(true)}
              className="text-sky-400 hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
            >
              <Bluetooth className="w-3 h-3" />
              ESP32-S3 Guide
            </button>

            <button
              onClick={handleUnlockAll}
              className="text-amber-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
            >
              <Unlock className="w-3 h-3" />
              Unlock All (Teacher)
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-sky-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
            >
              <Code2 className="w-3 h-3" />
              Standalone HTML Code
            </button>
          </div>
        </div>
      )}

      {/* Mobile Mode Switcher Bar (< md) */}
      <div className="md:hidden flex-none px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs w-full justify-between">
          <button
            onClick={() => handleModeChange('lessons')}
            className={`flex-1 py-1 text-center font-bold rounded ${
              mode === 'lessons' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => handleModeChange('discovery')}
            className={`flex-1 py-1 text-center font-bold rounded ${
              mode === 'discovery' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Discovery
          </button>
          <button
            onClick={() => handleModeChange('practice')}
            className={`flex-1 py-1 text-center font-bold rounded ${
              mode === 'practice' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-2 sm:p-3 lg:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 items-stretch lg:overflow-hidden">
        {/* Left Column (7 cols): Sighted Parent Dashboard (6-Dot Braille Cell + Perkins Keyboard) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg min-h-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-[11px] sm:text-xs font-bold text-white tracking-wider uppercase">
                Parent Dashboard: 6-Dot Cell
              </h2>
            </div>

            <div className="text-[10px] text-amber-400 font-semibold truncate max-w-[240px]">
              {currentLetterInfo?.fingerHint}
            </div>
          </div>

          {/* Braille Cell Graphic */}
          <div className="flex-1 flex items-center justify-center py-0.5 sm:py-1">
            <BrailleCell
              activeDots={currentActiveDots}
              theme={theme}
              label={
                mode === 'discovery'
                  ? `Letter ${currentDisplayLetter.toUpperCase()}`
                  : `Target: ${targetLetter.toUpperCase()}`
              }
              size="auto"
            />
          </div>

          {/* Perkins Keyboard Guide */}
          <div className="mt-1">
            <PerkinsKeyboardGuide activeDots={currentActiveDots} theme={theme} />
          </div>
        </div>

        {/* Right Column (5 cols): Target Card, Sensory Story, Button Instructions, Feedback */}
        <div className="lg:col-span-5 flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg gap-2 min-h-0">
          {/* Target Showcase Box */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center relative overflow-hidden min-h-[165px]">
            {/* Word spelling breadcrumbs if active */}
            {currentWordObj && (
              <div className="mb-0.5 text-[11px] font-bold text-sky-400 flex items-center gap-1">
                <span>Spelling:</span>
                <span className="font-mono tracking-widest text-xs text-white">
                  {currentWordObj.letters.map((l, i) => (
                    <span
                      key={i}
                      className={`px-1 py-0.2 rounded mx-0.5 ${
                        i === wordLetterIdx
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : i < wordLetterIdx
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {l.toUpperCase()}
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {mode === 'discovery' ? 'Current Letter' : 'Type This Letter'}
            </div>

            {/* Massive Letter + Unicode Braille Symbol */}
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none my-0.5 flex items-baseline justify-center gap-3">
              <span>{currentDisplayLetter.toUpperCase()}</span>
              <span className="text-3xl sm:text-4xl text-amber-400 font-normal">
                {currentLetterInfo?.unicode}
              </span>
            </div>

            {/* Sensory Story for Age 6+ Child */}
            <div className="text-xs sm:text-sm font-bold text-amber-400 px-2 leading-snug">
              {currentLetterInfo?.word} —{' '}
              <span className="text-slate-300 font-normal">
                {currentLetterInfo?.childFriendlyExample}
              </span>
            </div>

            {/* Explicit Button Instructions Card with Pointer Finger guidance */}
            <div className="mt-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-sky-300 flex items-center gap-1.5 text-left">
              <Hand className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{currentLetterInfo?.buttonInstructions}</span>
            </div>

            {/* Wrong letter warning */}
            {lastTypedLetter && feedbackStatus === 'wrong' && (
              <div className="mt-1.5 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg p-1 px-2 w-full">
                You pressed: <strong>{lastTypedLetter.toUpperCase()}</strong> (
                {formatDotsDescription(BRAILLE_ALPHABET[lastTypedLetter]?.dots || [])})
              </div>
            )}
          </div>

          {/* Live Feedback Banner */}
          <div
            className={`p-2 rounded-xl border text-center transition-all ${
              feedbackStatus === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : feedbackStatus === 'wrong'
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-950/50 border-slate-800 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-center gap-1.5">
              {feedbackStatus === 'success' && <Award className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{feedbackMessage}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const targetInfo = BRAILLE_ALPHABET[targetLetter];
                if (targetInfo) {
                  sound.speak(
                    `Let's type letter ${targetLetter.toUpperCase()}, as in ${targetInfo.word}. ${targetInfo.buttonInstructions}`
                  );
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              Repeat Voice
            </button>

            {/* Next Step Button with clean ArrowRight icon (Zero AI markings) */}
            <button
              onClick={() => {
                if (mode === 'lessons') {
                  const nextStep = currentStep + 1;
                  if (nextStep > currentLevel.totalSteps) {
                    handleLevelCompleted();
                  } else {
                    setCurrentStep(nextStep);
                    pickNextTargetForLevel(currentLevel, nextStep);
                  }
                } else {
                  const pool = range === 'A-J' ? LETTERS_A_TO_J : range === 'A-T' ? LETTERS_A_TO_T : LETTERS_A_TO_Z;
                  const nextRand = pool[Math.floor(Math.random() * pool.length)];
                  const nextInfo = BRAILLE_ALPHABET[nextRand];
                  setTargetLetter(nextRand);
                  sound.speak(`Next letter! Type ${nextRand.toUpperCase()}, as in ${nextInfo.word}. ${nextInfo.buttonInstructions}`);
                }
              }}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-500/20"
            >
              <span>Next Letter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="text-[9px] sm:text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1 font-semibold text-slate-300">
              <Keyboard className="w-3 h-3 text-amber-400" />
              <span>Shortcuts:</span>
            </div>
            <div className="flex items-center gap-2">
              <span><kbd className="px-1 py-0.2 rounded bg-slate-800 font-mono text-[9px]">Space</kbd> Repeat</span>
              <span>·</span>
              <span><kbd className="px-1 py-0.2 rounded bg-slate-800 font-mono text-[9px]">A-Z</kbd> Chords</span>
            </div>
          </div>
        </div>
      </main>

      {/* Optional Collapsible Alphabet Strip */}
      {showAlphabetStrip && (
        <div className="flex-none p-3 bg-slate-950 border-t border-slate-800 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
            <span className="font-bold text-slate-200">Alphabet Quick Reference</span>
            <button onClick={() => setShowAlphabetStrip(false)} className="text-amber-400 hover:underline">
              Close
            </button>
          </div>
          <div className="grid grid-cols-9 sm:grid-cols-13 gap-1">
            {LETTERS_A_TO_Z.map((l) => (
              <button
                key={l}
                onClick={() => handleCharacterInput(l)}
                className={`py-1 rounded text-center border text-[11px] font-bold ${
                  currentDisplayLetter === l
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duolingo Level Roadmap Drawer */}
      <DuolingoLevelDrawer
        isOpen={isLevelDrawerOpen}
        onClose={() => setIsLevelDrawerOpen(false)}
        currentLevelId={currentLevelId}
        userStats={userStats}
        onSelectLevel={handleSelectLevel}
        onUnlockAllLevels={handleUnlockAll}
      />

      {/* Level Completed Celebration Modal */}
      <LevelCompleteModal
        isOpen={isLevelCompleteModalOpen}
        level={currentLevel}
        earnedXp={25}
        stars={3}
        hasNextLevel={currentLevelId < LESSON_LEVELS.length}
        onNextLevel={handleAdvanceToNextLevel}
        onReplayLevel={handleReplayCurrentLevel}
        onClose={() => setIsLevelCompleteModalOpen(false)}
      />

      {/* Standalone HTML Code Modal */}
      <StandaloneExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* ESP32-S3 Bluetooth Keyboard Guide & Diagnostic Modal */}
      <Esp32ConnectionModal
        isOpen={isEsp32ModalOpen}
        onClose={() => setIsEsp32ModalOpen(false)}
        lastTypedChar={lastTypedLetter}
      />
    </div>
  );
}
