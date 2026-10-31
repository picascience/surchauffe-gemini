/**
 * AUDIO.JS — Synthétiseur de bruitages 100% Web Audio API (Zéro musique, Zéro fichier externe)
 * Déverrouillage automatique au premier tap pour iOS Safari + Muet mémorisé dans la sauvegarde.
 */
window.SoundFX = (function () {
  let ctx = null;
  let unlocked = false;
  let boltCombo = 0;
  let lastBoltTime = 0;

  function ensureContext() {
    if (window.SaveManager && window.SaveManager.getData().settings.muted) {
      return null;
    }
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function unlockiOSAudio() {
    if (unlocked) return;
    const c = ensureContext();
    if (!c) return;
    try {
      const buffer = c.createBuffer(1, 1, 22050);
      const source = c.createBufferSource();
      source.buffer = buffer;
      source.connect(c.destination);
      source.start(0);
      unlocked = true;
    } catch (e) {}
  }

  window.addEventListener('touchstart', unlockiOSAudio, { passive: true });
  window.addEventListener('mousedown', unlockiOSAudio, { passive: true });
  window.addEventListener('keydown', unlockiOSAudio, { passive: true });

  function playTone(freqStart, freqEnd, duration, type, volume, delay = 0) {
    const c = ensureContext();
    if (!c) return;

    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(Math.max(20, freqStart), now);
    if (freqEnd && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  function playNoiseBurst(duration, volume, filterFreq = 1200, delay = 0) {
    const c = ensureContext();
    if (!c) return;

    const now = c.currentTime + delay;
    const bufferSize = Math.floor(c.sampleRate * duration);
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = c.createBufferSource();
    noise.buffer = buffer;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);

    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  function play(soundName) {
    if (window.SaveManager && window.SaveManager.getData().settings.muted) return;

    switch (soundName) {
      case 'ui_click':
        playTone(520, 780, 0.045, 'triangle', 0.14);
        break;

      case 'ui_upgrade':
        playTone(330, 660, 0.08, 'triangle', 0.18, 0);
        playTone(440, 880, 0.11, 'sine', 0.18, 0.06);
        playNoiseBurst(0.07, 0.08, 2200, 0.02);
        break;

      case 'shoot':
        playTone(360, 140, 0.055, 'triangle', 0.09);
        playNoiseBurst(0.03, 0.04, 1800);
        break;

      case 'shoot_laser':
        // Faisceau optique de Lumignon-7
        playTone(980, 420, 0.065, 'sine', 0.10);
        playTone(1320, 660, 0.045, 'triangle', 0.06);
        break;

      case 'shoot_mortar':
        // Tir d'obus lourd de Boum-Chariot
        playTone(180, 65, 0.12, 'square', 0.13);
        playNoiseBurst(0.09, 0.11, 750);
        break;

      case 'explosion':
        // Explosion thermique d'obus ou de mine
        playTone(130, 34, 0.24, 'sawtooth', 0.20);
        playNoiseBurst(0.22, 0.18, 520);
        break;

      case 'hit':
        playTone(210, 95, 0.05, 'square', 0.08);
        break;

      case 'crit':
        playTone(680, 260, 0.08, 'sawtooth', 0.12);
        playTone(920, 480, 0.06, 'triangle', 0.10, 0.02);
        break;

      case 'enemy_destroy':
        playTone(190, 58, 0.14, 'sawtooth', 0.15);
        playNoiseBurst(0.11, 0.12, 950);
        break;

      case 'pickup_bolt': {
        const nowMs = performance.now();
        if (nowMs - lastBoltTime < 450) {
          boltCombo = Math.min(10, boltCombo + 1);
        } else {
          boltCombo = 0;
        }
        lastBoltTime = nowMs;
        const baseF = 580 + boltCombo * 48;
        playTone(baseF, baseF * 1.25, 0.065, 'sine', 0.11);
        break;
      }

      case 'pickup_heal':
        playTone(380, 560, 0.09, 'sine', 0.16, 0);
        playTone(560, 840, 0.12, 'sine', 0.16, 0.07);
        break;

      case 'level_up':
        playTone(440, 440, 0.08, 'triangle', 0.18, 0);
        playTone(554, 554, 0.08, 'triangle', 0.18, 0.07);
        playTone(659, 880, 0.16, 'triangle', 0.20, 0.14);
        break;

      case 'synergy_unlock':
        playTone(523.25, 659.25, 0.1, 'triangle', 0.2, 0);
        playTone(659.25, 1046.5, 0.2, 'sine', 0.22, 0.08);
        break;

      case 'impulse':
        playNoiseBurst(0.18, 0.16, 1500);
        playTone(220, 620, 0.18, 'sawtooth', 0.14);
        break;

      case 'impulse_gold':
        playNoiseBurst(0.22, 0.20, 2000);
        playTone(320, 880, 0.22, 'sawtooth', 0.18, 0);
        playTone(640, 1280, 0.18, 'triangle', 0.16, 0.05);
        break;

      case 'player_hurt':
        playTone(150, 52, 0.20, 'sawtooth', 0.22);
        playNoiseBurst(0.15, 0.18, 600);
        break;

      case 'carillon_bell':
        playTone(293.66, 290, 0.45, 'triangle', 0.24, 0);
        playTone(587.33, 580, 0.35, 'sine', 0.15, 0);
        playTone(880, 440, 0.22, 'sine', 0.10, 0.02);
        break;

      case 'crystal_chime':
        // Résonance cristalline de l'Orchidée Prismatique (Boss 2)
        playTone(880, 1320, 0.28, 'sine', 0.18, 0);
        playTone(1174, 1760, 0.25, 'triangle', 0.14, 0.06);
        break;

      case 'boss_slam':
        playTone(110, 38, 0.28, 'square', 0.24);
        playNoiseBurst(0.22, 0.20, 480);
        break;

      case 'boss_alert':
        playTone(240, 480, 0.22, 'sawtooth', 0.18, 0);
        playTone(240, 480, 0.26, 'sawtooth', 0.18, 0.25);
        break;

      case 'room_clear':
        playNoiseBurst(0.12, 0.10, 1400);
        playTone(400, 600, 0.12, 'triangle', 0.14);
        break;

      case 'victory':
        playTone(440, 440, 0.10, 'triangle', 0.20, 0);
        playTone(554, 554, 0.10, 'triangle', 0.20, 0.09);
        playTone(659, 659, 0.10, 'triangle', 0.20, 0.18);
        playTone(880, 880, 0.28, 'triangle', 0.24, 0.27);
        break;

      case 'gameover':
        playTone(300, 180, 0.18, 'triangle', 0.18, 0);
        playTone(180, 75, 0.32, 'sawtooth', 0.18, 0.16);
        break;
    }
  }

  function toggleMute() {
    const save = window.SaveManager.getData();
    save.settings.muted = !save.settings.muted;
    window.SaveManager.save();
    if (!save.settings.muted) {
      unlockiOSAudio();
      play('ui_click');
    }
    return save.settings.muted;
  }

  function isMuted() {
    return window.SaveManager ? !!window.SaveManager.getData().settings.muted : false;
  }

  return {
    play,
    toggleMute,
    isMuted,
    unlockiOSAudio
  };
})();
