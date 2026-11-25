import {
  BossProjectile,
  Collectible,
  Enemy,
  FallingEgg,
  FloatingText,
  FlyingCoffee,
  GiantOnionBoss,
  LevelConfig,
  MovingPlatform,
  Obstacle,
  Particle,
  Platform,
  PlayerState,
} from './types';
import { VIEW_HEIGHT, VIEW_WIDTH } from './levels';

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  time: number,
  cameraX: number,
  level: LevelConfig,
  player: PlayerState,
  movingPlatforms: MovingPlatform[],
  enemies: Enemy[],
  flyingCoffees: FlyingCoffee[],
  fallingEggs: FallingEgg[],
  collectibles: Collectible[],
  boss: GiantOnionBoss | null,
  bossProjectiles: BossProjectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  portalOpen: boolean
) {
  ctx.save();
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  // 1. Sky & Parallax Backdrop
  drawBackdrop(ctx, time, cameraX, level.theme);

  ctx.save();
  ctx.translate(-cameraX, 0);

  const viewMinX = cameraX - 80;
  const viewMaxX = cameraX + VIEW_WIDTH + 80;

  // 2. Static Platforms
  for (const plat of level.platforms) {
    if (plat.x + plat.w < viewMinX || plat.x > viewMaxX) continue;
    drawPlatform(ctx, plat, level.theme, time);
  }

  // 3. Moving Platforms
  for (const mp of movingPlatforms) {
    if (mp.x + mp.w < viewMinX || mp.x > viewMaxX) continue;
    drawMovingPlatform(ctx, mp, level.theme);
  }

  // 4. Obstacles (spikes, chaos boxes, rotten apples, banana peels)
  for (const obs of level.obstacles) {
    if (obs.x + obs.w < viewMinX || obs.x > viewMaxX) continue;
    drawObstacle(ctx, obs, time);
  }

  // 5. Goal Portal
  if (level.goalX + 80 >= viewMinX && level.goalX - 80 <= viewMaxX) {
    drawGoalPortal(ctx, level.goalX, level.goalY, time, portalOpen, level.theme);
  }

  // 6. Collectibles & Food Items
  for (const item of collectibles) {
    if (!item.collected && item.x >= viewMinX && item.x <= viewMaxX) {
      drawCollectible(ctx, item, time);
    }
  }

  // 7. Ground Enemies (Slime, Chaos Bug, Angry Onion, Rolling Angry Potato)
  for (const enemy of enemies) {
    if ((enemy.alive || enemy.squishTimer > 0) && enemy.x + enemy.w >= viewMinX && enemy.x <= viewMaxX) {
      drawEnemy(ctx, enemy, time);
    }
  }

  // 8. Flying Coffee Cups
  for (const fc of flyingCoffees) {
    if (fc.x + fc.w < viewMinX || fc.x > viewMaxX) continue;
    drawFlyingCoffee(ctx, fc, time);
  }

  // 9. Falling Eggs
  for (const egg of fallingEggs) {
    drawFallingEgg(ctx, egg);
  }

  // 10. Giant Onion Final Boss
  if (boss && !boss.defeated) {
    drawGiantOnionBoss(ctx, boss, time);
  }

  // 11. Boss Projectiles
  for (const proj of bossProjectiles) {
    drawBossProjectile(ctx, proj);
  }

  // 12. Bushra with dynamic emotions & power-up auras
  drawBushra(ctx, player, time, cameraX);

  // 13. Particles
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 14. Floating Score & Comedy Popups
  for (const ft of floatingTexts) {
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = '800 18px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
  ctx.restore();
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  time: number,
  cameraX: number,
  theme: LevelConfig['theme']
) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  if (theme === 'grassy') {
    sky.addColorStop(0, '#38BDF8');
    sky.addColorStop(0.55, '#DDD6FE');
    sky.addColorStop(1, '#FCE7F3');
  } else if (theme === 'chaos') {
    sky.addColorStop(0, '#3B0764');
    sky.addColorStop(0.55, '#9D174D');
    sky.addColorStop(1, '#FBCFE8');
  } else {
    sky.addColorStop(0, '#0EA5E9');
    sky.addColorStop(0.55, '#FEF3C7');
    sky.addColorStop(1, '#DCFCE7');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  // Twinkling stars in Level 2 Chaos sky
  if (theme === 'chaos') {
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 117 - cameraX * 0.08) % VIEW_WIDTH + VIEW_WIDTH) % VIEW_WIDTH;
      const sy = 24 + ((i * 53) % 180);
      const alpha = 0.35 + Math.abs(Math.sin(time * 2.5 + i)) * 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 2) + 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sun / Moon & Soft Sunbeams
  const sunX = 790 - cameraX * 0.04;
  const sunY = 92;
  ctx.save();
  if (theme !== 'chaos') {
    // Diagonal gentle sunbeams
    ctx.fillStyle = 'rgba(254, 240, 138, 0.14)';
    for (let b = -2; b <= 2; b++) {
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + b * 140 - 45, VIEW_HEIGHT);
      ctx.lineTo(sunX + b * 140 + 45, VIEW_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(253, 224, 71, 0.32)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 68 + Math.sin(time * 2) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 64, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F9A8D4';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Parallax Mountains
  const mOffset = -(cameraX * 0.18) % 480;
  for (let i = -1; i < 4; i++) {
    const mx = mOffset + i * 480;
    ctx.fillStyle =
      theme === 'chaos'
        ? '#6B21A8'
        : theme === 'kurdistan'
        ? '#15803D'
        : '#93C5FD';
    ctx.beginPath();
    ctx.moveTo(mx, VIEW_HEIGHT);
    ctx.lineTo(mx + 150, 230);
    ctx.lineTo(mx + 310, 355);
    ctx.lineTo(mx + 410, 250);
    ctx.lineTo(mx + 520, VIEW_HEIGHT);
    ctx.closePath();
    ctx.fill();

    if (theme === 'kurdistan') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(mx + 150, 230);
      ctx.lineTo(mx + 112, 290);
      ctx.lineTo(mx + 152, 274);
      ctx.lineTo(mx + 192, 292);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(mx + 410, 250);
      ctx.lineTo(mx + 380, 300);
      ctx.lineTo(mx + 412, 286);
      ctx.lineTo(mx + 442, 302);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Rolling foreground hills
  const hOffset = -(cameraX * 0.32) % 420;
  for (let i = -1; i < 4; i++) {
    const hx = hOffset + i * 420;
    ctx.fillStyle =
      theme === 'chaos'
        ? 'rgba(190, 24, 93, 0.35)'
        : theme === 'kurdistan'
        ? 'rgba(34, 197, 94, 0.45)'
        : 'rgba(167, 139, 250, 0.35)';
    ctx.beginPath();
    ctx.arc(hx + 210, 520, 230, Math.PI, 0);
    ctx.fill();
  }

  // Fluffy drifting clouds
  const cOffset = -(cameraX * 0.12 + time * 14) % 340;
  for (let i = -1; i < 5; i++) {
    const cx = cOffset + i * 340;
    const cy = 78 + (i % 2) * 44;
    drawCloud(
      ctx,
      cx,
      cy,
      theme === 'chaos' ? 'rgba(255,228,242,0.75)' : 'rgba(255,255,255,0.9)'
    );
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 24, y - 8, 28, 0, Math.PI * 2);
  ctx.arc(x + 52, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 25, y + 8, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  plat: Platform,
  theme: LevelConfig['theme'],
  time: number
) {
  const { x, y, w, h, kind } = plat;
  const r = 10;

  if (kind === 'bouncy') {
    const bouncePulse = Math.sin(time * 5) * 1.5;
    ctx.fillStyle = '#EC4899';
    roundRect(ctx, x, y + bouncePulse, w, h, 12);
    ctx.fill();
    ctx.fillStyle = '#FBCFE8';
    roundRect(ctx, x + 6, y + 3 + bouncePulse, w - 12, 7, 4);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲  ▲  ▲', x + w / 2, y + 17 + bouncePulse);
    return;
  }

  ctx.fillStyle =
    theme === 'chaos' ? '#581C87' : theme === 'kurdistan' ? '#78350F' : '#854D0E';
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.fillStyle =
    theme === 'chaos' ? '#EC4899' : theme === 'kurdistan' ? '#22C55E' : '#4ADE80';
  roundRect(ctx, x, y, w, Math.min(16, h), r);
  ctx.fill();

  if (kind === 'ground') {
    for (let fx = x + 36; fx < x + w - 30; fx += 90) {
      const sway = Math.sin(time * 3 + fx) * 1.5;
      ctx.fillStyle = theme === 'kurdistan' ? '#EF4444' : '#F472B6';
      ctx.beginPath();
      ctx.arc(fx + sway, y - 5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(fx + sway, y - 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawMovingPlatform(
  ctx: CanvasRenderingContext2D,
  mp: MovingPlatform,
  theme: LevelConfig['theme']
) {
  ctx.fillStyle = theme === 'chaos' ? '#3B82F6' : '#8B5CF6';
  roundRect(ctx, mp.x, mp.y, mp.w, mp.h, 11);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.35;
  roundRect(ctx, mp.x + 8, mp.y + 4, mp.w - 16, 5, 3);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, time: number) {
  if (obs.kind === 'spike') {
    const count = 3;
    const sw = obs.w / count;
    for (let i = 0; i < count; i++) {
      const sx = obs.x + i * sw;
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(sx, obs.y + obs.h);
      ctx.lineTo(sx + sw / 2, obs.y);
      ctx.lineTo(sx + sw, obs.y + obs.h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FECACA';
      ctx.beginPath();
      ctx.moveTo(sx + sw * 0.35, obs.y + obs.h);
      ctx.lineTo(sx + sw / 2, obs.y + 5);
      ctx.lineTo(sx + sw * 0.55, obs.y + obs.h);
      ctx.closePath();
      ctx.fill();
    }
  } else if (obs.kind === 'rotten_apple') {
    const cx = obs.x + obs.w / 2;
    const cy = obs.y + obs.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Sickly green-brown apple body
    ctx.fillStyle = '#65A30D';
    ctx.beginPath();
    ctx.arc(-4, 2, 11, 0, Math.PI * 2);
    ctx.arc(4, 2, 11, 0, Math.PI * 2);
    ctx.fill();
    // Brown rotten bruise
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(4, 4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Stem
    ctx.strokeStyle = '#713F12';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(3, -15);
    ctx.stroke();
    // Tiny circling fly
    const fx = Math.cos(time * 7) * 16;
    const fy = -14 + Math.sin(time * 9) * 5;
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // X eyes
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-2, 4);
    ctx.moveTo(-2, 0);
    ctx.lineTo(-6, 4);
    ctx.stroke();
    ctx.restore();
  } else if (obs.kind === 'banana_peel') {
    const cx = obs.x + obs.w / 2;
    const by = obs.y + obs.h;
    ctx.save();
    ctx.translate(cx, by);
    // Splayed yellow peel petals
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-8, -14, 0, -14);
    ctx.quadraticCurveTo(8, -14, 16, 0);
    ctx.quadraticCurveTo(6, -3, 0, -6);
    ctx.quadraticCurveTo(-6, -3, -16, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#92400E';
    ctx.fillRect(-2, -18, 4, 5);
    ctx.restore();
  } else {
    const pulse = Math.sin(time * 6) * 2;
    ctx.fillStyle = '#EF4444';
    roundRect(ctx, obs.x, obs.y + pulse, obs.w, obs.h - pulse, 8);
    ctx.fill();
    ctx.strokeStyle = '#FEE2E2';
    ctx.lineWidth = 2.5;
    roundRect(ctx, obs.x + 2, obs.y + 2 + pulse, obs.w - 4, obs.h - 4 - pulse, 6);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 16px "Bricolage Grotesque", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(obs.label || '!', obs.x + obs.w / 2, obs.y + 22 + pulse);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  ctx.save();
  const cx = enemy.x + enemy.w / 2;
  const bottomY = enemy.y + enemy.h;

  if (!enemy.alive) {
    ctx.translate(cx, bottomY);
    ctx.scale(1.45, 0.25);
    ctx.fillStyle = enemy.kind === 'angry_potato' ? '#F59E0B' : '#A855F7';
    ctx.beginPath();
    ctx.arc(0, -18, 19, Math.PI, 0);
    ctx.lineTo(19, 0);
    ctx.lineTo(-19, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (enemy.kind === 'angry_potato') {
    const cy = enemy.y + enemy.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(enemy.rotation || 0);
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Angry eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, -2, 4.5, 0, Math.PI * 2);
    ctx.arc(6, -2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(-6, -2, 2.2, 0, Math.PI * 2);
    ctx.arc(6, -2, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-2, -5);
    ctx.moveTo(10, -8);
    ctx.lineTo(2, -5);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (enemy.kind === 'angry_onion') {
    const cy = enemy.y + enemy.h / 2;
    const bounce = Math.abs(Math.sin(time * 7 + enemy.x * 0.04)) * 4;
    ctx.translate(cx, cy - bounce);
    // Green sprout
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(-4, -17);
    ctx.lineTo(0, -26);
    ctx.lineTo(4, -17);
    ctx.closePath();
    ctx.fill();
    // Onion bulb
    ctx.fillStyle = '#C084FC';
    ctx.strokeStyle = '#7E22CE';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Angry eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, 0, 4.5, 0, Math.PI * 2);
    ctx.arc(6, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(-6, 0, 2.2, 0, Math.PI * 2);
    ctx.arc(6, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-11, -7);
    ctx.lineTo(-2, -3);
    ctx.moveTo(11, -7);
    ctx.lineTo(2, -3);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const squish = 1 + Math.sin(time * 8 + enemy.x * 0.05) * 0.09;
  ctx.translate(cx, bottomY);
  ctx.scale(squish, 2 - squish);

  ctx.fillStyle = enemy.kind === 'chaos_bug' ? '#EC4899' : '#7C3AED';
  ctx.beginPath();
  ctx.arc(0, -16, 18, Math.PI, 0);
  ctx.lineTo(18, 0);
  ctx.lineTo(-18, 0);
  ctx.closePath();
  ctx.fill();

  if (enemy.kind === 'chaos_bug') {
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, -32);
    ctx.lineTo(-10, -40);
    ctx.moveTo(6, -32);
    ctx.lineTo(10, -40);
    ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(-10, -40, 3, 0, Math.PI * 2);
    ctx.arc(10, -40, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const lookDir = enemy.vx >= 0 ? 2 : -2;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-6, -18, 6, 0, Math.PI * 2);
  ctx.arc(6, -18, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1E1B4B';
  ctx.beginPath();
  ctx.arc(-6 + lookDir, -18, 2.7, 0, Math.PI * 2);
  ctx.arc(6 + lookDir, -18, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1E1B4B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-10, -24);
  ctx.lineTo(-2, -21);
  ctx.moveTo(10, -24);
  ctx.lineTo(2, -21);
  ctx.stroke();

  ctx.restore();
}

function drawFlyingCoffee(ctx: CanvasRenderingContext2D, fc: FlyingCoffee, time: number) {
  ctx.save();
  const cx = fc.x + fc.w / 2;
  const cy = fc.y + fc.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(time * 5 + fc.phase) * 0.14);

  const wingFlap = Math.sin(time * 18 + fc.phase) * 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-18, -2 + wingFlap * 0.4, 9, 5, -0.4, 0, Math.PI * 2);
  ctx.ellipse(18, -2 + wingFlap * 0.4, 9, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, -12, -10, 24, 22, 5);
  ctx.fill();
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2.5;
  roundRect(ctx, -12, -10, 24, 22, 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(13, 1, 5, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.fillStyle = '#92400E';
  ctx.fillRect(-10, -2, 20, 8);

  ctx.fillStyle = '#1E1B4B';
  ctx.beginPath();
  ctx.arc(-4, -5, 1.8, 0, Math.PI * 2);
  ctx.arc(4, -5, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -13);
  ctx.quadraticCurveTo(-7, -19, -3, -24);
  ctx.moveTo(4, -13);
  ctx.quadraticCurveTo(7, -19, 3, -24);
  ctx.stroke();

  ctx.restore();
}

function drawFallingEgg(ctx: CanvasRenderingContext2D, egg: FallingEgg) {
  ctx.save();
  ctx.translate(egg.x, egg.y);
  if (egg.splatTimer > 0) {
    // Funny fried-egg splat on ground!
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(0, -1, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Falling egg
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, egg.radius * 0.85, egg.radius * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-3, -4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGiantOnionBoss(ctx: CanvasRenderingContext2D, boss: GiantOnionBoss, time: number) {
  if (boss.invulnTimer > 0 && Math.floor(time * 18) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    drawOnionBody(ctx, boss, time);
    ctx.restore();
  } else {
    drawOnionBody(ctx, boss, time);
  }

  if (boss.taunt && boss.tauntTimer > 0) {
    ctx.save();
    ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(boss.taunt).width;
    const bw = tw + 22;
    const bx = boss.x + boss.w / 2 - bw / 2;
    const by = boss.y - 46;
    ctx.fillStyle = '#FFF1F2';
    roundRect(ctx, bx, by, bw, 28, 12);
    ctx.fill();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#4C1D95';
    ctx.textAlign = 'center';
    ctx.fillText(boss.taunt, bx + bw / 2, by + 19);
    ctx.restore();
  }
}

function drawOnionBody(ctx: CanvasRenderingContext2D, boss: GiantOnionBoss, time: number) {
  ctx.save();
  const cx = boss.x + boss.w / 2;
  const cy = boss.y + boss.h / 2;
  ctx.translate(cx, cy);
  ctx.rotate(boss.rotation);
  ctx.scale(boss.squashX, boss.squashY);

  // Enraged glow when low HP
  if (boss.hp <= 2) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 56 + Math.sin(time * 10) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.moveTo(-12, -38);
  ctx.quadraticCurveTo(-18, -62, -6, -64);
  ctx.quadraticCurveTo(0, -52, 0, -42);
  ctx.quadraticCurveTo(4, -64, 14, -60);
  ctx.quadraticCurveTo(18, -46, 10, -38);
  ctx.closePath();
  ctx.fill();

  const grad = ctx.createRadialGradient(-12, -12, 8, 0, 4, 52);
  grad.addColorStop(0, '#F472B6');
  grad.addColorStop(0.65, '#A855F7');
  grad.addColorStop(1, '#6B21A8');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.bezierCurveTo(48, -32, 54, 18, 34, 42);
  ctx.bezierCurveTo(18, 52, -18, 52, -34, 42);
  ctx.bezierCurveTo(-54, 18, -48, -32, 0, -44);
  ctx.fill();

  ctx.strokeStyle = '#FCE7F3';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.quadraticCurveTo(-22, 5, -12, 46);
  ctx.moveTo(0, -42);
  ctx.quadraticCurveTo(22, 5, 12, 46);
  ctx.stroke();

  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(-16, -42);
  ctx.lineTo(-18, -56);
  ctx.lineTo(-7, -48);
  ctx.lineTo(0, -60);
  ctx.lineTo(7, -48);
  ctx.lineTo(18, -56);
  ctx.lineTo(16, -42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-14, -4, 10, 0, Math.PI * 2);
  ctx.arc(14, -4, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1E1B4B';
  ctx.beginPath();
  ctx.arc(-14, -3, 4.5, 0, Math.PI * 2);
  ctx.arc(14, -3, 4.5, 0, Math.PI * 2);
  ctx.fill();

  if (boss.phase === 'TEAR_BARRAGE') {
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-17, 5, 5, 14 + Math.sin(time * 20) * 4);
    ctx.fillRect(12, 5, 5, 14 + Math.cos(time * 20) * 4);
  }

  ctx.strokeStyle = '#1E1B4B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-25, -16);
  ctx.lineTo(-6, -10);
  ctx.moveTo(25, -16);
  ctx.lineTo(6, -10);
  ctx.stroke();

  ctx.fillStyle = '#831843';
  ctx.beginPath();
  ctx.ellipse(0, 20, 14, boss.phase === 'ROLL_WINDUP' ? 10 : 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBossProjectile(ctx: CanvasRenderingContext2D, proj: BossProjectile) {
  ctx.save();
  ctx.translate(proj.x, proj.y);
  ctx.rotate(proj.rotation);

  if (proj.kind === 'tear') {
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, -proj.radius * 1.3);
    ctx.quadraticCurveTo(proj.radius * 1.1, 0, 0, proj.radius);
    ctx.quadraticCurveTo(-proj.radius * 1.1, 0, 0, -proj.radius * 1.3);
    ctx.fill();
    ctx.fillStyle = '#E0F2FE';
    ctx.beginPath();
    ctx.arc(-3, 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius - 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible, time: number) {
  const bob = Math.sin(time * 4 + item.bobOffset) * 5;
  const cx = item.x;
  const cy = item.y + bob;

  ctx.save();
  ctx.translate(cx, cy);

  // Soft golden-white glow behind all good food/collectibles!
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  if (item.kind === 'coin') {
    const scaleX = 0.65 + Math.abs(Math.cos(time * 4 + item.bobOffset)) * 0.35;
    ctx.scale(scaleX, 1);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#B45309';
    ctx.fillRect(-2, -6, 4, 12);
  } else if (item.kind === 'star') {
    ctx.rotate(Math.sin(time * 2.5 + item.bobOffset) * 0.18);
    drawStarShape(ctx, 0, 0, 5, 16, 7.5, '#FACC15', '#F59E0B');
  } else if (item.kind === 'heart') {
    const pulse = 1 + Math.sin(time * 5 + item.bobOffset) * 0.1;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-18, 0, -16, -15, 0, -5);
    ctx.bezierCurveTo(16, -15, 18, 0, 0, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'flag') {
    const wave = Math.sin(time * 5 + item.bobOffset) * 2.5;
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(-16, -18, 3.5, 36);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(-14.2, -19, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ED2024';
    ctx.fillRect(-12, -16 + wave * 0.2, 30, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-12, -9 + wave * 0.2, 30, 7);
    ctx.fillStyle = '#278E43';
    ctx.fillRect(-12, -2 + wave * 0.2, 30, 7);

    drawStarShape(ctx, 3, -5.5 + wave * 0.2, 12, 4.8, 2.5, '#FEBD11', '#FEBD11');
  } else if (item.kind === 'apple') {
    // Shiny red apple
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(-4, 2, 10, 0, Math.PI * 2);
    ctx.arc(4, 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FCA5A5';
    ctx.beginPath();
    ctx.arc(-6, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(2, -14);
    ctx.stroke();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.ellipse(6, -11, 5, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.kind === 'strawberry') {
    // Plump pink-red strawberry
    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.bezierCurveTo(-15, 4, -14, -10, 0, -9);
    ctx.bezierCurveTo(14, -10, 15, 4, 0, 14);
    ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.moveTo(-8, -9);
    ctx.lineTo(0, -14);
    ctx.lineTo(8, -9);
    ctx.lineTo(0, -6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    [[-4, -2], [4, -2], [0, 3], [-3, 7], [3, 7]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.3, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (item.kind === 'banana') {
    // Bright curved banana
    ctx.rotate(-0.25);
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-13, -6);
    ctx.quadraticCurveTo(0, 14, 14, -6);
    ctx.quadraticCurveTo(2, 4, -13, -6);
    ctx.fill();
    ctx.stroke();
  } else if (item.kind === 'sandwich') {
    // Cute layered sandwich
    ctx.fillStyle = '#F59E0B';
    roundRect(ctx, -14, -10, 28, 7, 4);
    ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(-13, -3, 26, 4);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-12, 1, 24, 3);
    ctx.fillStyle = '#FBBF24';
    roundRect(ctx, -14, 4, 28, 7, 4);
    ctx.fill();
  } else if (item.kind === 'power_coffee') {
    // Friendly golden glowing super-jump coffee cup
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 19 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -10, -8, 20, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    roundRect(ctx, -10, -8, 20, 18, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, 1, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-8, -2, 16, 6);
  }

  ctx.restore();
}

function drawGoalPortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  open: boolean,
  theme: LevelConfig['theme']
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = open ? '#A855F7' : '#94A3B8';
  roundRect(ctx, -34, -84, 68, 84, 34);
  ctx.fill();

  ctx.fillStyle = open ? '#3B82F6' : '#CBD5E1';
  roundRect(ctx, -24, -74, 48, 74, 24);
  ctx.fill();

  if (open) {
    ctx.fillStyle = `rgba(244, 114, 182, ${0.45 + Math.sin(time * 6) * 0.25})`;
    roundRect(ctx, -18, -68, 36, 68, 18);
    ctx.fill();
  }

  if (theme === 'kurdistan') {
    ctx.fillStyle = '#ED2024';
    ctx.fillRect(-16, -110, 32, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-16, -103, 32, 7);
    ctx.fillStyle = '#278E43';
    ctx.fillRect(-16, -96, 32, 7);
    drawStarShape(ctx, 0, -99.5, 12, 5, 2.5, '#FEBD11', '#FEBD11');
  } else {
    drawStarShape(ctx, 0, -96, 5, 13, 6, open ? '#FACC15' : '#94A3B8', '#FFFFFF');
  }

  ctx.restore();
}

function drawBushra(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  time: number,
  cameraX: number
) {
  if (player.invulnTimer > 0 && Math.floor(time * 16) % 2 === 0) {
    return;
  }

  ctx.save();
  const cx = player.x + player.w / 2;
  const bottomY = player.y + player.h;

  // Power-up aura rings
  if (player.speedBoostTimer > 0 || player.superJumpTimer > 0) {
    ctx.strokeStyle = player.superJumpTimer > 0 ? '#A855F7' : '#FACC15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, bottomY - 24, 28 + Math.sin(time * 12) * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.translate(cx, bottomY);
  if (player.emotion === 'slipping') {
    ctx.translate(0, -24);
    ctx.rotate(time * 16);
    ctx.translate(0, 24);
  }
  ctx.scale(player.facing * player.squashX, player.squashY);

  const legSwing =
    player.onGround && Math.abs(player.vx) > 20 ? Math.sin(player.walkCycle * 12) * 6 : 0;

  ctx.fillStyle = '#1E1B4B';
  roundRect(ctx, -9 + legSwing, -10, 8, 10, 4);
  ctx.fill();
  roundRect(ctx, 2 - legSwing, -10, 8, 10, 4);
  ctx.fill();

  ctx.fillStyle = '#EC4899';
  roundRect(ctx, -13, -30, 26, 22, 9);
  ctx.fill();
  ctx.fillStyle = '#60A5FA';
  ctx.fillRect(-10, -18, 20, 4);

  ctx.fillStyle = '#31102F';
  ctx.beginPath();
  ctx.arc(-8, -36, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FDE2C8';
  ctx.beginPath();
  ctx.arc(0, -37, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#31102F';
  ctx.beginPath();
  ctx.arc(0, -41, 13, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#A855F7';
  roundRect(ctx, -11, -49, 22, 5, 3);
  ctx.fill();

  ctx.fillStyle = '#FB7185';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(5, -33, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const emotion = player.emotion;
  if (emotion === 'crying') {
    // Sad crying eyes + blue streaming teardrops!
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(5, -37, 3, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(4, -35, 3.5, 10 + Math.sin(time * 24) * 3);
    ctx.strokeStyle = '#9D174D';
    ctx.beginPath();
    ctx.arc(4, -29, 3, Math.PI, 0);
    ctx.stroke();
  } else if (emotion === 'dizzy' || emotion === 'slipping') {
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(2, -41);
    ctx.lineTo(8, -35);
    ctx.moveTo(8, -41);
    ctx.lineTo(2, -35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, -31, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (emotion === 'joy') {
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(5, -37, 3.5, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#BE123C';
    ctx.beginPath();
    ctx.arc(4, -33, 4.2, 0, Math.PI);
    ctx.fill();
  } else if (emotion === 'excited') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(5, -38, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(6, -38, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9D174D';
    ctx.beginPath();
    ctx.ellipse(4.5, -31.5, 2.4, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (emotion === 'worried') {
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(5, -38, 2.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(1, -31);
    ctx.quadraticCurveTo(4, -34, 8, -31);
    ctx.stroke();
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-6, -42, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const isBlinking = Math.sin(time * 1.9) > 0.96;
    ctx.fillStyle = '#1E1B4B';
    if (isBlinking || emotion === 'hero') {
      ctx.fillRect(2.5, -38.5, 5.5, 2.2);
    } else {
      ctx.beginPath();
      ctx.arc(5, -38, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(6, -39, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(4, -33, 3.8, 0.1, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();

  if (player.speechText && player.speechTimer > 0) {
    ctx.save();
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(player.speechText).width;
    const bw = textW + 22;
    const bx = Math.max(cameraX + 10, Math.min(cameraX + VIEW_WIDTH - bw - 10, cx - bw / 2));
    const by = Math.max(12, player.y - 38);
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    roundRect(ctx, bx, by, bw, 27, 10);
    ctx.fill();
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#1E1B4B';
    ctx.textAlign = 'center';
    ctx.fillText(player.speechText, bx + bw / 2, by + 18);
    ctx.restore();
  }
}

function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fill: string,
  stroke: string
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
