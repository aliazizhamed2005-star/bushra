import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RotateCw } from 'lucide-react';
import { LEVELS, VIEW_HEIGHT, VIEW_WIDTH } from '../game/levels';
import { renderGameFrame } from '../game/renderer';
import {
  BossProjectile,
  Collectible,
  EggDropZone,
  Enemy,
  FallingEgg,
  FloatingText,
  FlyingCoffee,
  GiantOnionBoss,
  HudSnapshot,
  LevelId,
  MovingPlatform,
  Obstacle,
  Particle,
  PlayerState,
} from '../game/types';
import { soundEngine } from '../utils/sound';

interface PlatformerCanvasProps {
  levelId: LevelId;
  initialScore: number;
  initialLives: number;
  maxLives: number;
  paused: boolean;
  onHudUpdate: (hud: HudSnapshot) => void;
  onLevelComplete: (newScore: number, remainingLives: number) => void;
  onGameOver: (finalScore: number) => void;
  onTogglePause: () => void;
}

const GRAVITY = 1650;
const BASE_MOVE_SPEED = 315;
const BASE_JUMP_VEL = -645;
const DOUBLE_JUMP_VEL = -575;
const BOUNCY_VEL = -840;

const FUNNY_EVENTS = [
  { text: 'Aferîn, Einstein! 😂 (+15)', bonus: 15, confetti: true },
  { text: 'Bushra, hişyar be! 😂', bonus: 0, confetti: false },
  { text: 'Ev çi qelebalix e?! ☕ (+10)', bonus: 10, confetti: false },
  { text: 'Tu ji kartofan ditirsî?! 🥔😂', bonus: 0, confetti: false },
  { text: 'Barana Kenê! ⭐ (+15)', bonus: 15, confetti: true },
];

const BOSS_TAUNTS = [
  'Ez Pîvaza Mezin im! 😂',
  'Pîvaz çavên te giryan! 😭',
  'Bêhna min pir bihêz e!',
  'Ax! Li ser serê min baz nede!',
  'Hêza Şorba Pîvazê! 🧅',
];

