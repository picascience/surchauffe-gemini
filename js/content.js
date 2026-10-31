/**
 * CONTENT.JS — Base de données complète Phase 4 :
 * 6 Engins Jouables, 6 Biomes, 30 Automates/Boss, 84 Modules, 6 Synergies (2/4/6),
 * 52 Succès avec récompenses et 7 Chapitres d'Histoire jusqu'à la Vraie Fin.
 * 100% conforme aux règles éthiques : uniquement des machines, automates, cristaux et plantes mécaniques.
 */
window.GAME_CONTENT = {
  // 1. LES 6 ENGINS JOUABLES (Styles de jeu et d'Impulsion uniques)
  heroes: {
    toupillon: {
      id: 'toupillon',
      name: 'Toupillon MK-I',
      subtitle: 'Toupie Blindée Cinétique',
      icon: '⚙️',
      unlockedByDefault: true,
      unlockCrystalCost: 0,
      unlockHint: 'Débloqué dès le départ',
      weaponType: 'rivet',
      impulseType: 'spin_saw',
      description:
        'Gyroscope d\'assaut. Tire des rivets rapides et se transforme en scie-toupie ricocheuse invulnérable quand vous relâchez le pouce !',
      personalityQuote: '« [3000 TR/MIN] Pourquoi contourner un obstacle quand on peut le poncer ? »',
      colors: { body: '#e67e22', trim: '#f39c12', core: '#00f2fe', outline: '#2c1810' },
      baseStats: {
        maxHp: 120,
        moveSpeed: 198,
        damage: 16,
        fireRate: 3.4,
        projectileSpeed: 425,
        projectileCount: 1,
        projectilePierce: 0,
        projectileBounces: 0,
        explosionRadius: 0,
        radius: 19,
        impulseDamage: 38,
        impulseRadius: 48
      }
    },

    lumignon: {
      id: 'lumignon',
      name: 'Lumignon-7',
      subtitle: 'Drone-Lanterne Prismatique',
      icon: '🔮',
      unlockedByDefault: false,
      unlockCrystalCost: 3,
      unlockHint: 'Battre le Boss 1 (Grand Carillon) ou 3 💎',
      weaponType: 'prism_beam',
      impulseType: 'deploy_prism',
      description:
        'Lanterne optique flottante. Ses faisceaux traversent +1 cible et rebondissent sur les murs. Son Impulsion déploie un Prisme-Tourelle autonome pendant 7s !',
      personalityQuote: '« [ANGLE : 45.0°] Une lentille propre est le secret d\'une réfraction parfaite ! »',
      colors: { body: '#1dd1a1', trim: '#48dbfb', core: '#f368e0', outline: '#0a231c' },
      baseStats: {
        maxHp: 105,
        moveSpeed: 210,
        damage: 15,
        fireRate: 3.2,
        projectileSpeed: 520,
        projectileCount: 1,
        projectilePierce: 1,
        projectileBounces: 1,
        explosionRadius: 0,
        radius: 18,
        impulseDamage: 28,
        impulseRadius: 52
      }
    },

    boum_chariot: {
      id: 'boum_chariot',
      name: 'Boum-Chariot',
      subtitle: 'Mortier Blindé à Chenilles',
      icon: '💣',
      unlockedByDefault: false,
      unlockCrystalCost: 5,
      unlockHint: 'Battre le Boss 2 (Orchidée Prismatique) ou 5 💎',
      weaponType: 'mortar_shell',
      impulseType: 'mine_dash',
      description:
        'Petit blindé lourd sur chenilles. Tire des obus explosifs à dégâts de zone. Son Impulsion le propulse et pose 2 Mines à Ressort (3 en Surcharge Dorée) !',
      personalityQuote: '« [POUDRE & PISTON] Si ça résiste encore, c\'est qu\'il manquait un ressort sous l\'obus ! »',
      colors: { body: '#ff5252', trim: '#ffb142', core: '#ffda79', outline: '#2c1111' },
      baseStats: {
        maxHp: 145,
        moveSpeed: 180,
        damage: 27,
        fireRate: 2.05,
        projectileSpeed: 365,
        projectileCount: 1,
        projectilePierce: 0,
        projectileBounces: 0,
        explosionRadius: 46,
        radius: 21,
        impulseDamage: 46,
        impulseRadius: 55
      }
    },

    bobine_z: {
      id: 'bobine_z',
      name: 'Bobine-Z',
      subtitle: 'Sphère Gyro-Magnétique',
      icon: '⚡',
      unlockedByDefault: false,
      unlockCrystalCost: 6,
      unlockHint: 'Battre le Boss 3 (Vulcain-9000) ou 6 💎',
      weaponType: 'tesla_orb',
      impulseType: 'tesla_storm',
      description:
        'Sphère à lévitation magnétique (+35% d\'Arcs Électriques de base). Son Impulsion foudroie instantanément jusqu\'à 5 automates et aspire tous les boulons !',
      personalityQuote: '« [BZZT-ZAP] Oups, mon champ magnétique a encore collé trois clés à molette sur ma coque ! »',
      colors: { body: '#3867d6', trim: '#48dbfb', core: '#ffd32a', outline: '#0c1836' },
      baseStats: {
        maxHp: 115,
        moveSpeed: 215,
        damage: 15,
        fireRate: 3.5,
        projectileSpeed: 450,
        projectileCount: 1,
        projectilePierce: 0,
        projectileBounces: 1,
        explosionRadius: 0,
        radius: 18,
        impulseDamage: 42,
        impulseRadius: 60,
        innateChainChance: 0.35
      }
    },

    sablier_vapeur: {
      id: 'sablier_vapeur',
      name: 'Sablier-Vapeur',
      subtitle: 'Automate Chronométré',
      icon: '⏳',
      unlockedByDefault: false,
      unlockCrystalCost: 8,
      unlockHint: 'Battre le Boss 4 (Astrolabe Magnétique) ou 8 💎',
      weaponType: 'clock_needle',
      impulseType: 'chrono_field',
      description:
        'Châssis horloger de haute précision (+20% Chance Critique, +1 Perforation). Son Impulsion déploie un Champ Temporel qui ralentit ennemis et tirs de 65% !',
      personalityQuote: '« [TIC-TAC 0.002s] Vous êtes en retard de quatre dixièmes sur le planning de démontage ! »',
      colors: { body: '#f39c12', trim: '#dff9fb', core: '#a55eea', outline: '#2c1c08' },
      baseStats: {
        maxHp: 110,
        moveSpeed: 205,
        damage: 19,
        fireRate: 3.1,
        projectileSpeed: 540,
        projectileCount: 1,
        projectilePierce: 1,
        projectileBounces: 0,
        explosionRadius: 0,
        radius: 18,
        impulseDamage: 34,
        impulseRadius: 56,
        innateCritBonus: 0.20
      }
    },

    graine_acier: {
      id: 'graine_acier',
      name: 'Graine-Acier',
      subtitle: 'Capsulier Botanique Mécanique',
      icon: '🌱',
      unlockedByDefault: false,
      unlockCrystalCost: 10,
      unlockHint: 'Battre le Boss 5 (Grand Distillateur) ou 10 💎',
      weaponType: 'seed_shot',
      impulseType: 'bloom_garden',
      description:
        'Jardinier mécanique qui sème des bulbes de cuivre. Son Impulsion fait éclore 2 Fleurs-Canons (3 en Zone Dorée) qui arrosent toute la salle pendant 8s !',
      personalityQuote: '« [PHOTOSYNTHÈSE VAPEUR] Un peu d\'huile chaude, deux boulons, et admirez la floraison ! »',
      colors: { body: '#20bf6b', trim: '#fed330', core: '#26de81', outline: '#0b2919' },
      baseStats: {
        maxHp: 130,
        moveSpeed: 192,
        damage: 14,
        fireRate: 3.3,
        projectileSpeed: 410,
        projectileCount: 2,
        projectilePierce: 0,
        projectileBounces: 1,
        explosionRadius: 0,
        radius: 19,
        impulseDamage: 32,
        impulseRadius: 54
      }
    }
  },

  // 2. LES 6 BIOMES COMPLETS
  biomesOrder: ['horlogerie', 'serres', 'fonderie', 'archives', 'canaux', 'balancier'],

  biomes: {
    horlogerie: {
      id: 'horlogerie',
      order: 1,
      name: 'L\'Horlogerie Rouillée',
      subtitle: 'Secteur 1 — Beffroi Mécanique',
      icon: '⚙️',
      palette: {
        bgOuter: '#1c120c',
        bgFloor: '#2e1f16',
        bgGrid: '#3b281d',
        wallFill: '#543828',
        wallTrim: '#d97724',
        accent: '#f5b041',
        gearDecor: 'rgba(20, 12, 8, 0.32)'
      },
      enemyPool: ['ecrou_errant', 'ressort_bondissant', 'tourelle_rivet', 'scie_rail'],
      midBossId: 'automate_pilon',
      bossId: 'grand_carillon',
      nextBiomeId: 'serres',
      unlockHeroOnClear: 'lumignon'
    },

    serres: {
      id: 'serres',
      order: 2,
      name: 'Les Serres de Cristal',
      subtitle: 'Secteur 2 — Jardin Prismatique',
      icon: '💎',
      palette: {
        bgOuter: '#081b18',
        bgFloor: '#112e28',
        bgGrid: '#1a423a',
        wallFill: '#1f5449',
        wallTrim: '#48dbfb',
        accent: '#1dd1a1',
        gearDecor: 'rgba(72, 219, 251, 0.12)'
      },
      enemyPool: ['bourgeon_laser', 'scarabee_quartz', 'liane_bobine', 'scie_rail'],
      midBossId: 'gardien_geode',
      bossId: 'orchidee_prismatique',
      nextBiomeId: 'fonderie',
      unlockHeroOnClear: 'boum_chariot'
    },

    fonderie: {
      id: 'fonderie',
      order: 3,
      name: 'La Fonderie Thermique',
      subtitle: 'Secteur 3 — Hauts-Fourneaux',
      icon: '🔥',
      palette: {
        bgOuter: '#160d0e',
        bgFloor: '#261719',
        bgGrid: '#382124',
        wallFill: '#4d292c',
        wallTrim: '#ff6b6b',
        accent: '#ff9f43',
        gearDecor: 'rgba(255, 107, 107, 0.14)'
      },
      enemyPool: ['charbon_roulant', 'wagon_belier', 'fourneau_mortier', 'ecrou_errant'],
      midBossId: 'loco_blindee',
      bossId: 'vulcain_9000',
      nextBiomeId: 'archives',
      unlockHeroOnClear: 'bobine_z'
    },

    archives: {
      id: 'archives',
      order: 4,
      name: 'Les Archives Magnétiques',
      subtitle: 'Secteur 4 — Bobines & Mémoires',
      icon: '⚡',
      palette: {
        bgOuter: '#070e1c',
        bgFloor: '#101d36',
        bgGrid: '#182b4d',
        wallFill: '#203a66',
        wallTrim: '#00f2fe',
        accent: '#54a0ff',
        gearDecor: 'rgba(0, 242, 254, 0.12)'
      },
      enemyPool: ['drone_bobine', 'cube_donnees', 'relais_arc', 'scie_rail'],
      midBossId: 'commutateur_geant',
      bossId: 'astrolabe_quantique',
      nextBiomeId: 'canaux',
      unlockHeroOnClear: 'sablier_vapeur'
    },

    canaux: {
      id: 'canaux',
      order: 5,
      name: 'Les Canaux Alchimiques',
      subtitle: 'Secteur 5 — Cuves Pressurisées',
      icon: '🧪',
      palette: {
        bgOuter: '#09170e',
        bgFloor: '#132a1b',
        bgGrid: '#1c3d27',
        wallFill: '#255234',
        wallTrim: '#2ecc71',
        accent: '#f1c40f',
        gearDecor: 'rgba(46, 204, 113, 0.14)'
      },
      enemyPool: ['fiole_instable', 'pompe_piston', 'alambic_tourelle', 'ressort_bondissant'],
      midBossId: 'cuve_centrifuge',
      bossId: 'alambic_ambulant',
      nextBiomeId: 'balancier',
      unlockHeroOnClear: 'graine_acier'
    },

    balancier: {
      id: 'balancier',
      order: 6,
      name: 'Le Cœur du Grand Balancier',
      subtitle: 'Secteur Final — Sanctuaire Horloger',
      icon: '🌟',
      palette: {
        bgOuter: '#0b0914',
        bgFloor: '#181426',
        bgGrid: '#26203b',
        wallFill: '#352d52',
        wallTrim: '#ffd32a',
        accent: '#ffffff',
        gearDecor: 'rgba(255, 211, 42, 0.16)'
      },
      enemyPool: ['sentinelle_or', 'pendule_lame', 'prisme_astral', 'drone_bobine'],
      midBossId: 'regulateur_royal',
      bossId: 'coeur_zero',
      nextBiomeId: null,
      unlockHeroOnClear: null
    }
  },

  // 3. LES 30 AUTOMATES ENNEMIS, SOUS-BOSS ET BOSS (100% Machines/Cristaux sans visage)
  enemies: {
    // Secteur 1
    ecrou_errant: {
      id: 'ecrou_errant', name: 'Écrou-Culbuto', biome: 'Secteur 1', category: 'Châssis Roulant',
      behavior: 'chaser', hp: 36, damage: 11, speed: 98, radius: 15, xpBolts: 2,
      colors: { main: '#b86b35', secondary: '#e59866', core: '#ff6b35' },
      codexDesc: 'Gros écrou hexagonal monté sur un gyroscope grippé.'
    },
    ressort_bondissant: {
      id: 'ressort_bondissant', name: 'Bobine-Ressort', biome: 'Secteur 1', category: 'Piston Sauteur',
      behavior: 'jumper', hp: 44, damage: 14, speed: 75, radius: 16, xpBolts: 3,
      colors: { main: '#48a999', secondary: '#76d7c4', core: '#ffe66d' },
      codexDesc: 'Cylindre de cuivre sur ressort hélicoïdal qui se comprime avant de bondir.'
    },
    tourelle_rivet: {
      id: 'tourelle_rivet', name: 'Trépied-Riveur', biome: 'Secteur 1', category: 'Artillerie Fixe',
      behavior: 'shooter', hp: 48, damage: 12, speed: 0, radius: 18, xpBolts: 3,
      colors: { main: '#6c7a89', secondary: '#d35400', core: '#ff3838' },
      codexDesc: 'Outil d\'assemblage industriel dont le canon rotatif expulse trois billes de laiton.'
    },
    scie_rail: {
      id: 'scie_rail', name: 'Disque-Ricochet', biome: 'Secteur 1', category: 'Découpeuse Cinétique',
      behavior: 'bouncer', hp: 42, damage: 13, speed: 170, radius: 16, xpBolts: 3,
      colors: { main: '#95a5a6', secondary: '#f39c12', core: '#00f2fe' },
      codexDesc: 'Roue dentée détachée de son axe qui rebondit contre les parois.'
    },
    automate_pilon: {
      id: 'automate_pilon', name: 'Le Marteau-Presse MK-IV', biome: 'Secteur 1', category: 'Sous-Boss S.1',
      behavior: 'warden', isBoss: true, isMidBoss: true, hp: 540, damage: 16, speed: 78, radius: 32, xpBolts: 14,
      colors: { main: '#d35400', secondary: '#f1c40f', core: '#00f2fe' },
      codexDesc: 'Lourde presse industrielle émettant des anneaux sismiques.'
    },
    grand_carillon: {
      id: 'grand_carillon', name: 'Le Grand Carillon Détraqué', biome: 'Secteur 1', category: 'Boss Secteur 1',
      behavior: 'boss_carillon', isBoss: true, hp: 1350, damage: 20, speed: 105, radius: 44, xpBolts: 30,
      colors: { main: '#d97724', secondary: '#ffd32a', core: '#00f2fe' },
      codexDesc: 'Beffroi horloger sur rail magnétique combinant ondes acoustiques et chute de poids de 1000 KG.'
    },

    // Secteur 2
    bourgeon_laser: {
      id: 'bourgeon_laser', name: 'Bourgeon-Prisme', biome: 'Secteur 2', category: 'Fleur Optique',
      behavior: 'sniper_prism', hp: 52, damage: 14, speed: 35, radius: 17, xpBolts: 3,
      colors: { main: '#10ac84', secondary: '#48dbfb', core: '#f368e0' },
      codexDesc: 'Corolle mécanique en verre taillé qui tire un rayon photonique véloce.'
    },
    scarabee_quartz: {
      id: 'scarabee_quartz', name: 'Foreur de Quartz', biome: 'Secteur 2', category: 'Cristal Propulsé',
      behavior: 'jumper', hp: 58, damage: 15, speed: 95, radius: 16, xpBolts: 3,
      colors: { main: '#9b59b6', secondary: '#48dbfb', core: '#ffffff' },
      codexDesc: 'Bloc d\'améthyste taillé en pointe et propulsé par un ressort à gaz.'
    },
    liane_bobine: {
      id: 'liane_bobine', name: 'Bulbe-Ronce Voltaïque', biome: 'Secteur 2', category: 'Botanique Magnétique',
      behavior: 'pulse_plant', hp: 64, damage: 14, speed: 55, radius: 18, xpBolts: 4,
      colors: { main: '#1dd1a1', secondary: '#feca57', core: '#00d2d3' },
      codexDesc: 'Bulbe de cuivre qui libère des anneaux pollinisateurs électrifiés.'
    },
    gardien_geode: {
      id: 'gardien_geode', name: 'Le Monolithe Géode', biome: 'Secteur 2', category: 'Sous-Boss S.2',
      behavior: 'warden_geode', isBoss: true, isMidBoss: true, hp: 740, damage: 18, speed: 72, radius: 34, xpBolts: 16,
      colors: { main: '#8e44ad', secondary: '#48dbfb', core: '#1dd1a1' },
      codexDesc: 'Noyau minéral rotatif hérissé de prismes réflecteurs.'
    },
    orchidee_prismatique: {
      id: 'orchidee_prismatique', name: 'L\'Orchidée Prismatique', biome: 'Secteur 2', category: 'Boss Secteur 2',
      behavior: 'boss_orchidee', isBoss: true, hp: 1750, damage: 22, speed: 85, radius: 46, xpBolts: 36,
      colors: { main: '#1dd1a1', secondary: '#f368e0', core: '#48dbfb' },
      codexDesc: 'Grande corolle mécanique de cristal et de laiton à 6 pétales-miroirs rotatifs.'
    },

    // Secteur 3
    charbon_roulant: {
      id: 'charbon_roulant', name: 'Sphère-Scorie', biome: 'Secteur 3', category: 'Noyau Incandescent',
      behavior: 'volatile_chaser', hp: 56, damage: 16, speed: 118, radius: 15, xpBolts: 3,
      colors: { main: '#4b4b4b', secondary: '#ff5252', core: '#ffda79' },
      codexDesc: 'Bille d\'acier en fusion qui libère 4 flammèches radiales à la destruction.'
    },
    wagon_belier: {
      id: 'wagon_belier', name: 'Wagonnet-Lingot', biome: 'Secteur 3', category: 'Convoi Blindé',
      behavior: 'jumper', hp: 76, damage: 18, speed: 88, radius: 19, xpBolts: 4,
      colors: { main: '#576574', secondary: '#ff793f', core: '#ff5252' },
      codexDesc: 'Chariot de mine surblindé chargé de lingots brûlants.'
    },
    fourneau_mortier: {
      id: 'fourneau_mortier', name: 'Cuve-Mortier', biome: 'Secteur 3', category: 'Artillerie de Fonte',
      behavior: 'mortar_bot', hp: 72, damage: 17, speed: 45, radius: 19, xpBolts: 4,
      colors: { main: '#cd6133', secondary: '#ffda79', core: '#ff5252' },
      codexDesc: 'Chaudière mobile qui expulse des gouttes de métal en fusion en cloche.'
    },
    loco_blindee: {
      id: 'loco_blindee', name: 'La Foreuse Thermique MK-IX', biome: 'Secteur 3', category: 'Sous-Boss S.3',
      behavior: 'warden', isBoss: true, isMidBoss: true, hp: 960, damage: 21, speed: 95, radius: 35, xpBolts: 18,
      colors: { main: '#b33939', secondary: '#ffb142', core: '#ffda79' },
      codexDesc: 'Tunnelier à vapeur surchauffé qui traverse les galeries de basalte.'
    },
    vulcain_9000: {
      id: 'vulcain_9000', name: 'Vulcain-9000, Haut-Fourneau', biome: 'Secteur 3', category: 'Boss Secteur 3',
      behavior: 'boss_vulcain', isBoss: true, hp: 2300, damage: 25, speed: 90, radius: 48, xpBolts: 45,
      colors: { main: '#b33939', secondary: '#ff793f', core: '#ffda79' },
      codexDesc: 'Colossale chaudière industrielle sur vérins hydrauliques.'
    },

    // Secteur 4 : Les Archives Magnétiques
    drone_bobine: {
      id: 'drone_bobine', name: 'Sphère-Inductrice', biome: 'Secteur 4', category: 'Bobine Flottante',
      behavior: 'chaser', hp: 68, damage: 17, speed: 122, radius: 16, xpBolts: 4,
      colors: { main: '#203a66', secondary: '#00f2fe', core: '#ffffff' },
      codexDesc: 'Condensateur sphérique en lévitation qui poursuit les sources métalliques.'
    },
    cube_donnees: {
      id: 'cube_donnees', name: 'Monolithe-Mémoire', biome: 'Secteur 4', category: 'Archive Blindée',
      behavior: 'shooter', hp: 82, damage: 18, speed: 30, radius: 19, xpBolts: 4,
      colors: { main: '#3867d6', secondary: '#48dbfb', core: '#ffd32a' },
      codexDesc: 'Bloc de stockage poinçonné qui projette des salves d\'impulsions binaires.'
    },
    relais_arc: {
      id: 'relais_arc', name: 'Diffuseur Voltaïque', biome: 'Secteur 4', category: 'Tour Tesla',
      behavior: 'pulse_plant', hp: 76, damage: 18, speed: 60, radius: 18, xpBolts: 4,
      colors: { main: '#4b6584', secondary: '#00f2fe', core: '#54a0ff' },
      codexDesc: 'Isolateur en porcelaine et cuivre qui décharge des anneaux haute-tension.'
    },
    commutateur_geant: {
      id: 'commutateur_geant', name: 'Le Disjoncteur Central', biome: 'Secteur 4', category: 'Sous-Boss S.4',
      behavior: 'warden_geode', isBoss: true, isMidBoss: true, hp: 1180, damage: 22, speed: 82, radius: 35, xpBolts: 20,
      colors: { main: '#1e3799', secondary: '#00f2fe', core: '#ffd32a' },
      codexDesc: 'Transformateur haute-tension gardant le cœur des Archives Magnétiques.'
    },
    astrolabe_quantique: {
      id: 'astrolabe_quantique', name: 'L\'Astrolabe Magnétique', biome: 'Secteur 4', category: 'Boss Secteur 4',
      behavior: 'boss_orchidee', isBoss: true, hp: 2800, damage: 26, speed: 95, radius: 48, xpBolts: 50,
      colors: { main: '#3867d6', secondary: '#00f2fe', core: '#ffd32a' },
      codexDesc: 'Anneaux gyroscopiques géants en rotation qui divisent l\'arène en cadrans électrifiés.'
    },

    // Secteur 5 : Les Canaux Alchimiques
    fiole_instable: {
      id: 'fiole_instable', name: 'Flacon-Pressurisé', biome: 'Secteur 5', category: 'Verrerie Mobile',
      behavior: 'volatile_chaser', hp: 75, damage: 19, speed: 125, radius: 16, xpBolts: 4,
      colors: { main: '#20bf6b', secondary: '#f1c40f', core: '#ffffff' },
      codexDesc: 'Bonbonne de verre blindé qui projette 4 jets acides lorsque sa valve cède.'
    },
    pompe_piston: {
      id: 'pompe_piston', name: 'Bélier-Hydraulique', biome: 'Secteur 5', category: 'Compresseur',
      behavior: 'jumper', hp: 92, damage: 20, speed: 92, radius: 19, xpBolts: 5,
      colors: { main: '#26de81', secondary: '#eb3b5a', core: '#fed330' },
      codexDesc: 'Piston de canalisation qui se propulse par jets de vapeur sous haute pression.'
    },
    alambic_tourelle: {
      id: 'alambic_tourelle', name: 'Vaporisateur Chimique', biome: 'Secteur 5', category: 'Distillateur',
      behavior: 'mortar_bot', hp: 88, damage: 20, speed: 48, radius: 19, xpBolts: 5,
      colors: { main: '#0fb9b1', secondary: '#2ecc71', core: '#f1c40f' },
      codexDesc: 'Serpentin de cuivre sur roues qui expulse des bulles corrosives en cloche.'
    },
    cuve_centrifuge: {
      id: 'cuve_centrifuge', name: 'La Centrifugeuse Lourde', biome: 'Secteur 5', category: 'Sous-Boss S.5',
      behavior: 'warden', isBoss: true, isMidBoss: true, hp: 1450, damage: 24, speed: 88, radius: 36, xpBolts: 24,
      colors: { main: '#20bf6b', secondary: '#f1c40f', core: '#eb3b5a' },
      codexDesc: 'Tambour d\'épuration en rotation rapide qui sème des gouttelettes pressurisées.'
    },
    alambic_ambulant: {
      id: 'alambic_ambulant', name: 'Le Grand Distillateur', biome: 'Secteur 5', category: 'Boss Secteur 5',
      behavior: 'boss_vulcain', isBoss: true, hp: 3400, damage: 28, speed: 96, radius: 50, xpBolts: 58,
      colors: { main: '#20bf6b', secondary: '#fed330', core: '#eb3b5a' },
      codexDesc: 'Usine alchimique ambulante à trois ballons de verre qui inonde la salle de réactifs bouillonnants.'
    },

    // Secteur 6 : Le Cœur du Grand Balancier
    sentinelle_or: {
      id: 'sentinelle_or', name: 'Pignon-Gardien d\'Or', biome: 'Secteur 6', category: 'Horlogerie Pure',
      behavior: 'sniper_prism', hp: 96, damage: 21, speed: 65, radius: 18, xpBolts: 5,
      colors: { main: '#ffd32a', secondary: '#ffffff', core: '#00f2fe' },
      codexDesc: 'Automate de précision taillé dans l\'alliage d\'or inaltérable du Grand Balancier.'
    },
    pendule_lame: {
      id: 'pendule_lame', name: 'Faucheuse-Pendulaire', biome: 'Secteur 6', category: 'Balancier Cinétique',
      behavior: 'bouncer', hp: 90, damage: 22, speed: 195, radius: 18, xpBolts: 5,
      colors: { main: '#f5b041', secondary: '#a55eea', core: '#ffffff' },
      codexDesc: 'Lentille de pendule affûtée qui ricoche à très haute vitesse sur les murs.'
    },
    prisme_astral: {
      id: 'prisme_astral', name: 'Octaèdre Harmonique', biome: 'Secteur 6', category: 'Résonateur',
      behavior: 'pulse_plant', hp: 105, damage: 22, speed: 70, radius: 19, xpBolts: 6,
      colors: { main: '#a55eea', secondary: '#ffd32a', core: '#00f2fe' },
      codexDesc: 'Cristal de synchronisation émettant des ondes acoustiques d\'une pureté absolue.'
    },
    regulateur_royal: {
      id: 'regulateur_royal', name: 'Le Régulateur Solaire', biome: 'Secteur 6', category: 'Sous-Boss S.6',
      behavior: 'warden_geode', isBoss: true, isMidBoss: true, hp: 1850, damage: 26, speed: 92, radius: 36, xpBolts: 28,
      colors: { main: '#ffd32a', secondary: '#a55eea', core: '#ffffff' },
      codexDesc: 'Mécanisme d\'échappement royal qui protège l\'accès au Cœur Zéro.'
    },
    coeur_zero: {
      id: 'coeur_zero', name: 'Cœur Zéro, L\'Architecte Automatique', biome: 'Secteur 6', category: 'BOSS FINAL',
      behavior: 'boss_coeur_zero', isBoss: true, hp: 4200, damage: 30, speed: 105, radius: 52, xpBolts: 80,
      colors: { main: '#ffd32a', secondary: '#00f2fe', core: '#ffffff' },
      codexDesc:
        'Le noyau central d\'Automatia détraqué par l\'orage magnétique. Ses 3 phases combinent toutes les technologies des ruines : horlogerie, optique, thermique et magnétisme.'
    }
  },

  // 4. LES 6 FAMILLES DE SYNERGIES (Paliers à 2, 4 et 6 modules !)
  synergies: {
    Horlogerie: {
      name: 'Horlogerie', icon: '⚙️', color: '#f39c12',
      tier2Desc: '(2) +18% Cadence de tir globale',
      tier4Desc: '(4) +1 Pignon Satellite orbital & +25% Cadence',
      tier6Desc: '(6) Maître Horloger : +2 Pignons Orbitaux & -30% Recharge d\'Impulsion'
    },
    Cinétique: {
      name: 'Cinétique', icon: '🔩', color: '#00f2fe',
      tier2Desc: '(2) +20% Dégâts des projectiles & Recul accru',
      tier4Desc: '(4) +1 Rebond sur les murs & +25% Dégâts aux Boss',
      tier6Desc: '(6) Hyper-Vélocité : +1 Projectile, +1 Perforation & +35% Dégâts'
    },
    Thermique: {
      name: 'Thermique', icon: '🔥', color: '#ff6b6b',
      tier2Desc: '(2) +25% Vitesse de montée en Pression',
      tier4Desc: '(4) Chaque Impulsion déclenche une Nova Thermique',
      tier6Desc: '(6) Fusion Solaire : Vos tirs explosent et l\'Impulsion tire 12 projectiles'
    },
    Magnétisme: {
      name: 'Magnétisme', icon: '⚡', color: '#54a0ff',
      tier2Desc: '(2) +20% Chance d\'Arc Électrique sur chaque tir',
      tier4Desc: '(4) Les éclairs infligent +60% de dégâts et chargent la Pression',
      tier6Desc: '(6) Bobine Suprême : 100% de chance d\'Arc Électrique & +50% Dégâts d\'éclair'
    },
    Châssis: {
      name: 'Châssis', icon: '🛡️', color: '#2ecc71',
      tier2Desc: '(2) +30 Blindage Max & +2 Armure plate',
      tier4Desc: '(4) Auto-Soudure : régénère +3 PV toutes les 4 secondes',
      tier6Desc: '(6) Forteresse Mobile : +80 PV Max, +5 Armure & Régénération doublée'
    },
    Optique: {
      name: 'Optique', icon: '🔮', color: '#a55eea',
      tier2Desc: '(2) +15% Chance de Coup Critique',
      tier4Desc: '(4) Les Coups Critiques infligent x2.5 dégâts',
      tier6Desc: '(6) Prisme Absolu : +30% Chance Critique & Critiques x3.0 dégâts !'
    }
  },

  // 5. ARBRE D'AMÉLIORATIONS PERMANENTES DE L'ATELIER
  workshopUpgrades: [
    {
      id: 'hullPlating', name: 'Plaques de Cuivre Trempé', icon: '🛡️', maxLevel: 5, baseCost: 12, costGrowth: 14,
      descPerLevel: '+15 Blindage Maximum au départ de chaque expédition.',
      statPreview: (lvl) => `Bonus actuel : +${lvl * 15} PV`
    },
    {
      id: 'steamTurbine', name: 'Ressort de Percuteur', icon: '🔩', maxLevel: 5, baseCost: 15, costGrowth: 16,
      descPerLevel: '+10% Dégâts des tirs et des engrenages.',
      statPreview: (lvl) => `Bonus actuel : +${lvl * 10}% Dégâts`
    },
    {
      id: 'prePressurized', name: 'Soupape Pré-Pressurisée', icon: '⚡', maxLevel: 5, baseCost: 14, costGrowth: 15,
      descPerLevel: '+12% Pression initiale à chaque salle et +8% vitesse de charge.',
      statPreview: (lvl) => `Départ : ${lvl * 12}% | Charge : +${lvl * 8}%`
    },
    {
      id: 'impulseGears', name: 'Pignons de Surcharge', icon: '⚙️', maxLevel: 5, baseCost: 16, costGrowth: 18,
      descPerLevel: '+15% Dégâts d\'Impulsion et -8% délai de récupération.',
      statPreview: (lvl) => `Impulsion : +${lvl * 15}% Dégâts`
    },
    {
      id: 'emergencyKit', name: 'Soudeuse de Campagne', icon: '🔧', maxLevel: 5, baseCost: 18, costGrowth: 20,
      descPerLevel: 'Répare automatiquement +6 PV à la fin de chaque salle.',
      statPreview: (lvl) => `Soudure : +${lvl * 6} PV / salle`
    },
    {
      id: 'magnetCoil', name: 'Bobine d\'Aspiration', icon: '🧲', maxLevel: 5, baseCost: 12, costGrowth: 14,
      descPerLevel: '+25% Rayon d\'aimant à boulons et +10% expérience gagnée.',
      statPreview: (lvl) => `Aimant : +${lvl * 25}% | XP : +${lvl * 10}%`
    },
    {
      id: 'scrapRecycler', name: 'Compacteur Doré', icon: '♻️', maxLevel: 5, baseCost: 20, costGrowth: 22,
      descPerLevel: '+20% d\'Écrous Dorés rapportés à l\'Atelier en fin de sortie.',
      statPreview: (lvl) => `Butin Doré : +${lvl * 20}%`
    },
    {
      id: 'opticCalibrator', name: 'Prisme de Visée', icon: '🔮', maxLevel: 5, baseCost: 18, costGrowth: 20,
      descPerLevel: '+4% de chance de Coup Critique (dégâts x2) dès le départ.',
      statPreview: (lvl) => `Critique bonus : +${lvl * 4}%`
    }
  ],

  // 6. AUTOMATES-TECHNICIENS DU CAMP & JOURNAL NARRATIF (7 CHAPITRES + VRAIE FIN)
  workshopNpcs: [
    {
      id: 'grue_4',
      name: 'Bras-Soudeur #4',
      icon: '🦾',
      role: 'Mécanicien en Chef',
      getDialogue: (save) => {
        if (save.stats.trueEndingSeen) {
          return '« 🌟 LE GRAND BALANCIER CHANTE À NOUVEAU ! Grâce à tes 3 Clés d\'Horlogerie, toute la cité d\'Automatia est recalibrée ! »';
        }
        const keysCount = (save.stats.heroesClearedSector6 || []).length;
        if (keysCount > 0 && keysCount < 3) {
          return `« Tu as forgé ${keysCount}/3 Clés d'Horlogerie au Secteur 6 ! Triomphe de Cœur Zéro avec ${3 - keysCount} autre(s) châssis pour déclencher le Réveil Complet ! »`;
        }
        return `« ${save.unlockedAchievements.length}/52 Succès accomplis et ${save.discoveredModules.length}/84 Modules répertoriés ! Prêt pour le prochain Secteur ? »`;
      }
    },
    {
      id: 'manometre_chef',
      name: 'Chroniqueur-Bande #1',
      icon: '📠',
      role: 'Mémoire de la Caravane',
      getDialogue: (save) => {
        const chap = window.GAME_CONTENT.storyChapters[Math.min(6, save.unlockedBiomes.length - 1)];
        return `« [${chap.title}] : ${chap.text} »`;
      }
    }
  ],

  storyChapters: [
    {
      id: 1,
      title: 'Chapitre 1 : L\'Orage Magnétique',
      text: 'Il y a cent cycles, une décharge solaire a aimanté les ressorts du Grand Balancier. Depuis, les automates des étages tournent en boucle sans savoir que la tempête est finie.'
    },
    {
      id: 2,
      title: 'Chapitre 2 : Les Serres Déréglées',
      text: 'Le Grand Carillon remis à l\'heure, les portes de verre s\'ouvrent ! Les plantes mécaniques des Serres cherchaient simplement la lumière du beffroi supérieur.'
    },
    {
      id: 3,
      title: 'Chapitre 3 : Les Forges Sous Pression',
      text: 'Sous les racines de quartz gronde la Fonderie Thermique. Vulcain-9000 chauffe encore les conduites à plein régime faute d\'avoir reçu le signal d\'arrêt.'
    },
    {
      id: 4,
      title: 'Chapitre 4 : La Mémoire Aimantée',
      text: 'Les Archives Magnétiques conservent tous les plans originaux d\'Automatia. C\'est ici que l\'Astrolabe retient prisonniers les signaux de synchronisation.'
    },
    {
      id: 5,
      title: 'Chapitre 5 : L\'Élixir de Lubrification',
      text: 'Dans les Canaux Alchimiques circule l\'huile dorée qui nourrit le Grand Balancier. Purifier le Grand Distillateur ouvrira le Sanctuaire Final !'
    },
    {
      id: 6,
      title: 'Chapitre 6 : Devant le Cœur Zéro',
      text: 'Voici le Cœur du Grand Balancier ! Cœur Zéro attend que trois châssis différents viennent tourner ses trois serrures horlogères pour relancer la cité.'
    },
    {
      id: 7,
      title: 'Épilogue : Le Réveil d\'Automatia',
      text: 'Les trois Clés d\'Horlogerie sont enclenchées ! Du Beffroi jusqu\'aux Serres de Cristal, tous les automates retrouvent leur cadence harmonieuse. Merci, Pilote !'
    }
  ],

  // 7. LES 84 MODULES D'INVENTION (14 par famille x 6 familles)
  modules: [
    // ==================== FAMILLE HORLOGERIE (⚙️ 14 modules) ====================
    { id: 'double_canon', name: 'Buse Jumelée', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'rare', color: '#f39c12',
      desc: '+1 Projectile par tir, mais -10% de dégâts unitaires.', apply: (s) => { s.projectileCount += 1; s.damage *= 0.90; } },
    { id: 'satellites_laiton', name: 'Pignons Satellites', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'epic', color: '#feca57',
      desc: 'Ajoute +1 engrenage orbital qui tourne autour de votre châssis.', apply: (s) => { s.orbitalCogs += 1; } },
    { id: 'onde_choc_impulse', name: 'Tambour à Résonance', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'rare', color: '#f39c12',
      desc: 'À la fin de chaque Impulsion, émet une onde acoustique circulaire (+45% dégâts).', apply: (s) => { s.impulseShockwave = true; s.impulseRadius *= 1.3; s.impulseDamage *= 1.45; } },
    { id: 'echappement_ancre', name: 'Échappement à Ancre', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '+22% Cadence de tir et +10% vitesse des projectiles.', apply: (s) => { s.fireRate *= 1.22; s.projectileSpeed *= 1.10; } },
    { id: 'balancier_chronometre', name: 'Balancier Chronométré', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '-20% Temps de recharge d\'Impulsion et +20% dégâts d\'Impulsion.', apply: (s) => { s.impulseCooldownMs *= 0.80; s.impulseDamage *= 1.20; } },
    { id: 'couronne_dentee', name: 'Couronne Dentée Triple', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'epic', color: '#feca57',
      desc: '+2 Pignons Satellites orbitaux d\'un coup !', apply: (s) => { s.orbitalCogs += 2; } },
    { id: 'ressort_spiral', name: 'Ressort Spiral en Or', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'rare', color: '#f39c12',
      desc: '+18% Cadence de tir et +15% vitesse de déplacement.', apply: (s) => { s.fireRate *= 1.18; s.moveSpeed *= 1.15; } },
    { id: 'carillon_interne', name: 'Timbre d\'Horloge', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '+25% Rayon d\'Impulsion et +20% dégâts d\'Impulsion.', apply: (s) => { s.impulseRadius *= 1.25; s.impulseDamage *= 1.20; } },
    { id: 'remontoir_perpetuel', name: 'Remontoir Perpétuel', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'rare', color: '#f39c12',
      desc: '+15% Cadence de tir et vous démarrez chaque salle avec +20% de Pression.', apply: (s) => { s.fireRate *= 1.15; s.startRoomPressure = (s.startRoomPressure || 0) + 20; } },
    { id: 'roue_queteuse', name: 'Roue de Compte', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '+16% Cadence de tir et +16% Dégâts.', apply: (s) => { s.fireRate *= 1.16; s.damage *= 1.16; } },
    { id: 'barillet_double', name: 'Double Barillet', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'rare', color: '#f39c12',
      desc: '+30% Cadence de tir et +15% Vitesse des projectiles.', apply: (s) => { s.fireRate *= 1.30; s.projectileSpeed *= 1.15; } },
    { id: 'aiguille_seconde', name: 'Trotteuse Foudroyante', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '+20% Vitesse de déplacement et -15% délai d\'Impulsion.', apply: (s) => { s.moveSpeed *= 1.20; s.impulseCooldownMs *= 0.85; } },
    { id: 'tourbillon_royal', name: 'Cage à Tourbillon Royal', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'epic', color: '#feca57',
      desc: '+1 Pignon Satellite, +20% Cadence et +20% Dégâts !', apply: (s) => { s.orbitalCogs += 1; s.fireRate *= 1.20; s.damage *= 1.20; } },
    { id: 'metronome_cuivre', name: 'Métronome de Laiton', family: 'Horlogerie', familyIcon: '⚙️', rarity: 'common', color: '#f39c12',
      desc: '+18% Cadence de tir et +15 PV de Blindage Max.', apply: (s, p) => { s.fireRate *= 1.18; s.maxHp += 15; if (p) p.hp += 15; } },

    // ==================== FAMILLE CINÉTIQUE (🔩 14 modules) ====================
    { id: 'ressort_ricochet', name: 'Billes en Caoutchouc Vulcanisé', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: 'Vos tirs rebondissent +1 fois contre les murs et gagnent +15% de vitesse.', apply: (s) => { s.projectileBounces += 1; s.projectileSpeed *= 1.15; } },
    { id: 'rivets_lourds', name: 'Poinçons en Tungstène', family: 'Cinétique', familyIcon: '🔩', rarity: 'common', color: '#00f2fe',
      desc: '+30% Dégâts des tirs et repoussement accru sur les automates.', apply: (s) => { s.damage *= 1.30; s.knockback += 35; } },
    { id: 'foreuse_perforante', name: 'Pointes Hélicoïdales', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: 'Vos projectiles traversent +1 automate supplémentaire et gagnent +12% dégâts.', apply: (s) => { s.projectilePierce += 1; s.damage *= 1.12; } },
    { id: 'canon_raye', name: 'Canon Rayé Haute-Vélocité', family: 'Cinétique', familyIcon: '🔩', rarity: 'common', color: '#00f2fe',
      desc: '+35% Vitesse des projectiles et +18% Dégâts.', apply: (s) => { s.projectileSpeed *= 1.35; s.damage *= 1.18; } },
    { id: 'marteau_pneumatique', name: 'Culasse Pneumatique', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: '+25% Dégâts et +30% Dégâts supplémentaires contre les Boss et Sous-Boss.', apply: (s) => { s.damage *= 1.25; s.bossDamageMult = (s.bossDamageMult || 1) * 1.30; } },
    { id: 'double_ricochet', name: 'Parois Gyro-Réflectrices', family: 'Cinétique', familyIcon: '🔩', rarity: 'epic', color: '#00f2fe',
      desc: '+2 Rebonds contre les murs et +1 Perforation pour tous vos tirs !', apply: (s) => { s.projectileBounces += 2; s.projectilePierce += 1; } },
    { id: 'billes_acier', name: 'Roulements d\'Acier Massif', family: 'Cinétique', familyIcon: '🔩', rarity: 'common', color: '#00f2fe',
      desc: '+22% Dégâts et +15 Blindage Max.', apply: (s, p) => { s.damage *= 1.22; s.maxHp += 15; if (p) p.hp += 15; } },
    { id: 'eventail_laiton', name: 'Répartiteur à 3 Voies', family: 'Cinétique', familyIcon: '🔩', rarity: 'epic', color: '#00f2fe',
      desc: '+2 Projectiles par tir en éventail (-15% dégâts unitaires).', apply: (s) => { s.projectileCount += 2; s.damage *= 0.85; } },
    { id: 'belier_inertie', name: 'Volant d\'Inertie Lourd', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: '+35% Dégâts d\'Impulsion et +20% Dégâts des tirs.', apply: (s) => { s.impulseDamage *= 1.35; s.damage *= 1.20; } },
    { id: 'pointes_diamant', name: 'Trépan au Diamant', family: 'Cinétique', familyIcon: '🔩', rarity: 'epic', color: '#00f2fe',
      desc: '+2 Perforations et +25% Dégâts contre les Boss !', apply: (s) => { s.projectilePierce += 2; s.bossDamageMult = (s.bossDamageMult || 1) * 1.25; } },
    { id: 'ressort_rappel', name: 'Ressort de Rappel', family: 'Cinétique', familyIcon: '🔩', rarity: 'common', color: '#00f2fe',
      desc: '+1 Rebond sur les murs et +12% Cadence de tir.', apply: (s) => { s.projectileBounces += 1; s.fireRate *= 1.12; } },
    { id: 'piston_choc', name: 'Amortisseur à Choc', family: 'Cinétique', familyIcon: '🔩', rarity: 'common', color: '#00f2fe',
      desc: '+24% Dégâts et +25 Recul cinétique.', apply: (s) => { s.damage *= 1.24; s.knockback += 25; } },
    { id: 'turbine_balistique', name: 'Compresseur Balistique', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: '+28% Dégâts et +25% Vitesse des projectiles.', apply: (s) => { s.damage *= 1.28; s.projectileSpeed *= 1.25; } },
    { id: 'ecrou_geant', name: 'Calibre Surdimensionné', family: 'Cinétique', familyIcon: '🔩', rarity: 'rare', color: '#00f2fe',
      desc: '+38% Dégâts des tirs, mais -8% Cadence de tir.', apply: (s) => { s.damage *= 1.38; s.fireRate *= 0.92; } },

    // ==================== FAMILLE THERMIQUE (🔥 14 modules) ====================
    { id: 'sillage_vapeur', name: 'Soupape d\'Échappement', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: 'Votre Impulsion laisse derrière vous des nuages de vapeur brûlante.', apply: (s) => { s.impulseSteamClouds += 4; s.impulseDamage += 12; } },
    { id: 'turbine_haute_pression', name: 'Turbine Surcompressée', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: '+25% Cadence de tir et votre Jauge de Pression monte 25% plus vite.', apply: (s) => { s.fireRate *= 1.25; s.pressureRateMult *= 1.25; } },
    { id: 'surcharge_doree', name: 'Manomètre de Précision', family: 'Thermique', familyIcon: '🔥', rarity: 'epic', color: '#ffd32a',
      desc: 'Déclencher une Impulsion en Zone Dorée (65%+) tire une couronne de 8 projectiles !', apply: (s) => { s.goldImpulseNova += 8; } },
    { id: 'poudre_alchimique', name: 'Capsules Thermobarriques', family: 'Thermique', familyIcon: '🔥', rarity: 'rare', color: '#ff6b6b',
      desc: 'Tous vos projectiles explosent à l\'impact (+28px de rayon AoE).', apply: (s) => { s.explosionRadius = (s.explosionRadius || 0) + 28; s.damage *= 1.12; } },
    { id: 'chaudiere_vive', name: 'Brûleur à Huile Lourde', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: '+35% Vitesse de gain de Pression et +20% Dégâts d\'Impulsion.', apply: (s) => { s.pressureRateMult *= 1.35; s.impulseDamage *= 1.20; } },
    { id: 'injecteur_vapeur', name: 'Injecteur Buse-Rouge', family: 'Thermique', familyIcon: '🔥', rarity: 'rare', color: '#ff6b6b',
      desc: 'Tant que votre Pression dépasse 50%, vous gagnez +30% de Dégâts.', apply: (s) => { s.highPressureDmgBonus = (s.highPressureDmgBonus || 0) + 0.30; } },
    { id: 'coeur_fusion', name: 'Cœur de Haut-Fourneau', family: 'Thermique', familyIcon: '🔥', rarity: 'epic', color: '#ff6b6b',
      desc: '+40% Dégâts d\'Impulsion, nuages de vapeur doublés et +25 PV Max.', apply: (s, p) => { s.impulseDamage *= 1.40; s.impulseSteamClouds += 4; s.maxHp += 25; if (p) p.hp += 25; } },
    { id: 'soupape_securite', name: 'Purgeur Automatique', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: 'Chaque Impulsion en Zone Dorée répare immédiatement +4 PV de Blindage.', apply: (s) => { s.healOnGoldImpulse = (s.healOnGoldImpulse || 0) + 4; } },
    { id: 'tuyere_postcombustion', name: 'Tuyère Post-Combustion', family: 'Thermique', familyIcon: '🔥', rarity: 'rare', color: '#ff6b6b',
      desc: '+30% Vitesse d\'Impulsion et +30% Dégâts d\'Impulsion.', apply: (s) => { s.impulseSpeedMult *= 1.30; s.impulseDamage *= 1.30; } },
    { id: 'grille_incandescente', name: 'Grille Incandescente', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: '+22% Dégâts et +20% Vitesse de gain de Pression.', apply: (s) => { s.damage *= 1.22; s.pressureRateMult *= 1.20; } },
    { id: 'bombe_vapeur', name: 'Sifflet de Surchauffe', family: 'Thermique', familyIcon: '🔥', rarity: 'rare', color: '#ff6b6b',
      desc: '+4 Projectiles dans la couronne de Surcharge Dorée et +15% Cadence.', apply: (s) => { s.goldImpulseNova += 4; s.fireRate *= 1.15; } },
    { id: 'piston_allumage', name: 'Bougie à Étincelle Chaude', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: 'Vous démarrez chaque salle avec +25% de Pression et +15% Dégâts.', apply: (s) => { s.startRoomPressure = (s.startRoomPressure || 0) + 25; s.damage *= 1.15; } },
    { id: 'fournaise_orbitale', name: 'Brasero Gyroscopique', family: 'Thermique', familyIcon: '🔥', rarity: 'epic', color: '#ff6b6b',
      desc: '+1 Pignon Orbital et tous vos projectiles gagnent +22px de rayon d\'explosion !', apply: (s) => { s.orbitalCogs += 1; s.explosionRadius = (s.explosionRadius || 0) + 22; } },
    { id: 'radiateur_cuivre', name: 'Échangeur Thermique', family: 'Thermique', familyIcon: '🔥', rarity: 'common', color: '#ff6b6b',
      desc: '+6 PV réparés à chaque fin de salle et +20% gain de Pression.', apply: (s) => { s.healPerRoom += 6; s.pressureRateMult *= 1.20; } },

    // ==================== FAMILLE MAGNÉTISME (⚡ 14 modules) ====================
    { id: 'bobine_volta', name: 'Bobine de Volta', family: 'Magnétisme', familyIcon: '⚡', rarity: 'epic', color: '#54a0ff',
      desc: 'Vos tirs ont +35% de chance de déclencher un arc électrique vers un 2e automate.', apply: (s) => { s.chainLightningChance += 0.35; s.chainLightningDmg += 14; } },
    { id: 'aimant_industriel', name: 'Électro-Aimant de Grue', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#48dbfb',
      desc: '+80% Rayon d\'aspiration des boulons et chaque niveau gagné répare 14 PV.', apply: (s) => { s.magnetRadius *= 1.8; s.healOnLevelUp += 14; } },
    { id: 'condensateur_tesla', name: 'Anneau de Faraday', family: 'Magnétisme', familyIcon: '⚡', rarity: 'rare', color: '#54a0ff',
      desc: 'Votre Impulsion électrocute tous les automates proches (+25 dégâts électriques).', apply: (s) => { s.impulseShockwave = true; s.chainLightningDmg += 15; s.impulseDamage += 18; } },
    { id: 'inducteur_cuivre', name: 'Spire d\'Induction', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#54a0ff',
      desc: '+20% Chance d\'arc électrique et +15% Cadence de tir.', apply: (s) => { s.chainLightningChance += 0.20; s.fireRate *= 1.15; } },
    { id: 'batterie_ionique', name: 'Accumulateur au Cuivre-Zinc', family: 'Magnétisme', familyIcon: '⚡', rarity: 'rare', color: '#54a0ff',
      desc: '+25% Expérience des boulons et +20% Dégâts globaux.', apply: (s) => { s.xpGainMult = (s.xpGainMult || 1) * 1.25; s.damage *= 1.20; } },
    { id: 'orage_magnetique', name: 'Générateur Van de Graaff', family: 'Magnétisme', familyIcon: '⚡', rarity: 'epic', color: '#54a0ff',
      desc: '+45% Chance d\'arc électrique et les éclairs infligent +22 dégâts !', apply: (s) => { s.chainLightningChance += 0.45; s.chainLightningDmg += 22; } },
    { id: 'rails_magnetiques', name: 'Semelles à Lévitation', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#54a0ff',
      desc: '+20% Vitesse de déplacement et ignore le ralentissement des dalles de résine.', apply: (s) => { s.moveSpeed *= 1.20; s.ignoreSlow = true; } },
    { id: 'dynamo_tachymetrique', name: 'Dynamo de Roue', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#54a0ff',
      desc: '+25% Vitesse de gain de Pression et +50% Rayon d\'aimant.', apply: (s) => { s.pressureRateMult *= 1.25; s.magnetRadius *= 1.5; } },
    { id: 'aimant_neodyme', name: 'Noyau au Néodyme', family: 'Magnétisme', familyIcon: '⚡', rarity: 'rare', color: '#54a0ff',
      desc: '+25% Chance d\'arc électrique et +25% Dégâts des éclairs.', apply: (s) => { s.chainLightningChance += 0.25; s.chainLightningDmg *= 1.25; } },
    { id: 'transformateur_arc', name: 'Transformateur Survolteur', family: 'Magnétisme', familyIcon: '⚡', rarity: 'rare', color: '#54a0ff',
      desc: '+22% Dégâts globaux et +15% Chance d\'arc électrique.', apply: (s) => { s.damage *= 1.22; s.chainLightningChance += 0.15; } },
    { id: 'cage_paratonnerre', name: 'Antenne Paratonnerre', family: 'Magnétisme', familyIcon: '⚡', rarity: 'epic', color: '#54a0ff',
      desc: 'Chaque Impulsion foudroie automatiquement 3 ennemis dans la salle !', apply: (s) => { s.impulseLightningBolts = (s.impulseLightningBolts || 0) + 3; s.chainLightningDmg += 15; } },
    { id: 'solenoide_rapide', name: 'Solénoïde à Impulsion', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#54a0ff',
      desc: '+20% Cadence de tir et +20% Vitesse des projectiles.', apply: (s) => { s.fireRate *= 1.20; s.projectileSpeed *= 1.20; } },
    { id: 'boussole_flux', name: 'Boussole de Flux', family: 'Magnétisme', familyIcon: '⚡', rarity: 'common', color: '#54a0ff',
      desc: '+15% Chance Critique et +15% Chance d\'arc électrique.', apply: (s) => { s.critChance += 0.15; s.chainLightningChance += 0.15; } },
    { id: 'condensateur_or', name: 'Bouteille de Leyde Dorée', family: 'Magnétisme', familyIcon: '⚡', rarity: 'rare', color: '#54a0ff',
      desc: '+30% Expérience des boulons et +18 PV réparés à chaque montée de niveau.', apply: (s) => { s.xpGainMult = (s.xpGainMult || 1) * 1.30; s.healOnLevelUp += 18; } },

    // ==================== FAMILLE CHÂSSIS (🛡️ 14 modules) ====================
    { id: 'blindage_rivete', name: 'Plaques de Cuivre Rivetées', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: '+35 Blindage Max et répare immédiatement 35 points de Blindage.', apply: (s, p) => { s.maxHp += 35; if (p) p.hp = Math.min(s.maxHp, p.hp + 35); } },
    { id: 'huile_glissante', name: 'Roulements à Billes Huilés', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: '+22% Vitesse de déplacement et votre Impulsion va 25% plus loin.', apply: (s) => { s.moveSpeed *= 1.22; s.impulseSpeedMult *= 1.25; } },
    { id: 'contre_ecrou', name: 'Blindage à Ressort', family: 'Châssis', familyIcon: '🛡️', rarity: 'rare', color: '#2ecc71',
      desc: 'Réduit tous les dégâts subis de 3 points et déclenche une salve défensive en cas de choc.', apply: (s) => { s.flatArmor += 3; s.revengeNova = true; } },
    { id: 'nanorobots_soudeurs', name: 'Soudeuse Automatique', family: 'Châssis', familyIcon: '🛡️', rarity: 'rare', color: '#2ecc71',
      desc: 'Répare automatiquement 12 points de Blindage à chaque fin de salle.', apply: (s) => { s.healPerRoom += 12; } },
    { id: 'coque_titane', name: 'Arceau en Acier Forgé', family: 'Châssis', familyIcon: '🛡️', rarity: 'epic', color: '#2ecc71',
      desc: '+60 Blindage Max, +4 Armure plate et répare 60 PV immédiatement !', apply: (s, p) => { s.maxHp += 60; s.flatArmor += 4; if (p) p.hp = Math.min(s.maxHp, p.hp + 60); } },
    { id: 'amortisseurs_hydrauliques', name: 'Vérins Amortisseurs', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: 'Réduit les dégâts des pièges de 50% et accorde +20 Blindage Max.', apply: (s, p) => { s.hazardResist = true; s.maxHp += 20; if (p) p.hp += 20; } },
    { id: 'convertisseur_blindage', name: 'Bélier de Fonte', family: 'Châssis', familyIcon: '🛡️', rarity: 'rare', color: '#2ecc71',
      desc: '+25 Blindage Max et vos dégâts augmentent de +20%.', apply: (s, p) => { s.maxHp += 25; s.damage *= 1.20; if (p) p.hp += 25; } },
    { id: 'joint_etanche', name: 'Joints d\'Étanchéité', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: '+2 Armure plate et +8 PV réparés à chaque fin de salle.', apply: (s) => { s.flatArmor += 2; s.healPerRoom += 8; } },
    { id: 'reservoir_secours', name: 'Réservoir d\'Huile Auxiliaire', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: '+45 Blindage Max et répare 45 PV.', apply: (s, p) => { s.maxHp += 45; if (p) p.hp = Math.min(s.maxHp, p.hp + 45); } },
    { id: 'pare_chocs_pointes', name: 'Pare-Chocs Denté', family: 'Châssis', familyIcon: '🛡️', rarity: 'rare', color: '#2ecc71',
      desc: '+40% Dégâts d\'Impulsion et +25 Blindage Max.', apply: (s, p) => { s.impulseDamage *= 1.40; s.maxHp += 25; if (p) p.hp += 25; } },
    { id: 'coque_regenerante', name: 'Alliage à Mémoire de Forme', family: 'Châssis', familyIcon: '🛡️', rarity: 'epic', color: '#2ecc71',
      desc: 'Régénère automatiquement +3 PV toutes les 4 secondes en combat !', apply: (s) => { s.regenPer4Sec = (s.regenPer4Sec || 0) + 3; } },
    { id: 'chenilles_renforcees', name: 'Patins Tout-Terrain', family: 'Châssis', familyIcon: '🛡️', rarity: 'common', color: '#2ecc71',
      desc: '+18% Vitesse, ignore les zones ralentissantes et +15 PV Max.', apply: (s, p) => { s.moveSpeed *= 1.18; s.ignoreSlow = true; s.maxHp += 15; if (p) p.hp += 15; } },
    { id: 'bouclier_gyro', name: 'Anneau Déflecteur', family: 'Châssis', familyIcon: '🛡️', rarity: 'rare', color: '#2ecc71',
      desc: '+3 Armure plate et +1 Pignon Satellite orbital.', apply: (s) => { s.flatArmor += 3; s.orbitalCogs += 1; } },
    { id: 'châssis_or', name: 'Carénage Doré Impérial', family: 'Châssis', familyIcon: '🛡️', rarity: 'epic', color: '#2ecc71',
      desc: '+50 PV Max, +20% Dégâts et +15% Vitesse de déplacement !', apply: (s, p) => { s.maxHp += 50; s.damage *= 1.20; s.moveSpeed *= 1.15; if (p) p.hp += 50; } },

    // ==================== FAMILLE OPTIQUE (🔮 14 modules) ====================
    { id: 'condensateur_critique', name: 'Lentille de Focalisation', family: 'Optique', familyIcon: '🔮', rarity: 'rare', color: '#a55eea',
      desc: '+25% de chance de Coup Critique (dégâts x2) avec étincelles bleues.', apply: (s) => { s.critChance += 0.25; } },
    { id: 'prisme_dedoubleur', name: 'Miroir Semi-Réfléchissant', family: 'Optique', familyIcon: '🔮', rarity: 'epic', color: '#a55eea',
      desc: '+1 Projectile par tir et +15% de chance de Coup Critique !', apply: (s) => { s.projectileCount += 1; s.critChance += 0.15; } },
    { id: 'verre_quartz', name: 'Monocle de Quartz Pur', family: 'Optique', familyIcon: '🔮', rarity: 'common', color: '#a55eea',
      desc: '+15% Chance de Coup Critique et +20% vitesse des projectiles.', apply: (s) => { s.critChance += 0.15; s.projectileSpeed *= 1.20; } },
    { id: 'faisceau_coherent', name: 'Amplificateur Photonique', family: 'Optique', familyIcon: '🔮', rarity: 'rare', color: '#a55eea',
      desc: 'Vos projectiles traversent +1 cible supplémentaire et infligent +25% de dégâts.', apply: (s) => { s.projectilePierce += 1; s.damage *= 1.25; } },
    { id: 'kaléidoscope_combat', name: 'Kaléidoscope d\'Améthyste', family: 'Optique', familyIcon: '🔮', rarity: 'epic', color: '#a55eea',
      desc: '+30% Chance de Coup Critique et +1 Rebond sur les murs !', apply: (s) => { s.critChance += 0.30; s.projectileBounces += 1; } },
    { id: 'pointeur_telemetre', name: 'Télémètre à Prisme', family: 'Optique', familyIcon: '🔮', rarity: 'common', color: '#a55eea',
      desc: '+18% Dégâts et +12% Chance de Coup Critique.', apply: (s) => { s.damage *= 1.18; s.critChance += 0.12; } },
    { id: 'refracteur_solaire', name: 'Concentrateur Solaire', family: 'Optique', familyIcon: '🔮', rarity: 'rare', color: '#a55eea',
      desc: '+18% Chance Critique et +25% Dégâts d\'Impulsion.', apply: (s) => { s.critChance += 0.18; s.impulseDamage *= 1.25; } },
    { id: 'lentille_fresnel', name: 'Lentille de Fresnel', family: 'Optique', familyIcon: '🔮', rarity: 'common', color: '#a55eea',
      desc: '+25% Dégâts des Coups Critiques (x2.25) et +10% Chance Critique.', apply: (s) => { s.critDamageMult = (s.critDamageMult || 2.0) + 0.25; s.critChance += 0.10; } },
    { id: 'miroir_parabolique', name: 'Miroir Parabolique', family: 'Optique', familyIcon: '🔮', rarity: 'rare', color: '#a55eea',
      desc: '+1 Rebond sur les murs et +22% Dégâts.', apply: (s) => { s.projectileBounces += 1; s.damage *= 1.22; } },
    { id: 'cristal_birefringent', name: 'Spath d\'Islande', family: 'Optique', familyIcon: '🔮', rarity: 'epic', color: '#a55eea',
      desc: '+40% Dégâts des Coups Critiques et +20% Chance Critique !', apply: (s) => { s.critDamageMult = (s.critDamageMult || 2.0) + 0.40; s.critChance += 0.20; } },
    { id: 'fibre_verre', name: 'Conduit en Fibre de Verre', family: 'Optique', familyIcon: '🔮', rarity: 'common', color: '#a55eea',
      desc: '+20% Cadence de tir et +10% Chance Critique.', apply: (s) => { s.fireRate *= 1.20; s.critChance += 0.10; } },
    { id: 'oculaire_precision', name: 'Viseur Gyroscopique', family: 'Optique', familyIcon: '🔮', rarity: 'common', color: '#a55eea',
      desc: '+16% Chance Critique et +25% Dégâts contre les Boss.', apply: (s) => { s.critChance += 0.16; s.bossDamageMult = (s.bossDamageMult || 1) * 1.25; } },
    { id: 'prisme_arc_en_ciel', name: 'Spectrographe Royal', family: 'Optique', familyIcon: '🔮', rarity: 'epic', color: '#a55eea',
      desc: '+1 Projectile, +1 Perforation et +15% Chance Critique !', apply: (s) => { s.projectileCount += 1; s.projectilePierce += 1; s.critChance += 0.15; } },
    { id: 'lanterne_zenith', name: 'Projecteur Zénithal', family: 'Optique', familyIcon: '🔮', rarity: 'rare', color: '#a55eea',
      desc: '+25% Dégâts et +20% Vitesse de montée en Pression.', apply: (s) => { s.damage *= 1.25; s.pressureRateMult *= 1.20; } }
  ],

  // 8. LES 52 SUCCÈS (AVEC RÉCOMPENSES EN ÉCROUS DORÉS ⚙️ ET CRISTAUX 💎)
  achievements: [
    // Progression des Salles & Runs (1 à 10)
    { id: 'ach_run_1', name: 'Premier Tour de Clé', desc: 'Lancer votre première expédition.', rewardCogs: 10, check: (s) => s.stats.runsPlayed >= 1 },
    { id: 'ach_run_5', name: 'Bricoleur Assidu', desc: 'Effectuer 5 expéditions.', rewardCogs: 20, check: (s) => s.stats.runsPlayed >= 5 },
    { id: 'ach_run_15', name: 'Vétéran de la Caravane', desc: 'Effectuer 15 expéditions.', rewardCogs: 40, check: (s) => s.stats.runsPlayed >= 15 },
    { id: 'ach_run_30', name: 'Explorateur Infatigable', desc: 'Effectuer 30 expéditions.', rewardCogs: 60, check: (s) => s.stats.runsPlayed >= 30 },
    { id: 'ach_room_5', name: 'Palier Intermédiaire', desc: 'Atteindre la Salle 5 d\'un Secteur.', rewardCogs: 15, check: (s) => s.stats.bestRoom >= 5 },
    { id: 'ach_room_10', name: 'Au Pied du Beffroi', desc: 'Atteindre la Salle 10 d\'un Secteur.', rewardCogs: 25, check: (s) => s.stats.bestRoom >= 10 },
    { id: 'ach_win_1', name: 'Première Remise à l\'Heure', desc: 'Remporter une première victoire de Secteur.', rewardCogs: 35, rewardCrystals: 1, check: (s) => s.stats.runsWon >= 1 },
    { id: 'ach_win_3', name: 'Triple Couronne Mécanique', desc: 'Remporter 3 victoires de Secteur.', rewardCogs: 50, rewardCrystals: 1, check: (s) => s.stats.runsWon >= 3 },
    { id: 'ach_win_6', name: 'Maître des Six Secteurs', desc: 'Remporter 6 victoires de Secteur.', rewardCogs: 80, rewardCrystals: 2, check: (s) => s.stats.runsWon >= 6 },
    { id: 'ach_win_12', name: 'Légende d\'Automatia', desc: 'Remporter 12 victoires de Secteur.', rewardCogs: 120, rewardCrystals: 3, check: (s) => s.stats.runsWon >= 12 },

    // Victoires par Secteur & Vraie Fin (11 à 18)
    { id: 'ach_sec_1', name: 'Carillon Silencieux', desc: 'Sécuriser le Secteur 1 (L\'Horlogerie Rouillée).', rewardCogs: 30, rewardCrystals: 1, check: (s) => s.stats.highestBiomeCleared >= 1 },
    { id: 'ach_sec_2', name: 'Jardinier de Cristal', desc: 'Sécuriser le Secteur 2 (Les Serres de Cristal).', rewardCogs: 40, rewardCrystals: 1, check: (s) => s.stats.highestBiomeCleared >= 2 },
    { id: 'ach_sec_3', name: 'Dompteur de Fourneau', desc: 'Sécuriser le Secteur 3 (La Fonderie Thermique).', rewardCogs: 50, rewardCrystals: 2, check: (s) => s.stats.highestBiomeCleared >= 3 },
    { id: 'ach_sec_4', name: 'Archiviste Haute-Tension', desc: 'Sécuriser le Secteur 4 (Les Archives Magnétiques).', rewardCogs: 60, rewardCrystals: 2, check: (s) => s.stats.highestBiomeCleared >= 4 },
    { id: 'ach_sec_5', name: 'Maître Distillateur', desc: 'Sécuriser le Secteur 5 (Les Canaux Alchimiques).', rewardCogs: 75, rewardCrystals: 2, check: (s) => s.stats.highestBiomeCleared >= 5 },
    { id: 'ach_sec_6', name: 'Cœur Zéro Réinitialisé', desc: 'Vaincre Cœur Zéro au Secteur 6.', rewardCogs: 100, rewardCrystals: 3, check: (s) => s.stats.highestBiomeCleared >= 6 },
    { id: 'ach_key_2', name: 'Deuxième Clé d\'Horlogerie', desc: 'Vaincre le Secteur 6 avec 2 Engins différents.', rewardCogs: 120, rewardCrystals: 3, check: (s) => (s.stats.heroesClearedSector6 || []).length >= 2 },
    { id: 'ach_true_end', name: 'Le Réveil d\'Automatia (Vraie Fin)', desc: 'Assembler les 3 Clés d\'Horlogerie en gagnant le Secteur 6 avec 3 Engins !', rewardCogs: 250, rewardCrystals: 5, check: (s) => (s.stats.heroesClearedSector6 || []).length >= 3 },

    // Démontage d'Automates & Boss (19 à 26)
    { id: 'ach_kill_25', name: 'Apprenti Démonteur', desc: 'Démonter 25 automates détraqués.', rewardCogs: 15, check: (s) => s.stats.enemiesDismantled >= 25 },
    { id: 'ach_kill_100', name: 'Recycleur Certifié', desc: 'Démonter 100 automates détraqués.', rewardCogs: 25, check: (s) => s.stats.enemiesDismantled >= 100 },
    { id: 'ach_kill_250', name: 'Presse Industrielle', desc: 'Démonter 250 automates détraqués.', rewardCogs: 40, check: (s) => s.stats.enemiesDismantled >= 250 },
    { id: 'ach_kill_500', name: 'Ouragan de Ferraille', desc: 'Démonter 500 automates détraqués.', rewardCogs: 60, check: (s) => s.stats.enemiesDismantled >= 500 },
    { id: 'ach_kill_1000', name: 'Centrale de Tri', desc: 'Démonter 1000 automates détraqués.', rewardCogs: 100, rewardCrystals: 2, check: (s) => s.stats.enemiesDismantled >= 1000 },
    { id: 'ach_boss_1', name: 'Chasseur de Gardien', desc: 'Démonter 1 Sous-Boss ou Boss.', rewardCogs: 20, check: (s) => s.stats.bossesDefeated >= 1 },
    { id: 'ach_boss_5', name: 'Briseur de Colosse', desc: 'Démonter 5 Sous-Boss ou Boss.', rewardCogs: 45, check: (s) => s.stats.bossesDefeated >= 5 },
    { id: 'ach_boss_15', name: 'Démolisseur de Beffroi', desc: 'Démonter 15 Sous-Boss ou Boss.', rewardCogs: 80, rewardCrystals: 2, check: (s) => s.stats.bossesDefeated >= 15 },

    // Mécanique d'Impulsion & Pression (27 à 32)
    { id: 'ach_imp_10', name: 'Soupape Débloquée', desc: 'Déclencher 10 Impulsions.', rewardCogs: 15, check: (s) => s.stats.impulsesTriggered >= 10 },
    { id: 'ach_imp_50', name: 'Pilote Cinétique', desc: 'Déclencher 50 Impulsions.', rewardCogs: 30, check: (s) => s.stats.impulsesTriggered >= 50 },
    { id: 'ach_imp_150', name: 'Turbine Vivante', desc: 'Déclencher 150 Impulsions.', rewardCogs: 55, check: (s) => s.stats.impulsesTriggered >= 150 },
    { id: 'ach_gold_5', name: 'Timing Doré', desc: 'Déclencher 5 Impulsions en Zone Dorée (65%+).', rewardCogs: 20, check: (s) => (s.stats.goldImpulsesTriggered || 0) >= 5 },
    { id: 'ach_gold_25', name: 'Maître du Manomètre', desc: 'Déclencher 25 Impulsions en Zone Dorée.', rewardCogs: 40, check: (s) => (s.stats.goldImpulsesTriggered || 0) >= 25 },
    { id: 'ach_gold_75', name: 'Surcharge Parfaite', desc: 'Déclencher 75 Impulsions en Zone Dorée.', rewardCogs: 70, rewardCrystals: 1, check: (s) => (s.stats.goldImpulsesTriggered || 0) >= 75 },

    // Déblocage des 6 Engins (33 à 37)
    { id: 'ach_hero_2', name: 'Optique Embarquée', desc: 'Débloquer le drone Lumignon-7.', rewardCogs: 25, check: (s) => s.unlockedHeroes.includes('lumignon') },
    { id: 'ach_hero_3', name: 'Artillerie Lourde', desc: 'Débloquer le blindé Boum-Chariot.', rewardCogs: 30, check: (s) => s.unlockedHeroes.includes('boum_chariot') },
    { id: 'ach_hero_4', name: 'Haute Fréquence', desc: 'Débloquer la sphère Bobine-Z.', rewardCogs: 35, check: (s) => s.unlockedHeroes.includes('bobine_z') },
    { id: 'ach_hero_5', name: 'Garde-Temps', desc: 'Débloquer l\'automate Sablier-Vapeur.', rewardCogs: 40, check: (s) => s.unlockedHeroes.includes('sablier_vapeur') },
    { id: 'ach_hero_6', name: 'Hangar au Complet', desc: 'Débloquer les 6 Engins jouables !', rewardCogs: 80, rewardCrystals: 2, check: (s) => s.unlockedHeroes.length >= 6 },

    // Collection du Codex & Synergies (38 à 45)
    { id: 'ach_mod_10', name: 'Curieux Mécanique', desc: 'Découvrir 10 Modules dans le Codex.', rewardCogs: 20, check: (s) => s.discoveredModules.length >= 10 },
    { id: 'ach_mod_25', name: 'Ingénieur Breveté', desc: 'Découvrir 25 Modules dans le Codex.', rewardCogs: 35, check: (s) => s.discoveredModules.length >= 25 },
    { id: 'ach_mod_50', name: 'Encyclopédiste', desc: 'Découvrir 50 Modules dans le Codex.', rewardCogs: 60, rewardCrystals: 1, check: (s) => s.discoveredModules.length >= 50 },
    { id: 'ach_mod_84', name: 'Architecte Omniscient', desc: 'Découvrir les 84 Modules du Codex !', rewardCogs: 150, rewardCrystals: 3, check: (s) => s.discoveredModules.length >= 84 },
    { id: 'ach_syn_2', name: 'Première Résonance', desc: 'Activer une Synergie de palier 2 en expédition.', rewardCogs: 20, check: (s) => (s.stats.maxSynergyTierReached || 0) >= 2 },
    { id: 'ach_syn_4', name: 'Quatuor Harmonique', desc: 'Activer une Synergie de palier 4 en expédition.', rewardCogs: 45, check: (s) => (s.stats.maxSynergyTierReached || 0) >= 4 },
    { id: 'ach_syn_6', name: 'Synergie Suprême (6)', desc: 'Activer une Synergie maximale de palier 6 !', rewardCogs: 90, rewardCrystals: 2, check: (s) => (s.stats.maxSynergyTierReached || 0) >= 6 },
    { id: 'ach_bestiary', name: 'Observateur de Ruines', desc: 'Recenser au moins 20 types d\'automates dans le Bestiaire.', rewardCogs: 50, check: (s) => s.discoveredEnemies.length >= 20 },

    // Atelier, Boulons & Événements (46 à 52)
    { id: 'ach_upg_5', name: 'Châssis Révisé', desc: 'Acheter 5 niveaux d\'améliorations à l\'Atelier.', rewardCogs: 20, check: () => window.SaveManager.getTotalUpgradeLevels() >= 5 },
    { id: 'ach_upg_20', name: 'Atelier Suréquipé', desc: 'Acheter 20 niveaux d\'améliorations à l\'Atelier.', rewardCogs: 50, check: () => window.SaveManager.getTotalUpgradeLevels() >= 20 },
    { id: 'ach_upg_40', name: 'Chef-d\'Œuvre de la Caravane', desc: 'Atteindre le niveau 40/40 à l\'Atelier !', rewardCogs: 150, rewardCrystals: 3, check: () => window.SaveManager.getTotalUpgradeLevels() >= 40 },
    { id: 'ach_bolts_200', name: 'Aspirateur à Boulons', desc: 'Collecter 200 boulons au total.', rewardCogs: 20, check: (s) => s.stats.totalBoltsCollected >= 200 },
    { id: 'ach_bolts_1000', name: 'Trésorier de Ferraille', desc: 'Collecter 1000 boulons au total.', rewardCogs: 55, check: (s) => s.stats.totalBoltsCollected >= 1000 },
    { id: 'ach_vending', name: 'Client Fidèle', desc: 'Utiliser un Distributeur Automatique en expédition.', rewardCogs: 25, check: (s) => (s.stats.vendingPurchases || 0) >= 1 },
    { id: 'ach_chest', name: 'Démineur Audacieux', desc: 'Survivre à l\'embuscade d\'un Coffre Piégé à Ressort.', rewardCogs: 35, check: (s) => (s.stats.trappedChestsOpened || 0) >= 1 }
  ],

  // 9. TYPES DE PORTES / EMBRANCHEMENTS
  doorTypes: {
    combat_module: {
      id: 'combat_module', title: 'Salle des Machines', subtitle: 'Combat Standard : Nouveau Module',
      icon: '⚙️', badgeColor: '#e67e22'
    },
    elite_challenge: {
      id: 'elite_challenge', title: 'Arène Haute-Tension', subtitle: 'Automate Élite : Module + Écrous Bonus',
      icon: '⚡', badgeColor: '#eb3b5a'
    },
    repair_station: {
      id: 'repair_station', title: 'Établi de Soudure', subtitle: 'Répare +40% de Blindage ou Surcalibre',
      icon: '🔧', badgeColor: '#20bf6b'
    },
    vending_machine: {
      id: 'vending_machine', title: 'Distributeur Automatique', subtitle: 'Échangez vos Boulons contre Modules & Huile',
      icon: '🏪', badgeColor: '#3867d6'
    },
    trapped_chest: {
      id: 'trapped_chest', title: 'Coffre Piégé à Ressort', subtitle: 'Défi d\'embuscade : 2 Modules d\'un coup !',
      icon: '📦', badgeColor: '#8854d0'
    },
    midboss_room: {
      id: 'midboss_room', title: 'Palier du Gardien', subtitle: 'Sous-Boss (Salle 5) : +1 Cristal d\'Éther 💎',
      icon: '🔨', badgeColor: '#fa8231'
    },
    warden_boss: {
      id: 'warden_boss', title: 'Cœur du Secteur', subtitle: 'BOSS DU BIOME (Salle 10) : 3 Phases !',
      icon: '🚨', badgeColor: '#ffd32a'
    }
  }
};
