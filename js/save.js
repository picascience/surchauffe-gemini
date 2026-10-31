/**
 * SAVE.JS — Système de sauvegarde automatique versionnée + Export / Import texte (Phase 4)
 * Gère les 6 Engins, 6 Biomes, 84 Modules, 52 Succès, l'Histoire et les 3 Clés d'Horlogerie (Vraie Fin).
 */
window.SaveManager = (function () {
  const STORAGE_KEY = 'ecrou_et_vapeur_save_v1';

  function getDefaultSave() {
    return {
      version: window.GAME_CONFIG.SAVE_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        muted: false,
        screenshake: true
      },
      currencies: {
        goldenCogs: 0,
        etherCrystals: 0
      },
      stats: {
        runsPlayed: 0,
        runsWon: 0,
        bestRoom: 0,
        highestBiomeCleared: 0,
        enemiesDismantled: 0,
        elitesDismantled: 0,
        bossesDefeated: 0,
        impulsesTriggered: 0,
        goldImpulsesTriggered: 0,
        totalBoltsCollected: 0,
        vendingPurchases: 0,
        trappedChestsOpened: 0,
        maxSynergyTierReached: 0,
        heroesClearedSector6: [], // Liste des engins ayant vaincu le Secteur 6 (3 = Vraie Fin !)
        trueEndingSeen: false,
        lastRunResult: 'none',
        lastRunRoom: 0
      },
      unlockedHeroes: ['toupillon'],
      selectedHero: 'toupillon',
      unlockedBiomes: ['horlogerie'],
      selectedBiome: 'horlogerie',
      discoveredModules: [],
      discoveredEnemies: ['ecrou_errant'],
      unlockedAchievements: [],
      storyChaptersSeen: 1,
      tutorialsSeen: {
        moveAndShoot: false,
        pressureImpulse: false,
        workshopIntro: false
      },
      permanentUpgrades: {
        hullPlating: 0,
        steamTurbine: 0,
        prePressurized: 0,
        magnetCoil: 0,
        emergencyKit: 0,
        impulseGears: 0,
        scrapRecycler: 0,
        opticCalibrator: 0
      }
    };
  }

  let currentData = getDefaultSave();

  function migrateSave(loaded) {
    const base = getDefaultSave();
    if (!loaded || typeof loaded !== 'object') return base;

    const merged = {
      ...base,
      ...loaded,
      version: window.GAME_CONFIG.SAVE_VERSION,
      updatedAt: Date.now(),
      settings: { ...base.settings, ...(loaded.settings || {}) },
      currencies: { ...base.currencies, ...(loaded.currencies || {}) },
      stats: { ...base.stats, ...(loaded.stats || {}) },
      tutorialsSeen: { ...base.tutorialsSeen, ...(loaded.tutorialsSeen || {}) },
      permanentUpgrades: { ...base.permanentUpgrades, ...(loaded.permanentUpgrades || {}) }
    };

    if (!Array.isArray(merged.unlockedHeroes) || merged.unlockedHeroes.length === 0) {
      merged.unlockedHeroes = ['toupillon'];
    }
    if (!Array.isArray(merged.unlockedBiomes) || merged.unlockedBiomes.length === 0) {
      merged.unlockedBiomes = ['horlogerie'];
    }
    if (!merged.selectedBiome) merged.selectedBiome = 'horlogerie';
    if (!Array.isArray(merged.discoveredModules)) merged.discoveredModules = [];
    if (!Array.isArray(merged.discoveredEnemies)) merged.discoveredEnemies = ['ecrou_errant'];
    if (!Array.isArray(merged.unlockedAchievements)) merged.unlockedAchievements = [];
    if (!Array.isArray(merged.stats.heroesClearedSector6)) merged.stats.heroesClearedSector6 = [];

    return merged;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        currentData = getDefaultSave();
        save();
        return currentData;
      }
      const parsed = JSON.parse(raw);
      currentData = migrateSave(parsed);
      save();
      return currentData;
    } catch (err) {
      console.warn('Sauvegarde corrompue ou inaccessible, réinitialisation sûre.', err);
      currentData = getDefaultSave();
      return currentData;
    }
  }

  function save() {
    try {
      currentData.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      return true;
    } catch (err) {
      console.warn('Impossible d\'écrire dans localStorage:', err);
      return false;
    }
  }

  function exportCode() {
    try {
      const json = JSON.stringify(currentData);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      return 'ECROU1-' + encoded;
    } catch (err) {
      return '';
    }
  }

  function importCode(codeStr) {
    if (!codeStr || typeof codeStr !== 'string') {
      return { ok: false, message: 'Code vide ou invalide.' };
    }
    const clean = codeStr.trim();
    if (!clean.startsWith('ECROU1-')) {
      return { ok: false, message: 'Ce code ne commence pas par ECROU1-.' };
    }
    try {
      const base64 = clean.slice(7);
      const json = decodeURIComponent(escape(atob(base64)));
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object' || !parsed.stats) {
        return { ok: false, message: 'Structure de sauvegarde non reconnue.' };
      }
      currentData = migrateSave(parsed);
      save();
      return { ok: true, message: 'Sauvegarde importée avec succès !' };
    } catch (err) {
      return { ok: false, message: 'Code de sauvegarde endommagé ou incomplet.' };
    }
  }

  function resetAll() {
    currentData = getDefaultSave();
    save();
    return currentData;
  }

  function getTotalUpgradeLevels() {
    const upg = currentData.permanentUpgrades || {};
    return Object.values(upg).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }

  // Vérification automatique des 52 Succès et attribution des récompenses
  function checkAchievements() {
    if (!window.GAME_CONTENT || !window.GAME_CONTENT.achievements) return [];
    const newlyUnlocked = [];
    window.GAME_CONTENT.achievements.forEach((ach) => {
      if (!currentData.unlockedAchievements.includes(ach.id)) {
        try {
          if (ach.check(currentData)) {
            currentData.unlockedAchievements.push(ach.id);
            if (ach.rewardCogs) currentData.currencies.goldenCogs += ach.rewardCogs;
            if (ach.rewardCrystals) currentData.currencies.etherCrystals += ach.rewardCrystals;
            newlyUnlocked.push(ach);
          }
        } catch (e) {}
      }
    });
    if (newlyUnlocked.length > 0) {
      save();
    }
    return newlyUnlocked;
  }

  function unlockEverythingDebug() {
    currentData.currencies.goldenCogs += 2500;
    currentData.currencies.etherCrystals += 80;
    currentData.unlockedHeroes = [
      'toupillon',
      'lumignon',
      'boum_chariot',
      'bobine_z',
      'sablier_vapeur',
      'graine_acier'
    ];
    currentData.unlockedBiomes = [
      'horlogerie',
      'serres',
      'fonderie',
      'archives',
      'canaux',
      'balancier'
    ];
    currentData.storyChaptersSeen = 7;
    if (window.GAME_CONTENT && window.GAME_CONTENT.modules) {
      currentData.discoveredModules = window.GAME_CONTENT.modules.map((m) => m.id);
    }
    if (window.GAME_CONTENT && window.GAME_CONTENT.enemies) {
      currentData.discoveredEnemies = Object.keys(window.GAME_CONTENT.enemies);
    }
    checkAchievements();
    save();
  }

  load();

  return {
    getData: () => currentData,
    save,
    load,
    exportCode,
    importCode,
    resetAll,
    getTotalUpgradeLevels,
    checkAchievements,
    unlockEverythingDebug
  };
})();
