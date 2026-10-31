/**
 * ENGINE.JS — Moteur de jeu 60 FPS (Phase 4) :
 * 6 Engins jouables, 6 Biomes, 30 Automates & Boss à 3 phases (dont Cœur-Zéro, Boss Final),
 * 84 Modules, Synergies de Famille (2/4/6), 52 Succès et Vraie Fin (Les 3 Clés d'Horlogerie).
 */
window.GameEngine = (function () {
  const CFG = window.GAME_CONFIG;

  let canvas, ctx;
  let viewWidth = window.innerWidth;
  let viewHeight = window.innerHeight;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  let isRunning = false;
  let isPaused = false;
  let godMode = false;
  let lastFrameTime = 0;
  let elapsedSec = 0;

  // Game Feel
  let hitStopTimer = 0;
  let shakeMagnitude = 0;
  let screenFlashAlpha = 0;

  // Contrôles Tactiles
  const touchInput = {
    active: false,
    id: null,
    originX: 0,
    originY: 0,
    currX: 0,
    currY: 0,
    dx: 0,
    dy: 0,
    dist: 0,
    maxRadius: 56
  };

  const keys = {};

  let player = null;
  let runState = null;

  // Listes d'entités actives
  let enemies = [];
  let spawnQueue = [];
  let projectiles = [];
  let deployables = [];
  let fallingWeights = [];
  let hazards = [];
  let pickups = [];
  let steamClouds = [];
  let shockwaves = [];
  let lightningArcs = [];
  let particles = [];
  let floatingTexts = [];

  function init() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: false });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isRunning && !isPaused) {
        setPaused(true);
        const modalPause = document.getElementById('modal-pause');
        if (modalPause) modalPause.classList.remove('hidden');
      }
    });

    setupInputListeners();
    requestAnimationFrame(mainLoop);
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, CFG.MAX_DPR);
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;

    canvas.width = Math.floor(viewWidth * dpr);
    canvas.height = Math.floor(viewHeight * dpr);
    canvas.style.width = viewWidth + 'px';
    canvas.style.height = viewHeight + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const topHudMargin = 98;
    const bottomMargin = 28;
    const availW = viewWidth - 16;
    const availH = viewHeight - topHudMargin - bottomMargin;

    scale = Math.min(availW / CFG.ARENA_WIDTH, availH / CFG.ARENA_HEIGHT);
    offsetX = (viewWidth - CFG.ARENA_WIDTH * scale) / 2;
    offsetY = topHudMargin + (availH - CFG.ARENA_HEIGHT * scale) / 2;
  }

  function setupInputListeners() {
    canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        window.SoundFX.unlockiOSAudio();
        if (!isRunning || isPaused) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (!touchInput.active) {
            touchInput.active = true;
            touchInput.id = t.identifier;
            touchInput.originX = t.clientX;
            touchInput.originY = t.clientY;
            touchInput.currX = t.clientX;
            touchInput.currY = t.clientY;
            touchInput.dx = 0;
            touchInput.dy = 0;
            touchInput.dist = 0;
            break;
          }
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        if (!touchInput.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === touchInput.id) {
            updateJoystickVector(t.clientX, t.clientY);
            break;
          }
        }
      },
      { passive: false }
    );

    const handleTouchEnd = (e) => {
      e.preventDefault();
      if (!touchInput.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchInput.id) {
          releaseJoystickAndTriggerImpulse();
          break;
        }
      }
    };

    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    canvas.addEventListener('mousedown', (e) => {
      window.SoundFX.unlockiOSAudio();
      if (!isRunning || isPaused) return;
      touchInput.active = true;
      touchInput.id = 'mouse';
      touchInput.originX = e.clientX;
      touchInput.originY = e.clientY;
      touchInput.currX = e.clientX;
      touchInput.currY = e.clientY;
      touchInput.dx = 0;
      touchInput.dy = 0;
      touchInput.dist = 0;
    });

    window.addEventListener('mousemove', (e) => {
      if (touchInput.active && touchInput.id === 'mouse') {
        updateJoystickVector(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (touchInput.active && touchInput.id === 'mouse') {
        releaseJoystickAndTriggerImpulse();
      }
    });

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'Space' && isRunning && !isPaused) {
        tryTriggerImpulse();
      }
    });
    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });
  }

  function updateJoystickVector(clientX, clientY) {
    touchInput.currX = clientX;
    touchInput.currY = clientY;
    const rawDx = clientX - touchInput.originX;
    const rawDy = clientY - touchInput.originY;
    const len = Math.hypot(rawDx, rawDy);

    if (len > touchInput.maxRadius * 1.35) {
      const pull = len - touchInput.maxRadius * 1.35;
      touchInput.originX += (rawDx / len) * pull;
      touchInput.originY += (rawDy / len) * pull;
    }

    const clampedLen = Math.min(len, touchInput.maxRadius);
    touchInput.dist = clampedLen / touchInput.maxRadius;
    if (len > 4) {
      touchInput.dx = rawDx / len;
      touchInput.dy = rawDy / len;
    } else {
      touchInput.dx = 0;
      touchInput.dy = 0;
      touchInput.dist = 0;
    }
  }

  function releaseJoystickAndTriggerImpulse() {
    const lastDx = touchInput.dx;
    const lastDy = touchInput.dy;
    touchInput.active = false;
    touchInput.id = null;
    touchInput.dx = 0;
    touchInput.dy = 0;
    touchInput.dist = 0;

    if (isRunning && !isPaused) {
      tryTriggerImpulse(lastDx, lastDy);
    }
  }

  function notifyNewAchievements() {
    const unlocked = window.SaveManager.checkAchievements();
    if (unlocked && unlocked.length > 0) {
      const first = unlocked[0];
      const title = first.name || first.title || 'Succès';
      const extra = unlocked.length > 1 ? ` (+${unlocked.length - 1} autre)` : '';
      window.SoundFX.play('synergy_unlock');
      window.UI.showToast(
        `🏆 SUCCÈS : ${title}${extra} (+${first.rewardCogs || 0}⚙️ ${
          first.rewardCrystals ? `+${first.rewardCrystals}💎` : ''
        })`,
        4000
      );
    }
  }

  // --- INITIALISATION D'UNE NOUVELLE RUN ---
  function startNewRun(forcedBiomeId) {
    if (!canvas || !ctx) {
      init();
    }
    resizeCanvas();

    const save = window.SaveManager.getData();
    const upg = save.permanentUpgrades || {};
    const heroDef =
      window.GAME_CONTENT.heroes[save.selectedHero] || window.GAME_CONTENT.heroes.toupillon;
    const startBiome = forcedBiomeId || save.selectedBiome || 'horlogerie';

    const bonusHp = (upg.hullPlating || 0) * 15;
    const dmgMult = 1 + (upg.steamTurbine || 0) * 0.10;
    const startPressure = (upg.prePressurized || 0) * 12;
    const pressureGainMult = 1 + (upg.prePressurized || 0) * 0.08;
    const magnetMult = 1 + (upg.magnetCoil || 0) * 0.25;
    const xpMult = 1 + (upg.magnetCoil || 0) * 0.10;
    const roomHealBonus = (upg.emergencyKit || 0) * 6;
    const impulseDmgMult = 1 + (upg.impulseGears || 0) * 0.15;
    const impulseCdMult = Math.max(0.5, 1 - (upg.impulseGears || 0) * 0.08);
    const critBonus =
      (upg.opticCalibrator || 0) * 0.04 + (heroDef.baseStats.innateCritBonus || 0);

    const stats = {
      ...heroDef.baseStats,
      maxHp: heroDef.baseStats.maxHp + bonusHp,
      damage: heroDef.baseStats.damage * dmgMult,
      impulseDamage: heroDef.baseStats.impulseDamage * dmgMult * impulseDmgMult,
      impulseCooldownMs: CFG.PLAYER.IMPULSE_COOLDOWN_MS * impulseCdMult,
      startRoomPressure: startPressure,
      chainLightningChance: heroDef.baseStats.innateChainChance || 0,
      chainLightningDmg: 15 * dmgMult,
      impulseLightningBolts: 0,
      impulseSteamClouds: 0,
      orbitalCogs: 0,
      pressureRateMult: pressureGainMult,
      knockback: 18,
      magnetRadius: CFG.PLAYER.MAGNET_BASE_RADIUS * magnetMult,
      xpGainMult: xpMult,
      healOnLevelUp: 0,
      healPerRoom: roomHealBonus,
      healOnGoldImpulse: 0,
      highPressureDmgBonus: 0,
      bossDamageMult: 1,
      impulseShockwave: false,
      impulseSpeedMult: CFG.PLAYER.IMPULSE_SPEED_MULT,
      goldImpulseNova: 0,
      flatArmor: 0,
      revengeNova: false,
      hazardResist: false,
      ignoreSlow: false,
      critChance: 0.05 + critBonus,
      critDamageMult: 2.0,
      regenPer4Sec: 0
    };

    player = {
      heroId: heroDef.id,
      weaponType: heroDef.weaponType,
      impulseType: heroDef.impulseType,
      x: CFG.ARENA_WIDTH / 2,
      y: CFG.ARENA_HEIGHT * 0.72,
      vx: 0,
      vy: 0,
      radius: stats.radius,
      hp: stats.maxHp,
      stats,
      aimAngle: -Math.PI / 2,
      moveAngle: -Math.PI / 2,
      moveDirX: 0,
      moveDirY: -1,
      pressure: stats.startRoomPressure,
      fireCooldown: 0,
      invulnTimer: 0,
      flashTimer: 0,
      impulseTimer: 0,
      impulseCooldown: 0,
      impulseGoldActive: false,
      steamDropTimer: 0,
      regenTimer: 4.0,
      scaleX: 1,
      scaleY: 1
    };

    runState = {
      biomeId: startBiome,
      roomIndex: 1,
      roomType: 'combat_module',
      waveIndex: 0,
      totalWaves: 2,
      roomCleared: false,
      transitionPending: false,
      ambushExtraModule: false,
      tookDamageInBossRoom: false,
      level: 1,
      xp: 0,
      xpToNext: CFG.ECONOMY.BASE_XP_TO_LEVEL,
      boltsCurrency: 10,
      equippedModules: [],
      familyCounts: {},
      kills: 0,
      impulsesUsed: 0,
      crystalsEarnedThisRun: 0,
      activeBoss: null,
      isFirstRun: save.stats.runsPlayed === 0
    };

    enemies = [];
    spawnQueue = [];
    projectiles = [];
    deployables = [];
    fallingWeights = [];
    hazards = [];
    pickups = [];
    steamClouds = [];
    shockwaves = [];
    lightningArcs = [];
    particles = [];
    floatingTexts = [];

    isRunning = true;
    isPaused = false;
    window.UI.hideTitleScreen();

    setupRoom(1, 'combat_module');

    if (!save.tutorialsSeen.moveAndShoot) {
      save.tutorialsSeen.moveAndShoot = true;
      window.SaveManager.save();
      window.UI.showToast(
        '👆 Glissez le pouce n\'importe où pour piloter. Tir automatique !',
        4200
      );
    }
  }

  // --- CONFIGURATION D'UNE SALLE ---
  function setupRoom(roomNumber, roomType) {
    runState.roomIndex = roomNumber;
    runState.roomType = roomType;
    runState.roomCleared = false;
    runState.transitionPending = false;
    runState.ambushExtraModule = false;
    runState.tookDamageInBossRoom = false;
    runState.activeBoss = null;

    player.x = CFG.ARENA_WIDTH / 2;
    player.y = CFG.ARENA_HEIGHT - 95;
    player.scaleX = 1.25;
    player.scaleY = 0.8;
    player.pressure = Math.max(player.pressure, player.stats.startRoomPressure || 0);

    enemies = [];
    spawnQueue = [];
    projectiles = [];
    deployables = [];
    fallingWeights = [];
    hazards = [];
    steamClouds = [];
    shockwaves = [];
    lightningArcs = [];

    generateRoomHazards(roomNumber, roomType);

    if (roomType === 'repair_station') {
      runState.totalWaves = 0;
      runState.waveIndex = 0;
      setTimeout(() => {
        if (!isRunning) return;
        window.UI.showRepairStation(player, (choice, amount) => {
          const save = window.SaveManager.getData();
          save.stats.eventsCompleted = (save.stats.eventsCompleted || 0) + 1;
          window.SaveManager.save();
          notifyNewAchievements();

          if (choice === 'heal') {
            player.hp = Math.min(player.stats.maxHp, player.hp + amount);
            spawnFloatingText(player.x, player.y - 20, `+${amount} PV`, '#2ecc71', true);
            spawnBurstParticles(player.x, player.y, '#2ecc71', 16);
            completeCurrentRoom();
          } else {
            player.hp = Math.max(1, player.hp - amount);
            player.stats.damage *= 1.22;
            spawnFloatingText(player.x, player.y - 20, 'SURCALIBRAGE +22% !', '#ffd32a', true);
            spawnBurstParticles(player.x, player.y, '#ffd32a', 20);
            triggerModuleSelection(() => {
              completeCurrentRoom();
            });
          }
        });
      }, 400);
    } else if (roomType === 'vending_machine') {
      runState.totalWaves = 0;
      runState.waveIndex = 0;
      setTimeout(() => {
        if (!isRunning) return;
        window.UI.showVendingMachine(player, runState, (action, costOrGain, healAmt) => {
          const save = window.SaveManager.getData();
          save.stats.vendingPurchases = (save.stats.vendingPurchases || 0) + 1;
          window.SaveManager.save();
          notifyNewAchievements();

          if (action === 'buy_module') {
            runState.boltsCurrency -= costOrGain;
            triggerModuleSelection(() => completeCurrentRoom());
          } else if (action === 'buy_oil') {
            runState.boltsCurrency -= costOrGain;
            player.hp = Math.min(player.stats.maxHp, player.hp + healAmt);
            player.stats.moveSpeed *= 1.10;
            spawnFloatingText(
              player.x,
              player.y - 20,
              `+${healAmt} PV & +10% VITESSE`,
              '#2ecc71',
              true
            );
            completeCurrentRoom();
          } else {
            runState.boltsCurrency += costOrGain;
            spawnFloatingText(player.x, player.y - 20, `+${costOrGain} BOULONS 🔩`, '#f39c12', true);
            completeCurrentRoom();
          }
        });
      }, 400);
    } else if (roomType === 'trapped_chest') {
      runState.totalWaves = 0;
      runState.waveIndex = 0;
      setTimeout(() => {
        if (!isRunning) return;
        window.UI.showTrappedChestModal((choice) => {
          const save = window.SaveManager.getData();
          if (choice === 'trigger_ambush') {
            save.stats.trappedChestsOpened = (save.stats.trappedChestsOpened || 0) + 1;
            window.SaveManager.save();
            notifyNewAchievements();

            runState.roomType = 'combat_module';
            runState.ambushExtraModule = true;
            runState.totalWaves = 2;
            runState.waveIndex = 1;
            spawnWave(roomNumber, null, true);
            window.UI.showToast('⚡ EMBUSCADE : Battez-les pour gagner 2 Modules !', 3400);
          } else {
            save.currencies.goldenCogs += 15;
            window.SaveManager.save();
            spawnFloatingText(player.x, player.y - 20, '+15 ÉCROUS DORÉS ⚙️', '#ffd32a', true);
            completeCurrentRoom();
          }
        });
      }, 400);
    } else if (roomNumber === CFG.MIDBOSS_ROOM || roomType === 'midboss_room') {
      runState.totalWaves = 1;
      runState.waveIndex = 1;
      window.SoundFX.play('boss_alert');
      spawnWave(roomNumber, 'midboss', false);
      const bDef = window.GAME_CONTENT.biomes[runState.biomeId];
      const midDef = window.GAME_CONTENT.enemies[bDef.midBossId];
      window.UI.showToast(`🔨 SOUS-BOSS : ${midDef.name} !`, 3600);
    } else if (roomNumber >= CFG.ROOMS_PER_BIOME || roomType === 'warden_boss') {
      runState.totalWaves = 1;
      runState.waveIndex = 1;
      window.SoundFX.play('boss_alert');
      spawnWave(roomNumber, 'finalboss', false);
      const bDef = window.GAME_CONTENT.biomes[runState.biomeId];
      const bossDef = window.GAME_CONTENT.enemies[bDef.bossId];
      window.UI.showToast(`🚨 BOSS DU SECTEUR : ${bossDef.name} !`, 4200);
    } else {
      runState.totalWaves = roomNumber <= 2 ? 2 : 3;
      runState.waveIndex = 1;
      spawnWave(
        roomNumber,
        null,
        roomType === 'elite_challenge' && runState.waveIndex === runState.totalWaves
      );
    }

    window.UI.updateHUD(player, runState);
  }

  function generateRoomHazards(roomNumber, roomType) {
    if (
      roomType === 'repair_station' ||
      roomType === 'vending_machine' ||
      roomType === 'trapped_chest' ||
      roomNumber === CFG.MIDBOSS_ROOM ||
      roomNumber >= CFG.ROOMS_PER_BIOME
    ) {
      return;
    }

    const margin = CFG.WALL_THICKNESS + 58;
    const w = CFG.ARENA_WIDTH;
    const h = CFG.ARENA_HEIGHT;
    const biomeId = runState.biomeId;

    if (biomeId === 'horlogerie') {
      if (roomNumber % 2 === 0) {
        hazards.push(
          { type: 'spinning_cog', x: margin + 25, y: h * 0.36, radius: 26, dir: 1 },
          { type: 'spinning_cog', x: w - margin - 25, y: h * 0.36, radius: 26, dir: -1 }
        );
      }
      if (roomNumber >= 3) {
        hazards.push({
          type: 'steam_vent',
          x: w / 2,
          y: h * 0.48,
          radius: 18,
          dmgRadius: 52,
          timer: 0,
          cycleDuration: 4.2,
          state: 'idle'
        });
      }
    } else if (biomeId === 'serres') {
      hazards.push({
        type: 'laser_prism',
        x: w / 2,
        y: h * 0.42,
        radius: 16,
        beamLength: 105,
        dir: roomNumber % 2 === 0 ? 1 : -1
      });
      if (roomNumber >= 2) {
        hazards.push(
          { type: 'resin_tile', x: margin + 35, y: h * 0.56, radius: 38 },
          { type: 'resin_tile', x: w - margin - 35, y: h * 0.32, radius: 38 }
        );
      }
    } else if (biomeId === 'fonderie') {
      hazards.push(
        { type: 'lava_pool', x: margin + 35, y: h * 0.38, radius: 34 },
        { type: 'lava_pool', x: w - margin - 35, y: h * 0.38, radius: 34 }
      );
      if (roomNumber % 2 === 1) {
        hazards.push({
          type: 'steam_vent',
          x: w / 2,
          y: h * 0.52,
          radius: 18,
          dmgRadius: 54,
          timer: 0.5,
          cycleDuration: 3.8,
          state: 'idle'
        });
      }
    } else if (biomeId === 'archives') {
      hazards.push(
        {
          type: 'tesla_coil',
          x: margin + 35,
          y: h * 0.38,
          radius: 18,
          dmgRadius: 56,
          timer: 0,
          cycleDuration: 3.6,
          state: 'idle'
        },
        {
          type: 'tesla_coil',
          x: w - margin - 35,
          y: h * 0.52,
          radius: 18,
          dmgRadius: 56,
          timer: 1.8,
          cycleDuration: 3.6,
          state: 'idle'
        }
      );
    } else if (biomeId === 'canaux') {
      hazards.push(
        { type: 'spinning_cog', x: w / 2, y: h * 0.38, radius: 28, dir: 1 },
        { type: 'resin_tile', x: margin + 35, y: h * 0.54, radius: 38 },
        { type: 'resin_tile', x: w - margin - 35, y: h * 0.54, radius: 38 }
      );
    } else if (biomeId === 'balancier') {
      hazards.push(
        { type: 'spinning_cog', x: margin + 28, y: h * 0.35, radius: 26, dir: 1 },
        { type: 'spinning_cog', x: w - margin - 28, y: h * 0.35, radius: 26, dir: -1 },
        {
          type: 'laser_prism',
          x: w / 2,
          y: h * 0.48,
          radius: 16,
          beamLength: 110,
          dir: roomNumber % 2 === 0 ? 1 : -1
        }
      );
    }
  }

  function spawnWave(roomNumber, bossMode, includeElite) {
    const biome = window.GAME_CONTENT.biomes[runState.biomeId];
    const margin = CFG.WALL_THICKNESS + 38;

    if (bossMode === 'midboss') {
      spawnQueue.push({
        enemyId: biome.midBossId,
        x: CFG.ARENA_WIDTH / 2,
        y: CFG.ARENA_HEIGHT * 0.28,
        timer: CFG.ENEMY_SPAWN_WARN_MS / 1000,
        isElite: false
      });
      return;
    }

    if (bossMode === 'finalboss') {
      const centerBosses = ['orchidee_prismatique', 'astrolabe_quantique', 'coeur_zero'];
      spawnQueue.push({
        enemyId: biome.bossId,
        x: CFG.ARENA_WIDTH / 2,
        y: centerBosses.includes(biome.bossId)
          ? CFG.ARENA_HEIGHT * 0.30
          : CFG.WALL_THICKNESS + 66,
        timer: CFG.ENEMY_SPAWN_WARN_MS / 1000,
        isElite: false
      });
      return;
    }

    const baseCount = 3 + Math.min(4, Math.floor(roomNumber * 0.65));
    for (let i = 0; i < baseCount; i++) {
      const poolMax = Math.min(biome.enemyPool.length, 1 + Math.ceil(roomNumber / 2));
      const enemyId = biome.enemyPool[Math.floor(Math.random() * poolMax)];

      let sx, sy;
      let tries = 0;
      do {
        sx = margin + Math.random() * (CFG.ARENA_WIDTH - margin * 2);
        sy = margin + Math.random() * (CFG.ARENA_HEIGHT * 0.65);
        tries++;
      } while (Math.hypot(sx - player.x, sy - player.y) < 110 && tries < 10);

      spawnQueue.push({
        enemyId,
        x: sx,
        y: sy,
        timer: (CFG.ENEMY_SPAWN_WARN_MS + i * 110) / 1000,
        isElite: includeElite && i === 0
      });
    }
  }

  function materializeEnemy(spawnItem) {
    const def = window.GAME_CONTENT.enemies[spawnItem.enemyId];
    if (!def) return;

    const biomeOrder = window.GAME_CONTENT.biomes[runState.biomeId].order - 1;
    const biomeHpMult = CFG.DIFFICULTY.BIOME_HP_MULT[biomeOrder] || 1;
    const biomeDmgMult = CFG.DIFFICULTY.BIOME_DMG_MULT[biomeOrder] || 1;

    const roomScaleHp = def.isBoss
      ? 1
      : (1 + (runState.roomIndex - 1) * CFG.DIFFICULTY.HP_SCALE_PER_ROOM) * biomeHpMult;
    const roomScaleDmg = def.isBoss
      ? 1
      : (1 + (runState.roomIndex - 1) * CFG.DIFFICULTY.DMG_SCALE_PER_ROOM) * biomeDmgMult;
    const eliteHpMult = spawnItem.isElite ? CFG.DIFFICULTY.ELITE_HP_MULT : 1;
    const eliteSizeMult = spawnItem.isElite ? CFG.DIFFICULTY.ELITE_SIZE_MULT : 1;

    const maxHp = Math.round(def.hp * roomScaleHp * eliteHpMult);
    const angle = Math.random() * Math.PI * 2;

    const enemy = {
      id: def.id,
      type: def.id,
      name: spawnItem.isElite ? `${def.name} [ÉLITE]` : def.name,
      behavior: def.behavior,
      isBoss: !!def.isBoss,
      isMidBoss: !!def.isMidBoss,
      isElite: !!spawnItem.isElite,
      bossPhase: def.isBoss && !def.isMidBoss ? 1 : undefined,
      railDir: 1,
      attackCycle: 0,
      ringingTimer: 0,
      x: spawnItem.x,
      y: spawnItem.y,
      vx: Math.cos(angle) * def.speed,
      vy: Math.sin(angle) * def.speed,
      hp: maxHp,
      maxHp,
      damage: Math.round(def.damage * roomScaleDmg),
      speed: def.speed,
      radius: Math.round(def.radius * eliteSizeMult),
      xpBolts: def.xpBolts * (spawnItem.isElite ? CFG.DIFFICULTY.ELITE_BOLT_MULT : 1),
      colors: def.colors,
      state: 'idle',
      stateTimer: 0.9,
      angle: 0,
      aimAngle: Math.PI / 2,
      flashTimer: 0,
      scaleX: 1.35,
      scaleY: 0.65,
      seed: Math.random() * 10
    };

    enemies.push(enemy);
    if (enemy.isBoss) {
      runState.activeBoss = enemy;
    }

    const save = window.SaveManager.getData();
    if (!save.discoveredEnemies.includes(def.id)) {
      save.discoveredEnemies.push(def.id);
      window.SaveManager.save();
      notifyNewAchievements();
    }

    spawnBurstParticles(enemy.x, enemy.y, def.colors.core, 8);
  }

  // --- MÉCANIQUE D'IMPULSION SELON LES 6 ENGINS ---
  function tryTriggerImpulse(dirX, dirY) {
    if (!player || player.impulseCooldown > 0) return false;
    if (player.pressure < CFG.PLAYER.PRESSURE_MIN_TO_TRIGGER) return false;

    const isGold = player.pressure >= CFG.PLAYER.PRESSURE_GOLD_MIN;
    player.pressure = 0;
    player.impulseTimer = CFG.PLAYER.IMPULSE_DURATION_MS / 1000;
    player.impulseCooldown =
      (player.stats.impulseCooldownMs || CFG.PLAYER.IMPULSE_COOLDOWN_MS) / 1000;
    player.invulnTimer = Math.max(player.invulnTimer, player.impulseTimer + 0.08);
    player.impulseGoldActive = isGold;

    window.SoundFX.play(isGold ? 'impulse_gold' : 'impulse');

    const useDx = dirX && Math.hypot(dirX, dirY) > 0.1 ? dirX : player.moveDirX;
    const useDy = dirY && Math.hypot(dirX, dirY) > 0.1 ? dirY : player.moveDirY;
    const len = Math.hypot(useDx, useDy) || 1;
    player.moveDirX = useDx / len;
    player.moveDirY = useDy / len;

    player.scaleX = 1.35;
    player.scaleY = 0.72;
    shakeMagnitude = Math.max(shakeMagnitude, isGold ? 7 : 4);

    runState.impulsesUsed++;
    const save = window.SaveManager.getData();
    save.stats.impulsesTriggered++;
    if (isGold) {
      save.stats.goldImpulsesTriggered = (save.stats.goldImpulsesTriggered || 0) + 1;
    }

    if (isGold && player.stats.healOnGoldImpulse > 0) {
      player.hp = Math.min(player.stats.maxHp, player.hp + player.stats.healOnGoldImpulse);
    }

    if (player.impulseType === 'deploy_prism') {
      deployables.push({
        type: 'prism_turret',
        x: player.x,
        y: player.y,
        life: 7.0,
        fireCd: 0.25,
        isGold
      });
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '🔮 PRISME SURCHARGÉ !' : '🔮 PRISME DÉPLOYÉ !',
        isGold ? '#ffd32a' : '#48dbfb',
        true
      );
    } else if (player.impulseType === 'mine_dash') {
      const mineCount = isGold ? 3 : 2;
      for (let m = 0; m < mineCount; m++) {
        deployables.push({
          type: 'spring_mine',
          x: player.x + (m - (mineCount - 1) / 2) * 26,
          y: player.y,
          life: 10.0,
          radius: 16,
          blastRadius: 68,
          damage: player.stats.impulseDamage * (isGold ? 1.4 : 1.1)
        });
      }
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '💣 3 MINES DORÉES !' : '💣 MINES POSÉES !',
        '#ffb142',
        true
      );
    } else if (player.impulseType === 'tesla_storm') {
      const strikeCount = isGold ? 6 : 4;
      const targets = [...enemies].slice(0, strikeCount);
      targets.forEach((t) => {
        damageEnemy(t, player.stats.impulseDamage * (isGold ? 1.35 : 1.0), isGold, '#00f2fe');
        lightningArcs.push({
          x1: player.x,
          y1: player.y,
          x2: t.x,
          y2: t.y,
          life: 0.28
        });
      });
      pickups.forEach((p) => {
        p.magnetized = true;
      });
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '⚡ ORAGE DE FARADAY !' : '⚡ DÉCHARGE TESLA !',
        '#00f2fe',
        true
      );
    } else if (player.impulseType === 'chrono_field') {
      deployables.push({
        type: 'chrono_field',
        x: player.x,
        y: player.y,
        radius: isGold ? 155 : 120,
        life: isGold ? 5.5 : 4.2,
        isGold
      });
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '⏳ STASE DORÉE !' : '⏳ BULLE TEMPORELLE !',
        '#feca57',
        true
      );
    } else if (player.impulseType === 'bloom_garden') {
      const count = isGold ? 3 : 2;
      for (let b = 0; b < count; b++) {
        const angle = (b * Math.PI * 2) / count;
        deployables.push({
          type: 'bloom_turret',
          x: Math.max(
            CFG.WALL_THICKNESS + 24,
            Math.min(CFG.ARENA_WIDTH - CFG.WALL_THICKNESS - 24, player.x + Math.cos(angle) * 32)
          ),
          y: Math.max(
            CFG.WALL_THICKNESS + 24,
            Math.min(CFG.ARENA_HEIGHT - CFG.WALL_THICKNESS - 24, player.y + Math.sin(angle) * 32)
          ),
          life: 8.0,
          fireCd: 0.25 + b * 0.12,
          isGold
        });
      }
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '🌱 JARDIN D\'ACIER DORÉ !' : '🌱 ÉCLOSION MÉCANIQUE !',
        '#2ecc71',
        true
      );
    } else {
      spawnFloatingText(
        player.x,
        player.y - 24,
        isGold ? '⚡ SURCHARGE DORÉE !' : '💨 IMPULSION !',
        isGold ? '#ffd32a' : '#00f2fe',
        isGold
      );
    }

    if (player.stats.impulseLightningBolts > 0 && enemies.length > 0) {
      const boltTargets = [...enemies].slice(0, player.stats.impulseLightningBolts);
      boltTargets.forEach((t) => {
        damageEnemy(t, player.stats.chainLightningDmg * 1.4, false, '#00f2fe');
        lightningArcs.push({
          x1: player.x,
          y1: player.y,
          x2: t.x,
          y2: t.y,
          life: 0.22
        });
      });
    }

    spawnBurstParticles(player.x, player.y, isGold ? '#ffd32a' : '#00f2fe', isGold ? 18 : 10);

    if ((runState.familyCounts['Thermique'] || 0) >= 4) {
      const novaRad = (runState.familyCounts['Thermique'] || 0) >= 6 ? 155 : 110;
      triggerPlayerShockwave(player.x, player.y, novaRad, player.stats.impulseDamage);
    }

    if (isGold && player.stats.goldImpulseNova > 0) {
      const count = player.stats.goldImpulseNova;
      for (let i = 0; i < count; i++) {
        const a = (i * Math.PI * 2) / count;
        spawnProjectile(
          player.x,
          player.y,
          Math.cos(a) * player.stats.projectileSpeed,
          Math.sin(a) * player.stats.projectileSpeed,
          player.stats.damage * 1.25,
          true,
          '#ffd32a',
          0
        );
      }
    }

    notifyNewAchievements();
    return true;
  }

  // --- BOUCLE PRINCIPALE 60 FPS ---
  function mainLoop(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const rawDt = Math.min(0.05, (timestamp - lastFrameTime) / 1000);
    lastFrameTime = timestamp;

    if (isRunning && !isPaused) {
      if (hitStopTimer > 0) {
        hitStopTimer -= rawDt;
      } else {
        elapsedSec += rawDt;
        updateGame(rawDt);
      }
    }

    renderGame();
    requestAnimationFrame(mainLoop);
  }

  function updateGame(dt) {
    updatePlayer(dt);
    updateDeployables(dt);
    updateSpawnQueue(dt);
    updateEnemies(dt);
    updateFallingWeights(dt);
    updateProjectiles(dt);
    updateHazards(dt);
    updateSteamClouds(dt);
    updateShockwaves(dt);
    updatePickups(dt);
    updateParticlesAndTexts(dt);
    checkRoomProgression();

    if (shakeMagnitude > 0.1) {
      shakeMagnitude *= CFG.SCREEN_SHAKE_DECAY;
    } else {
      shakeMagnitude = 0;
    }
    if (screenFlashAlpha > 0) {
      screenFlashAlpha = Math.max(0, screenFlashAlpha - dt * 4);
    }

    window.UI.updateHUD(player, runState);
  }

  function updatePlayer(dt) {
    player.scaleX += (1 - player.scaleX) * Math.min(1, dt * 14);
    player.scaleY += (1 - player.scaleY) * Math.min(1, dt * 14);

    if (player.invulnTimer > 0) player.invulnTimer -= dt;
    if (player.flashTimer > 0) player.flashTimer -= dt;
    if (player.impulseCooldown > 0) player.impulseCooldown -= dt;

    if (player.stats.regenPer4Sec > 0 && player.hp < player.stats.maxHp) {
      player.regenTimer -= dt;
      if (player.regenTimer <= 0) {
        player.regenTimer = 4.0;
        player.hp = Math.min(player.stats.maxHp, player.hp + player.stats.regenPer4Sec);
        spawnFloatingText(
          player.x,
          player.y - 18,
          `+${player.stats.regenPer4Sec} PV`,
          '#2ecc71',
          false
        );
      }
    }

    let inputX = touchInput.dx * touchInput.dist;
    let inputY = touchInput.dy * touchInput.dist;

    if (!touchInput.active) {
      let kx = 0;
      let ky = 0;
      if (keys['ArrowLeft'] || keys['KeyA'] || keys['KeyQ']) kx -= 1;
      if (keys['ArrowRight'] || keys['KeyD']) kx += 1;
      if (keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ']) ky -= 1;
      if (keys['ArrowDown'] || keys['KeyS']) ky += 1;
      if (kx !== 0 || ky !== 0) {
        const klen = Math.hypot(kx, ky);
        inputX = kx / klen;
        inputY = ky / klen;
      }
    }

    const inputMag = Math.hypot(inputX, inputY);
    if (inputMag > 0.08) {
      player.moveDirX = inputX / inputMag;
      player.moveDirY = inputY / inputMag;
      player.moveAngle = Math.atan2(player.moveDirY, player.moveDirX);
    }

    let speedFactor = 1.0;
    if (!player.stats.ignoreSlow) {
      hazards.forEach((h) => {
        if (h.type === 'resin_tile' && Math.hypot(player.x - h.x, player.y - h.y) < h.radius) {
          speedFactor = 0.6;
        }
      });
    }

    if (player.impulseTimer > 0) {
      player.impulseTimer -= dt;
      const mult = player.stats.impulseSpeedMult * (player.impulseGoldActive ? 1.2 : 1);
      player.vx = player.moveDirX * player.stats.moveSpeed * mult;
      player.vy = player.moveDirY * player.stats.moveSpeed * mult;

      const impRadius = player.stats.impulseRadius * (player.impulseGoldActive ? 1.2 : 1);
      const impDmg = player.stats.impulseDamage * (player.impulseGoldActive ? 1.45 : 1);
      enemies.forEach((e) => {
        if (!e.impulseHitCooldown || e.impulseHitCooldown <= 0) {
          const d = Math.hypot(e.x - player.x, e.y - player.y);
          if (d < impRadius + e.radius) {
            damageEnemy(e, impDmg, true);
            e.impulseHitCooldown = 0.16;
          }
        }
      });

      if (player.stats.impulseSteamClouds > 0) {
        player.steamDropTimer -= dt;
        if (player.steamDropTimer <= 0) {
          player.steamDropTimer = 0.08;
          steamClouds.push({
            x: player.x,
            y: player.y,
            radius: 28,
            life: 1.6,
            maxLife: 1.6,
            dmgPerSec: player.stats.damage * 1.4
          });
        }
      }

      if (player.impulseTimer <= 0 && player.stats.impulseShockwave) {
        triggerPlayerShockwave(player.x, player.y, player.stats.impulseRadius * 1.5, impDmg * 0.85);
      }
    } else {
      player.vx = inputX * player.stats.moveSpeed * speedFactor;
      player.vy = inputY * player.stats.moveSpeed * speedFactor;

      if (inputMag > 0.1) {
        const gain = CFG.PLAYER.PRESSURE_GAIN_MOVE * player.stats.pressureRateMult * dt;
        player.pressure = Math.min(100, player.pressure + gain);
      }
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const minX = CFG.WALL_THICKNESS + player.radius;
    const maxX = CFG.ARENA_WIDTH - CFG.WALL_THICKNESS - player.radius;
    const minY = CFG.WALL_THICKNESS + player.radius;
    const maxY = CFG.ARENA_HEIGHT - CFG.WALL_THICKNESS - player.radius;

    if (player.x < minX) {
      player.x = minX;
      if (player.impulseTimer > 0) player.moveDirX = Math.abs(player.moveDirX);
    } else if (player.x > maxX) {
      player.x = maxX;
      if (player.impulseTimer > 0) player.moveDirX = -Math.abs(player.moveDirX);
    }
    if (player.y < minY) {
      player.y = minY;
      if (player.impulseTimer > 0) player.moveDirY = Math.abs(player.moveDirY);
    } else if (player.y > maxY) {
      player.y = maxY;
      if (player.impulseTimer > 0) player.moveDirY = -Math.abs(player.moveDirY);
    }

    if (player.stats.orbitalCogs > 0) {
      const count = player.stats.orbitalCogs;
      const orbitR = player.radius + 28;
      for (let i = 0; i < count; i++) {
        const a = elapsedSec * 4.2 + (i * Math.PI * 2) / count;
        const ox = player.x + Math.cos(a) * orbitR;
        const oy = player.y + Math.sin(a) * orbitR;
        enemies.forEach((e) => {
          if (
            (!e.orbitalHitCd || e.orbitalHitCd <= 0) &&
            Math.hypot(e.x - ox, e.y - oy) < e.radius + 11
          ) {
            damageEnemy(e, player.stats.damage * 0.85, false);
            e.orbitalHitCd = 0.25;
          }
        });
      }
    }

    let nearest = null;
    let bestDist = Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = e;
      }
    }

    if (nearest) {
      player.aimAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
      player.fireCooldown -= dt;
      if (player.fireCooldown <= 0 && player.impulseTimer <= 0) {
        firePlayerWeapon(player.aimAngle);
        player.fireCooldown = 1 / player.stats.fireRate;
      }
    } else if (inputMag > 0.1) {
      player.aimAngle = Math.atan2(player.moveDirY, player.moveDirX);
    }
  }

  function firePlayerWeapon(baseAngle) {
    if (player.weaponType === 'prism_beam' || player.weaponType === 'tesla_orb') {
      window.SoundFX.play('shoot_laser');
    } else if (player.weaponType === 'mortar_shell') {
      window.SoundFX.play('shoot_mortar');
    } else {
      window.SoundFX.play('shoot');
    }

    let dmg = player.stats.damage;
    if (player.pressure >= 50 && player.stats.highPressureDmgBonus > 0) {
      dmg *= 1 + player.stats.highPressureDmgBonus;
    }

    const count = player.stats.projectileCount;
    const spread = 0.16;
    const colorMap = {
      prism_beam: '#48dbfb',
      mortar_shell: '#ff5252',
      tesla_orb: '#00f2fe',
      clock_needle: '#feca57',
      seed_shot: '#2ecc71',
      botanic_seed: '#2ecc71'
    };
    const projColor = colorMap[player.weaponType] || '#f5b041';

    for (let i = 0; i < count; i++) {
      const offsetAngle = count === 1 ? 0 : (i - (count - 1) / 2) * spread;
      const a = baseAngle + offsetAngle;
      spawnProjectile(
        player.x + Math.cos(a) * 16,
        player.y + Math.sin(a) * 16,
        Math.cos(a) * player.stats.projectileSpeed,
        Math.sin(a) * player.stats.projectileSpeed,
        dmg,
        true,
        projColor,
        player.stats.explosionRadius || 0
      );
    }

    player.scaleX = 0.9;
    player.scaleY = 1.1;
    player.pressure = Math.min(
      100,
      player.pressure + CFG.PLAYER.PRESSURE_GAIN_SHOOT * player.stats.pressureRateMult
    );
  }

  // --- MISE À JOUR DES 4 DÉPLOYABLES ---
  function updateDeployables(dt) {
    for (let i = deployables.length - 1; i >= 0; i--) {
      const d = deployables[i];
      d.life -= dt;
      if (d.life <= 0) {
        deployables.splice(i, 1);
        continue;
      }

      if (d.type === 'prism_turret' || d.type === 'bloom_turret') {
        d.fireCd -= dt;
        if (d.fireCd <= 0 && enemies.length > 0) {
          d.fireCd = d.isGold ? 0.42 : 0.60;
          let target = enemies[0];
          let best = Infinity;
          enemies.forEach((e) => {
            const dist = Math.hypot(e.x - d.x, e.y - d.y);
            if (dist < best) {
              best = dist;
              target = e;
            }
          });
          if (target) {
            const a = Math.atan2(target.y - d.y, target.x - d.x);
            spawnProjectile(
              d.x,
              d.y,
              Math.cos(a) * 460,
              Math.sin(a) * 460,
              player.stats.damage * (d.isGold ? 0.95 : 0.72),
              true,
              d.type === 'bloom_turret' ? '#2ecc71' : d.isGold ? '#ffd32a' : '#f368e0',
              0
            );
          }
        }
      } else if (d.type === 'spring_mine') {
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (Math.hypot(e.x - d.x, e.y - d.y) < d.radius + e.radius + 6) {
            window.SoundFX.play('explosion');
            triggerPlayerShockwave(d.x, d.y, d.blastRadius, d.damage);
            spawnBurstParticles(d.x, d.y, '#ff5252', 18);
            deployables.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  function isPointInChronoField(x, y) {
    for (let i = 0; i < deployables.length; i++) {
      const d = deployables[i];
      if (d.type === 'chrono_field' && Math.hypot(x - d.x, y - d.y) <= d.radius) {
        return true;
      }
    }
    return false;
  }

  function spawnProjectile(x, y, vx, vy, damage, fromPlayer, color, explosionRadius = 0) {
    if (projectiles.length >= CFG.MAX_PROJECTILES) {
      projectiles.shift();
    }
    projectiles.push({
      x,
      y,
      vx,
      vy,
      radius: fromPlayer ? (explosionRadius > 0 ? 7.5 : 5.5) : 6.5,
      damage,
      fromPlayer,
      color: color || (fromPlayer ? '#f5b041' : '#ff4757'),
      bouncesLeft: fromPlayer ? player.stats.projectileBounces : 0,
      pierceLeft: fromPlayer ? player.stats.projectilePierce : 0,
      explosionRadius,
      hitIds: []
    });
  }

  function updateSpawnQueue(dt) {
    for (let i = spawnQueue.length - 1; i >= 0; i--) {
      const s = spawnQueue[i];
      s.timer -= dt;
      if (s.timer <= 0) {
        materializeEnemy(s);
        spawnQueue.splice(i, 1);
      }
    }
  }

  function updateEnemies(dt) {
    const minX = CFG.WALL_THICKNESS;
    const maxX = CFG.ARENA_WIDTH - CFG.WALL_THICKNESS;
    const minY = CFG.WALL_THICKNESS;
    const maxY = CFG.ARENA_HEIGHT - CFG.WALL_THICKNESS;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const slowMult = isPointInChronoField(e.x, e.y) ? 0.35 : 1.0;
      const effDt = dt * slowMult;

      e.scaleX += (1 - e.scaleX) * Math.min(1, dt * 12);
      e.scaleY += (1 - e.scaleY) * Math.min(1, dt * 12);
      if (e.flashTimer > 0) e.flashTimer -= dt;
      if (e.impulseHitCooldown > 0) e.impulseHitCooldown -= dt;
      if (e.orbitalHitCd > 0) e.orbitalHitCd -= dt;
      if (e.ringingTimer > 0) e.ringingTimer -= dt;

      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;

      if (e.behavior === 'chaser' || e.behavior === 'volatile_chaser') {
        e.x += dirX * e.speed * effDt;
        e.y += dirY * e.speed * effDt;
        e.angle += effDt * 3.5;
      } else if (e.behavior === 'jumper') {
        e.stateTimer -= effDt;
        if (e.state === 'idle') {
          e.x += dirX * e.speed * 0.5 * effDt;
          e.y += dirY * e.speed * 0.5 * effDt;
          if (e.stateTimer <= 0) {
            e.state = 'charging';
            e.stateTimer = 0.65;
            e.targetX = Math.max(minX + 20, Math.min(maxX - 20, player.x));
            e.targetY = Math.max(minY + 20, Math.min(maxY - 20, player.y));
          }
        } else if (e.state === 'charging') {
          if (e.stateTimer <= 0) {
            e.state = 'jumping';
            e.stateTimer = 0.42;
            const jdx = e.targetX - e.x;
            const jdy = e.targetY - e.y;
            const jlen = Math.hypot(jdx, jdy) || 1;
            e.vx = (jdx / jlen) * 315;
            e.vy = (jdy / jlen) * 315;
            e.angle = Math.atan2(jdy, jdx);
            e.scaleX = 0.75;
            e.scaleY = 1.35;
          }
        } else if (e.state === 'jumping') {
          e.x += e.vx * effDt;
          e.y += e.vy * effDt;
          if (e.stateTimer <= 0) {
            e.state = 'idle';
            e.stateTimer = 1.1;
            e.scaleX = 1.25;
            e.scaleY = 0.78;
          }
        }
      } else if (e.behavior === 'shooter' || e.behavior === 'sniper_prism') {
        e.aimAngle = Math.atan2(dy, dx);
        e.stateTimer -= effDt;
        if (e.stateTimer <= 0) {
          e.stateTimer = e.behavior === 'sniper_prism' ? 1.55 : 1.85;
          const bCount = e.behavior === 'sniper_prism' ? 1 : 3;
          const pSpeed = e.behavior === 'sniper_prism' ? 285 : 195;
          for (let b = 0; b < bCount; b++) {
            const offset = bCount === 1 ? 0 : (b - 1) * 0.24;
            const a = e.aimAngle + offset;
            spawnProjectile(
              e.x + Math.cos(a) * e.radius,
              e.y + Math.sin(a) * e.radius,
              Math.cos(a) * pSpeed,
              Math.sin(a) * pSpeed,
              e.damage,
              false,
              e.behavior === 'sniper_prism' ? '#f368e0' : '#ff4757'
            );
          }
          e.scaleX = 1.2;
          e.scaleY = 0.82;
        }
      } else if (e.behavior === 'pulse_plant') {
        e.x += dirX * e.speed * effDt;
        e.y += dirY * e.speed * effDt;
        e.stateTimer -= effDt;
        if (e.stateTimer <= 0) {
          e.stateTimer = 2.4;
          shockwaves.push({
            x: e.x,
            y: e.y,
            radius: e.radius,
            maxRadius: 95,
            color: '#1dd1a1',
            fromPlayer: false,
            damage: e.damage,
            hitPlayer: false
          });
        }
      } else if (e.behavior === 'mortar_bot') {
        e.stateTimer -= effDt;
        if (e.stateTimer <= 0) {
          e.stateTimer = 2.2;
          fallingWeights.push({
            x: player.x,
            y: player.y,
            radius: 38,
            timer: 1.1,
            maxTimer: 1.1,
            damage: e.damage,
            style: 'slag',
            color: '#ff5252'
          });
        }
      } else if (e.behavior === 'bouncer') {
        e.x += e.vx * effDt;
        e.y += e.vy * effDt;
        if (e.x < minX + e.radius) {
          e.x = minX + e.radius;
          e.vx = Math.abs(e.vx);
        } else if (e.x > maxX - e.radius) {
          e.x = maxX - e.radius;
          e.vx = -Math.abs(e.vx);
        }
        if (e.y < minY + e.radius) {
          e.y = minY + e.radius;
          e.vy = Math.abs(e.vy);
        } else if (e.y > maxY - e.radius) {
          e.y = maxY - e.radius;
          e.vy = -Math.abs(e.vy);
        }
      } else if (e.behavior === 'warden' || e.behavior === 'warden_geode') {
        e.x += dirX * e.speed * effDt;
        e.y += dirY * e.speed * effDt;
        e.stateTimer -= effDt;
        if (e.stateTimer <= 0) {
          e.stateTimer = 2.3;
          e.scaleX = 1.35;
          e.scaleY = 0.7;
          shakeMagnitude = Math.max(shakeMagnitude, 6);
          window.SoundFX.play('boss_slam');
          const count = e.behavior === 'warden_geode' ? 6 : 8;
          const offsetA = elapsedSec * 2;
          for (let k = 0; k < count; k++) {
            const a = offsetA + (k * Math.PI * 2) / count;
            spawnProjectile(
              e.x,
              e.y,
              Math.cos(a) * 195,
              Math.sin(a) * 195,
              e.damage,
              false,
              e.behavior === 'warden_geode' ? '#48dbfb' : '#ffa502'
            );
          }
          shockwaves.push({
            x: e.x,
            y: e.y,
            radius: e.radius,
            maxRadius: 125,
            color: '#ff6b6b',
            fromPlayer: false,
            damage: e.damage,
            hitPlayer: false
          });
        }
      } else if (e.behavior === 'boss_carillon') {
        updateCarillonBoss(e, effDt, minX, maxX);
      } else if (e.behavior === 'boss_orchidee' || e.behavior === 'boss_dynamo') {
        updateOrchideeOrDynamoBoss(e, effDt, minX, maxX, minY, maxY);
      } else if (e.behavior === 'boss_vulcain' || e.behavior === 'boss_leviathan') {
        updateVulcainOrLeviathanBoss(e, effDt, minX, maxX);
      } else if (e.behavior === 'boss_coeur_zero') {
        updateCoeurZeroBoss(e, effDt, minX, maxX, minY, maxY);
      }

      e.x = Math.max(minX + e.radius, Math.min(maxX - e.radius, e.x));
      e.y = Math.max(minY + e.radius, Math.min(maxY - e.radius, e.y));

      if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius - 2) {
        if (player.impulseTimer <= 0) {
          damagePlayer(e.damage, false);
        }
      }
    }
  }

  // --- BOSS 1 : LE GRAND CARILLON DÉTRAQUÉ ---
  function updateCarillonBoss(boss, dt, minX, maxX) {
    const hpRatio = boss.hp / boss.maxHp;
    const targetPhase = hpRatio <= 0.32 ? 3 : hpRatio <= 0.66 ? 2 : 1;

    if (targetPhase > boss.bossPhase) {
      boss.bossPhase = targetPhase;
      boss.scaleX = 1.45;
      boss.scaleY = 0.65;
      boss.ringingTimer = 1.2;
      shakeMagnitude = 11;
      window.SoundFX.play('carillon_bell');
      spawnBurstParticles(boss.x, boss.y, '#ffd32a', 30);

      if (targetPhase === 2) {
        window.UI.showToast('🔔 PHASE 2 : Attention aux Poids d\'Horlogerie !', 3400);
        spawnQueue.push(
          { enemyId: 'ecrou_errant', x: minX + 55, y: 190, timer: 0.7, isElite: false },
          { enemyId: 'ecrou_errant', x: maxX - 55, y: 190, timer: 0.7, isElite: false }
        );
      } else if (targetPhase === 3) {
        window.UI.showToast('🚨 PHASE 3 : Carillon en Surcharge Acoustique !', 3400);
      }
    }

    const railSpeed = boss.speed * (boss.bossPhase === 3 ? 1.45 : boss.bossPhase === 2 ? 1.2 : 1);
    boss.x += boss.railDir * railSpeed * dt;
    const leftBound = minX + boss.radius + 16;
    const rightBound = maxX - boss.radius - 16;
    if (boss.x <= leftBound) {
      boss.x = leftBound;
      boss.railDir = 1;
    } else if (boss.x >= rightBound) {
      boss.x = rightBound;
      boss.railDir = -1;
    }

    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      boss.attackCycle = (boss.attackCycle + 1) % 3;
      boss.scaleX = 1.28;
      boss.scaleY = 0.76;

      if (boss.attackCycle === 0) {
        window.SoundFX.play('shoot');
        const baseA = Math.atan2(player.y - boss.y, player.x - boss.x);
        const count = boss.bossPhase === 1 ? 5 : boss.bossPhase === 2 ? 7 : 9;
        const spread = 0.19;
        for (let i = 0; i < count; i++) {
          const a = baseA + (i - (count - 1) / 2) * spread;
          spawnProjectile(
            boss.x + Math.cos(a) * boss.radius * 0.8,
            boss.y + Math.sin(a) * boss.radius * 0.8,
            Math.cos(a) * 215,
            Math.sin(a) * 215,
            boss.damage,
            false,
            '#ffd32a'
          );
        }
        boss.stateTimer = boss.bossPhase === 3 ? 1.35 : 1.75;
      } else if (boss.attackCycle === 1) {
        boss.ringingTimer = 0.9;
        window.SoundFX.play('carillon_bell');
        shakeMagnitude = Math.max(shakeMagnitude, 6.5);
        shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: boss.radius * 0.8,
          maxRadius: 270,
          color: '#00f2fe',
          fromPlayer: false,
          damage: boss.damage,
          hitPlayer: false
        });
        boss.stateTimer = boss.bossPhase === 3 ? 1.45 : 1.9;
      } else {
        const weightCount = boss.bossPhase === 1 ? 2 : boss.bossPhase === 2 ? 3 : 4;
        for (let w = 0; w < weightCount; w++) {
          const wx =
            w === 0
              ? player.x
              : CFG.WALL_THICKNESS +
                55 +
                Math.random() * (CFG.ARENA_WIDTH - (CFG.WALL_THICKNESS + 55) * 2);
          const wy =
            w === 0
              ? player.y
              : CFG.ARENA_HEIGHT * 0.35 + Math.random() * (CFG.ARENA_HEIGHT * 0.5);
          fallingWeights.push({
            x: Math.max(
              CFG.WALL_THICKNESS + 45,
              Math.min(CFG.ARENA_WIDTH - CFG.WALL_THICKNESS - 45, wx)
            ),
            y: Math.max(
              CFG.WALL_THICKNESS + 120,
              Math.min(CFG.ARENA_HEIGHT - CFG.WALL_THICKNESS - 45, wy)
            ),
            radius: 44,
            timer: 1.15,
            maxTimer: 1.15,
            damage: boss.damage + 4,
            style: 'weight'
          });
        }
        boss.stateTimer = boss.bossPhase === 3 ? 1.6 : 2.1;
      }
    }
  }

  // --- BOSS 2 (ORCHIDÉE PRISMATIQUE) & BOSS 4 (ASTROLABE MAGNÉTIQUE) ---
  function updateOrchideeOrDynamoBoss(boss, dt, minX, maxX, minY, maxY) {
    const isAstrolabe = boss.type === 'astrolabe_quantique';
    const hpRatio = boss.hp / boss.maxHp;
    const targetPhase = hpRatio <= 0.32 ? 3 : hpRatio <= 0.66 ? 2 : 1;

    if (targetPhase > boss.bossPhase) {
      boss.bossPhase = targetPhase;
      boss.scaleX = 1.45;
      boss.scaleY = 0.65;
      shakeMagnitude = 11;
      window.SoundFX.play('crystal_chime');
      spawnBurstParticles(boss.x, boss.y, isAstrolabe ? '#00f2fe' : '#48dbfb', 32);

      if (targetPhase === 2) {
        window.UI.showToast(
          isAstrolabe
            ? '⚡ PHASE 2 : Inducteurs Magnétiques en Surcharge !'
            : '💎 PHASE 2 : Floraison des Pétales-Miroirs !',
          3400
        );
        const addId = isAstrolabe ? 'drone_bobine' : 'bourgeon_laser';
        spawnQueue.push(
          { enemyId: addId, x: minX + 55, y: minY + 95, timer: 0.7, isElite: false },
          { enemyId: addId, x: maxX - 55, y: minY + 95, timer: 0.7, isElite: false }
        );
      } else if (targetPhase === 3) {
        window.UI.showToast(
          isAstrolabe
            ? '🚨 PHASE 3 : Tempête Électromagnétique Totale !'
            : '🚨 PHASE 3 : Tempête de Réfraction Pure !',
          3400
        );
      }
    }

    boss.x = CFG.ARENA_WIDTH / 2 + Math.sin(elapsedSec * 1.3) * 85;
    boss.y = CFG.ARENA_HEIGHT * 0.28 + Math.sin(elapsedSec * 2.6) * 32;

    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      boss.attackCycle = (boss.attackCycle + 1) % 3;
      boss.scaleX = 1.3;
      boss.scaleY = 0.75;

      if (boss.attackCycle === 0) {
        window.SoundFX.play('crystal_chime');
        const branches = boss.bossPhase === 1 ? 6 : boss.bossPhase === 2 ? 8 : 10;
        for (let i = 0; i < branches; i++) {
          const a = elapsedSec + (i * Math.PI * 2) / branches;
          spawnProjectile(
            boss.x,
            boss.y,
            Math.cos(a) * 215,
            Math.sin(a) * 215,
            boss.damage,
            false,
            i % 2 === 0 ? '#00f2fe' : '#f368e0'
          );
        }
        boss.stateTimer = boss.bossPhase === 3 ? 1.3 : 1.65;
      } else if (boss.attackCycle === 1) {
        const count = boss.bossPhase + 1;
        for (let c = 0; c < count; c++) {
          fallingWeights.push({
            x: c === 0 ? player.x : minX + 55 + Math.random() * (maxX - minX - 110),
            y: c === 0 ? player.y : minY + 140 + Math.random() * (maxY - minY - 190),
            radius: 42,
            timer: 1.08,
            maxTimer: 1.08,
            damage: boss.damage + 3,
            style: 'crystal',
            color: '#00f2fe'
          });
        }
        boss.stateTimer = 1.75;
      } else {
        window.SoundFX.play('crystal_chime');
        shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: boss.radius,
          maxRadius: 280,
          color: isAstrolabe ? '#00f2fe' : '#1dd1a1',
          fromPlayer: false,
          damage: boss.damage,
          hitPlayer: false
        });
        boss.stateTimer = 1.7;
      }
    }
  }

  // --- BOSS 3 (VULCAIN-9000) & BOSS 5 (GRAND DISTILLATEUR) ---
  function updateVulcainOrLeviathanBoss(boss, dt, minX, maxX) {
    const isDistillateur = boss.type === 'alambic_ambulant';
    const hpRatio = boss.hp / boss.maxHp;
    const targetPhase = hpRatio <= 0.32 ? 3 : hpRatio <= 0.66 ? 2 : 1;

    if (targetPhase > boss.bossPhase) {
      boss.bossPhase = targetPhase;
      boss.scaleX = 1.45;
      boss.scaleY = 0.65;
      shakeMagnitude = 12;
      window.SoundFX.play('explosion');
      spawnBurstParticles(boss.x, boss.y, isDistillateur ? '#2ecc71' : '#ff5252', 35);

      if (targetPhase === 2) {
        window.UI.showToast(
          isDistillateur
            ? '🧪 PHASE 2 : Ouverture des Vannes Haute Pression !'
            : '🔥 PHASE 2 : Ouverture des Soupapes de Fonte !',
          3400
        );
        const addId = isDistillateur ? 'fiole_instable' : 'charbon_roulant';
        spawnQueue.push(
          { enemyId: addId, x: minX + 55, y: 200, timer: 0.7, isElite: false },
          { enemyId: addId, x: maxX - 55, y: 200, timer: 0.7, isElite: false }
        );
      } else if (targetPhase === 3) {
        window.UI.showToast(
          isDistillateur
            ? '🚨 PHASE 3 : Ébullition Alchimique Maximale !'
            : '🚨 PHASE 3 : Vulcain-9000 en Fusion Critique !',
          3400
        );
      }
    }

    const railSpeed = boss.speed * (boss.bossPhase === 3 ? 1.5 : 1.2);
    boss.x += boss.railDir * railSpeed * dt;
    const leftBound = minX + boss.radius + 16;
    const rightBound = maxX - boss.radius - 16;
    if (boss.x <= leftBound) {
      boss.x = leftBound;
      boss.railDir = 1;
    } else if (boss.x >= rightBound) {
      boss.x = rightBound;
      boss.railDir = -1;
    }

    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      boss.attackCycle = (boss.attackCycle + 1) % 3;
      boss.scaleX = 1.32;
      boss.scaleY = 0.72;

      if (boss.attackCycle === 0) {
        window.SoundFX.play('shoot_mortar');
        const baseA = Math.atan2(player.y - boss.y, player.x - boss.x);
        const count = boss.bossPhase === 1 ? 6 : boss.bossPhase === 2 ? 8 : 10;
        for (let i = 0; i < count; i++) {
          const a = baseA + (i - (count - 1) / 2) * 0.17;
          spawnProjectile(
            boss.x,
            boss.y,
            Math.cos(a) * 230,
            Math.sin(a) * 230,
            boss.damage,
            false,
            isDistillateur ? '#2ecc71' : '#ffda79'
          );
        }
        boss.stateTimer = 1.55;
      } else if (boss.attackCycle === 1) {
        const count = boss.bossPhase + 2;
        for (let m = 0; m < count; m++) {
          fallingWeights.push({
            x: m === 0 ? player.x : minX + 55 + Math.random() * (maxX - minX - 110),
            y:
              m === 0
                ? player.y
                : CFG.ARENA_HEIGHT * 0.35 + Math.random() * (CFG.ARENA_HEIGHT * 0.5),
            radius: 45,
            timer: 1.05,
            maxTimer: 1.05,
            damage: boss.damage + 4,
            style: 'slag',
            color: isDistillateur ? '#2ecc71' : '#ff5252'
          });
        }
        boss.stateTimer = 1.7;
      } else {
        window.SoundFX.play('explosion');
        shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: boss.radius,
          maxRadius: 290,
          color: isDistillateur ? '#2ecc71' : '#ff5252',
          fromPlayer: false,
          damage: boss.damage,
          hitPlayer: false
        });
        boss.stateTimer = 1.65;
      }
    }
  }

  // --- BOSS FINAL (SECTEUR 6) : CŒUR-ZÉRO, L'ARCHITECTE AUTOMATIQUE ---
  function updateCoeurZeroBoss(boss, dt, minX, maxX, minY, maxY) {
    const hpRatio = boss.hp / boss.maxHp;
    const targetPhase = hpRatio <= 0.33 ? 3 : hpRatio <= 0.66 ? 2 : 1;

    if (targetPhase > boss.bossPhase) {
      boss.bossPhase = targetPhase;
      boss.scaleX = 1.5;
      boss.scaleY = 0.6;
      shakeMagnitude = 14;
      window.SoundFX.play('carillon_bell');
      spawnBurstParticles(boss.x, boss.y, '#ffd32a', 40);

      if (targetPhase === 2) {
        window.UI.showToast('⏳ CŒUR-ZÉRO PHASE 2 : Synchronisation des Cadrans !', 3800);
        spawnQueue.push(
          { enemyId: 'sentinelle_or', x: minX + 55, y: minY + 95, timer: 0.7, isElite: false },
          { enemyId: 'sentinelle_or', x: maxX - 55, y: minY + 95, timer: 0.7, isElite: false }
        );
      } else if (targetPhase === 3) {
        window.UI.showToast('🚨 PHASE FINALE : Résonance du Grand Balancier !', 4000);
      }
    }

    boss.x = CFG.ARENA_WIDTH / 2 + Math.cos(elapsedSec * 1.15) * 90;
    boss.y = CFG.ARENA_HEIGHT * 0.27 + Math.sin(elapsedSec * 2.3) * 35;

    boss.stateTimer -= dt;
    if (boss.stateTimer <= 0) {
      boss.attackCycle = (boss.attackCycle + 1) % 3;
      boss.scaleX = 1.35;
      boss.scaleY = 0.72;

      if (boss.attackCycle === 0) {
        window.SoundFX.play('carillon_bell');
        const needles = boss.bossPhase === 1 ? 8 : boss.bossPhase === 2 ? 10 : 12;
        for (let i = 0; i < needles; i++) {
          const a = elapsedSec * 1.8 + (i * Math.PI * 2) / needles;
          spawnProjectile(
            boss.x,
            boss.y,
            Math.cos(a) * 225,
            Math.sin(a) * 225,
            boss.damage,
            false,
            i % 2 === 0 ? '#ffd32a' : '#00f2fe'
          );
        }
        boss.stateTimer = boss.bossPhase === 3 ? 1.25 : 1.6;
      } else if (boss.attackCycle === 1) {
        window.SoundFX.play('crystal_chime');
        shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: boss.radius * 0.7,
          maxRadius: 310,
          color: '#ffd32a',
          fromPlayer: false,
          damage: boss.damage,
          hitPlayer: false
        });
        boss.stateTimer = 1.55;
      } else {
        const count = boss.bossPhase + 2;
        for (let w = 0; w < count; w++) {
          fallingWeights.push({
            x: w === 0 ? player.x : minX + 55 + Math.random() * (maxX - minX - 110),
            y: w === 0 ? player.y : minY + 135 + Math.random() * (maxY - minY - 185),
            radius: 44,
            timer: 1.05,
            maxTimer: 1.05,
            damage: boss.damage + 4,
            style: 'weight',
            color: '#00f2fe'
          });
        }
        boss.stateTimer = 1.65;
      }
    }
  }

  function updateFallingWeights(dt) {
    for (let i = fallingWeights.length - 1; i >= 0; i--) {
      const fw = fallingWeights[i];
      fw.timer -= dt;
      if (fw.timer <= 0) {
        window.SoundFX.play('boss_slam');
        shakeMagnitude = Math.max(shakeMagnitude, 7.5);
        spawnBurstParticles(fw.x, fw.y, fw.color || '#ffa502', 18);

        if (Math.hypot(player.x - fw.x, player.y - fw.y) < player.radius + fw.radius - 4) {
          damagePlayer(fw.damage, false);
        }

        if (runState.activeBoss && runState.activeBoss.bossPhase === 3) {
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3;
            spawnProjectile(
              fw.x,
              fw.y,
              Math.cos(a) * 170,
              Math.sin(a) * 170,
              15,
              false,
              '#ff6b6b'
            );
          }
        }

        fallingWeights.splice(i, 1);
      }
    }
  }

  function updateProjectiles(dt) {
    const minX = CFG.WALL_THICKNESS;
    const maxX = CFG.ARENA_WIDTH - CFG.WALL_THICKNESS;
    const minY = CFG.WALL_THICKNESS;
    const maxY = CFG.ARENA_HEIGHT - CFG.WALL_THICKNESS;

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      const slowMult = !p.fromPlayer && isPointInChronoField(p.x, p.y) ? 0.35 : 1.0;
      p.x += p.vx * dt * slowMult;
      p.y += p.vy * dt * slowMult;

      let hitWall = false;
      if (p.x <= minX + p.radius || p.x >= maxX - p.radius) {
        if (p.bouncesLeft > 0) {
          p.vx = -p.vx;
          p.x = Math.max(minX + p.radius, Math.min(maxX - p.radius, p.x));
          p.bouncesLeft--;
          spawnBurstParticles(p.x, p.y, p.color, 4);
        } else {
          hitWall = true;
        }
      }
      if (p.y <= minY + p.radius || p.y >= maxY - p.radius) {
        if (p.bouncesLeft > 0) {
          p.vy = -p.vy;
          p.y = Math.max(minY + p.radius, Math.min(maxY - p.radius, p.y));
          p.bouncesLeft--;
          spawnBurstParticles(p.x, p.y, p.color, 4);
        } else {
          hitWall = true;
        }
      }

      if (hitWall) {
        if (p.fromPlayer && p.explosionRadius > 0) {
          window.SoundFX.play('explosion');
          triggerPlayerShockwave(p.x, p.y, p.explosionRadius, p.damage * 0.65);
        }
        spawnBurstParticles(p.x, p.y, p.color, 4);
        projectiles.splice(i, 1);
        continue;
      }

      if (p.fromPlayer) {
        let removed = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (p.hitIds.includes(e)) continue;
          if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
            p.hitIds.push(e);

            const isCrit = Math.random() < player.stats.critChance;
            const critMult = player.stats.critDamageMult || 2.0;
            const bossMult = e.isBoss ? player.stats.bossDamageMult || 1 : 1;
            const finalDmg = (isCrit ? p.damage * critMult : p.damage) * bossMult;
            damageEnemy(e, finalDmg, isCrit);

            if (p.explosionRadius > 0) {
              window.SoundFX.play('explosion');
              triggerPlayerShockwave(p.x, p.y, p.explosionRadius, p.damage * 0.6);
            }

            if (!e.isBoss) {
              const kLen = Math.hypot(p.vx, p.vy) || 1;
              e.x += (p.vx / kLen) * (player.stats.knockback * 0.15);
              e.y += (p.vy / kLen) * (player.stats.knockback * 0.15);
            }

            if (Math.random() < player.stats.chainLightningChance && enemies.length > 1) {
              triggerChainLightning(e, player.stats.chainLightningDmg);
            }

            if (p.pierceLeft > 0) {
              p.pierceLeft--;
            } else {
              projectiles.splice(i, 1);
              removed = true;
              break;
            }
          }
        }
        if (removed) continue;
      } else {
        if (Math.hypot(p.x - player.x, p.y - player.y) < p.radius + player.radius - 2) {
          damagePlayer(p.damage, false);
          projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  function triggerChainLightning(sourceEnemy, dmg) {
    let target = null;
    let bestD = 165;
    enemies.forEach((other) => {
      if (other !== sourceEnemy && other.hp > 0) {
        const d = Math.hypot(other.x - sourceEnemy.x, other.y - sourceEnemy.y);
        if (d < bestD) {
          bestD = d;
          target = other;
        }
      }
    });
    if (target) {
      damageEnemy(target, dmg, false, '#00f2fe');
      lightningArcs.push({
        x1: sourceEnemy.x,
        y1: sourceEnemy.y,
        x2: target.x,
        y2: target.y,
        life: 0.18
      });
      if ((runState.familyCounts['Magnétisme'] || 0) >= 4) {
        player.pressure = Math.min(100, player.pressure + 3);
      }
    }
  }

  function triggerPlayerShockwave(x, y, maxRadius, damage) {
    shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius,
      color: '#ffd32a',
      fromPlayer: true,
      damage,
      hitList: []
    });
  }

  function damageEnemy(e, amount, isCrit, customColor) {
    const dmg = Math.max(1, Math.round(amount));
    e.hp -= dmg;
    e.flashTimer = CFG.FLASH_DURATION_MS / 1000;
    e.scaleX = 1.22;
    e.scaleY = 0.8;

    window.SoundFX.play(isCrit ? 'crit' : 'hit');

    spawnFloatingText(
      e.x + (Math.random() - 0.5) * 14,
      e.y - e.radius - 6,
      isCrit ? `${dmg}!` : `${dmg}`,
      customColor || (isCrit ? '#00f2fe' : '#ffffff'),
      isCrit
    );
    spawnBurstParticles(e.x, e.y, isCrit ? '#00f2fe' : e.colors.secondary, isCrit ? 9 : 5);

    if (e.hp <= 0) {
      const idx = enemies.indexOf(e);
      if (idx !== -1) enemies.splice(idx, 1);

      window.SoundFX.play('enemy_destroy');
      hitStopTimer = (e.isBoss ? CFG.BOSS_HIT_STOP_MS : CFG.HIT_STOP_MS) / 1000;
      shakeMagnitude = Math.max(shakeMagnitude, e.isBoss ? 11 : 3.5);
      spawnBurstParticles(e.x, e.y, e.colors.core, e.isBoss ? 32 : 14);

      if (e.behavior === 'volatile_chaser') {
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          spawnProjectile(e.x, e.y, Math.cos(a) * 165, Math.sin(a) * 165, 13, false, '#ff5252');
        }
      }

      runState.kills++;
      const save = window.SaveManager.getData();
      save.stats.enemiesDismantled++;
      if (e.isBoss) {
        save.stats.bossesDefeated++;
        if (!e.isMidBoss && !runState.tookDamageInBossRoom) {
          save.stats.noHitBosses = (save.stats.noHitBosses || 0) + 1;
        }
      }

      for (let b = 0; b < e.xpBolts; b++) {
        const a = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 22;
        pickups.push({
          kind: 'bolt',
          x: e.x + Math.cos(a) * r,
          y: e.y + Math.sin(a) * r,
          value: Math.round(CFG.ECONOMY.BOLT_XP_VALUE * (player.stats.xpGainMult || 1)),
          seed: Math.random() * 10
        });
      }

      if (e.isMidBoss) {
        pickups.push({
          kind: 'ether_crystal',
          x: e.x,
          y: e.y,
          value: CFG.ECONOMY.ETHER_CRYSTAL_MIDBOSS,
          seed: 1
        });
      } else if (e.isBoss) {
        for (let c = 0; c < CFG.ECONOMY.ETHER_CRYSTAL_BOSS; c++) {
          pickups.push({
            kind: 'ether_crystal',
            x: e.x + (c - 1) * 18,
            y: e.y,
            value: 1,
            seed: c
          });
        }
      }

      if (Math.random() < 0.12 || e.isElite || e.isMidBoss) {
        pickups.push({
          kind: 'heal_oil',
          x: e.x,
          y: e.y + 12,
          value: 22,
          seed: Math.random() * 10
        });
      }

      notifyNewAchievements();
    }
  }

  function damagePlayer(rawAmount, isHazard) {
    if (player.invulnTimer > 0 || player.impulseTimer > 0) return;
    if (godMode) {
      spawnFloatingText(player.x, player.y - 20, 'BLINDÉ', '#00f2fe', false);
      player.invulnTimer = 0.35;
      return;
    }

    runState.tookDamageInBossRoom = true;

    let dmg = rawAmount;
    if (isHazard && player.stats.hazardResist) {
      dmg *= 0.5;
    }
    if (runState.isFirstRun) {
      dmg *= 1 - CFG.DIFFICULTY.FIRST_RUN_ASSIST_DR;
    }
    dmg = Math.max(1, Math.round(dmg - player.stats.flatArmor));

    player.hp = Math.max(0, player.hp - dmg);
    player.invulnTimer = CFG.PLAYER.BASE_INVULN_MS / 1000;
    player.flashTimer = 0.16;
    player.scaleX = 1.3;
    player.scaleY = 0.72;
    shakeMagnitude = 7.5;
    screenFlashAlpha = 0.35;

    window.SoundFX.play('player_hurt');
    spawnFloatingText(player.x, player.y - 22, `-${dmg}`, '#ff4757', true);
    spawnBurstParticles(player.x, player.y, '#ff4757', 12);

    if (player.stats.revengeNova) {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        spawnProjectile(
          player.x,
          player.y,
          Math.cos(a) * player.stats.projectileSpeed,
          Math.sin(a) * player.stats.projectileSpeed,
          player.stats.damage,
          true,
          '#ff9f43',
          0
        );
      }
    }

    if (player.hp <= 0) {
      const bDef = window.GAME_CONTENT.biomes[runState.biomeId];
      endRun(false, `Blindage tombé à zéro dans ${bDef.name}.`);
    }
  }

  function updateHazards(dt) {
    hazards.forEach((h) => {
      if (h.type === 'spinning_cog') {
        if (Math.hypot(player.x - h.x, player.y - h.y) < player.radius + h.radius - 4) {
          damagePlayer(10, true);
        }
      } else if (h.type === 'steam_vent' || h.type === 'tesla_coil') {
        h.timer = (h.timer + dt) % h.cycleDuration;
        if (h.timer < 2.2) {
          h.state = 'idle';
        } else if (h.timer < 3.0) {
          h.state = 'warning';
        } else {
          h.state = 'erupting';
          if (Math.hypot(player.x - h.x, player.y - h.y) < player.radius + h.dmgRadius - 6) {
            damagePlayer(12, true);
          }
        }
      } else if (h.type === 'lava_pool') {
        if (Math.hypot(player.x - h.x, player.y - h.y) < player.radius + h.radius - 6) {
          damagePlayer(13, true);
        }
      } else if (h.type === 'laser_prism') {
        const angle = elapsedSec * 1.3 * h.dir;
        const beamLen = h.beamLength || 105;
        const bx = h.x + Math.cos(angle) * beamLen;
        const by = h.y + Math.sin(angle) * beamLen;
        const distToRay = pointToSegmentDist(player.x, player.y, h.x, h.y, bx, by);
        if (distToRay < player.radius + 3) {
          damagePlayer(12, true);
        }
      }
    });
  }

  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  function updateSteamClouds(dt) {
    for (let i = steamClouds.length - 1; i >= 0; i--) {
      const c = steamClouds[i];
      c.life -= dt;
      if (c.life <= 0) {
        steamClouds.splice(i, 1);
        continue;
      }
      enemies.forEach((e) => {
        if (Math.hypot(e.x - c.x, e.y - c.y) < c.radius + e.radius) {
          e.hp -= c.dmgPerSec * dt;
          if (e.hp <= 0) {
            damageEnemy(e, 1, false);
          }
        }
      });
    }
  }

  function updateShockwaves(dt) {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 250 * dt;
      if (sw.fromPlayer) {
        enemies.forEach((e) => {
          if (
            !sw.hitList.includes(e) &&
            Math.hypot(e.x - sw.x, e.y - sw.y) <= sw.radius + e.radius
          ) {
            sw.hitList.push(e);
            damageEnemy(e, sw.damage, false);
          }
        });
      } else {
        const d = Math.hypot(player.x - sw.x, player.y - sw.y);
        if (!sw.hitPlayer && Math.abs(d - sw.radius) < player.radius + 9) {
          sw.hitPlayer = true;
          damagePlayer(sw.damage, false);
        }
      }
      if (sw.radius >= sw.maxRadius) {
        shockwaves.splice(i, 1);
      }
    }

    for (let i = lightningArcs.length - 1; i >= 0; i--) {
      lightningArcs[i].life -= dt;
      if (lightningArcs[i].life <= 0) lightningArcs.splice(i, 1);
    }
  }

  function updatePickups(dt) {
    const magnetR = runState.roomCleared ? 900 : player.stats.magnetRadius;
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < magnetR || p.magnetized) {
        const pullSpeed = runState.roomCleared || p.magnetized ? 480 : 295;
        p.x += (dx / dist) * pullSpeed * dt;
        p.y += (dy / dist) * pullSpeed * dt;
      }

      if (dist < player.radius + 13) {
        if (p.kind === 'heal_oil') {
          window.SoundFX.play('pickup_heal');
          player.hp = Math.min(player.stats.maxHp, player.hp + p.value);
          spawnFloatingText(player.x, player.y - 18, `+${p.value} PV`, '#2ecc71', false);
        } else if (p.kind === 'ether_crystal') {
          window.SoundFX.play('level_up');
          runState.crystalsEarnedThisRun += p.value;
          const save = window.SaveManager.getData();
          save.currencies.etherCrystals += p.value;
          window.SaveManager.save();
          spawnFloatingText(
            player.x,
            player.y - 24,
            `+${p.value} CRISTAL D'ÉTHER 💎`,
            '#00f2fe',
            true
          );
        } else {
          window.SoundFX.play('pickup_bolt');
          runState.xp += p.value;
          runState.boltsCurrency += 2;
          const save = window.SaveManager.getData();
          save.stats.totalBoltsCollected++;
          if (runState.xp >= runState.xpToNext) {
            runState.xp -= runState.xpToNext;
            runState.level++;
            runState.xpToNext += CFG.ECONOMY.XP_GROWTH_PER_LEVEL;
            window.SoundFX.play('level_up');
            if (player.stats.healOnLevelUp > 0) {
              player.hp = Math.min(player.stats.maxHp, player.hp + player.stats.healOnLevelUp);
            }
            spawnFloatingText(player.x, player.y - 26, 'NIVEAU SUPÉRIEUR !', '#ffd32a', true);
          }
        }
        pickups.splice(i, 1);
      }
    }
  }

  function checkRoomProgression() {
    if (
      runState.roomType === 'repair_station' ||
      runState.roomType === 'vending_machine' ||
      runState.roomType === 'trapped_chest' ||
      runState.transitionPending
    ) {
      return;
    }

    if (enemies.length === 0 && spawnQueue.length === 0) {
      if (runState.waveIndex < runState.totalWaves) {
        runState.waveIndex++;
        const isEliteWave =
          runState.roomType === 'elite_challenge' && runState.waveIndex === runState.totalWaves;
        spawnWave(runState.roomIndex, null, isEliteWave);
      } else if (!runState.roomCleared) {
        runState.roomCleared = true;
        runState.transitionPending = true;
        fallingWeights = [];
        window.SoundFX.play('room_clear');

        if (player.stats.healPerRoom > 0) {
          player.hp = Math.min(player.stats.maxHp, player.hp + player.stats.healPerRoom);
          spawnFloatingText(
            player.x,
            player.y - 20,
            `+${player.stats.healPerRoom} PV (Soudure)`,
            '#2ecc71',
            false
          );
        }

        setTimeout(() => {
          if (!isRunning) return;
          if (runState.roomIndex >= CFG.ROOMS_PER_BIOME) {
            handleBiomeBossVictory();
          } else {
            triggerModuleSelection(() => {
              if (runState.ambushExtraModule) {
                runState.ambushExtraModule = false;
                triggerModuleSelection(() => completeCurrentRoom());
              } else {
                completeCurrentRoom();
              }
            });
          }
        }, 700);
      }
    }
  }

  function handleBiomeBossVictory() {
    const save = window.SaveManager.getData();
    const bDef = window.GAME_CONTENT.biomes[runState.biomeId];

    if (bDef.nextBiomeId && !save.unlockedBiomes.includes(bDef.nextBiomeId)) {
      save.unlockedBiomes.push(bDef.nextBiomeId);
      save.selectedBiome = bDef.nextBiomeId;
    }
    if (bDef.unlockHeroOnClear && !save.unlockedHeroes.includes(bDef.unlockHeroOnClear)) {
      save.unlockedHeroes.push(bDef.unlockHeroOnClear);
      const hName = window.GAME_CONTENT.heroes[bDef.unlockHeroOnClear].name;
      window.UI.showToast(`🎉 NOUVEAU CHÂSSIS DÉBLOQUÉ : ${hName} !`, 4500);
    }

    let keyMessage = '';
    if (bDef.order === 6) {
      if (!save.stats.heroesClearedSector6.includes(player.heroId)) {
        save.stats.heroesClearedSector6.push(player.heroId);
      }
      const keysCount = save.stats.heroesClearedSector6.length;
      if (keysCount >= 3 && !save.stats.trueEndingSeen) {
        save.stats.trueEndingSeen = true;
        save.storyChaptersSeen = 7;
        keyMessage =
          '🌟 LES 3 CLÉS D\'HORLOGERIE SONT RÉUNIES : LE RÉVEIL D\'AUTOMATIA EST ACCOMPLI !';
      } else {
        keyMessage = `🔑 Clés d'Horlogerie réunies : ${Math.min(3, keysCount)}/3 (gagnez le Secteur 6 avec 3 Châssis différents pour la Vraie Fin !).`;
      }
    }

    window.SaveManager.save();
    notifyNewAchievements();

    endRun(
      true,
      `Vous avez triomphé du Boss de ${bDef.name} ! ${
        keyMessage ||
        (bDef.nextBiomeId
          ? 'Le Secteur suivant est désormais ouvert !'
          : 'Tous les Secteurs sont sécurisés !')
      }`
    );
  }

  function triggerModuleSelection(onComplete) {
    setPaused(true);
    const allMods = window.GAME_CONTENT.modules;
    const shuffled = [...allMods].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    window.UI.showModuleChoices(choices, runState.familyCounts, (chosenMod) => {
      chosenMod.apply(player.stats, player);
      runState.equippedModules.push(chosenMod);

      const fam = chosenMod.family;
      runState.familyCounts[fam] = (runState.familyCounts[fam] || 0) + 1;
      applyFamilySynergyMilestone(fam, runState.familyCounts[fam]);

      const save = window.SaveManager.getData();
      if (!save.discoveredModules.includes(chosenMod.id)) {
        save.discoveredModules.push(chosenMod.id);
      }
      if (runState.familyCounts[fam] > (save.stats.maxSynergyTierReached || 0)) {
        save.stats.maxSynergyTierReached = runState.familyCounts[fam];
      }
      window.SaveManager.save();
      notifyNewAchievements();

      spawnFloatingText(player.x, player.y - 24, `+ ${chosenMod.name}`, chosenMod.color, true);
      setPaused(false);
      if (onComplete) onComplete();
    });
  }

  function applyFamilySynergyMilestone(family, count) {
    if (count !== 2 && count !== 4 && count !== 6) return;
    window.SoundFX.play('synergy_unlock');
    const syn = window.GAME_CONTENT.synergies[family];
    if (syn) {
      window.UI.showToast(`⚡ SYNERGIE ${family.toUpperCase()} (${count}) ACTIVÉE !`, 3600);
    }

    if (family === 'Horlogerie') {
      if (count === 2) player.stats.fireRate *= 1.18;
      if (count === 4) {
        player.stats.orbitalCogs += 1;
        player.stats.fireRate *= 1.25;
      }
      if (count === 6) {
        player.stats.orbitalCogs += 2;
        player.stats.impulseCooldownMs *= 0.70;
      }
    } else if (family === 'Cinétique') {
      if (count === 2) {
        player.stats.damage *= 1.20;
        player.stats.knockback += 25;
      }
      if (count === 4) {
        player.stats.projectileBounces += 1;
        player.stats.bossDamageMult = (player.stats.bossDamageMult || 1) * 1.25;
      }
      if (count === 6) {
        player.stats.projectileCount += 1;
        player.stats.projectilePierce += 1;
        player.stats.damage *= 1.35;
      }
    } else if (family === 'Thermique') {
      if (count === 2) player.stats.pressureRateMult *= 1.25;
      if (count === 4) player.stats.impulseDamage *= 1.30;
      if (count === 6) {
        player.stats.explosionRadius = Math.max(38, player.stats.explosionRadius + 28);
        player.stats.goldImpulseNova += 12;
      }
    } else if (family === 'Magnétisme') {
      if (count === 2) player.stats.chainLightningChance += 0.20;
      if (count === 4) player.stats.chainLightningDmg *= 1.60;
      if (count === 6) {
        player.stats.chainLightningChance = 1.0;
        player.stats.chainLightningDmg *= 1.50;
      }
    } else if (family === 'Châssis') {
      if (count === 2) {
        player.stats.maxHp += 30;
        player.hp += 30;
        player.stats.flatArmor += 2;
      }
      if (count === 4) {
        player.stats.regenPer4Sec += 3;
      }
      if (count === 6) {
        player.stats.maxHp += 80;
        player.hp += 80;
        player.stats.flatArmor += 5;
        player.stats.regenPer4Sec *= 2;
      }
    } else if (family === 'Optique') {
      if (count === 2) player.stats.critChance += 0.15;
      if (count === 4) player.stats.critDamageMult = 2.5;
      if (count === 6) {
        player.stats.critChance += 0.30;
        player.stats.critDamageMult = 3.0;
      }
    }
  }

  function completeCurrentRoom() {
    const nextRoom = runState.roomIndex + 1;
    const doors = [];

    if (nextRoom === CFG.MIDBOSS_ROOM) {
      doors.push(window.GAME_CONTENT.doorTypes.midboss_room);
    } else if (nextRoom >= CFG.ROOMS_PER_BIOME) {
      doors.push(window.GAME_CONTENT.doorTypes.warden_boss);
    } else {
      doors.push(window.GAME_CONTENT.doorTypes.combat_module);
      if (nextRoom === 3 || nextRoom === 7) {
        doors.push(window.GAME_CONTENT.doorTypes.vending_machine);
        doors.push(window.GAME_CONTENT.doorTypes.trapped_chest);
      } else if (nextRoom === 4 || nextRoom === 8) {
        doors.push(window.GAME_CONTENT.doorTypes.repair_station);
        doors.push(window.GAME_CONTENT.doorTypes.elite_challenge);
      } else {
        doors.push(window.GAME_CONTENT.doorTypes.elite_challenge);
      }
    }

    setPaused(true);
    window.UI.showDoorChoices(doors, (chosenDoor) => {
      setPaused(false);
      setupRoom(nextRoom, chosenDoor.id);
    });
  }

  function endRun(victory, reason) {
    isRunning = false;
    isPaused = false;

    const save = window.SaveManager.getData();
    const bDef = window.GAME_CONTENT.biomes[runState.biomeId];
    const recyclerLvl = (save.permanentUpgrades && save.permanentUpgrades.scrapRecycler) || 0;
    const cogsMult = (1 + recyclerLvl * 0.20) * (1 + (bDef.order - 1) * 0.25);

    const rawCogs =
      runState.roomIndex * CFG.ECONOMY.GOLDEN_COG_PER_ROOM +
      (runState.roomIndex >= CFG.MIDBOSS_ROOM ? CFG.ECONOMY.GOLDEN_COG_MIDBOSS_BONUS : 0) +
      (victory ? CFG.ECONOMY.GOLDEN_COG_VICTORY_BONUS : 0);

    const cogsEarned = Math.round(rawCogs * cogsMult);

    save.stats.runsPlayed++;
    save.stats.lastRunResult = victory ? 'victory' : 'defeat';
    save.stats.lastRunRoom = runState.roomIndex;
    if (victory) {
      save.stats.runsWon++;
      if (bDef.order > (save.stats.highestBiomeCleared || 0)) {
        save.stats.highestBiomeCleared = bDef.order;
      }
    }
    if (runState.roomIndex > save.stats.bestRoom) {
      save.stats.bestRoom = runState.roomIndex;
    }
    save.currencies.goldenCogs += cogsEarned;
    window.SaveManager.save();
    notifyNewAchievements();

    window.UI.showGameOver(victory, reason, {
      biomeName: bDef.name,
      room: runState.roomIndex,
      kills: runState.kills,
      impulses: runState.impulsesUsed,
      goldenCogsEarned: cogsEarned,
      crystalsEarned: runState.crystalsEarnedThisRun,
      modules: runState.equippedModules,
      trueEndingUnlocked: !!save.stats.trueEndingSeen && bDef.order === 6 && victory
    });
  }

  function spawnBurstParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      if (particles.length >= CFG.MAX_PARTICLES) {
        particles.shift();
      }
      const a = Math.random() * Math.PI * 2;
      const spd = 45 + Math.random() * 145;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: 3 + Math.random() * 4,
        color,
        life: 0.28 + Math.random() * 0.25,
        maxLife: 0.5
      });
    }
  }

  function spawnFloatingText(x, y, text, color, isBig) {
    if (floatingTexts.length >= CFG.MAX_FLOATING_TEXTS) {
      floatingTexts.shift();
    }
    floatingTexts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 36,
      vy: isBig ? -95 : -70,
      text,
      color: color || '#ffffff',
      size: isBig ? 17 : 13,
      life: isBig ? 0.85 : 0.65,
      maxLife: isBig ? 0.85 : 0.65
    });
  }

  function updateParticlesAndTexts(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.x += ft.vx * dt;
      ft.y += ft.vy * dt;
      ft.vy += 150 * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function renderGame() {
    if (!ctx) return;

    const currentBiomeId = runState ? runState.biomeId : 'horlogerie';
    const biomeObj =
      window.GAME_CONTENT.biomes[currentBiomeId] || window.GAME_CONTENT.biomes.horlogerie;
    const palette = biomeObj.palette;
    ctx.fillStyle = palette.bgOuter;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    ctx.save();
    const shakeX = (Math.random() - 0.5) * shakeMagnitude * 2;
    const shakeY = (Math.random() - 0.5) * shakeMagnitude * 2;
    ctx.translate(offsetX + shakeX, offsetY + shakeY);
    ctx.scale(scale, scale);

    drawArenaBackground(palette);

    if (isRunning && player) {
      steamClouds.forEach((c) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, (c.life / c.maxLife) * 0.55);
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      hazards.forEach((h) => window.Entities.drawHazard(ctx, h, elapsedSec));
      deployables.forEach((d) => window.Entities.drawDeployable(ctx, d, elapsedSec));
      fallingWeights.forEach((fw) => window.Entities.drawFallingWeight(ctx, fw));

      spawnQueue.forEach((s) => {
        const pulse = 0.5 + Math.sin(elapsedSec * 18) * 0.35;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 107, 107, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s.x - 10, s.y);
        ctx.lineTo(s.x + 10, s.y);
        ctx.moveTo(s.x, s.y - 10);
        ctx.lineTo(s.x, s.y + 10);
        ctx.stroke();
        ctx.restore();
      });

      pickups.forEach((p) => window.Entities.drawPickup(ctx, p, elapsedSec));

      shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4.5;
        ctx.globalAlpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      enemies.forEach((e) => window.Entities.drawEnemy(ctx, e, elapsedSec));
      window.Entities.drawPlayer(ctx, player, elapsedSec);

      lightningArcs.forEach((arc) => {
        ctx.save();
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.lineTo(
          (arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 14,
          (arc.y1 + arc.y2) / 2
        );
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();
        ctx.restore();
      });

      projectiles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1e120a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.font = `900 ${ft.size}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, Math.min(1, (ft.life / ft.maxLife) * 1.4));
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1e120a';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });
    }

    ctx.restore();

    if (isRunning && !isPaused && touchInput.active) {
      drawTouchJoystick();
    }

    if (screenFlashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 71, 87, ${screenFlashAlpha})`;
      ctx.fillRect(0, 0, viewWidth, viewHeight);
      ctx.restore();
    }
  }

  function drawArenaBackground(palette) {
    const w = CFG.ARENA_WIDTH;
    const h = CFG.ARENA_HEIGHT;
    const wall = CFG.WALL_THICKNESS;

    ctx.fillStyle = palette.bgFloor;
    ctx.fillRect(wall, wall, w - wall * 2, h - wall * 2);

    window.Entities.drawGear(
      ctx,
      w * 0.28,
      h * 0.28,
      68,
      52,
      12,
      elapsedSec * 0.25,
      palette.gearDecor,
      null
    );
    window.Entities.drawGear(
      ctx,
      w * 0.72,
      h * 0.68,
      78,
      60,
      14,
      -elapsedSec * 0.2,
      palette.gearDecor,
      null
    );

    ctx.strokeStyle = palette.bgGrid;
    ctx.lineWidth = 2;
    const tile = 52;
    for (let x = wall; x < w - wall; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, wall);
      ctx.lineTo(x, h - wall);
      ctx.stroke();
    }
    for (let y = wall; y < h - wall; y += tile) {
      ctx.beginPath();
      ctx.moveTo(wall, y);
      ctx.lineTo(w - wall, y);
      ctx.stroke();
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1e120a';
    ctx.fillStyle = palette.wallFill;

    ctx.beginPath();
    ctx.rect(0, 0, w, wall);
    ctx.rect(0, h - wall, w, wall);
    ctx.rect(0, wall, wall, h - wall * 2);
    ctx.rect(w - wall, wall, wall, h - wall * 2);
    ctx.fill();

    ctx.strokeStyle = palette.wallTrim;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(wall, wall, w - wall * 2, h - wall * 2);

    const doorW = 84;
    ctx.fillStyle = runState && runState.roomCleared ? '#2ecc71' : palette.wallTrim;
    ctx.fillRect((w - doorW) / 2, 4, doorW, wall - 6);
    ctx.strokeStyle = '#1e120a';
    ctx.strokeRect((w - doorW) / 2, 4, doorW, wall - 6);
  }

  function drawTouchJoystick() {
    const isGold = player && player.pressure >= CFG.PLAYER.PRESSURE_GOLD_MIN;
    ctx.save();
    ctx.beginPath();
    ctx.arc(touchInput.originX, touchInput.originY, touchInput.maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = isGold ? 'rgba(255, 211, 42, 0.16)' : 'rgba(255, 255, 255, 0.10)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isGold ? 'rgba(255, 211, 42, 0.7)' : 'rgba(245, 176, 65, 0.45)';
    ctx.stroke();

    const knobX = touchInput.originX + touchInput.dx * touchInput.dist * touchInput.maxRadius;
    const knobY = touchInput.originY + touchInput.dy * touchInput.dist * touchInput.maxRadius;

    ctx.beginPath();
    ctx.arc(knobX, knobY, 22, 0, Math.PI * 2);
    ctx.fillStyle = isGold ? '#ffd32a' : '#f39c12';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#24140e';
    ctx.stroke();
    ctx.restore();
  }

  function setPaused(val) {
    isPaused = !!val;
  }

  function toggleGodMode() {
    godMode = !godMode;
    return godMode;
  }

  function jumpToRoomDebug(roomNum) {
    if (!isRunning) startNewRun();
    const rType =
      roomNum === CFG.MIDBOSS_ROOM
        ? 'midboss_room'
        : roomNum >= CFG.ROOMS_PER_BIOME
        ? 'warden_boss'
        : 'combat_module';
    setupRoom(roomNum, rType);
  }

  return {
    init,
    startNewRun,
    setPaused,
    endRun,
    toggleGodMode,
    jumpToRoomDebug,
    triggerModuleSelection,
    getEquippedModules: () => (runState ? runState.equippedModules : []),
    getFamilyCounts: () => (runState ? runState.familyCounts : {})
  };
})();
