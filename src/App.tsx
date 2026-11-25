import React, { useState, useCallback } from 'react';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  ArrowRight,
  Heart,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PlatformerCanvas } from './components/PlatformerCanvas';
import { ConfettiBurst } from './components/ConfettiBurst';
import {
  Heart3DIcon,
  Star3DIcon,
  Smiley3DIcon,
  Flower3DIcon,
  KurdistanFlagIcon,
  OnionIcon,
  PotatoIcon,
} from './components/PlayfulIcons';
import { LEVELS } from './game/levels';
import { HudSnapshot, LevelId } from './game/types';
import { soundEngine } from './utils/sound';

type ScreenState =
  | 'TITLE'
  | 'PLAYING'
  | 'LEVEL_CLEAR'
  | 'GAME_OVER'
  | 'VICTORY';

const MAX_LIVES = 5;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('TITLE');
  const [levelId, setLevelId] = useState<LevelId>(1);
  const [runKey, setRunKey] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  const [hud, setHud] = useState<HudSnapshot>({
    levelId: 1,
    levelTitle: LEVELS[1].title,
    dialogue: LEVELS[1].dialogue,
    score: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    objectiveCollected: 0,
    objectiveTarget: LEVELS[1].objectiveTarget,
    objectiveLabel: LEVELS[1].objectiveLabel,
    worldProgress: 0,
    portalOpen: false,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 5,
    bossDefeated: true,
    funnyEvent: null,
    speedActive: false,
    superJumpActive: false,
  });

  const toggleSound = () => {
    soundEngine.unlock();
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
    if (!next) soundEngine.playPop(620);
  };

  const startNewGame = () => {
    soundEngine.unlock();
    soundEngine.playCelebration();
    setLevelId(1);
    setScore(0);
    setLives(MAX_LIVES);
    setPaused(false);
    setRunKey((k) => k + 1);
    setScreen('PLAYING');
  };

  const handleLevelComplete = useCallback(
    (newScore: number, remainingLives: number) => {
      setScore(newScore);
      setLives(remainingLives);
      if (levelId < 3) {
        setScreen('LEVEL_CLEAR');
      } else {
        soundEngine.playCelebration();
        setScreen('VICTORY');
      }
    },
    [levelId]
  );

  const handleNextLevel = () => {
    soundEngine.unlock();
    soundEngine.playClick();
    const nextId = (levelId + 1) as LevelId;
    setLevelId(nextId);
    setPaused(false);
    setRunKey((k) => k + 1);
    setScreen('PLAYING');
  };

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setScreen('GAME_OVER');
  }, []);

  const retryCurrentLevel = () => {
    soundEngine.unlock();
    soundEngine.playClick();
    setLives(MAX_LIVES);
    setPaused(false);
    setRunKey((k) => k + 1);
    setScreen('PLAYING');
  };

  const activeLevel = LEVELS[levelId];

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`flex flex-col bg-pastel-glow text-indigo-950 relative overflow-x-hidden selection:bg-pink-200 ${
          screen === 'PLAYING' ? 'h-dvh overflow-hidden game-touch-surface' : 'min-h-dvh'
        }`}
      >
        {screen === 'VICTORY' && <ConfettiBurst />}

        {/* Top Game Header / HUD (respects Honor safe-area notch & status bar) */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shrink-0 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] landscape-header">
          <div className="max-w-5xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setPaused(false);
                setScreen('TITLE');
              }}
              className="cursor-pointer font-display text-sm sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap shrink-0"
            >
              <span className="landscape-hide">BUSHRA — THE CHAOS ADVENTURE</span>
              <span className="landscape-only items-center">BUSHRA</span>
            </button>

            {screen === 'PLAYING' ? (
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                {/* Lives */}
                <div
                  className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-50 border border-rose-200"
                  aria-label={`Jiyan: ${hud.lives}`}
                >
                  {Array.from({ length: hud.maxLives }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                        idx < hud.lives
                          ? 'fill-rose-500 text-rose-500 scale-100'
                          : 'fill-rose-100 text-rose-200 scale-90'
                      }`}
                    />
                  ))}
                </div>

                {/* Objective Counter */}
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] sm:text-sm font-extrabold text-amber-900 font-mono-nums whitespace-nowrap">
                  {hud.objectiveLabel}: {hud.objectiveCollected}/{hud.objectiveTarget}
                </div>

                {/* Score */}
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] sm:text-sm font-extrabold text-purple-900 font-mono-nums whitespace-nowrap">
                  Puan: {hud.score}
                </div>

                {/* Compact Landscape Food & Danger Guide (shown only in mobile landscape) */}
                <div className="landscape-only items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-50/90 border border-emerald-200 text-[11px] font-bold">
                  <span className="text-emerald-800">✓🍎🍓🍌🥪☕⭐❤️</span>
                  <span className="text-indigo-950/30">|</span>
                  <span className="text-rose-800">⚠🧅🥔🥚🍏</span>
                </div>

                {/* Inline Landscape Boss HP Pill */}
                {hud.bossActive && (
                  <div className="landscape-only items-center gap-1.5 px-2 py-1 rounded-xl bg-purple-950 text-white text-[11px] font-extrabold">
                    <span>🧅</span>
                    <span className="font-mono-nums">
                      {hud.bossHp}/{hud.bossMaxHp}
                    </span>
                  </div>
                )}

                {/* Active Powerups */}
                {hud.speedActive && (
                  <span className="px-2 py-1 rounded-xl bg-yellow-100 border border-yellow-300 text-[11px] sm:text-xs font-extrabold text-amber-900 animate-pulse">
                    🍌 Lez!
                  </span>
                )}
                {hud.superJumpActive && (
                  <span className="px-2 py-1 rounded-xl bg-purple-100 border border-purple-300 text-[11px] sm:text-xs font-extrabold text-purple-900 animate-pulse">
                    ☕ Super!
                  </span>
                )}

                {/* Pause Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setPaused((p) => !p);
                  }}
                  aria-label={paused ? 'Berdewam bike' : 'Rawestîne'}
                  title={paused ? 'Berdewam bike' : 'Rawestîne'}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={muted ? 'Deng veke' : 'Deng bigire'}
                  title={muted ? 'Deng veke' : 'Deng bigire'}
                  className="cursor-pointer p-1.5 sm:p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {screen !== 'TITLE' && (
                  <span className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-xs sm:text-sm font-extrabold text-purple-900 font-mono-nums">
                    Puan: {score}
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-label={muted ? 'Deng veke' : 'Deng bigire'}
                  title={muted ? 'Deng veke' : 'Deng bigire'}
                  className="cursor-pointer p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Level Info, Permanent Food Guide HUD, Boss HP & Progress Bar (hidden in compact mobile landscape) */}
          {screen === 'PLAYING' && (
            <div className="landscape-hide max-w-5xl mx-auto px-2.5 sm:px-6 pb-2 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-950/85">
                  <span className="text-purple-700 font-extrabold">{hud.levelTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-pink-600 font-bold">{hud.dialogue}</span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-xs min-w-[140px]">
                  <span className="text-xs font-bold text-indigo-950/60 whitespace-nowrap">
                    {hud.portalOpen ? 'Derî Vebû!' : activeLevel.subtitle}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-purple-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 transition-all duration-150"
                      style={{ width: `${Math.round(hud.worldProgress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Food & Hazard HUD Guide */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs font-bold">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-2 py-1 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-extrabold">BIXWE:</span>
                  <span>🍎 Sêv</span>
                  <span>·</span>
                  <span>🍓 Tûfrengî</span>
                  <span>·</span>
                  <span>🍌 Mûz</span>
                  <span>·</span>
                  <span>🥪 Sendwîç</span>
                  <span>·</span>
                  <span>☕ Qehwe</span>
                  <span>·</span>
                  <span>⭐ Stêrk</span>
                  <span>·</span>
                  <span>❤️ Dil</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-2 py-1 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="font-extrabold">DÛR BIKEVE:</span>
                  <span>🧅 Pîvaz</span>
                  <span>·</span>
                  <span>🥔 Kartol</span>
                  <span>·</span>
                  <span>🥚 Hêk</span>
                  <span>·</span>
                  <span>🍏 Sêva Xerab</span>
                  <span>·</span>
                  <span>🍌 Qalik</span>
                </div>
              </div>

              {/* Giant Onion Boss Health Bar OR Random Funny Event Ticker */}
              <AnimatePresence>
                {hud.bossActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-purple-950/90 text-white px-3.5 py-1.5"
                  >
                    <OnionIcon className="w-6 h-6 shrink-0" />
                    <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap">
                      PÎVAZA MEZIN
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-purple-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-400 to-red-500 transition-all duration-200"
                        style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono-nums text-xs font-bold">
                      {hud.bossHp}/{hud.bossMaxHp}
                    </span>
                  </motion.div>
                )}

                {hud.funnyEvent && (
                  <motion.div
                    key={hud.funnyEvent}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-xs sm:text-sm font-extrabold text-purple-800 bg-yellow-100/90 border border-yellow-300 rounded-xl py-1 px-3"
                  >
                    {hud.funnyEvent}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </header>

        {/* Main Stage */}
        <main
          className={`flex-1 flex items-center justify-center relative z-20 min-h-0 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] ${
            screen === 'PLAYING' ? 'p-2 sm:p-4 landscape-stage' : 'p-3 sm:p-6'
          }`}
        >
          <AnimatePresence mode="wait">
            {/* 1. TITLE / STORY SCREEN */}
            {screen === 'TITLE' && (
              <motion.section
                key="title"
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="landscape-card-compact w-full max-w-2xl rounded-[2rem] sm:rounded-[2.25rem] bg-white/92 backdrop-blur-md border-2 border-white shadow-[0_28px_70px_rgba(124,58,237,0.16)] p-6 sm:p-11 text-center"
              >
                <div className="flex items-center justify-center gap-3.5 mb-5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                  >
                    <Star3DIcon className="w-9 h-9" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart3DIcon className="w-9 h-9" />
                  </motion.div>
                  <div className="animate-wave-flag">
                    <KurdistanFlagIcon className="w-12 h-8" />
                  </div>
                  <div className="animate-gentle-sway">
                    <Flower3DIcon className="w-9 h-9" />
                  </div>
                  <OnionIcon className="w-9 h-9" />
                  <PotatoIcon className="w-9 h-9" />
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  BUSHRA — THE CHAOS ADVENTURE
                </h1>

                <div className="mt-5 space-y-2 text-base sm:text-lg font-semibold text-indigo-950/85 max-w-xl mx-auto">
                  <p>
                    Bushra dikeve cîhaneke xerîb ku hemû stêrk û alên Kurdistanê winda bûne.
                  </p>
                  <p className="text-purple-700 font-bold">
                    Divê ew sê astan biqedîne da ku wan dîsa berhev bike û Pîvaza Mezin têk bibe! 🧅😂
                  </p>
                </div>

                {/* Three Levels Preview */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
                    <p className="text-xs font-extrabold text-emerald-700">Asta 1</p>
                    <p className="font-display font-bold text-sm text-indigo-950">Dineya Bushra</p>
                    <p className="text-xs text-indigo-950/70 mt-0.5">10 stêrkan berhev bike</p>
                  </div>
                  <div className="rounded-2xl bg-pink-50 border border-pink-200 p-3.5">
                    <p className="text-xs font-extrabold text-pink-700">Asta 2</p>
                    <p className="font-display font-bold text-sm text-indigo-950">Dineya Kaosê</p>
                    <p className="text-xs text-indigo-950/70 mt-0.5">8 dilan berhev bike</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3.5">
                    <p className="text-xs font-extrabold text-blue-700">Asta 3</p>
                    <p className="font-display font-bold text-sm text-indigo-950">Bijî Kurdistan</p>
                    <p className="text-xs text-indigo-950/70 mt-0.5">Pîvaza Mezin têk bibe</p>
                  </div>
                </div>

                {/* Quick Food vs Danger Preview */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    ✓ Bixwe: 🍎 🍓 🍌 🥪 ☕ ⭐ ❤️
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    ⚠ Dûr bikeve: 🧅 🥔 🥚 🍏
                  </span>
                </div>

                <motion.button
                  type="button"
                  onClick={startNewGame}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer mt-7 px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-display font-extrabold text-lg sm:text-xl shadow-[0_14px_35px_rgba(236,72,153,0.38)] hover:shadow-[0_18px_45px_rgba(124,58,237,0.45)] transition-shadow"
                >
                  DEST PÊ BIKE
                </motion.button>
              </motion.section>
            )}

            {/* 2. ACTIVE GAMEPLAY */}
            {screen === 'PLAYING' && (
              <motion.section
                key={`play-${levelId}-${runKey}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center relative min-h-0"
              >
                <PlatformerCanvas
                  levelId={levelId}
                  initialScore={score}
                  initialLives={lives}
                  maxLives={MAX_LIVES}
                  paused={paused}
                  onHudUpdate={setHud}
                  onLevelComplete={handleLevelComplete}
                  onGameOver={handleGameOver}
                  onTogglePause={() => setPaused((p) => !p)}
                />

                {/* Pause Overlay */}
                <AnimatePresence>
                  {paused && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 bg-indigo-950/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                      <motion.div
                        initial={{ scale: 0.88 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        className="landscape-card-compact max-w-sm w-full rounded-3xl bg-white p-7 text-center shadow-2xl border-2 border-purple-100"
                      >
                        <div className="flex justify-center mb-3">
                          <Smiley3DIcon className="w-14 h-14" mood="wink" />
                        </div>
                        <h2 className="font-display text-2xl font-extrabold text-indigo-950">
                          Lîstik Hat Rawestandin
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-purple-700">
                          Bêhna xwe vede, sendwîçekê bixwe 🥪☕
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setPaused(false);
                            }}
                            className="cursor-pointer w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold shadow-md"
                          >
                            Berdewam Bike
                          </button>
                          <button
                            type="button"
                            onClick={startNewGame}
                            className="cursor-pointer w-full py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200"
                          >
                            Ji Nû Ve Dest Pê Bike
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )}

            {/* 3. LEVEL CLEAR TRANSITION */}
            {screen === 'LEVEL_CLEAR' && (
              <motion.section
                key="level-clear"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="landscape-card-compact w-full max-w-lg rounded-[2rem] sm:rounded-[2.25rem] bg-white/92 backdrop-blur-md border-2 border-white shadow-2xl p-7 sm:p-10 text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                  className="flex justify-center gap-3 mb-4"
                >
                  <Star3DIcon className="w-12 h-12" />
                  <Smiley3DIcon className="w-12 h-12" mood="laugh" />
                </motion.div>
                <h2 className="font-display text-3xl font-extrabold text-indigo-950">
                  Aferîn, Einstein! 🎉
                </h2>
                <p className="mt-2 text-lg font-bold text-purple-700">
                  {activeLevel.title} bi serkeftî qediya!
                </p>
                <p className="mt-4 text-base font-extrabold text-pink-600 font-mono-nums">
                  Puanên Te: {score}
                </p>

                <motion.button
                  type="button"
                  onClick={handleNextLevel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer mt-7 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-display font-extrabold text-lg shadow-lg"
                >
                  Herê Asta {levelId + 1} <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.section>
            )}

            {/* 4. GAME OVER */}
            {screen === 'GAME_OVER' && (
              <motion.section
                key="game-over"
                initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                className="landscape-card-compact w-full max-w-lg rounded-[2rem] sm:rounded-[2.25rem] bg-white/92 backdrop-blur-md border-2 border-white shadow-2xl p-7 sm:p-10 text-center"
              >
                <motion.div
                  animate={{ rotate: [-12, 12, -12], y: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="flex justify-center gap-3 mb-4"
                >
                  <Smiley3DIcon className="w-14 h-14" mood="wink" />
                  <OnionIcon className="w-12 h-12" />
                </motion.div>
                <h2 className="font-display text-3xl font-extrabold text-red-600">
                  Ax! Pîvazê te giryan 😂
                </h2>
                <p className="mt-2 text-base font-bold text-indigo-950/80">
                  Tu ji kartofan ditirsî?! Xem nake, Bushra qet teslîm nabe!
                </p>
                <p className="mt-3 text-base font-extrabold text-purple-700 font-mono-nums">
                  Puanên Te: {score}
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={retryCurrentLevel}
                    className="cursor-pointer px-7 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold shadow-md"
                  >
                    Vê Astê Dîsa Bilîze
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setScreen('TITLE');
                    }}
                    className="cursor-pointer px-6 py-3.5 rounded-2xl bg-purple-50 text-purple-900 font-bold border border-purple-200"
                  >
                    Destpêk
                  </button>
                </div>
              </motion.section>
            )}

            {/* 5. FINAL WIN CELEBRATION SCREEN (with Bushra's Victory Dance!) */}
            {screen === 'VICTORY' && (
              <motion.section
                key="victory"
                initial={{ opacity: 0, scale: 0.85, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className="landscape-card-compact w-full max-w-xl rounded-[2rem] sm:rounded-[2.5rem] bg-white/92 backdrop-blur-md border-2 border-white shadow-[0_28px_80px_rgba(236,72,153,0.25)] p-7 sm:p-11 text-center relative z-40"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [-12, 12, -12], scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Star3DIcon className="w-11 h-11" />
                  </motion.div>
                  <div className="animate-wave-flag">
                    <KurdistanFlagIcon className="w-16 h-11" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.3, repeat: Infinity }}
                  >
                    <Heart3DIcon className="w-11 h-11" />
                  </motion.div>
                </div>

                {/* Bushra's Animated Victory Dance */}
                <motion.div
                  animate={{
                    y: [0, -16, 0, -12, 0],
                    rotate: [-8, 8, -8, 8, 0],
                    scale: [1, 1.06, 1, 1.06, 1],
                  }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                  className="mx-auto my-3 w-28 h-28 rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 border-4 border-pink-300 shadow-lg flex items-center justify-center"
                >
                  <svg viewBox="0 0 80 88" className="w-20 h-22" aria-label="Bushra govendê digire">
                    {/* Dancing arms */}
                    <path d="M22 46 L8 32" stroke="#EC4899" strokeWidth="7" strokeLinecap="round" />
                    <path d="M58 46 L72 30" stroke="#EC4899" strokeWidth="7" strokeLinecap="round" />
                    {/* Legs */}
                    <rect x="28" y="64" width="8" height="14" rx="4" fill="#1E1B4B" />
                    <rect x="44" y="64" width="8" height="14" rx="4" fill="#1E1B4B" />
                    {/* Hoodie */}
                    <rect x="23" y="40" width="34" height="26" rx="10" fill="#EC4899" />
                    <rect x="26" y="52" width="28" height="5" fill="#60A5FA" />
                    {/* Hair & Head */}
                    <circle cx="40" cy="24" r="16" fill="#31102F" />
                    <circle cx="40" cy="26" r="14" fill="#FDE2C8" />
                    <path d="M26 23 A14 14 0 0 1 54 23 Z" fill="#31102F" />
                    <rect x="28" y="12" width="24" height="5" rx="2.5" fill="#A855F7" />
                    {/* Joyful eyes & big smile */}
                    <path d="M33 26 Q35 23 37 26" stroke="#1E1B4B" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                    <path d="M43 26 Q45 23 47 26" stroke="#1E1B4B" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                    <path d="M34 31 Q40 37 46 31 Z" fill="#BE123C" />
                  </svg>
                </motion.div>

                <h2 className="font-display text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  PÎROZ BE BUSHRA!
                </h2>

                <div className="mt-4 space-y-2 text-lg sm:text-2xl font-extrabold text-indigo-950">
                  <p>Tu bi ser ketî! Tu qehremana vê lîstikê yî!</p>
                  <p className="text-sm sm:text-base font-bold text-purple-700">
                    Pîvaza Mezin bû şorba pîvazê û Bushra govendê digire! 🧅💃😂
                  </p>
                  <p className="text-red-600 text-2xl sm:text-3xl pt-2">
                    Bijî Kurdistan ❤️
                  </p>
                </div>

                <div className="mt-6 inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border border-purple-200">
                  <span className="text-sm font-bold text-purple-700">Puanên Te: </span>
                  <span className="font-mono-nums text-2xl font-extrabold text-pink-600">
                    {score}
                  </span>
                </div>

                <div className="mt-7">
                  <motion.button
                    type="button"
                    onClick={startNewGame}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-display font-extrabold text-lg shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Dîsa Bilîze
                  </motion.button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
