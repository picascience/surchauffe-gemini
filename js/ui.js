/**
 * UI.JS — Gestion des écrans, 6 Engins & 6 Biomes, Atelier, Codex (84 Modules, 30 Automates,
 * 6 Châssis, 52 Succès, 7 Chapitres d'Histoire), Vraie Fin et Menu Debug (Phase 4)
 */
window.UI = (function () {
  let versionTapCount = 0;
  let versionTapTimer = null;
  let activeCodexTab = 'modules';

  function isStoryChapterUnlocked(ch, save) {
    if (typeof ch.checkUnlocked === 'function') {
      return ch.checkUnlocked(save);
    }
    if (ch.id === 1) return true;
    if (ch.id <= 6) {
      return (save.unlockedBiomes || []).length >= ch.id || (save.storyChaptersSeen || 1) >= ch.id;
    }
    return (
      !!save.stats.trueEndingSeen ||
      (save.stats.heroesClearedSector6 || []).length >= 3 ||
      (save.storyChaptersSeen || 1) >= 7
    );
  }

  function init() {
    // Bouton Lancer une Run
    document.getElementById('btn-start-run')?.addEventListener('click', () => {
      const save = window.SaveManager.getData();
      const heroId = save.selectedHero;
      const heroDef = window.GAME_CONTENT.heroes[heroId];

      if (!save.unlockedHeroes.includes(heroId)) {
        if (save.currencies.etherCrystals >= heroDef.unlockCrystalCost) {
          save.currencies.etherCrystals -= heroDef.unlockCrystalCost;
          save.unlockedHeroes.push(heroId);
          window.SaveManager.save();
          window.SaveManager.checkAchievements();
          window.SoundFX.play('ui_upgrade');
          refreshTitleScreen();
          showToast(`🎉 Châssis ${heroDef.name} débloqué !`);
        } else {
          window.SoundFX.play('ui_click');
          showToast(`🔒 ${heroDef.unlockHint}`);
        }
        return;
      }

      window.SoundFX.play('ui_click');
      window.GameEngine.startNewRun(save.selectedBiome);
    });

    // Flèches de sélection d'Engin sur l'écran d'accueil
    document.getElementById('btn-prev-hero')?.addEventListener('click', () => cycleHero(-1));
    document.getElementById('btn-next-hero')?.addEventListener('click', () => cycleHero(1));

    // Flèches de sélection de Biome sur l'écran d'accueil
    document.getElementById('btn-prev-biome')?.addEventListener('click', () => cycleBiome(-1));
    document.getElementById('btn-next-biome')?.addEventListener('click', () => cycleBiome(1));

    // Bouton Atelier de la Caravane
    const modalWorkshop = document.getElementById('modal-workshop');
    document.getElementById('btn-open-workshop')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      renderWorkshopModal();
      modalWorkshop.classList.remove('hidden');
    });
    document.getElementById('btn-close-workshop')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalWorkshop.classList.add('hidden');
      refreshTitleScreen();
    });

    // Bouton Codex, Succès & Histoire
    const modalCodex = document.getElementById('modal-codex');
    document.getElementById('btn-open-codex')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      renderCodexModal(activeCodexTab);
      modalCodex.classList.remove('hidden');
    });
    document.getElementById('btn-open-achievements')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      activeCodexTab = 'achievements';
      renderCodexModal('achievements');
      modalCodex.classList.remove('hidden');
    });
    document.getElementById('btn-open-story')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      activeCodexTab = 'story';
      renderCodexModal('story');
      modalCodex.classList.remove('hidden');
    });
    document.getElementById('btn-close-codex')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalCodex.classList.add('hidden');
    });

    document.querySelectorAll('.codex-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (!tab) return;
        window.SoundFX.play('ui_click');
        activeCodexTab = tab;
        renderCodexModal(activeCodexTab);
      });
    });

    // Modale Vraie Fin
    document.getElementById('btn-close-true-ending')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      document.getElementById('modal-true-ending')?.classList.add('hidden');
    });

    // Boutons Son (Mute / Unmute)
    const handleToggleMute = () => {
      window.SoundFX.toggleMute();
      refreshMuteButtons();
    };
    document.getElementById('btn-mute-home')?.addEventListener('click', handleToggleMute);
    document.getElementById('btn-mute-pause')?.addEventListener('click', handleToggleMute);

    // Sauvegarde (Export / Import)
    const modalSave = document.getElementById('modal-save');
    const txtSaveCode = document.getElementById('txt-save-code');
    const saveFeedback = document.getElementById('save-feedback');

    document.getElementById('btn-open-save')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      txtSaveCode.value = window.SaveManager.exportCode();
      saveFeedback.textContent = 'Copiez ce code pour sauvegarder votre progression.';
      saveFeedback.style.color = '#f5b041';
      modalSave.classList.remove('hidden');
    });

    document.getElementById('btn-close-save')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalSave.classList.add('hidden');
    });

    document.getElementById('btn-copy-save')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      txtSaveCode.select();
      txtSaveCode.setSelectionRange(0, 99999);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txtSaveCode.value).then(() => {
          saveFeedback.textContent = '✅ Code copié dans le presse-papiers !';
          saveFeedback.style.color = '#2ecc71';
        });
      } else {
        document.execCommand('copy');
        saveFeedback.textContent = '✅ Code copié !';
        saveFeedback.style.color = '#2ecc71';
      }
    });

    document.getElementById('btn-import-save')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      const res = window.SaveManager.importCode(txtSaveCode.value);
      saveFeedback.textContent = (res.ok ? '✅ ' : '⚠️ ') + res.message;
      saveFeedback.style.color = res.ok ? '#2ecc71' : '#ff6b6b';
      if (res.ok) {
        refreshTitleScreen();
        refreshMuteButtons();
      }
    });

    // Pause en jeu
    const modalPause = document.getElementById('modal-pause');
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      window.GameEngine.setPaused(true);
      renderPauseModules();
      refreshMuteButtons();
      modalPause.classList.remove('hidden');
    });

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalPause.classList.add('hidden');
      window.GameEngine.setPaused(false);
    });

    document.getElementById('btn-abandon')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalPause.classList.add('hidden');
      window.GameEngine.endRun(false, 'Remorquage volontaire à l\'Atelier.');
    });

    // Fin de Run
    document.getElementById('btn-retry-run')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      document.getElementById('screen-gameover').classList.add('hidden');
      window.GameEngine.startNewRun(window.SaveManager.getData().selectedBiome);
    });

    document.getElementById('btn-gameover-workshop')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      document.getElementById('screen-gameover').classList.add('hidden');
      showTitleScreen();
      renderWorkshopModal();
      document.getElementById('modal-workshop').classList.remove('hidden');
    });

    document.getElementById('btn-back-home')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      document.getElementById('screen-gameover').classList.add('hidden');
      showTitleScreen();
    });

    // MENU DEBUG CACHÉ : 5 taps rapides sur le numéro de version
    const versionBadge = document.getElementById('version-badge');
    const modalDebug = document.getElementById('modal-debug');

    if (versionBadge) {
      versionBadge.textContent = 'v' + window.GAME_CONFIG.VERSION;
      versionBadge.addEventListener('click', () => {
        versionTapCount++;
        clearTimeout(versionTapTimer);
        versionTapTimer = setTimeout(() => {
          versionTapCount = 0;
        }, 1600);

        if (versionTapCount >= 5) {
          versionTapCount = 0;
          window.SoundFX.play('ui_upgrade');
          modalDebug.classList.remove('hidden');
        }
      });
    }

    document.getElementById('btn-close-debug')?.addEventListener('click', () => {
      window.SoundFX.play('ui_click');
      modalDebug.classList.add('hidden');
    });

    document.getElementById('dbg-add-currency')?.addEventListener('click', () => {
      window.SaveManager.unlockEverythingDebug();
      window.SaveManager.checkAchievements();
      refreshTitleScreen();
      window.SoundFX.play('ui_upgrade');
      showToast('🛠️ +2500 ⚙️, +80 💎, 6 Engins, 6 Biomes & 84 Modules Débloqués !');
    });

    document.getElementById('dbg-godmode')?.addEventListener('click', () => {
      const enabled = window.GameEngine.toggleGodMode();
      window.SoundFX.play('ui_click');
      showToast(
        enabled ? '🛡️ Blindage Inaltérable ACTIVÉ' : '🛡️ Blindage Inaltérable DÉSACTIVÉ'
      );
    });

    const biomeBtns = [
      ['dbg-biome-1', 'horlogerie'],
      ['dbg-biome-2', 'serres'],
      ['dbg-biome-3', 'fonderie'],
      ['dbg-biome-4', 'archives'],
      ['dbg-biome-5', 'canaux'],
      ['dbg-biome-6', 'balancier']
    ];
    biomeBtns.forEach(([btnId, bId]) => {
      document.getElementById(btnId)?.addEventListener('click', () => {
        modalDebug.classList.add('hidden');
        window.GameEngine.startNewRun(bId);
      });
    });

    document.getElementById('dbg-skip-warden')?.addEventListener('click', () => {
      modalDebug.classList.add('hidden');
      window.GameEngine.jumpToRoomDebug(window.GAME_CONFIG.ROOMS_PER_BIOME);
      showToast('🚨 Téléportation Salle 10 (Boss du Secteur) !');
    });

    document.getElementById('dbg-free-module')?.addEventListener('click', () => {
      modalDebug.classList.add('hidden');
      window.GameEngine.triggerModuleSelection();
    });

    document.getElementById('dbg-true-ending')?.addEventListener('click', () => {
      modalDebug.classList.add('hidden');
      const save = window.SaveManager.getData();
      save.stats.trueEndingSeen = true;
      save.storyChaptersSeen = 7;
      window.SaveManager.save();
      showTrueEndingModal();
    });

    document.getElementById('dbg-reset-save')?.addEventListener('click', () => {
      window.SaveManager.resetAll();
      refreshTitleScreen();
      modalDebug.classList.add('hidden');
      showToast('♻️ Sauvegarde remise à zéro.');
    });

    refreshMuteButtons();
    refreshTitleScreen();
  }

  function cycleHero(dir) {
    window.SoundFX.play('ui_click');
    const save = window.SaveManager.getData();
    const keys = Object.keys(window.GAME_CONTENT.heroes);
    const idx = keys.indexOf(save.selectedHero);
    const nextIdx = (idx + dir + keys.length) % keys.length;
    save.selectedHero = keys[nextIdx];
    window.SaveManager.save();
    refreshTitleScreen();
  }

  function cycleBiome(dir) {
    window.SoundFX.play('ui_click');
    const save = window.SaveManager.getData();
    const order = window.GAME_CONTENT.biomesOrder;
    const idx = order.indexOf(save.selectedBiome);
    const nextIdx = (idx + dir + order.length) % order.length;
    const candidate = order[nextIdx];

    if (!save.unlockedBiomes.includes(candidate)) {
      const bDef = window.GAME_CONTENT.biomes[candidate];
      showToast(`🔒 Secteur verrouillé : battez d'abord le Boss du Secteur ${bDef.order - 1} !`);
      return;
    }

    save.selectedBiome = candidate;
    window.SaveManager.save();
    refreshTitleScreen();
  }

  function refreshMuteButtons() {
    const muted = window.SoundFX.isMuted();
    const btnHome = document.getElementById('btn-mute-home');
    const btnPause = document.getElementById('btn-mute-pause');
    if (btnHome) btnHome.textContent = muted ? '🔇' : '🔊';
    if (btnPause) {
      btnPause.textContent = muted ? '🔇 Bruitages : COUPÉS' : '🔊 Bruitages : ACTIVÉS';
    }
  }

  function refreshTitleScreen() {
    const data = window.SaveManager.getData();
    const heroDef =
      window.GAME_CONTENT.heroes[data.selectedHero] || window.GAME_CONTENT.heroes.toupillon;
    const isHeroUnlocked = data.unlockedHeroes.includes(heroDef.id);
    const biomeDef =
      window.GAME_CONTENT.biomes[data.selectedBiome] || window.GAME_CONTENT.biomes.horlogerie;

    document.getElementById('home-golden-cogs').textContent = data.currencies.goldenCogs;
    document.getElementById('home-ether-crystals').textContent = data.currencies.etherCrystals;

    const heroNameEl = document.getElementById('hero-select-name');
    const heroTagEl = document.getElementById('hero-select-tag');
    const heroDescEl = document.getElementById('hero-select-desc');
    const heroQuoteEl = document.getElementById('hero-select-quote');
    const btnStart = document.getElementById('btn-start-run');

    const clearedS6 = (data.stats.heroesClearedSector6 || []).includes(heroDef.id);
    if (heroNameEl) {
      heroNameEl.textContent = `${heroDef.icon} ${heroDef.name}${clearedS6 ? ' 🔑' : ''}`;
    }
    if (heroTagEl) {
      heroTagEl.textContent = isHeroUnlocked
        ? heroDef.subtitle
        : `🔒 ${heroDef.unlockCrystalCost} 💎`;
    }
    if (heroDescEl) heroDescEl.textContent = heroDef.description;
    if (heroQuoteEl) {
      heroQuoteEl.textContent = isHeroUnlocked
        ? heroDef.personalityQuote
        : `Condition : ${heroDef.unlockHint}`;
    }

    if (btnStart) {
      if (isHeroUnlocked) {
        btnStart.textContent = `🚀 EXPLORER : ${biomeDef.name.toUpperCase()}`;
      } else {
        btnStart.textContent = `🔓 DÉBLOQUER ${heroDef.name.toUpperCase()} (${heroDef.unlockCrystalCost} 💎)`;
      }
    }

    const biomeTitleEl = document.getElementById('biome-select-title');
    if (biomeTitleEl) {
      const keysCount = (data.stats.heroesClearedSector6 || []).length;
      const keySuffix = biomeDef.order === 6 ? ` (🔑 ${Math.min(3, keysCount)}/3)` : '';
      biomeTitleEl.textContent = `${biomeDef.icon} Secteur ${biomeDef.order}/6 : ${biomeDef.name}${keySuffix}`;
    }

    const totalLvls = window.SaveManager.getTotalUpgradeLevels();
    const workshopBadge = document.getElementById('workshop-lvl-badge');
    if (workshopBadge) {
      workshopBadge.textContent = `🔧 Atelier (${totalLvls}/40)`;
    }

    const codexBadge = document.getElementById('codex-count-badge');
    if (codexBadge) {
      const totalMods = window.GAME_CONTENT.modules.length;
      codexBadge.textContent = `📖 Codex (${data.discoveredModules.length}/${totalMods})`;
    }

    const achBadge = document.getElementById('ach-count-badge');
    if (achBadge) {
      const totalAch = window.GAME_CONTENT.achievements.length;
      achBadge.textContent = `🏆 Succès (${(data.unlockedAchievements || []).length}/${totalAch})`;
    }

    const storyBadge = document.getElementById('story-count-badge');
    if (storyBadge) {
      const chapters = window.GAME_CONTENT.storyChapters || [];
      const unlockedChapCount = chapters.filter((c) => isStoryChapterUnlocked(c, data)).length;
      storyBadge.textContent = `📜 Histoire (${unlockedChapCount}/${chapters.length})`;
    }

    const quipEl = document.getElementById('caravan-quip');
    if (quipEl) {
      const npc = window.GAME_CONTENT.workshopNpcs[0];
      quipEl.textContent = `${npc.icon} [${npc.name}] : ${npc.getDialogue(data)}`;
    }
  }

  // --- ATELIER DE LA CARAVANE ---
  function renderWorkshopModal() {
    const save = window.SaveManager.getData();
    document.getElementById('workshop-cogs-count').textContent = save.currencies.goldenCogs;
    document.getElementById('workshop-crystals-count').textContent = save.currencies.etherCrystals;

    const npcBox = document.getElementById('workshop-npcs-container');
    if (npcBox) {
      npcBox.innerHTML = window.GAME_CONTENT.workshopNpcs
        .map(
          (npc) => `
          <div class="npc-talk-card">
            <div class="npc-icon-badge">${npc.icon}</div>
            <div class="npc-talk-body">
              <div class="npc-talk-name">${npc.name} <span class="npc-role-tag">${npc.role}</span></div>
              <div class="npc-talk-text">${npc.getDialogue(save)}</div>
            </div>
          </div>
        `
        )
        .join('');
    }

    const upgradesBox = document.getElementById('workshop-upgrades-container');
    if (upgradesBox) {
      upgradesBox.innerHTML = '';
      window.GAME_CONTENT.workshopUpgrades.forEach((u) => {
        const currentLvl = save.permanentUpgrades[u.id] || 0;
        const isMax = currentLvl >= u.maxLevel;
        const costCogs = u.baseCost + currentLvl * u.costGrowth;
        const costCrystals = currentLvl === 4 ? 1 : 0;
        const canAfford =
          !isMax &&
          save.currencies.goldenCogs >= costCogs &&
          save.currencies.etherCrystals >= costCrystals;

        const pipsHtml = Array.from({ length: u.maxLevel }, (_, idx) => {
          return `<span class="upgrade-pip ${idx < currentLvl ? 'filled' : ''}"></span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = `upgrade-card ${isMax ? 'maxed' : ''}`;
        card.innerHTML = `
          <div class="upgrade-card-top">
            <div class="upgrade-icon">${u.icon}</div>
            <div class="upgrade-meta">
              <div class="upgrade-name">${u.name}</div>
              <div class="upgrade-pips">${pipsHtml} <span class="upgrade-lvl-num">${currentLvl}/${u.maxLevel}</span></div>
            </div>
            <button class="btn-buy-upgrade ${canAfford ? 'affordable' : 'locked'}" ${
          !canAfford || isMax ? 'disabled' : ''
        }>
              ${
                isMax
                  ? 'MAX ✅'
                  : `${costCogs} ⚙️${costCrystals > 0 ? ` + ${costCrystals} 💎` : ''}`
              }
            </button>
          </div>
          <div class="upgrade-desc">${u.descPerLevel}</div>
          <div class="upgrade-preview">${u.statPreview(currentLvl)}</div>
        `;

        const buyBtn = card.querySelector('.btn-buy-upgrade');
        if (buyBtn && canAfford && !isMax) {
          buyBtn.addEventListener('click', () => {
            save.currencies.goldenCogs -= costCogs;
            save.currencies.etherCrystals -= costCrystals;
            save.permanentUpgrades[u.id] = currentLvl + 1;
            window.SaveManager.save();
            window.SaveManager.checkAchievements();
            window.SoundFX.play('ui_upgrade');
            renderWorkshopModal();
            refreshTitleScreen();
          });
        }

        upgradesBox.appendChild(card);
      });
    }
  }

  // --- CODEX DE LA CARAVANE (MODULES, AUTOMATES, CHÂSSIS, SUCCÈS, HISTOIRE) ---
  function renderCodexModal(tab) {
    const save = window.SaveManager.getData();
    const contentBox = document.getElementById('codex-content-container');
    if (!contentBox) return;

    document.querySelectorAll('.codex-tab-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });

    if (tab === 'modules') {
      const mods = window.GAME_CONTENT.modules;
      const synHtml = Object.values(window.GAME_CONTENT.synergies)
        .map(
          (syn) => `
          <div class="codex-item-card" style="border-color:${syn.color}">
            <div class="codex-item-title" style="color:${syn.color}">${syn.icon} Synergie ${syn.name}</div>
            <div class="codex-item-desc">${syn.tier2Desc}<br/>${syn.tier4Desc}<br/>${syn.tier6Desc || ''}</div>
          </div>
        `
        )
        .join('');

      const modsHtml = mods
        .map((m) => {
          const found = save.discoveredModules.includes(m.id);
          return `
            <div class="codex-item-card ${found ? '' : 'undiscovered'}">
              <div class="codex-item-title">
                ${m.familyIcon} ${found ? m.name : 'Plan Inconnu (???)'}
                <span class="module-rarity-badge">${m.family}</span>
              </div>
              <div class="codex-item-desc">${
                found ? m.desc : 'Trouvez et installez ce module pendant une expédition.'
              }</div>
            </div>
          `;
        })
        .join('');

      contentBox.innerHTML = `
        <h3 style="font-size:0.86rem;color:#ffd32a;margin-bottom:6px;">⚡ Les 6 Familles de Synergies (2 / 4 / 6) :</h3>
        ${synHtml}
        <h3 style="font-size:0.86rem;color:#ffd32a;margin:10px 0 6px;">⚙️ Modules (${save.discoveredModules.length}/${mods.length}) :</h3>
        ${modsHtml}
      `;
    } else if (tab === 'enemies') {
      const allEnemies = Object.values(window.GAME_CONTENT.enemies);
      contentBox.innerHTML = allEnemies
        .map((e) => {
          const seen = save.discoveredEnemies.includes(e.id);
          return `
            <div class="codex-item-card ${seen ? '' : 'undiscovered'}">
              <div class="codex-item-title">
                ${e.isBoss ? '🚨 ' : '🤖 '}${seen ? e.name : 'Automate Non Recensé'}
                <span class="module-rarity-badge">${e.biome}</span>
              </div>
              <div class="codex-item-desc">${
                seen ? e.codexDesc : 'Rencontrez cet automate dans les ruines pour l\'analyser.'
              }</div>
            </div>
          `;
        })
        .join('');
    } else if (tab === 'heroes') {
      const allHeroes = Object.values(window.GAME_CONTENT.heroes);
      contentBox.innerHTML = allHeroes
        .map((h) => {
          const unlocked = save.unlockedHeroes.includes(h.id);
          const hasKey = (save.stats.heroesClearedSector6 || []).includes(h.id);
          return `
            <div class="codex-item-card" style="border-color:${h.colors.body}">
              <div class="codex-item-title">
                ${h.icon} ${h.name} — ${unlocked ? 'DÉBLOQUÉ ✅' : 'VERROUILLÉ 🔒'} ${hasKey ? '🔑' : ''}
              </div>
              <div class="codex-item-desc">${h.description}<br/><em>${h.personalityQuote}</em></div>
            </div>
          `;
        })
        .join('');
    } else if (tab === 'achievements') {
      const allAch = window.GAME_CONTENT.achievements;
      const unlockedList = save.unlockedAchievements || [];
      contentBox.innerHTML = `
        <div style="font-size:0.8rem;color:#ffd32a;font-weight:800;margin-bottom:4px;">
          🏆 ${unlockedList.length} / ${allAch.length} Succès accomplis
        </div>
        ${allAch
          .map((ach) => {
            const done = unlockedList.includes(ach.id);
            const title = ach.name || ach.title;
            const rewardTxt = `${ach.rewardCogs ? `+${ach.rewardCogs} ⚙️` : ''}${
              ach.rewardCrystals ? ` +${ach.rewardCrystals} 💎` : ''
            }`;
            return `
              <div class="codex-item-card ${done ? '' : 'undiscovered'}" style="${
              done ? 'border-color:#ffd32a;' : ''
            }">
                <div class="codex-item-title">
                  <span>${done ? '🏆' : '🔒'} ${title}</span>
                  <span class="module-rarity-badge" style="color:#ffd32a;">${rewardTxt}</span>
                </div>
                <div class="codex-item-desc">${ach.desc}</div>
              </div>
            `;
          })
          .join('')}
      `;
    } else if (tab === 'story') {
      const chapters = window.GAME_CONTENT.storyChapters || [];
      const keysCount = (save.stats.heroesClearedSector6 || []).length;
      contentBox.innerHTML = `
        <div class="codex-item-card" style="border-color:#00f2fe;background:#1a1528;">
          <div class="codex-item-title" style="color:#00f2fe;">
            🔑 Clés d'Horlogerie du Grand Balancier : ${Math.min(3, keysCount)} / 3
          </div>
          <div class="codex-item-desc">
            Triomphez de <strong>Cœur-Zéro (Secteur 6)</strong> avec 3 Châssis différents pour réunir les 3 Clés d'Horlogerie et déclencher la Vraie Fin d'Automatia !
          </div>
        </div>
        ${chapters
          .map((ch) => {
            const open = isStoryChapterUnlocked(ch, save);
            return `
              <div class="codex-item-card ${open ? '' : 'undiscovered'}" style="${
              open ? 'border-color:#f5b041;' : ''
            }">
                <div class="codex-item-title">
                  <span>📜 ${open ? ch.title : `Chapitre ${ch.id} Verrouillé (???)`}</span>
                  <span class="module-rarity-badge">${open ? '📠 Archive' : '🔒'}</span>
                </div>
                <div class="codex-item-desc">${
                  open
                    ? ch.text
                    : 'Progressez dans les 6 Secteurs d\'Automatia pour déchiffrer cette archive.'
                }</div>
              </div>
            `;
          })
          .join('')}
      `;
    }
  }

  function showTrueEndingModal() {
    const modal = document.getElementById('modal-true-ending');
    if (modal) {
      window.SoundFX.play('victory');
      modal.classList.remove('hidden');
    }
  }

  function showTitleScreen() {
    refreshTitleScreen();
    document.getElementById('screen-title').classList.remove('hidden');
    document.getElementById('hud-layer').classList.add('hidden');
  }

  function hideTitleScreen() {
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('hud-layer').classList.remove('hidden');
  }

  function updateHUD(player, runState) {
    const hpPct = Math.max(0, Math.min(100, (player.hp / player.stats.maxHp) * 100));
    const hpFill = document.getElementById('hud-hp-fill');
    const hpText = document.getElementById('hud-hp-text');
    if (hpFill) hpFill.style.width = hpPct + '%';
    if (hpText) hpText.textContent = `${Math.ceil(player.hp)} / ${Math.round(player.stats.maxHp)}`;

    const pPct = Math.max(0, Math.min(100, player.pressure));
    const pFill = document.getElementById('hud-pressure-fill');
    const pLabel = document.getElementById('hud-pressure-label');
    if (pFill) {
      pFill.style.width = pPct + '%';
      if (player.pressure >= window.GAME_CONFIG.PLAYER.PRESSURE_GOLD_MIN) {
        pFill.classList.add('gold-zone');
        if (pLabel) pLabel.textContent = '⚡ RELÂCHEZ : SURCHARGE DORÉE !';
      } else {
        pFill.classList.remove('gold-zone');
        if (pLabel) pLabel.textContent = `Pression : ${Math.floor(player.pressure)}%`;
      }
    }

    const biomeDef = window.GAME_CONTENT.biomes[runState.biomeId];
    const roomBadge = document.getElementById('hud-room-badge');
    const xpFill = document.getElementById('hud-xp-fill');
    const lvlBadge = document.getElementById('hud-lvl-badge');

    if (roomBadge) {
      roomBadge.textContent = `${biomeDef.icon} S.${biomeDef.order} - Salle ${runState.roomIndex}/${window.GAME_CONFIG.ROOMS_PER_BIOME}`;
    }
    if (xpFill) {
      const xpPct = Math.min(100, (runState.xp / runState.xpToNext) * 100);
      xpFill.style.width = xpPct + '%';
    }
    if (lvlBadge) {
      lvlBadge.textContent = `Niv.${runState.level} | 🔩 ${runState.boltsCurrency}`;
    }

    const bossBar = document.getElementById('hud-boss-bar');
    if (runState.activeBoss && runState.activeBoss.hp > 0) {
      bossBar.classList.remove('hidden');
      const bossFill = document.getElementById('hud-boss-fill');
      const bossName = document.getElementById('hud-boss-name');
      const phaseTxt = runState.activeBoss.bossPhase
        ? ` — PHASE ${runState.activeBoss.bossPhase}/3`
        : '';
      if (bossName) bossName.textContent = `${runState.activeBoss.name}${phaseTxt}`;
      if (bossFill) {
        bossFill.style.width =
          Math.max(0, (runState.activeBoss.hp / runState.activeBoss.maxHp) * 100) + '%';
      }
    } else if (bossBar) {
      bossBar.classList.add('hidden');
    }
  }

  // --- CHOIX D'AMÉLIORATION AVEC APERÇU DES SYNERGIES DE FAMILLES (2 / 4 / 6) ---
  function showModuleChoices(choices, familyCounts, onSelect) {
    const modal = document.getElementById('modal-modules');
    const container = document.getElementById('module-cards-container');
    container.innerHTML = '';

    choices.forEach((mod) => {
      const currentCount = (familyCounts && familyCounts[mod.family]) || 0;
      const nextCount = currentCount + 1;
      const synInfo = window.GAME_CONTENT.synergies[mod.family];
      let synBadge = `${currentCount} équipé(s)`;
      if (nextCount === 2) synBadge = '🔥 ACTIVE SYNERGIE (2) !';
      else if (nextCount === 4) synBadge = '⚡ ACTIVE SYNERGIE (4) !';
      else if (nextCount === 6) synBadge = '🌟 ACTIVE SYNERGIE ULTIME (6) !';

      let synPreviewText = '';
      if (synInfo) {
        if (nextCount === 2) synPreviewText = synInfo.tier2Desc;
        else if (nextCount === 4) synPreviewText = synInfo.tier4Desc;
        else if (nextCount === 6) synPreviewText = synInfo.tier6Desc;
      }

      const card = document.createElement('button');
      card.className = `module-card rarity-${mod.rarity}`;
      card.innerHTML = `
        <div class="module-card-header">
          <span class="module-family-tag" style="background:${mod.color}22; border-color:${mod.color}; color:${mod.color}">
            ${mod.familyIcon} ${mod.family} (${synBadge})
          </span>
          <span class="module-rarity-badge">${
            mod.rarity === 'epic' ? 'ÉPIQUE' : mod.rarity === 'rare' ? 'RARE' : 'STANDARD'
          }</span>
        </div>
        <div class="module-card-title">${mod.name}</div>
        <div class="module-card-desc">${mod.desc}</div>
        ${
          synPreviewText
            ? `<div style="font-size:0.74rem;color:#ffd32a;margin-top:4px;font-weight:800;">✨ ${synPreviewText}</div>`
            : ''
        }
      `;
      card.addEventListener('click', () => {
        window.SoundFX.play('ui_upgrade');
        modal.classList.add('hidden');
        onSelect(mod);
      });
      container.appendChild(card);
    });

    modal.classList.remove('hidden');
  }

  function showDoorChoices(doors, onSelectDoor) {
    const modal = document.getElementById('modal-doors');
    const container = document.getElementById('door-cards-container');
    container.innerHTML = '';

    doors.forEach((door) => {
      const btn = document.createElement('button');
      btn.className = 'door-card';
      btn.innerHTML = `
        <div class="door-icon" style="background:${door.badgeColor}">${door.icon}</div>
        <div class="door-info">
          <div class="door-title">${door.title}</div>
          <div class="door-subtitle">${door.subtitle}</div>
        </div>
        <div class="door-arrow">➜</div>
      `;
      btn.addEventListener('click', () => {
        window.SoundFX.play('ui_click');
        modal.classList.add('hidden');
        onSelectDoor(door);
      });
      container.appendChild(btn);
    });

    modal.classList.remove('hidden');
  }

  function showRepairStation(player, onDone) {
    const modal = document.getElementById('modal-repair');
    const healAmount = Math.round(
      player.stats.maxHp * window.GAME_CONFIG.ECONOMY.REPAIR_ROOM_HEAL_PCT
    );
    const hpCost = Math.max(
      10,
      Math.round(player.hp * window.GAME_CONFIG.ECONOMY.OVERCLOCK_HP_COST_PCT)
    );

    const btnHeal = document.getElementById('btn-station-heal');
    const btnOverclock = document.getElementById('btn-station-overclock');

    btnHeal.innerHTML = `
      <div class="door-icon" style="background:#20bf6b">🔧</div>
      <div class="door-info">
        <div class="door-title">Soudure Complète (+${healAmount} PV)</div>
        <div class="door-subtitle">Restaure 40% de votre Blindage maximum.</div>
      </div>
    `;

    btnOverclock.innerHTML = `
      <div class="door-icon" style="background:#eb3b5a">⚡</div>
      <div class="door-info">
        <div class="door-title">Presse Instable (-${hpCost} PV)</div>
        <div class="door-subtitle">Sacrifie du Blindage pour +22% Dégâts & +1 Module !</div>
      </div>
    `;

    btnHeal.onclick = () => {
      window.SoundFX.play('pickup_heal');
      modal.classList.add('hidden');
      onDone('heal', healAmount);
    };

    btnOverclock.onclick = () => {
      window.SoundFX.play('ui_upgrade');
      modal.classList.add('hidden');
      onDone('overclock', hpCost);
    };

    modal.classList.remove('hidden');
  }

  function showVendingMachine(player, runState, onDone) {
    const modal = document.getElementById('modal-event');
    const title = document.getElementById('event-modal-title');
    const sub = document.getElementById('event-modal-subtitle');
    const stack = document.getElementById('event-options-stack');

    const modCost = window.GAME_CONFIG.ECONOMY.VENDING_MODULE_COST;
    const healCost = window.GAME_CONFIG.ECONOMY.VENDING_HEAL_COST;
    const healAmt = Math.round(player.stats.maxHp * 0.35);

    title.textContent = '🏪 DISTRIBUTEUR AUTOMATIQUE';
    sub.textContent = `Boulons disponibles : ${runState.boltsCurrency} 🔩`;
    stack.innerHTML = '';

    const btnMod = document.createElement('button');
    btnMod.className = 'door-card';
    const canBuyMod = runState.boltsCurrency >= modCost;
    btnMod.innerHTML = `
      <div class="door-icon" style="background:${canBuyMod ? '#3867d6' : '#4b5563'}">⚙️</div>
      <div class="door-info">
        <div class="door-title">Acheter un Plan de Module (${modCost} 🔩)</div>
        <div class="door-subtitle">${
          canBuyMod ? 'Ouvre immédiatement un choix parmi 3 Modules.' : 'Pas assez de Boulons.'
        }</div>
      </div>
    `;
    btnMod.onclick = () => {
      if (!canBuyMod) {
        showToast('⚠️ Pas assez de Boulons !');
        return;
      }
      window.SoundFX.play('ui_upgrade');
      modal.classList.add('hidden');
      onDone('buy_module', modCost);
    };

    const btnOil = document.createElement('button');
    btnOil.className = 'door-card';
    const canBuyOil = runState.boltsCurrency >= healCost;
    btnOil.innerHTML = `
      <div class="door-icon" style="background:${canBuyOil ? '#20bf6b' : '#4b5563'}">🛢️</div>
      <div class="door-info">
        <div class="door-title">Bidon d'Huile Raffinée (${healCost} 🔩)</div>
        <div class="door-subtitle">Répare +${healAmt} PV et donne +10% Vitesse.</div>
      </div>
    `;
    btnOil.onclick = () => {
      if (!canBuyOil) {
        showToast('⚠️ Pas assez de Boulons !');
        return;
      }
      window.SoundFX.play('pickup_heal');
      modal.classList.add('hidden');
      onDone('buy_oil', healCost, healAmt);
    };

    const btnLeave = document.createElement('button');
    btnLeave.className = 'door-card';
    btnLeave.innerHTML = `
      <div class="door-icon" style="background:#f39c12">🔩</div>
      <div class="door-info">
        <div class="door-title">Collecter la Monnaie (+15 🔩)</div>
        <div class="door-subtitle">Récupère les boulons coincés dans le monnayeur et continue.</div>
      </div>
    `;
    btnLeave.onclick = () => {
      window.SoundFX.play('pickup_bolt');
      modal.classList.add('hidden');
      onDone('collect_bolts', 15);
    };

    stack.appendChild(btnMod);
    stack.appendChild(btnOil);
    stack.appendChild(btnLeave);
    modal.classList.remove('hidden');
  }

  function showTrappedChestModal(onDone) {
    const modal = document.getElementById('modal-event');
    const title = document.getElementById('event-modal-title');
    const sub = document.getElementById('event-modal-subtitle');
    const stack = document.getElementById('event-options-stack');

    title.textContent = '📦 COFFRE PIÉGÉ À RESSORT';
    sub.textContent = 'Ce coffre blindé est relié à une alarme mécanique :';
    stack.innerHTML = '';

    const btnOpen = document.createElement('button');
    btnOpen.className = 'door-card';
    btnOpen.innerHTML = `
      <div class="door-icon" style="background:#8854d0">⚡</div>
      <div class="door-info">
        <div class="door-title">Forcer le Coffre (Embuscade !)</div>
        <div class="door-subtitle">Affrontez une vague d'Élite pour gagner 2 MODULES d'un coup !</div>
      </div>
    `;
    btnOpen.onclick = () => {
      window.SoundFX.play('boss_alert');
      modal.classList.add('hidden');
      onDone('trigger_ambush');
    };

    const btnDismantle = document.createElement('button');
    btnDismantle.className = 'door-card';
    btnDismantle.innerHTML = `
      <div class="door-icon" style="background:#20bf6b">🔧</div>
      <div class="door-info">
        <div class="door-title">Démonter Sans Risque (+15 ⚙️ Dorés)</div>
        <div class="door-subtitle">Désamorce le ressort et récupère les Écrous Dorés du cadenas.</div>
      </div>
    `;
    btnDismantle.onclick = () => {
      window.SoundFX.play('ui_upgrade');
      modal.classList.add('hidden');
      onDone('safe_dismantle');
    };

    stack.appendChild(btnOpen);
    stack.appendChild(btnDismantle);
    modal.classList.remove('hidden');
  }

  function showGameOver(victory, reason, summary) {
    const screen = document.getElementById('screen-gameover');
    const title = document.getElementById('gameover-title');
    const sub = document.getElementById('gameover-subtitle');
    const statsBox = document.getElementById('gameover-stats');
    const modsBox = document.getElementById('gameover-modules');

    if (victory) {
      title.textContent = '🏆 SECTEUR SÉCURISÉ !';
      title.style.color = '#ffd32a';
      window.SoundFX.play('victory');
    } else {
      title.textContent = '🔧 REMORQUAGE À L\'ATELIER';
      title.style.color = '#ff9f43';
      window.SoundFX.play('gameover');
    }
    sub.textContent = reason;

    statsBox.innerHTML = `
      <div class="stat-row"><span>Secteur :</span><strong>${summary.biomeName} (Salle ${summary.room}/10)</strong></div>
      <div class="stat-row"><span>Automates démontés :</span><strong>${summary.kills}</strong></div>
      <div class="stat-row"><span>Impulsions déclenchées :</span><strong>${summary.impulses}</strong></div>
      <div class="stat-row highlight"><span>Écrous Dorés rapportés :</span><strong>+${summary.goldenCogsEarned} ⚙️</strong></div>
      ${
        summary.crystalsEarned > 0
          ? `<div class="stat-row" style="color:#00f2fe;"><span>Cristaux d'Éther :</span><strong>+${summary.crystalsEarned} 💎</strong></div>`
          : ''
      }
    `;

    if (summary.modules.length === 0) {
      modsBox.innerHTML =
        '<span class="empty-mods">Aucun module installé pendant cette sortie.</span>';
    } else {
      modsBox.innerHTML = summary.modules
        .map(
          (m) =>
            `<span class="mod-pill" style="border-color:${m.color}">${m.familyIcon} ${m.name}</span>`
        )
        .join('');
    }

    screen.classList.remove('hidden');

    if (summary.trueEndingUnlocked) {
      setTimeout(() => {
        showTrueEndingModal();
      }, 650);
    }
  }

  function renderPauseModules() {
    const list = document.getElementById('pause-modules-list');
    const mods = window.GameEngine.getEquippedModules();
    const famCounts = window.GameEngine.getFamilyCounts();
    if (!list) return;

    const activeSyns = Object.entries(famCounts)
      .filter(([, count]) => count >= 2)
      .map(([fam, count]) => {
        const syn = window.GAME_CONTENT.synergies[fam];
        return `<div class="pause-mod-item" style="border:1.5px solid ${syn.color}">
          <strong style="color:${syn.color}">${syn.icon} Synergie ${fam} (${count})</strong>
          <span>${count >= 6 ? syn.tier6Desc : count >= 4 ? syn.tier4Desc : syn.tier2Desc}</span>
        </div>`;
      })
      .join('');

    if (mods.length === 0) {
      list.innerHTML =
        '<p style="opacity:0.7;font-size:0.9rem;">Aucun module équipé pour l\'instant.</p>';
    } else {
      list.innerHTML =
        activeSyns +
        mods
          .map(
            (m) =>
              `<div class="pause-mod-item"><strong>${m.familyIcon} ${m.name}</strong><span>${m.desc}</span></div>`
          )
          .join('');
    }
  }

  let toastTimeout = null;
  function showToast(text, durationMs = 3400) {
    const toast = document.getElementById('game-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, durationMs);
  }

  return {
    init,
    showTitleScreen,
    hideTitleScreen,
    updateHUD,
    showModuleChoices,
    showDoorChoices,
    showRepairStation,
    showVendingMachine,
    showTrappedChestModal,
    showGameOver,
    showTrueEndingModal,
    showToast,
    renderWorkshopModal
  };
})();
