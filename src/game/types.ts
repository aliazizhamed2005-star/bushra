export type LevelId = 1 | 2 | 3;

export type CollectibleKind =
  | 'coin'
  | 'star'
  | 'heart'
  | 'flag'
  | 'apple'
  | 'strawberry'
  | 'banana'
  | 'sandwich'
  | 'power_coffee';

export type BushraEmotion =
  | 'happy'
  | 'excited'
  | 'worried'
  | 'joy'
  | 'dizzy'
  | 'hero'
  | 'crying'
  | 'slipping';

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind?: 'ground' | 'ledge' | 'bouncy';
}

export interface MovingPlatform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  phase?: number;
  dx: number;
  dy: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'spike' | 'chaos_box' | 'rotten_apple' | 'banana_peel';
  label?: string;
  cooldown?: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minX: number;
  maxX: number;
  vx: number;
  kind: 'slime' | 'chaos_bug' | 'angry_onion' | 'angry_potato';
  alive: boolean;
  squishTimer: number;
  rotation?: number;
}

export interface FlyingCoffee {
  id: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  ampY: number;
  freq: number;
  phase: number;
}

export interface EggDropZone {
  id: string;
  x: number;
  interval: number;
  timer: number;
}

export interface FallingEgg {
  id: number;
  x: number;
  y: number;
  vy: number;
  radius: number;
  splatTimer: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  kind: CollectibleKind;
  collected: boolean;
  bobOffset: number;
}

export interface BossConfig {
  x: number;
  y: number;
  arenaMinX: number;
  arenaMaxX: number;
  groundY: number;
  hp: number;
}

export type BossPhase =
  | 'IDLE_WALK'
  | 'TEAR_BARRAGE'
  | 'ROLL_WINDUP'
  | 'ROLL_CHARGE'
  | 'RING_BURST';

export interface GiantOnionBoss {
  active: boolean;
  defeated: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hp: number;
  maxHp: number;
  arenaMinX: number;
  arenaMaxX: number;
  groundY: number;
  phase: BossPhase;
  phaseTimer: number;
  attackCooldown: number;
  invulnTimer: number;
  rollDir: 1 | -1;
  rotation: number;
  squashX: number;
  squashY: number;
  taunt: string | null;
  tauntTimer: number;
}

export interface BossProjectile {
  id: number;
  kind: 'tear' | 'ring';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface LevelConfig {
  id: LevelId;
  title: string;
  subtitle: string;
  dialogue: string;
  objectiveKind: 'star' | 'heart' | 'flag';
  objectiveTarget: number;
  objectiveLabel: string;
  theme: 'grassy' | 'chaos' | 'kurdistan';
  worldWidth: number;
  spawnX: number;
  spawnY: number;
  goalX: number;
  goalY: number;
  platforms: Platform[];
  movingPlatforms: Omit<MovingPlatform, 'dx' | 'dy'>[];
  obstacles: Obstacle[];
  enemies: Omit<Enemy, 'alive' | 'squishTimer' | 'rotation'>[];
  flyingCoffees: Omit<FlyingCoffee, 'x' | 'y'>[];
  eggZones: Omit<EggDropZone, 'timer'>[];
  collectibles: Omit<Collectible, 'collected'>[];
  boss?: BossConfig;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  onGround: boolean;
  jumpsLeft: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
  invulnTimer: number;
  speedBoostTimer: number;
  superJumpTimer: number;
  slipTimer: number;
  walkCycle: number;
  squashX: number;
  squashY: number;
  emotion: BushraEmotion;
  emotionTimer: number;
  speechText: string | null;
  speechTimer: number;
}

export interface HudSnapshot {
  levelId: LevelId;
  levelTitle: string;
  dialogue: string;
  score: number;
  lives: number;
  maxLives: number;
  objectiveCollected: number;
  objectiveTarget: number;
  objectiveLabel: string;
  worldProgress: number;
  portalOpen: boolean;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossDefeated: boolean;
  funnyEvent: string | null;
  speedActive: boolean;
  superJumpActive: boolean;
}