export function PlatformerCanvas({
  levelId,
  initialScore,
  initialLives,
  maxLives,
  paused,
  onHudUpdate,
  onLevelComplete,
  onGameOver,
  onTogglePause,
}: PlatformerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const callbacksRef = useRef({
    onHudUpdate,
    onLevelComplete,
    onGameOver,
    onTogglePause,
  });
  callbacksRef.current = {
    onHudUpdate,
    onLevelComplete,
    onGameOver,
    onTogglePause,
  };

  const inputRef = useRef({
    left: false,
    right: false,
    jumpPressed: false,
  });

  const dpadRef = useRef<HTMLDivElement>(null);
  const dpadPointersRef = useRef<Map<number, 'left' | 'right'>>(new Map());
  const jumpPointersRef = useRef<Set<number>>(new Set());

  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [jumpActive, setJumpActive] = useState(false);

  const syncDpadFromPointers = () => {
    let left = false;
    let right = false;
    dpadPointersRef.current.forEach((dir) => {
      if (dir === 'left') left = true;
      if (dir === 'right') right = true;
    });
    inputRef.current.left = left;
    inputRef.current.right = right;
    setLeftActive(left);
    setRightActive(right);
  };

  const resetAllInputs = () => {
    dpadPointersRef.current.clear();
    jumpPointersRef.current.clear();
    inputRef.current = { left: false, right: false, jumpPressed: false };
    setLeftActive(false);
    setRightActive(false);
    setJumpActive(false);
  };

  useEffect(() => {
    if (paused) {
      resetAllInputs();
    }
  }, [paused]);

  const getDpadDirection = (clientX: number): 'left' | 'right' => {
    const rect = dpadRef.current?.getBoundingClientRect();
    if (!rect) return 'left';
    const midX = rect.left + rect.width / 2;
    return clientX < midX ? 'left' : 'right';
  };

  const handleDpadPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    soundEngine.unlock();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture unsupported
    }
    dpadPointersRef.current.set(e.pointerId, getDpadDirection(e.clientX));
    syncDpadFromPointers();
  };

  const handleDpadPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dpadPointersRef.current.has(e.pointerId)) return;
    e.preventDefault();
    const nextDir = getDpadDirection(e.clientX);
    if (dpadPointersRef.current.get(e.pointerId) !== nextDir) {
      dpadPointersRef.current.set(e.pointerId, nextDir);
      syncDpadFromPointers();
    }
  };

  const handleDpadPointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dpadPointersRef.current.has(e.pointerId)) return;
    dpadPointersRef.current.delete(e.pointerId);
    syncDpadFromPointers();
  };

  const handleJumpPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    soundEngine.unlock();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture unsupported
    }
    if (!jumpPointersRef.current.has(e.pointerId)) {
      jumpPointersRef.current.add(e.pointerId);
      inputRef.current.jumpPressed = true;
      setJumpActive(true);
    }
  };

  const handleJumpPointerUpOrCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!jumpPointersRef.current.has(e.pointerId)) return;
    jumpPointersRef.current.delete(e.pointerId);
    if (jumpPointersRef.current.size === 0) {
      setJumpActive(false);
    }
  };

  useEffect(() => {
    const level = LEVELS[levelId];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    inputRef.current = { left: false, right: false, jumpPressed: false };

    const player: PlayerState = {
      x: level.spawnX,
      y: level.spawnY,
      w: 34,
      h: 46,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      jumpsLeft: 2,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      invulnTimer: 0.8,
      speedBoostTimer: 0,
      superJumpTimer: 0,
      slipTimer: 0,
      walkCycle: 0,
      squashX: 1,
      squashY: 1,
      emotion: 'happy',
      emotionTimer: 0,
      speechText: level.dialogue,
      speechTimer: 3.4,
    };

    const movingPlatforms: MovingPlatform[] = level.movingPlatforms.map((mp) => ({
      ...mp,
      dx: 0,
      dy: 0,
    }));

    const obstacles: Obstacle[] = level.obstacles.map((o) => ({
      ...o,
      cooldown: 0,
    }));

    const enemies: Enemy[] = level.enemies.map((e) => ({
      ...e,
      alive: true,
      squishTimer: 0,
      rotation: 0,
    }));

    const flyingCoffees: FlyingCoffee[] = level.flyingCoffees.map((fc) => ({
      ...fc,
      x: fc.baseX,
      y: fc.baseY,
    }));

    const eggZones: EggDropZone[] = level.eggZones.map((ez, i) => ({
      ...ez,
      timer: 1.5 + i * 0.9,
    }));
    const fallingEggs: FallingEgg[] = [];

    const collectibles: Collectible[] = level.collectibles.map((c) => ({
      ...c,
      collected: false,
    }));

    const boss: GiantOnionBoss | null = level.boss
      ? {
          active: false,
          defeated: false,
          x: level.boss.x,
          y: level.boss.y,
          w: 92,
          h: 96,
          vx: -95,
          hp: level.boss.hp,
          maxHp: level.boss.hp,
          arenaMinX: level.boss.arenaMinX,
          arenaMaxX: level.boss.arenaMaxX,
          groundY: level.boss.groundY,
          phase: 'IDLE_WALK',
          phaseTimer: 1.6,
          attackCooldown: 0.5,
          invulnTimer: 0,
          rollDir: -1,
          rotation: 0,
          squashX: 1,
          squashY: 1,
          taunt: null,
          tauntTimer: 0,
        }
      : null;

    const bossProjectiles: BossProjectile[] = [];
    const particles: Particle[] = [];
    const floatingTexts: FloatingText[] = [];

    let score = initialScore;
    let lives = initialLives;
    let objectiveCollected = 0;
    let cameraX = 0;
    let elapsed = 0;
    let finished = false;
    let lastPortalSpeechShown = false;
    let lastHudPush = 0;
    let funnyEventTimer = 8.5;
    let activeFunnyEvent: string | null = null;
    let activeFunnyEventClear = 0;
    let nextProjId = 1;
    let nextEggId = 1;

    let safeSpot = { x: level.spawnX, y: level.spawnY };

    const spawnParticles = (x: number, y: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 60 + Math.random() * 145;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 45,
          radius: 3 + Math.random() * 3.8,
          color,
          life: 0.45 + Math.random() * 0.3,
          maxLife: 0.7,
        });
      }
    };

    const addFloatingText = (x: number, y: number, text: string, color: string) => {
      floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 0.95,
        maxLife: 0.95,
      });
    };

    const pushHud = (force = false) => {
      const now = performance.now();
      if (!force && now - lastHudPush < 70) return;
      lastHudPush = now;
      const bossDone = !boss || boss.defeated;
      const portalOpen = objectiveCollected >= level.objectiveTarget && bossDone;
      callbacksRef.current.onHudUpdate({
        levelId: level.id,
        levelTitle: level.title,
        dialogue: level.dialogue,
        score,
        lives,
        maxLives,
        objectiveCollected,
        objectiveTarget: level.objectiveTarget,
        objectiveLabel: level.objectiveLabel,
        worldProgress: Math.max(0, Math.min(1, player.x / (level.goalX - 60))),
        portalOpen,
        bossActive: Boolean(boss && boss.active && !boss.defeated),
        bossHp: boss ? boss.hp : 0,
        bossMaxHp: boss ? boss.maxHp : 0,
        bossDefeated: boss ? boss.defeated : true,
        funnyEvent: activeFunnyEvent,
        speedActive: player.speedBoostTimer > 0,
        superJumpActive: player.superJumpTimer > 0,
      });
    };

    pushHud(true);

    const damagePlayer = (reasonText: string, cry = false) => {
      if (player.invulnTimer > 0 || finished) return;
      lives -= 1;
      soundEngine.playHurt();
      player.invulnTimer = 1.4;
      player.vy = -380;
      player.squashX = 1.28;
      player.squashY = 0.72;
      player.emotion = cry ? 'crying' : 'dizzy';
      player.emotionTimer = 1.4;
      player.speechText = reasonText;
      player.speechTimer = 1.8;
      spawnParticles(
        player.x + player.w / 2,
        player.y + player.h / 2,
        cry ? '#38BDF8' : '#EF4444',
        12
      );
      pushHud(true);

      if (lives <= 0) {
        finished = true;
        soundEngine.playDefeatTrombone();
        callbacksRef.current.onGameOver(score);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', ' ', 'spacebar'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = true;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = true;
      if ((key === ' ' || key === 'arrowup' || key === 'w') && !e.repeat) {
        inputRef.current.jumpPressed = true;
      }
      if ((key === 'p' || key === 'escape') && !e.repeat) {
        callbacksRef.current.onTogglePause();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') inputRef.current.left = false;
      if (key === 'arrowright' || key === 'd') inputRef.current.right = false;
    };

    const handleVisibilityOrBlur = () => {
      if (document.hidden || !document.hasFocus()) {
        resetAllInputs();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetAllInputs);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);

    let prevTimestamp = performance.now();
    let rafId = 0;

    const step = (timestamp: number) => {
      const rawDt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;
      const dt = Math.min(rawDt, 0.033);

      if (!pausedRef.current && !finished) {
        elapsed += dt;

        // Power-up & Slip timers
        if (player.speedBoostTimer > 0) player.speedBoostTimer -= dt;
        if (player.superJumpTimer > 0) player.superJumpTimer -= dt;
        if (player.slipTimer > 0) player.slipTimer -= dt;

        // Random Funny Events
        funnyEventTimer -= dt;
        if (funnyEventTimer <= 0) {
          funnyEventTimer = 10 + Math.random() * 5;
          const ev = FUNNY_EVENTS[Math.floor(Math.random() * FUNNY_EVENTS.length)];
          activeFunnyEvent = ev.text;
          activeFunnyEventClear = 3.2;
          addFloatingText(player.x + player.w / 2, Math.max(48, player.y - 36), ev.text, '#7C3AED');
          if (ev.bonus > 0) {
            score += ev.bonus;
            soundEngine.playPop(700);
          }
          if (ev.confetti) {
            const colors = ['#EC4899', '#A855F7', '#FACC15', '#38BDF8'];
            for (let i = 0; i < 16; i++) {
              spawnParticles(
                cameraX + 100 + Math.random() * (VIEW_WIDTH - 200),
                60,
                colors[i % colors.length],
                2
              );
            }
          }
          pushHud(true);
        }
        if (activeFunnyEventClear > 0) {
          activeFunnyEventClear -= dt;
          if (activeFunnyEventClear <= 0) {
            activeFunnyEvent = null;
            pushHud(true);
          }
        }

        // 1. Update Moving Platforms
        for (const mp of movingPlatforms) {
          const prevX = mp.x;
          const prevY = mp.y;
          const t = (Math.sin(elapsed * mp.speed + (mp.phase || 0)) + 1) / 2;
          mp.x = mp.startX + (mp.endX - mp.startX) * t;
          mp.y = mp.startY + (mp.endY - mp.startY) * t;
          mp.dx = mp.x - prevX;
          mp.dy = mp.y - prevY;
        }

        // 2. Player Horizontal Input (with Banana speed boost & Banana-peel slip!)
        const currentSpeed = player.speedBoostTimer > 0 ? BASE_MOVE_SPEED * 1.45 : BASE_MOVE_SPEED;
        if (player.slipTimer > 0) {
          // Funny comical slide!
          player.vx = player.facing * 290;
        } else {
          const moveDir = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);
          if (moveDir !== 0) {
            player.vx = moveDir * currentSpeed;
            player.facing = moveDir > 0 ? 1 : -1;
            player.walkCycle += dt * (player.speedBoostTimer > 0 ? 1.4 : 1);
            if (player.speedBoostTimer > 0 && Math.random() < 0.35) {
              spawnParticles(player.x + player.w / 2, player.y + player.h - 6, '#FACC15', 1);
            }
          } else {
            player.vx *= 0.72;
            if (Math.abs(player.vx) < 8) player.vx = 0;
          }
        }

        // 3. Jump Buffer & Coyote Time (with Coffee Super Jump!)
        const activeJumpVel = player.superJumpTimer > 0 ? BASE_JUMP_VEL * 1.24 : BASE_JUMP_VEL;
        const activeDoubleJumpVel =
          player.superJumpTimer > 0 ? DOUBLE_JUMP_VEL * 1.22 : DOUBLE_JUMP_VEL;

        if (inputRef.current.jumpPressed) {
          player.jumpBufferTimer = 0.12;
          inputRef.current.jumpPressed = false;
        } else if (player.jumpBufferTimer > 0) {
          player.jumpBufferTimer -= dt;
        }

        if (player.onGround) {
          player.coyoteTimer = 0.09;
          player.jumpsLeft = 2;
        } else if (player.coyoteTimer > 0) {
          player.coyoteTimer -= dt;
        }

        if (player.jumpBufferTimer > 0) {
          if (player.coyoteTimer > 0) {
            player.vy = activeJumpVel;
            player.onGround = false;
            player.coyoteTimer = 0;
            player.jumpBufferTimer = 0;
            player.jumpsLeft = 1;
            player.squashX = 0.78;
            player.squashY = 1.25;
            player.emotion = 'excited';
            player.emotionTimer = 0.45;
            soundEngine.playJump(player.superJumpTimer > 0);
            spawnParticles(
              player.x + player.w / 2,
              player.y + player.h,
              player.superJumpTimer > 0 ? '#A855F7' : '#FFFFFF',
              6
            );
          } else if (player.jumpsLeft > 0) {
            player.vy = activeDoubleJumpVel;
            player.jumpsLeft = 0;
            player.jumpBufferTimer = 0;
            player.squashX = 0.8;
            player.squashY = 1.22;
            player.emotion = 'excited';
            player.emotionTimer = 0.45;
            soundEngine.playJump(true);
            spawnParticles(player.x + player.w / 2, player.y + player.h, '#F472B6', 7);
          }
        }

        // 4. Gravity & Position
        player.vy = Math.min(920, player.vy + GRAVITY * dt);
        const prevY = player.y;
        player.x += player.vx * dt;
        player.x = Math.max(0, Math.min(level.worldWidth - player.w, player.x));
        player.y += player.vy * dt;

        player.squashX += (1 - player.squashX) * Math.min(1, dt * 14);
        player.squashY += (1 - player.squashY) * Math.min(1, dt * 14);

        if (player.invulnTimer > 0) player.invulnTimer -= dt;
        if (player.speechTimer > 0) player.speechTimer -= dt;
        if (player.emotionTimer > 0) {
          player.emotionTimer -= dt;
        } else if (!player.onGround && player.vy > 340) {
          player.emotion = 'worried';
        } else {
          player.emotion = 'happy';
        }

        // 5. Platform Collisions
        const wasOnGround = player.onGround;
        player.onGround = false;

        for (const plat of level.platforms) {
          const overlapsX = player.x + player.w > plat.x + 4 && player.x < plat.x + plat.w - 4;
          const prevBottom = prevY + player.h;
          const currBottom = player.y + player.h;

          if (overlapsX && player.vy >= 0 && prevBottom <= plat.y + 12 && currBottom >= plat.y) {
            player.y = plat.y - player.h;
            if (plat.kind === 'bouncy') {
              player.vy = BOUNCY_VEL;
              player.onGround = false;
              player.jumpsLeft = 1;
              player.squashX = 0.76;
              player.squashY = 1.3;
              player.emotion = 'excited';
              player.emotionTimer = 0.6;
              soundEngine.playBoing();
              spawnParticles(player.x + player.w / 2, plat.y, '#EC4899', 8);
            } else {
              player.vy = 0;
              player.onGround = true;
              if (!wasOnGround) {
                player.squashX = 1.24;
                player.squashY = 0.78;
              }
              if (plat.kind === 'ground') {
                safeSpot = {
                  x: Math.max(plat.x + 16, Math.min(player.x, plat.x + plat.w - 50)),
                  y: plat.y - player.h - 4,
                };
              }
            }
          }
        }

        for (const mp of movingPlatforms) {
          const overlapsX = player.x + player.w > mp.x + 4 && player.x < mp.x + mp.w - 4;
          const prevBottom = prevY + player.h;
          const currBottom = player.y + player.h;

          if (overlapsX && player.vy >= 0 && prevBottom <= mp.y + 14 && currBottom >= mp.y - 2) {
            player.y = mp.y - player.h;
            player.x += mp.dx;
            player.vy = 0;
            player.onGround = true;
            if (!wasOnGround) {
              player.squashX = 1.2;
              player.squashY = 0.82;
            }
          }
        }

        // 6. Pit Fall Check
        if (player.y > VIEW_HEIGHT + 40) {
          damagePlayer('Ax! Ez ketim 😂');
          if (!finished) {
            player.x = safeSpot.x;
            player.y = safeSpot.y;
            player.vx = 0;
            player.vy = 0;
          }
        }

        // 7. Obstacles (spikes, chaos boxes, rotten apples, banana peels!)
        for (const obs of obstacles) {
          if (obs.cooldown && obs.cooldown > 0) {
            obs.cooldown -= dt;
          }
          if (
            rectsOverlap(
              player.x + 5,
              player.y + 6,
              player.w - 10,
              player.h - 8,
              obs.x + 4,
              obs.y + 4,
              obs.w - 8,
              obs.h - 4
            )
          ) {
            if (obs.kind === 'banana_peel') {
              if (!obs.cooldown || obs.cooldown <= 0) {
                obs.cooldown = 1.5;
                player.slipTimer = 0.55;
                player.vy = -240;
                player.emotion = 'slipping';
                player.emotionTimer = 0.7;
                player.speechText = 'Wîîî! Ez şemitîm! 😂';
                player.speechTimer = 1.5;
                soundEngine.playBoing();
                spawnParticles(obs.x + obs.w / 2, obs.y, '#FACC15', 8);
              }
            } else if (obs.kind === 'rotten_apple') {
              damagePlayer('Ev sêv xerab e! 🤢');
            } else {
              damagePlayer('Hawar! 😅');
            }
          }
        }

        // 8. Ground Enemies (Slime, Chaos Bug, Angry Onion, Rolling Angry Potato)
        for (const enemy of enemies) {
          if (!enemy.alive) {
            if (enemy.squishTimer > 0) enemy.squishTimer -= dt;
            continue;
          }
          // Angry potato rolls faster toward Bushra when near!
          if (enemy.kind === 'angry_potato') {
            const dist = Math.abs(player.x - enemy.x);
            const speed = dist < 240 ? 155 : 105;
            if (dist < 240 && Math.abs(player.y - enemy.y) < 90) {
              enemy.vx = player.x < enemy.x ? -speed : speed;
            }
            enemy.rotation = (enemy.rotation || 0) + (enemy.vx / 18) * dt;
          }

          enemy.x += enemy.vx * dt;
          if (enemy.x <= enemy.minX) {
            enemy.x = enemy.minX;
            enemy.vx = Math.abs(enemy.vx);
          } else if (enemy.x + enemy.w >= enemy.maxX) {
            enemy.x = enemy.maxX - enemy.w;
            enemy.vx = -Math.abs(enemy.vx);
          }

          if (
            rectsOverlap(
              player.x + 4,
              player.y + 4,
              player.w - 8,
              player.h - 4,
              enemy.x + 3,
              enemy.y + 4,
              enemy.w - 6,
              enemy.h - 4
            )
          ) {
            const isStomp = player.vy > 0 && prevY + player.h <= enemy.y + 18;
            if (isStomp) {
              enemy.alive = false;
              enemy.squishTimer = 0.45;
              player.vy = -495;
              player.jumpsLeft = 1;
              player.emotion = 'hero';
              player.emotionTimer = 0.65;
              player.speechText = 'Aferîn, Einstein! 😂';
              player.speechTimer = 1.4;
              score += 50;
              soundEngine.playBonk();
              spawnParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#A855F7', 12);
              addFloatingText(enemy.x + enemy.w / 2, enemy.y - 8, 'Bum! +50', '#9333EA');
              pushHud(true);
            } else if (enemy.kind === 'angry_onion') {
              damagePlayer('Pîvaz çavên te giryan! 😭', true);
            } else if (enemy.kind === 'angry_potato') {
              damagePlayer('Tu ji kartofan ditirsî?! 🥔😂');
            } else {
              damagePlayer('Hey! Hişyar be 😂');
            }
          }
        }

        // 9. Flying Coffee Cups
        for (const fc of flyingCoffees) {
          fc.x += fc.vx * dt;
          if (fc.x <= fc.minX) {
            fc.x = fc.minX;
            fc.vx = Math.abs(fc.vx);
          } else if (fc.x >= fc.maxX) {
            fc.x = fc.maxX;
            fc.vx = -Math.abs(fc.vx);
          }
          fc.y = fc.baseY + Math.sin(elapsed * fc.freq + fc.phase) * fc.ampY;

          if (
            rectsOverlap(
              player.x + 5,
              player.y + 5,
              player.w - 10,
              player.h - 10,
              fc.x + 6,
              fc.y + 6,
              fc.w - 12,
              fc.h - 12
            )
          ) {
            damagePlayer('Ev qehwe hêrs e! ☕😂');
          }
        }

        // 10. Falling Eggs
        for (const ez of eggZones) {
          ez.timer -= dt;
          if (ez.timer <= 0) {
            ez.timer = ez.interval;
            if (Math.abs(player.x - ez.x) < 460) {
              nextEggId += 1;
              fallingEggs.push({
                id: nextEggId,
                x: ez.x + (Math.random() - 0.5) * 60,
                y: -15,
                vy: 150,
                radius: 12,
                splatTimer: 0,
              });
            }
          }
        }

        for (let i = fallingEggs.length - 1; i >= 0; i--) {
          const egg = fallingEggs[i];
          if (egg.splatTimer > 0) {
            egg.splatTimer -= dt;
            if (egg.splatTimer <= 0) fallingEggs.splice(i, 1);
            continue;
          }
          egg.vy += 280 * dt;
          egg.y += egg.vy * dt;

          const dist = Math.hypot(
            player.x + player.w / 2 - egg.x,
            player.y + player.h / 2 - egg.y
          );
          if (dist < egg.radius + 16) {
            fallingEggs.splice(i, 1);
            spawnParticles(egg.x, egg.y, '#FACC15', 10);
            damagePlayer('Hêk li serê min ket! 🥚😂');
            continue;
          }

          if (egg.y >= 455) {
            egg.y = 455;
            egg.splatTimer = 0.5;
            soundEngine.playSillyTear();
          } else if (egg.y > VIEW_HEIGHT + 30) {
            fallingEggs.splice(i, 1);
          }
        }

        // 11. Giant Onion Final Boss (Pîvaza Mezin)
        if (boss && !boss.defeated) {
          if (!boss.active && player.x >= boss.arenaMinX - 100) {
            boss.active = true;
            boss.taunt = 'Ez Pîvaza Mezin im! 😂';
            boss.tauntTimer = 2.6;
            pushHud(true);
          }

          if (boss.active) {
            if (boss.invulnTimer > 0) boss.invulnTimer -= dt;
            if (boss.tauntTimer > 0) boss.tauntTimer -= dt;
            boss.squashX += (1 - boss.squashX) * Math.min(1, dt * 10);
            boss.squashY += (1 - boss.squashY) * Math.min(1, dt * 10);

            const enraged = boss.hp <= 2;
            boss.phaseTimer -= dt;
            boss.attackCooldown -= dt;

            if (boss.phase === 'IDLE_WALK') {
              boss.rotation = Math.sin(elapsed * 4) * 0.06;
              boss.x += boss.vx * (enraged ? 1.25 : 1) * dt;
              if (boss.x <= boss.arenaMinX) {
                boss.x = boss.arenaMinX;
                boss.vx = Math.abs(boss.vx);
              } else if (boss.x + boss.w >= boss.arenaMaxX) {
                boss.x = boss.arenaMaxX - boss.w;
                boss.vx = -Math.abs(boss.vx);
              }
              if (boss.phaseTimer <= 0) {
                boss.phase = 'TEAR_BARRAGE';
                boss.phaseTimer = 1.9;
                boss.attackCooldown = 0.25;
                boss.taunt = 'Hêsirên Pîvazê! 😭';
                boss.tauntTimer = 1.8;
              }
            } else if (boss.phase === 'TEAR_BARRAGE') {
              boss.rotation = Math.sin(elapsed * 12) * 0.08;
              if (boss.attackCooldown <= 0) {
                boss.attackCooldown = enraged ? 0.42 : 0.55;
                soundEngine.playSillyTear();
                [-1, 1].forEach((dir) => {
                  nextProjId += 1;
                  bossProjectiles.push({
                    id: nextProjId,
                    kind: 'tear',
                    x: boss.x + boss.w / 2,
                    y: boss.y + 34,
                    vx: dir * (135 + Math.random() * 65),
                    vy: -430,
                    radius: 11,
                    life: 2.6,
                    rotation: 0,
                  });
                });
              }
              if (boss.phaseTimer <= 0) {
                boss.phase = 'ROLL_WINDUP';
                boss.phaseTimer = 0.85;
                boss.rollDir = player.x < boss.x ? -1 : 1;
                boss.taunt = 'Ez têm! Gindirîn! 🧅';
                boss.tauntTimer = 1.4;
              }
            } else if (boss.phase === 'ROLL_WINDUP') {
              boss.rotation = Math.sin(elapsed * 32) * 0.22;
              if (boss.phaseTimer <= 0) {
                boss.phase = 'ROLL_CHARGE';
                boss.phaseTimer = 1.35;
                soundEngine.playBoing();
              }
            } else if (boss.phase === 'ROLL_CHARGE') {
              boss.x += boss.rollDir * (enraged ? 330 : 285) * dt;
              boss.rotation += boss.rollDir * 9 * dt;
              if (boss.x <= boss.arenaMinX) {
                boss.x = boss.arenaMinX;
                boss.rollDir = 1;
              } else if (boss.x + boss.w >= boss.arenaMaxX) {
                boss.x = boss.arenaMaxX - boss.w;
                boss.rollDir = -1;
              }
              if (boss.phaseTimer <= 0) {
                boss.phase = 'RING_BURST';
                boss.phaseTimer = 1.25;
                boss.rotation = 0;
                boss.taunt = 'Xelekên Pîvazê! 💥';
                boss.tauntTimer = 1.5;
                [-1, 1].forEach((dir) => {
                  nextProjId += 1;
                  bossProjectiles.push({
                    id: nextProjId,
                    kind: 'ring',
                    x: boss.x + boss.w / 2,
                    y: boss.groundY - 34,
                    vx: dir * 215,
                    vy: 0,
                    radius: 15,
                    life: 2.4,
                    rotation: 0,
                  });
                });
              }
            } else if (boss.phase === 'RING_BURST') {
              boss.rotation = 0;
              if (boss.phaseTimer <= 0) {
                boss.phase = 'IDLE_WALK';
                boss.phaseTimer = 1.5;
              }
            }

            if (
              rectsOverlap(
                player.x + 4,
                player.y + 4,
                player.w - 8,
                player.h - 4,
                boss.x + 8,
                boss.y + 10,
                boss.w - 16,
                boss.h - 10
              )
            ) {
              const isStomp = player.vy > 0 && prevY + player.h <= boss.y + 40;
              if (isStomp && boss.invulnTimer <= 0) {
                boss.hp -= 1;
                boss.invulnTimer = 0.6;
                boss.squashX = 1.45;
                boss.squashY = 0.55;
                player.vy = -560;
                player.jumpsLeft = 1;
                player.emotion = 'hero';
                player.emotionTimer = 0.85;
                score += 100;
                soundEngine.playBossHit();
                spawnParticles(boss.x + boss.w / 2, boss.y + 20, '#F472B6', 16);
                addFloatingText(boss.x + boss.w / 2, boss.y - 12, 'BAM! +100', '#DB2777');

                if (boss.hp <= 0) {
                  boss.defeated = true;
                  score += 300;
                  soundEngine.playCelebration();
                  spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#22C55E', 24);
                  spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#FACC15', 24);
                  addFloatingText(
                    boss.x + boss.w / 2,
                    boss.y - 24,
                    'Şorba Pîvazê! +300 😂',
                    '#16A34A'
                  );
                  player.speechText = 'Bijî Kurdistan! ❤️';
                  player.speechTimer = 3.0;
                  player.emotion = 'joy';
                  player.emotionTimer = 2.0;
                } else {
                  boss.taunt = BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)];
                  boss.tauntTimer = 1.7;
                }
                pushHud(true);
              } else if (!isStomp && boss.invulnTimer <= 0) {
                damagePlayer('Pîvaz çavên te giryan! 😭', true);
              }
            }
          }
        }

        // 12. Boss Projectiles Update
        for (let i = bossProjectiles.length - 1; i >= 0; i--) {
          const p = bossProjectiles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.kind === 'tear') {
            p.vy += 880 * dt;
          } else {
            p.rotation += 8 * dt;
          }
          p.life -= dt;

          const distToPlayer = Math.hypot(
            player.x + player.w / 2 - p.x,
            player.y + player.h / 2 - p.y
          );
          if (distToPlayer < p.radius + 14) {
            bossProjectiles.splice(i, 1);
            spawnParticles(p.x, p.y, p.kind === 'tear' ? '#38BDF8' : '#F472B6', 10);
            damagePlayer(
              p.kind === 'tear' ? 'Pîvaz çavên te giryan! 😭' : 'Xelek teqîya! 💥',
              p.kind === 'tear'
            );
            continue;
          }

          if (p.life <= 0 || p.y > VIEW_HEIGHT + 30) {
            bossProjectiles.splice(i, 1);
          }
        }

        // 13. Collectibles & Food System
        const pcx = player.x + player.w / 2;
        const pcy = player.y + player.h / 2;
        for (const item of collectibles) {
          if (item.collected) continue;
          const dist = Math.hypot(pcx - item.x, pcy - item.y);
          if (dist < 31) {
            item.collected = true;
            player.emotion = 'joy';
            player.emotionTimer = 0.65;
            if (item.kind === 'coin') {
              score += 10;
              soundEngine.playCoin();
              spawnParticles(item.x, item.y, '#FACC15', 8);
              addFloatingText(item.x, item.y - 12, '+10', '#D97706');
            } else if (item.kind === 'star') {
              score += 25;
              if (level.objectiveKind === 'star') objectiveCollected += 1;
              soundEngine.playStar();
              spawnParticles(item.x, item.y, '#FDE047', 12);
              addFloatingText(item.x, item.y - 12, '+25 ⭐', '#CA8A04');
            } else if (item.kind === 'heart') {
              score += 30;
              if (lives < maxLives) lives += 1;
              if (level.objectiveKind === 'heart') objectiveCollected += 1;
              soundEngine.playHeart();
              spawnParticles(item.x, item.y, '#EC4899', 12);
              addFloatingText(item.x, item.y - 12, '+1 ❤️', '#DB2777');
            } else if (item.kind === 'flag') {
              score += 50;
              if (level.objectiveKind === 'flag') objectiveCollected += 1;
              soundEngine.playFlag();
              spawnParticles(item.x, item.y, '#22C55E', 14);
              addFloatingText(item.x, item.y - 12, '+50', '#16A34A');
            } else if (item.kind === 'apple') {
              score += 15;
              if (lives < maxLives) lives += 1;
              soundEngine.playHeart();
              spawnParticles(item.x, item.y, '#EF4444', 10);
              addFloatingText(item.x, item.y - 12, '+1 Jiyan 🍎', '#DC2626');
            } else if (item.kind === 'strawberry') {
              score += 35;
              soundEngine.playStar();
              spawnParticles(item.x, item.y, '#F43F5E', 10);
              addFloatingText(item.x, item.y - 12, '+35 🍓', '#E11D48');
            } else if (item.kind === 'banana') {
              score += 20;
              player.speedBoostTimer = 5.0;
              player.speechText = 'Leza Mûzê! 🍌⚡';
              player.speechTimer = 1.6;
              soundEngine.playPop(740);
              spawnParticles(item.x, item.y, '#FACC15', 12);
              addFloatingText(item.x, item.y - 12, 'Lez! 🍌', '#CA8A04');
            } else if (item.kind === 'sandwich') {
              score += 25;
              lives = Math.min(maxLives, lives + 2);
              player.speechText = 'Sendwîça xweş! 🥪';
              player.speechTimer = 1.6;
              soundEngine.playHeart();
              spawnParticles(item.x, item.y, '#22C55E', 12);
              addFloatingText(item.x, item.y - 12, '+2 Jiyan 🥪', '#16A34A');
            } else if (item.kind === 'power_coffee') {
              score += 25;
              player.superJumpTimer = 6.0;
              player.speechText = 'Bazdana Super! ☕🚀';
              player.speechTimer = 1.6;
              soundEngine.playBoing();
              spawnParticles(item.x, item.y, '#A855F7', 12);
              addFloatingText(item.x, item.y - 12, 'Super! ☕', '#7C3AED');
            }

            const bossDone = !boss || boss.defeated;
            if (objectiveCollected >= level.objectiveTarget && bossDone && !lastPortalSpeechShown) {
              lastPortalSpeechShown = true;
              player.speechText = 'Derî vebû! 🎉';
              player.speechTimer = 2.2;
            }
            pushHud(true);
          }
        }

        // 14. Goal Portal Check
        const bossDone = !boss || boss.defeated;
        const portalOpen = objectiveCollected >= level.objectiveTarget && bossDone;
        if (
          rectsOverlap(
            player.x,
            player.y,
            player.w,
            player.h,
            level.goalX - 28,
            level.goalY - 82,
            56,
            82
          )
        ) {
          if (portalOpen) {
            finished = true;
            soundEngine.playLevelClear();
            pushHud(true);
            callbacksRef.current.onLevelComplete(score, lives);
          } else if (player.speechTimer <= 0) {
            if (boss && !boss.defeated) {
              player.speechText = 'Pêşî Pîvaza Mezin têk bibe! 🧅';
            } else {
              const left = level.objectiveTarget - objectiveCollected;
              player.speechText = `Hîn ${left} ${level.objectiveLabel} lazim e!`;
            }
            player.speechTimer = 1.6;
          }
        }

        // 15. Particles & Floating Texts
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 260 * dt;
          p.life -= dt;
          if (p.life <= 0) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.y -= 36 * dt;
          ft.life -= dt;
          if (ft.life <= 0) floatingTexts.splice(i, 1);
        }

        // 16. Smooth Camera Follow
        const targetCamX = Math.max(
          0,
          Math.min(level.worldWidth - VIEW_WIDTH, player.x - VIEW_WIDTH * 0.36)
        );
        cameraX += (targetCamX - cameraX) * Math.min(1, dt * 8);

        pushHud(false);
      }

      renderGameFrame(
        ctx,
        elapsed,
        cameraX,
        level,
        player,
        movingPlatforms,
        enemies,
        flyingCoffees,
        fallingEggs,
        collectibles,
        boss,
        bossProjectiles,
        particles,
        floatingTexts,
        objectiveCollected >= level.objectiveTarget && (!boss || boss.defeated)
      );

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', resetAllInputs);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
    };
  }, [levelId, initialScore, initialLives, maxLives]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center game-touch-surface"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Responsive 16:9 Canvas Stage (auto-maximizes height in Honor Landscape) */}
      <div className="landscape-canvas-frame relative w-full max-w-[960px] aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-white shadow-[0_24px_60px_rgba(124,58,237,0.2)] bg-indigo-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          className="w-full h-full block select-none touch-none"
        />
      </div>

      {/* Subtle Portrait Orientation Recommendation (Non-blocking) */}
      <div className="portrait-only-tip items-center justify-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-purple-50/90 border border-purple-200 text-[11px] font-bold text-purple-800">
        <RotateCw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        <span>Telefonê bizivirîne (Landscape) bo dîmena herî baş</span>
      </div>

      {/* Simultaneous Multi-Touch Controls (Thumb Dock in Portrait / Overlay in Landscape) */}
      <div className="landscape-controls-overlay mt-3 sm:mt-4 w-full max-w-[960px] flex items-center justify-between gap-3 px-1 sm:px-2">
        {/* Multi-touch D-Pad: Supports sliding thumb between Left and Right without lifting */}
        <div
          ref={dpadRef}
          onPointerDown={handleDpadPointerDown}
          onPointerMove={handleDpadPointerMove}
          onPointerUp={handleDpadPointerUpOrCancel}
          onPointerCancel={handleDpadPointerUpOrCancel}
          onContextMenu={(e) => e.preventDefault()}
          className="flex items-center gap-2.5 sm:gap-3 touch-none select-none p-1 rounded-3xl"
        >
          <div
            role="button"
            aria-label="Çep"
            aria-pressed={leftActive}
            className={`cursor-pointer select-none touch-none w-[74px] h-[64px] sm:w-16 sm:h-14 md:w-14 md:h-12 rounded-2xl border-2 shadow-lg flex items-center justify-center transition-transform duration-75 ${
              leftActive
                ? 'scale-95 bg-purple-100 border-purple-500 text-purple-900 ring-4 ring-purple-300/60'
                : 'bg-white/85 backdrop-blur-md border-purple-200/90 text-indigo-950'
            }`}
          >
            <ArrowLeft className="w-8 h-8 sm:w-7 sm:h-7 pointer-events-none" />
          </div>

          <div
            role="button"
            aria-label="Rast"
            aria-pressed={rightActive}
            className={`cursor-pointer select-none touch-none w-[74px] h-[64px] sm:w-16 sm:h-14 md:w-14 md:h-12 rounded-2xl border-2 shadow-lg flex items-center justify-center transition-transform duration-75 ${
              rightActive
                ? 'scale-95 bg-purple-100 border-purple-500 text-purple-900 ring-4 ring-purple-300/60'
                : 'bg-white/85 backdrop-blur-md border-purple-200/90 text-indigo-950'
            }`}
          >
            <ArrowRight className="w-8 h-8 sm:w-7 sm:h-7 pointer-events-none" />
          </div>
        </div>

        <p className="hidden lg:block text-sm font-bold text-indigo-950/75 landscape-hide">
          Klavye: Tîrên aliyan an WASD ji bo livînê · Valahî (Space) ji bo bazdanê
        </p>

        {/* Independent Multi-Touch Jump Button */}
        <button
          type="button"
          aria-label="Bazde"
          aria-pressed={jumpActive}
          onPointerDown={handleJumpPointerDown}
          onPointerUp={handleJumpPointerUpOrCancel}
          onPointerCancel={handleJumpPointerUpOrCancel}
          onContextMenu={(e) => e.preventDefault()}
          className={`cursor-pointer select-none touch-none min-w-[108px] sm:min-w-[120px] h-[64px] sm:h-14 md:h-12 px-5 sm:px-6 rounded-2xl border-2 border-white/70 bg-gradient-to-r from-pink-500/95 via-purple-600/95 to-blue-600/95 text-white font-display font-extrabold text-base sm:text-lg shadow-xl flex items-center justify-center gap-2 transition-transform duration-75 ${
            jumpActive ? 'scale-[0.92] brightness-110 ring-4 ring-pink-300/70' : ''
          }`}
        >
          <ArrowUp className="w-6 h-6 pointer-events-none" />
          <span>Bazde</span>
        </button>
      </div>
    </div>
  );
}

function rectsOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
