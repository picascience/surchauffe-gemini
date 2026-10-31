/**
 * ENTITIES.JS — Rendu 100% Canvas 2D procédural (Phase 4) :
 * 6 Engins jouables, 4 Déployables (Prismes, Mines, Bulle Temporelle, Fleurs-Canons),
 * 30 Automates/Boss (incluant Cœur-Zéro, Boss Final) et Pièges des 6 Biomes.
 * Strictement aucun visage, aucun œil, aucune silhouette vivante.
 */
window.Entities = (function () {
  const CFG = window.GAME_CONFIG;

  function drawShadow(ctx, x, y, rx, ry) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 6, 4, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x, y + ry * 0.85, rx, ry * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGear(ctx, x, y, outerR, innerR, teeth, angle, fillStyle, strokeStyle, lineWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    const step = (Math.PI * 2) / (teeth * 2);
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = i * step;
      const gx = Math.cos(a) * r;
      const gy = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.lineWidth = lineWidth || 3;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHexagon(ctx, x, y, r, angle, fillStyle, strokeStyle, lineWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = Math.cos(a) * r;
      const hy = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.lineWidth = lineWidth || 3.5;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDiamond(ctx, x, y, rx, ry, angle, fillStyle, strokeStyle, lineWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -ry);
    ctx.lineTo(rx, 0);
    ctx.lineTo(0, ry);
    ctx.lineTo(-rx, 0);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    if (strokeStyle) {
      ctx.lineWidth = lineWidth || 3;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- DESSIN DES 6 ENGINS JOUABLES ---
  function drawPlayer(ctx, player, timeSec) {
    const isFlashing = player.flashTimer > 0;
    const isImpulsing = player.impulseTimer > 0;
    const isGold = player.pressure >= CFG.PLAYER.PRESSURE_GOLD_MIN;
    const breathe = 1 + Math.sin(timeSec * 7) * 0.04;
    const sx = player.scaleX * breathe;
    const sy = player.scaleY / breathe;

    drawShadow(ctx, player.x, player.y + 4, player.radius * 1.05, player.radius * 0.7);

    // Aura d'Impulsion ou Halo de Zone Dorée
    if (isImpulsing) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(timeSec * 22);
      const auraR = player.stats.impulseRadius;
      const grad = ctx.createRadialGradient(0, 0, auraR * 0.2, 0, 0, auraR);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.1)');
      grad.addColorStop(0.75, 'rgba(255, 211, 42, 0.45)');
      grad.addColorStop(1, 'rgba(255, 107, 53, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, auraR, 0, Math.PI * 2);
      ctx.fill();

      if (player.heroId === 'toupillon') {
        drawGear(
          ctx,
          0,
          0,
          auraR * 0.92,
          auraR * 0.68,
          10,
          0,
          'rgba(255, 230, 109, 0.35)',
          '#ffd32a',
          2.5
        );
      }
      ctx.restore();
    } else if (isGold) {
      const pulseR = player.radius + 7 + Math.sin(timeSec * 14) * 3;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.78)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, pulseR, timeSec * 4, timeSec * 4 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Pignons Satellites (Module ou Synergie Horlogerie 4/6)
    if (player.stats.orbitalCogs > 0) {
      const count = player.stats.orbitalCogs;
      const orbitR = player.radius + 28;
      for (let i = 0; i < count; i++) {
        const a = timeSec * 4.2 + (i * Math.PI * 2) / count;
        const ox = player.x + Math.cos(a) * orbitR;
        const oy = player.y + Math.sin(a) * orbitR;
        drawGear(ctx, ox, oy, 11, 7, 6, -timeSec * 10, '#feca57', '#2c1810', 2.5);
      }
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(sx, sy);

    const outline = '#1e120a';

    if (player.heroId === 'lumignon') {
      // ENGIN #2 : LUMIGNON-7 (Drone-Lanterne Prismatique)
      const hoverY = Math.sin(timeSec * 6) * 2.5;
      ctx.translate(0, hoverY);

      drawHexagon(
        ctx,
        0,
        0,
        player.radius + 2,
        -timeSec * 2.5,
        isFlashing ? '#ffffff' : '#1dd1a1',
        outline,
        3.5
      );

      ctx.save();
      ctx.rotate(player.aimAngle);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#48dbfb';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.radius + 7, 0);
      ctx.lineTo(player.radius - 6, -9);
      ctx.lineTo(player.radius - 6, 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      drawDiamond(
        ctx,
        0,
        0,
        11,
        11,
        timeSec * 4,
        isFlashing ? '#ffffff' : isGold ? '#ffd32a' : '#f368e0',
        outline,
        3
      );
      ctx.beginPath();
      ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (player.heroId === 'boum_chariot') {
      // ENGIN #3 : BOUM-CHARIOT (Mortier Blindé à Chenilles)
      ctx.save();
      ctx.rotate(player.moveAngle || 0);
      ctx.fillStyle = '#2f3640';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-player.radius, -player.radius, player.radius * 2, 8, 3);
      ctx.roundRect(-player.radius, player.radius - 8, player.radius * 2, 8, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isFlashing ? '#ffffff' : '#ff5252';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(
        -player.radius * 0.78,
        -player.radius * 0.72,
        player.radius * 1.56,
        player.radius * 1.44,
        7
      );
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(player.aimAngle);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#ffb142';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(0, -7, player.radius + 5, 14, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : isGold ? '#ffd32a' : '#ffda79';
      ctx.fill();
      ctx.stroke();
    } else if (player.heroId === 'bobine_z') {
      // ENGIN #4 : BOBINE-Z (Sphère Magnétique de Faraday)
      const hoverY = Math.sin(timeSec * 8) * 2.5;
      ctx.translate(0, hoverY);

      for (let r = 0; r < 2; r++) {
        ctx.save();
        ctx.rotate(timeSec * (r === 0 ? 4.5 : -4.5) + (r * Math.PI) / 2);
        ctx.strokeStyle = isFlashing ? '#ffffff' : '#00f2fe';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, player.radius + 4, player.radius * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, player.radius * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#3867d6';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = outline;
      ctx.stroke();

      ctx.save();
      ctx.rotate(player.aimAngle);
      drawDiamond(ctx, player.radius, 0, 7, 5, 0, '#00f2fe', outline, 2.5);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : isGold ? '#ffd32a' : '#00f2fe';
      ctx.fill();
      ctx.stroke();
    } else if (player.heroId === 'sablier_vapeur') {
      // ENGIN #5 : SABLIER-VAPEUR (Automate Chronométré)
      drawGear(
        ctx,
        0,
        0,
        player.radius + 3,
        player.radius - 2,
        12,
        -timeSec * 3,
        isFlashing ? '#ffffff' : '#d35400',
        outline,
        3.5
      );

      ctx.fillStyle = isFlashing ? '#ffffff' : '#feca57';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, -13);
      ctx.lineTo(12, -13);
      ctx.lineTo(0, 0);
      ctx.lineTo(12, 13);
      ctx.lineTo(-12, 13);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(player.aimAngle);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#48dbfb';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(player.radius + 8, 0);
      ctx.lineTo(0, -4);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = isGold ? '#ffd32a' : '#ffffff';
      ctx.fill();
      ctx.stroke();
    } else if (player.heroId === 'graine_acier') {
      // ENGIN #6 : GRAINE-ACIER (Capsulier Botanique Mécanique)
      const petalCount = 6;
      for (let i = 0; i < petalCount; i++) {
        const a = timeSec * 2.5 + (i * Math.PI * 2) / petalCount;
        const px = Math.cos(a) * (player.radius * 0.72);
        const py = Math.sin(a) * (player.radius * 0.72);
        drawDiamond(
          ctx,
          px,
          py,
          8,
          6,
          a,
          isFlashing ? '#ffffff' : '#f39c12',
          outline,
          2.5
        );
      }

      drawHexagon(
        ctx,
        0,
        0,
        player.radius * 0.75,
        -timeSec * 2,
        isFlashing ? '#ffffff' : '#2ecc71',
        outline,
        3.5
      );

      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : isGold ? '#ffd32a' : '#ffda79';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = outline;
      ctx.stroke();
    } else {
      // ENGIN #1 : TOUPILLON MK-I (Toupie Blindée Cinétique)
      const spinSpeed = isImpulsing ? 26 : 8;
      drawGear(
        ctx,
        0,
        0,
        player.radius + 3,
        player.radius - 3,
        8,
        timeSec * spinSpeed,
        isFlashing ? '#ffffff' : '#f39c12',
        outline,
        3.5
      );

      ctx.beginPath();
      ctx.arc(0, 0, player.radius - 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#e67e22';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = outline;
      ctx.stroke();

      ctx.save();
      ctx.rotate(player.aimAngle);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#576574';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(6, -5, 16, 10, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const corePulse = 6.5 + Math.sin(timeSec * 12) * 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : isGold ? '#ffd32a' : '#00f2fe';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-2, -2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      const antWave = Math.sin(timeSec * 15) * 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -player.radius + 5);
      ctx.quadraticCurveTo(antWave, -player.radius - 5, antWave * 1.3, -player.radius - 9);
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(antWave * 1.3, -player.radius - 9, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isGold ? '#ffd32a' : '#00f2fe';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- DESSIN DES 4 ENGINS DÉPLOYÉS PAR LE JOUEUR ---
  function drawDeployable(ctx, d, timeSec) {
    ctx.save();
    if (d.type === 'prism_turret') {
      drawShadow(ctx, d.x, d.y + 4, 15, 9);
      drawHexagon(ctx, d.x, d.y, 15, timeSec * 2, '#1dd1a1', '#1e120a', 3);
      drawDiamond(
        ctx,
        d.x,
        d.y,
        10,
        10,
        -timeSec * 5,
        d.isGold ? '#ffd32a' : '#48dbfb',
        '#1e120a',
        2.5
      );
    } else if (d.type === 'spring_mine') {
      drawShadow(ctx, d.x, d.y + 3, 12, 7);
      const blink = Math.sin(timeSec * 16) > 0;
      drawGear(ctx, d.x, d.y, 13, 9, 8, timeSec * 1.5, '#576574', '#1e120a', 2.5);
      ctx.beginPath();
      ctx.arc(d.x, d.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = blink ? '#ff4757' : '#ffd32a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1e120a';
      ctx.stroke();
    } else if (d.type === 'chrono_field') {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.fillStyle = d.isGold ? 'rgba(254, 202, 87, 0.18)' : 'rgba(72, 219, 251, 0.16)';
      ctx.beginPath();
      ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = d.isGold ? '#ffd32a' : '#48dbfb';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, d.radius, timeSec * 1.5, timeSec * 1.5 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (d.type === 'bloom_turret') {
      drawShadow(ctx, d.x, d.y + 4, 15, 9);
      for (let p = 0; p < 5; p++) {
        const a = timeSec * 3 + (p * Math.PI * 2) / 5;
        drawDiamond(
          ctx,
          d.x + Math.cos(a) * 11,
          d.y + Math.sin(a) * 11,
          7,
          5,
          a,
          d.isGold ? '#ffd32a' : '#f39c12',
          '#1e120a',
          2
        );
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#1e120a';
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- DESSIN DES 30 AUTOMATES ENNEMIS & BOSS ---
  function drawEnemy(ctx, e, timeSec) {
    const isFlashing = e.flashTimer > 0;
    const breathe = 1 + Math.sin(timeSec * 6 + e.seed) * 0.045;
    const sx = e.scaleX * breathe;
    const sy = e.scaleY / breathe;

    if (
      e.type === 'grand_carillon' ||
      e.type === 'vulcain_9000' ||
      e.type === 'alambic_ambulant'
    ) {
      ctx.save();
      ctx.fillStyle = e.type === 'vulcain_9000' ? '#2f181b' : '#3b2518';
      ctx.strokeStyle = '#1e120a';
      ctx.lineWidth = 3.5;
      const railY = e.y - 6;
      ctx.fillRect(
        CFG.WALL_THICKNESS + 8,
        railY,
        CFG.ARENA_WIDTH - (CFG.WALL_THICKNESS + 8) * 2,
        12
      );
      ctx.strokeRect(
        CFG.WALL_THICKNESS + 8,
        railY,
        CFG.ARENA_WIDTH - (CFG.WALL_THICKNESS + 8) * 2,
        12
      );
      ctx.restore();
    }

    drawShadow(ctx, e.x, e.y + 4, e.radius * 1.05, e.radius * 0.65);

    if (e.isElite) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 107, 107, 0.78)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 6, -timeSec * 3, -timeSec * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (e.state === 'charging' && e.targetX !== undefined) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.68)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.targetX, e.targetY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(sx, sy);

    const fillMain = isFlashing ? '#ffffff' : e.colors.main;
    const fillSec = isFlashing ? '#ffffff' : e.colors.secondary;
    const fillCore = isFlashing ? '#ffffff' : e.colors.core;
    const outline = '#1e120a';

    if (
      e.type === 'ecrou_errant' ||
      e.type === 'charbon_roulant' ||
      e.type === 'drone_bobine' ||
      e.type === 'fiole_instable'
    ) {
      drawHexagon(ctx, 0, 0, e.radius, e.angle, fillMain, outline, 3.5);
      drawHexagon(ctx, 0, 0, e.radius * 0.58, -e.angle, fillSec, outline, 2.5);
      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = fillCore;
      ctx.fill();
      ctx.stroke();
    } else if (
      e.type === 'ressort_bondissant' ||
      e.type === 'scarabee_quartz' ||
      e.type === 'wagon_belier' ||
      e.type === 'pompe_piston'
    ) {
      const compress = e.state === 'charging' ? 0.68 : 1;
      ctx.scale(1 / compress, compress);
      if (e.type === 'scarabee_quartz') {
        drawDiamond(ctx, 0, 0, e.radius * 1.15, e.radius * 0.9, e.angle, fillMain, outline, 3.5);
        drawDiamond(ctx, 0, 0, e.radius * 0.6, e.radius * 0.5, 0, fillSec, outline, 2.5);
      } else {
        ctx.fillStyle = fillMain;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(-e.radius, -e.radius * 0.75, e.radius * 2, e.radius * 1.5, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = fillSec;
        ctx.fillRect(-e.radius + 3, -3, e.radius * 2 - 6, 6);
      }
      ctx.fillStyle = fillCore;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (
      e.type === 'tourelle_rivet' ||
      e.type === 'bourgeon_laser' ||
      e.type === 'liane_bobine' ||
      e.type === 'fourneau_mortier' ||
      e.type === 'cube_donnees' ||
      e.type === 'relais_arc' ||
      e.type === 'alambic_tourelle' ||
      e.type === 'sentinelle_or' ||
      e.type === 'prisme_astral'
    ) {
      for (let i = 0; i < 4; i++) {
        const petalA = (i * Math.PI) / 2 + timeSec * (e.behavior === 'pulse_plant' ? 2.5 : 0.5);
        ctx.save();
        ctx.rotate(petalA);
        ctx.fillStyle = fillSec;
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(0, -5, e.radius + 4, 10, 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = fillMain;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = fillCore;
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'scie_rail' || e.type === 'pendule_lame') {
      drawGear(ctx, 0, 0, e.radius + 3, e.radius - 4, 10, timeSec * 16, fillMain, outline, 3);
      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = fillSec;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = outline;
      ctx.stroke();
    } else if (e.isMidBoss) {
      // SOUS-BOSS DES BIOMES 1 À 6
      drawGear(ctx, 0, 0, e.radius + 5, e.radius - 3, 12, -timeSec * 3.5, fillSec, outline, 4);
      drawHexagon(ctx, 0, 0, e.radius * 0.85, timeSec * 1.5, fillMain, outline, 4);
      drawDiamond(ctx, 0, 0, 12, 12, timeSec * 4, fillCore, outline, 3);
    } else if (e.type === 'grand_carillon') {
      // BOSS 1 : LE GRAND CARILLON DÉTRAQUÉ
      const phase = e.bossPhase || 1;
      const bellSwing =
        Math.sin(timeSec * (phase === 3 ? 16 : 8)) * (e.ringingTimer > 0 ? 0.32 : 0.08);

      drawGear(
        ctx,
        0,
        0,
        e.radius + 10,
        e.radius + 1,
        16,
        timeSec * (phase * 1.4),
        isFlashing ? '#ffffff' : '#b86b35',
        outline,
        4
      );

      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * (e.radius * 0.88), -6);
        ctx.rotate(side * bellSwing);
        ctx.fillStyle = isFlashing ? '#ffffff' : '#ffd32a';
        ctx.strokeStyle = outline;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-13, -10);
        ctx.lineTo(13, -10);
        ctx.lineTo(18, 14);
        ctx.lineTo(-18, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.86, 0, Math.PI * 2);
      ctx.fillStyle = fillMain;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, e.radius * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#24140e';
      ctx.fill();
      ctx.strokeStyle = fillSec;
      ctx.stroke();

      ctx.save();
      ctx.rotate(timeSec * (1.8 * phase));
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -e.radius * 0.48);
      ctx.stroke();
      ctx.restore();

      const phaseColor = phase === 1 ? '#00f2fe' : phase === 2 ? '#ff9f43' : '#ff4757';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : phaseColor;
      ctx.fill();
      ctx.stroke();
    } else if (e.type === 'orchidee_prismatique' || e.type === 'astrolabe_quantique') {
      // BOSS 2 (ORCHIDÉE PRISMATIQUE) & BOSS 4 (ASTROLABE MAGNÉTIQUE)
      const phase = e.bossPhase || 1;
      const petalCount = 6;
      for (let p = 0; p < petalCount; p++) {
        const a = timeSec * (1.2 + phase * 0.5) + (p * Math.PI * 2) / petalCount;
        const px = Math.cos(a) * (e.radius * 0.78);
        const py = Math.sin(a) * (e.radius * 0.78);
        drawDiamond(
          ctx,
          px,
          py,
          18,
          11,
          a + Math.PI / 2,
          isFlashing ? '#ffffff' : p % 2 === 0 ? fillSec : fillCore,
          outline,
          3.5
        );
      }

      drawHexagon(ctx, 0, 0, e.radius * 0.72, -timeSec * 1.5, fillMain, outline, 4);
      drawDiamond(
        ctx,
        0,
        0,
        16,
        16,
        timeSec * 3,
        isFlashing ? '#ffffff' : phase === 3 ? '#ffd32a' : fillCore,
        outline,
        3
      );
    } else if (e.type === 'vulcain_9000' || e.type === 'alambic_ambulant') {
      // BOSS 3 (VULCAIN-9000) & BOSS 5 (LE GRAND DISTILLATEUR)
      const phase = e.bossPhase || 1;
      drawGear(
        ctx,
        0,
        0,
        e.radius + 8,
        e.radius - 2,
        14,
        -timeSec * (1.5 * phase),
        isFlashing ? '#ffffff' : fillSec,
        outline,
        4
      );
      drawHexagon(ctx, 0, 0, e.radius * 0.88, 0, fillMain, outline, 4);

      ctx.fillStyle = isFlashing ? '#ffffff' : phase === 3 ? '#ffffff' : fillCore;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-e.radius * 0.48, -e.radius * 0.35, e.radius * 0.96, e.radius * 0.7, 6);
      ctx.fill();
      ctx.stroke();

      for (let b = -12; b <= 12; b += 8) {
        ctx.beginPath();
        ctx.moveTo(b, -e.radius * 0.35);
        ctx.lineTo(b, e.radius * 0.35);
        ctx.stroke();
      }
    } else if (e.type === 'coeur_zero') {
      // BOSS FINAL (SECTEUR 6) : CŒUR-ZÉRO, L'ARCHITECTE AUTOMATIQUE
      const phase = e.bossPhase || 1;
      drawGear(
        ctx,
        0,
        0,
        e.radius + 10,
        e.radius + 1,
        18,
        timeSec * (1.2 * phase),
        isFlashing ? '#ffffff' : '#feca57',
        outline,
        4
      );
      drawGear(
        ctx,
        0,
        0,
        e.radius * 0.76,
        e.radius * 0.62,
        12,
        -timeSec * (2.0 * phase),
        isFlashing ? '#ffffff' : '#ff9f43',
        outline,
        3.5
      );
      drawHexagon(
        ctx,
        0,
        0,
        e.radius * 0.48,
        timeSec * 3,
        isFlashing ? '#ffffff' : '#1e120a',
        '#00f2fe',
        3
      );
      drawDiamond(
        ctx,
        0,
        0,
        15,
        15,
        -timeSec * 5,
        isFlashing ? '#ffffff' : phase === 3 ? '#ff4757' : '#00f2fe',
        outline,
        2.5
      );
    } else {
      // Repli générique géométrique sûr
      drawHexagon(ctx, 0, 0, e.radius, e.angle, fillMain, outline, 3.5);
      drawDiamond(ctx, 0, 0, e.radius * 0.5, e.radius * 0.5, -e.angle, fillCore, outline, 2.5);
    }

    ctx.restore();

    if (e.hp < e.maxHp && !e.isBoss) {
      const bw = Math.max(26, e.radius * 1.7);
      const bh = 5;
      const bx = e.x - bw / 2;
      const by = e.y - e.radius - 13;
      ctx.fillStyle = 'rgba(20, 12, 8, 0.85)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = e.isElite ? '#ff4757' : '#ff9f43';
      ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), bh);
    }
  }

  function drawFallingWeight(ctx, fw) {
    ctx.save();
    const progress = 1 - Math.max(0, fw.timer / fw.maxTimer);

    ctx.beginPath();
    ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 71, 87, ${0.15 + progress * 0.35})`;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = fw.color || '#ff4757';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(fw.x, fw.y, fw.radius * progress, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd32a';
    ctx.lineWidth = 2;
    ctx.stroke();

    const dropY = fw.y - (1 - progress) * 240;
    ctx.translate(fw.x, dropY);
    if (fw.style === 'crystal') {
      drawDiamond(ctx, 0, 0, 18, 26, 0, '#48dbfb', '#1e120a', 3.5);
    } else if (fw.style === 'slag') {
      ctx.fillStyle = '#ff5252';
      ctx.strokeStyle = '#1e120a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#4b5563';
      ctx.strokeStyle = '#1e120a';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-20, -24, 40, 44, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-14, -6, 28, 10);
    }
    ctx.restore();
  }

  // --- DESSIN DES PIÈGES MÉCANIQUES DES 6 BIOMES ---
  function drawHazard(ctx, h, timeSec) {
    ctx.save();
    if (h.type === 'spinning_cog') {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24, 15, 10, 0.65)';
      ctx.fill();
      drawGear(
        ctx,
        h.x,
        h.y,
        h.radius,
        h.radius * 0.72,
        10,
        timeSec * 5.5 * h.dir,
        '#7f8c8d',
        '#24140e',
        3.5
      );
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#d35400';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#24140e';
      ctx.stroke();
    } else if (h.type === 'steam_vent' || h.type === 'tesla_coil') {
      const isTesla = h.type === 'tesla_coil';
      ctx.translate(h.x, h.y);
      ctx.beginPath();
      ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
      ctx.fillStyle =
        h.state === 'erupting'
          ? isTesla
            ? '#00f2fe'
            : '#ff6b6b'
          : isTesla
          ? '#341f97'
          : '#4a3525';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#24140e';
      ctx.stroke();

      if (h.state === 'warning') {
        const warnAlpha = 0.35 + Math.sin(timeSec * 20) * 0.25;
        ctx.beginPath();
        ctx.arc(0, 0, h.dmgRadius, 0, Math.PI * 2);
        ctx.fillStyle = isTesla
          ? `rgba(0, 242, 254, ${warnAlpha})`
          : `rgba(255, 159, 67, ${warnAlpha})`;
        ctx.fill();
        ctx.strokeStyle = isTesla ? '#00f2fe' : '#ff9f43';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (h.state === 'erupting') {
        ctx.beginPath();
        ctx.arc(0, 0, h.dmgRadius, 0, Math.PI * 2);
        ctx.fillStyle = isTesla ? 'rgba(0, 242, 254, 0.5)' : 'rgba(236, 240, 241, 0.55)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else if (h.type === 'resin_tile') {
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(243, 156, 18, 0.32)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#f39c12';
      ctx.stroke();
    } else if (h.type === 'laser_prism') {
      const beamLen = h.beamLength || 105;
      const angle = timeSec * 1.3 * h.dir;
      const bx = h.x + Math.cos(angle) * beamLen;
      const by = h.y + Math.sin(angle) * beamLen;

      ctx.strokeStyle = 'rgba(243, 104, 224, 0.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(bx, by);
      ctx.stroke();

      drawDiamond(ctx, h.x, h.y, 16, 16, angle, '#48dbfb', '#1e120a', 3);
    } else if (h.type === 'lava_pool') {
      const pulse = 1 + Math.sin(timeSec * 5) * 0.05;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 82, 82, 0.52)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffda79';
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPickup(ctx, p, timeSec) {
    const bob = Math.sin(timeSec * 8 + p.seed) * 2.5;
    drawShadow(ctx, p.x, p.y + 4, 7, 4);
    if (p.kind === 'heal_oil') {
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      ctx.fillStyle = '#2ecc71';
      ctx.strokeStyle = '#1e120a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-7, -8, 14, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    } else if (p.kind === 'ether_crystal') {
      drawDiamond(
        ctx,
        p.x,
        p.y + bob,
        9,
        12,
        Math.sin(timeSec * 4) * 0.2,
        '#00f2fe',
        '#1e120a',
        3
      );
    } else {
      const isGold = p.value >= 25;
      drawHexagon(
        ctx,
        p.x,
        p.y + bob,
        isGold ? 9.5 : 7.5,
        timeSec * 3 + p.seed,
        isGold ? '#ffd32a' : '#f39c12',
        '#24140e',
        2.5
      );
      ctx.beginPath();
      ctx.arc(p.x, p.y + bob, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#24140e';
      ctx.fill();
    }
  }

  return {
    drawGear,
    drawHexagon,
    drawDiamond,
    drawPlayer,
    drawDeployable,
    drawEnemy,
    drawFallingWeight,
    drawHazard,
    drawPickup
  };
})();
