/**
 * 《弑君者》（Regicide）数字化版本
 * 版本：1.6.0引入
 * 
 * 模块化分区说明：
 * 1. CONFIG & CONSTANTS - 核心配置与文本
 * 2. GLOBAL STATE & DOM - 状态管理与DOM引用
 * 3. UTILS & HELPERS - 通用工具函数
 * 4. AUDIO SYSTEM - 音效与音乐控制
 * 5. CORE ENGINE & LOGIC - 游戏核心玩法与算法
 * 6. UI RENDERING & ANIMATIONS - 渲染视图与视觉反馈
 * 7. EVENT LISTENERS & ENTRY POINT - 交互绑定与初始化
 */

// =============================================================================
// 1. CONFIG & CONSTANTS
// =============================================================================
const CONFIG = {
    VERSION: '2.7.1',
    CARD_VALUES: {
        'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 10, 'Q': 15, 'K': 20, 'JOKER': 0
    },
    BOSS_CONFIG: {
        'J': { hp: 20, atk: 10 },
        'Q': { hp: 30, atk: 15 },
        'K': { hp: 40, atk: 20 }
    },
    HAND_LIMIT: {
        1: 8, 2: 7, 3: 6, 4: 5
    },
    // 主角人物配置
    CHARACTERS: {
        'CHOSEN_ONE': {
            name: '天选之人',
            id: 'CHOSEN_ONE',
            portrait: 'assets/char_chosen_one.png',
            bio: '被众神选中的勇士，拥有操控命运（Joker）的潜力。',
            abilities: {
                lv1: '【小丑1】: 可随时使用 1 张 Joker。效果：Boss 能力无效化，弃手牌并重回 8 张。',
                lv2: '【流溢】: Joker 触发的抽牌溢出上限时，多余卡牌将回到酒馆底部。',
                lv3: '【小丑2】: 可使用的 Joker 数量增加至 2 张。'
            },
            skills: {
                id: 'JOKER',
                icon: '🃏',
                charges: (lv) => lv >= 3 ? 2 : 1,
                resetType: (lv) => 'GAME',
                overflowToDeck: (lv) => lv >= 2
            }
        },
        'BARD': {
            name: '吟游诗人',
            id: 'BARD',
            portrait: 'assets/char_bard.png',
            bio: '游走于酒馆间的乐者，擅长以乐律重排命运（洗牌）。',
            abilities: {
                lv1: '【万能之手1】: 进攻阶段可弃掉任意张数选中的手牌，并重抽等量牌。每局限 1 次。',
                lv2: '【万能之手2】: 每局限 2 次。',
                lv3: '【上帝之手2】: 执行每个 Boss 战阶段限 2 次。'
            },
            skills: {
                id: 'DISCARD_DRAW',
                icon: '🎶',
                charges: (lv) => lv >= 2 ? 2 : 1,
                resetType: (lv) => lv >= 3 ? 'BOSS' : 'GAME'
            }
        }
    },
    // 升级胜场阈值
    UPGRADE_REQUIREMENTS: {
        lv2: 1, // 1 胜升级 lv2
        lv3: 3  // 3 胜升级 lv3
    },
    // 游戏规则配置
    GAME_RULES: [
        {
            title: '核心目标',
            items: ['击败或感化全部 12 名 Boss（J, Q, K 各 4 种花色）。']
        },
        {
            title: '花色技能',
            items: [
                '♠ <strong>护盾</strong>: 减少 Boss 攻击力。',
                '♣ <strong>暴击</strong>: 最终伤害翻倍。',
                '♦ <strong>补给</strong>: 从酒馆抽取等量数值卡牌。',
                '♥ <strong>复活</strong>: 将墓地的卡牌洗回酒馆。'
            ]
        },
        {
            title: '特殊机制',
            items: [
                '<strong>感化</strong>: 伤害刚好等于 Boss 血量，Boss 加入酒馆。',
                '<strong>免疫</strong>: Boss 初始免疫与其花色相同的技能效果。',
                '<strong>连招</strong>: 打出同数值多牌（合计≤10）。',
                '<strong>宠物(A)</strong>: 可与单牌组合，激活双花色技能。'
            ]
        }
    ],
    SOUNDS: {
        bgmMain: 'assets/sounds/bgm_main.mp3',
        playCard: 'assets/sounds/play_card.ogg',
        crit: 'assets/sounds/crit.ogg',
        shield: 'assets/sounds/shield.ogg',
        draw: 'assets/sounds/draw.ogg',
        revive: 'assets/sounds/revive.ogg',
        bossDeath: 'assets/sounds/boss_death.ogg',
        purify: 'assets/sounds/purify.ogg',
        bossVictory: 'assets/sounds/boss_victory.ogg',
        gameVictory: 'assets/sounds/game_victory.ogg',
        gameOver: 'assets/sounds/game_over.ogg'
    },
    UI_TEXT: {
        MENU: {
            PAGE_TITLE: '《弑君者》Regicide - 卡牌游戏',
            TITLE: 'REGICIDE',
            SUBTITLE: '孤身踏入王座间，筹谋一场弑君之战',
            HINT: '按任意键开始游戏',
            MAIN_TITLE: '弑君者',
            ADVENTURE_NAME: '冒险模式',
            ADVENTURE_DESC: '单人挑战12名堕落君王',
            ONLINE_NAME: '联机模式',
            ONLINE_DESC: '与队友共同对抗黑暗',
            ACHIEVEMENTS_NAME: '成就馆',
            ACHIEVEMENTS_DESC: '回顾你的辉煌时刻',
            SELECT_CHAR: '选择主角 / CHARACTER',
            CHAR_WINS_LABEL: '当前胜场:'
        },
        HEADERS: {
            RULES: '📜 游戏规则',
            LOGS: '🗂️ 战斗记录'
        },
        CHAR_PANEL: {
            ABILITY_TITLE: '人物能力'
        },
        PHASES: {
            'TURN_START': '你的回合',
            'TAKE_DAMAGE': '承受攻击',
            'GAME_OVER': '游戏结束'
        },
        STATS: {
            PLAYER_DECK: '酒馆',
            DISCARD_PILE: '墓地',
            BOSS_DECK: '城堡',
            HEALTH: '血量',
            ATTACK: '攻击',
            FIELD: '护盾',
            IMMUNE: '{suit} 免疫'
        },
        LOGS: {
            READY: '准备就绪',
            START: '游戏开始，祝你好运！',
            DRAW_START: '游戏开始，玩家获得初始手牌',
            SKILL_SPADE: '♠ 触发：增加护盾点数 {val}',
            SKILL_DIAMOND: '♦ 触发：请求补给 {req} 张（实际入手 {act}）',
            SKILL_HEART: '♥ 触发：从墓地回收 {val} 张卡牌',
            BOSS_DAMAGED: 'Boss 受到 {val} 点伤害',
            PURIFY: '✨ Boss 已被感化并加入酒馆！',
            BOSS_DEFEATED: '💀 Boss 被击败了！',
            BOSS_APPEAR: '📜 新 Boss 出现了：{suit}{rank}',
            DEFENSE_SUCCESS: '🛡️ 防御成功！',
            DEFENSE_FAIL: '💥 防御失败！',
            USE_JOKER: '🃏 使用 Joker：Boss 技能失效，重置手牌！',
            OVERFLOW_DECK: '♻️ 触发【回流】：{count} 张溢出牌回流至酒馆底。'
        },
        NOTIFICATIONS: {
            START_TOAST: '游戏开始！请选择操作...',
            NEW_BOSS_TOAST: '新Boss出现了！请选择操作...',
            SELECT_PROMPT: '请先选择卡牌！',
            INVALID_COMBO: '❌ 无效的组合！请检查组合 rules。',
            EMPTY_DECK: '牌库已空，游戏失败！',
            VICTORY: '🎊 恭喜！你击败了所有Boss！',
            DEFEAT: '💀 失败！',
            DEFENSE_PROMPT: '⚔️ Boss 攻击力 {atk}！请选择弃牌防御...',
            DEFENSE_FAIL: '💥 防御失败！你的手牌总值({defense})无法抵挡Boss攻击力({atk})',
            DEFENSE_SUCCESS: '🛡️ 防御成功！',
            DEFENSE_TITLE: '⚔️ 承受攻击',
            DEFENSE_REQ: '需求',
            DEFENSE_CUR: '当前',
            ONLINE_WIP: '联机模式即将开启！',
            ACHIEVEMENTS_WIP: '成就系统开发中...',
            CHAR_UPGRADE: '⬆️ 角色升级！当前等级: Lv.{lv}'
        },
        BUTTONS: {
            PLAY: '发动攻击',
            SKIP: '放弃出牌',
            RESTART: '重新开始',
            CONFIRM_DEFENSE: '执行防御',
            CONFIRM_CHAR: '确认选择',
            USE_JOKER_BTN: '使用 Joker'
        }
    },
    ANIMATION: {
        TOAST_DURATION: 2000,
        EFFECT_DURATION: 1500,
        SCREEN_FLASH_DURATION: 2000
    }
};

// =============================================================================
// 2. GLOBAL STATE & DOM
// =============================================================================
let currentDefenseValueSelected = 0;
let hasGameStarted = false;
let bgmAudio = null;
let currentBgmSrc = null;
let charSelectionIndex = 0; // [NEW] 追踪当前选择的角色索引 (v2.4.0)
const CHAR_IDS = ['CHOSEN_ONE', 'BARD']; // [NEW] 可选角色列表 (v2.4.0)

// [NEW] AI 队友配置 (v2.5.0)
// 数据结构示例: [{ id: 'AI_1', name: 'AI-1', strategy: 'balanced', isAI: true }]
let selectedAIs = []; 

const elements = {
    gameBoard: document.querySelector('.game-board'),
    phaseIndicator: document.getElementById('phaseIndicator'),
    // playerInfo 已移除
    currentBoss: document.getElementById('currentBoss'),
    bossHealthFill: document.getElementById('bossHealthFill'),
    bossHealthText: document.getElementById('bossHealthText'),
    bossAttack: document.getElementById('bossAttack'),
    bossSuit: document.getElementById('bossSuit'),
    bossRank: document.getElementById('bossRank'),
    bossImmunity: document.getElementById('bossImmunity'), // 新增免疫角标
    // bossShield: document.getElementById('bossShield'), // 组件已移除 (v2.7.1)
    bossDeckCount: document.getElementById('bossDeckCount'),
    playerDeckCount: document.getElementById('playerDeckCount'),
    discardCount: document.getElementById('discardCount'),
    fieldCards: document.getElementById('fieldCards'),
    playerHand: document.getElementById('playerHand'),
    actionButtons: document.getElementById('actionButtons'),
    playCardBtn: document.getElementById('playCardBtn'),
    skipTurnBtn: document.getElementById('skipTurnBtn'),
    jokerBtn: document.getElementById('jokerBtn'),
    jokerCountText: document.getElementById('jokerCountText'),
    jokerSkillName: document.getElementById('jokerSkillName'),
    comboInfo: document.getElementById('comboInfo'),
    gameLog: document.getElementById('gameLog'),
    gameMessage: document.getElementById('gameMessage'),
    defensePanel: document.getElementById('defensePanel'),
    requiredDefense: document.getElementById('requiredDefense'),
    currentDefenseValue: document.getElementById('currentDefenseValue'),
    confirmDefenseBtn: document.getElementById('confirmDefenseBtn'),
    gameOverModal: document.getElementById('gameOverModal'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverMessage: document.getElementById('gameOverMessage'),
    restartGameBtn: document.getElementById('restartGameBtn'),
    startScreen: document.getElementById('startScreen'),
    startScreenImage: document.getElementById('startScreenImage'),
    mainMenu: document.getElementById('mainMenu'),
    charSelection: document.getElementById('charSelection'),
    charName: document.getElementById('charName'),
    charBio: document.getElementById('charBio'),
    charLevel: document.getElementById('charLevel'),
    charWins: document.getElementById('charWins'),
    hudCharName: document.getElementById('hudCharName'),
    hudCharLv: document.getElementById('hudCharLv'),
    hudCharBadge: document.getElementById('hudCharBadge'),
    hudCharPortrait: document.getElementById('hudCharPortrait'), // [NEW] 战斗头像 (v2.4.1)
    confirmCharBtn: document.getElementById('confirmCharBtn'),
    adventureBtn: document.getElementById('adventureBtn'),
    onlineBtn: document.getElementById('onlineBtn'),
    achievementsBtn: document.getElementById('achievementsBtn'),
    // [NEW] AI 配置界面元素
    aiSelection: document.getElementById('aiSelection'),
    aiCountSelect: document.getElementById('aiCountSelect'),
    manualExpandHandBtn: document.getElementById('manualExpandHandBtn'), // [NEW] (v2.5.2)
    toastContainer: document.getElementById('toastContainer'), // [NEW] (v2.5.0)
    teammatesZone: document.getElementById('teammatesZone'), // [NEW] (v2.5.0)
    aiStrategyContainer: document.getElementById('aiStrategyContainer'),
    confirmAiBtn: document.getElementById('confirmAiBtn'),
    cancelAiBtn: document.getElementById('cancelAiBtn'),
    teammatesZone: document.getElementById('teammatesZone'),
    manualExpandHandBtn: document.getElementById('manualExpandHandBtn')
};

// =============================================================================
// PROGRESSION SYSTEM (v2.0.0)
// =============================================================================
const ProgressionTracker = {
    saveWin: function (charId) {
        const stats = this.getStats();
        stats[charId] = (stats[charId] || 0) + 1;
        localStorage.setItem('rgc_char_stats', JSON.stringify(stats));
        return stats[charId];
    },
    getWins: function (charId) {
        return this.getStats()[charId] || 0;
    },
    getStats: function () {
        const saved = localStorage.getItem('rgc_char_stats');
        return saved ? JSON.parse(saved) : {};
    },
    calculateLevel: function (wins) {
        if (wins >= CONFIG.UPGRADE_REQUIREMENTS.lv3) return 3;
        if (wins >= CONFIG.UPGRADE_REQUIREMENTS.lv2) return 2;
        return 1;
    }
};

// =============================================================================
// 3. UTILS & HELPERS
// =============================================================================
// 创建卡牌 DOM 元素
function createCardElement(card, isSmall = false) {
    const el = document.createElement('div');
    const isRed = card.suit === '♥' || card.suit === '♦';
    el.className = `card ${isRed ? 'red' : 'black'}`;
    el.dataset.cardId = card.id;

    if (isSmall) {
        el.innerHTML = `
            <div class="card-suit-small">${card.suit}</div>
            <div class="card-rank-small">${card.rank}</div>
        `;
    } else {
        el.innerHTML = `
            <div class="card-suit-small">${card.suit}</div>
            <div class="card-rank-small">${card.rank}</div>
        `;
        el.addEventListener('click', () => selectCardForCombo(card.id));
    }
    return el;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getCardColor(card) {
    if (card.suit === '♥' || card.suit === '♦') {
        return 'red';
    } else {
        return 'black';
    }
}

function createCardElement(card, isFieldCard = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${getCardColor(card)}`;
    cardDiv.dataset.cardId = card.id;
    cardDiv.setAttribute('data-suit', card.suit); // 用于渲染中心大号花色

    cardDiv.innerHTML = `
        <div class="card-suit-small">${card.suit}</div>
        <div class="card-rank-small">${card.rank}</div>
    `;

    if (!isFieldCard) {
        cardDiv.addEventListener('click', () => selectCardForCombo(card.id));
    } else {
        cardDiv.classList.add('disabled');
        cardDiv.title = CONFIG.UI_TEXT.NOTIFICATIONS.ACTION_PROMPT;
    }

    return cardDiv;
}

function createFloatingText(text, color, fontSize) {
    const element = document.createElement('div');
    element.textContent = text;
    element.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${color};
        font-size: ${fontSize};
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 200;
        animation: skillFloat 1.5s ease-out forwards;
    `;
    return element;
}

function addLogEntry(message, type = '') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = message;

    elements.gameLog.appendChild(logEntry);
    elements.gameLog.scrollTop = elements.gameLog.scrollHeight;

    const maxEntries = 50;
    while (elements.gameLog.children.length > maxEntries) {
        elements.gameLog.removeChild(elements.gameLog.children[0]);
    }
}

// =============================================================================
// 4. AUDIO SYSTEM
// =============================================================================
function getSoundSrc(key) {
    const customMap = (typeof window !== 'undefined' && window.REGICIDE_SOUNDS) || {};
    const src = customMap[key] || CONFIG.SOUNDS[key];
    if (!src) return;
    return src;
}

function playSound(key) {
    const src = getSoundSrc(key);
    if (!src) return;
    try {
        const audio = new Audio(src);
        audio.volume = 0.8;
        audio.play().catch(() => { });
    } catch (e) { }
}

function playBgm(key) {
    const src = getSoundSrc(key);
    console.log(`[Audio] playBgm requested: ${src}`);

    if (!src) return;
    if (src === currentBgmSrc) return;

    try {
        if (bgmAudio) {
            bgmAudio.pause();
        }

        // 统一使用 HTML5 Audio，原生支持 MP3/OGG，且本地 file:// 兼容性良好
        bgmAudio = new Audio(src);
        bgmAudio.loop = true;
        bgmAudio.volume = 0.5;
        bgmAudio.play().then(() => {
            currentBgmSrc = src;
            console.log(`[Audio] BGM started: ${src}`);
        }).catch((err) => {
            console.error(`[Audio] BGM failed to start:`, err);
        });
    } catch (e) {
        console.error(`[Audio] playBgm exception:`, e);
    }
}

function stopBgm() {
    if (bgmAudio) {
        bgmAudio.pause();
    }
    currentBgmSrc = null;
}

// =============================================================================
// 5. CORE ENGINE & LOGIC
// =============================================================================
function initGame() {
    // 如果没有选定角色，默认选定天选之人（用于直接重启等场景）
    if (!gameState || !gameState.character) {
        const charId = 'CHOSEN_ONE';
        const wins = ProgressionTracker.getWins(charId);
        const level = ProgressionTracker.calculateLevel(wins);
        applyCharacterToState(charId, level);
    }

    applyRulesUI();
    applyStaticUI();
    hasGameStarted = true;
    const bossDeck = createBossDeck();
    const playerDeck = createPlayerDeck();
    const currentBossCard = bossDeck.pop();
    const bossConfig = CONFIG.BOSS_CONFIG[currentBossCard.rank];

    // 初始化 gameState，保留 character 信息并重置每局相关的角色状态
    const charId = gameState.character.id;
    const charData = CONFIG.CHARACTERS[charId];

    // [NEW] 动态生成 players 数组
    const totalPlayers = 1 + selectedAIs.length;
    const maxHandSize = CONFIG.HAND_LIMIT[totalPlayers] || 5;
    
    const players = [{
        id: 'player_1',
        name: charData.name,
        isAI: false,
        hand: [],
        maxHandSize: maxHandSize
    }];

    // 将选定的 AI 加入队伍
    selectedAIs.forEach((aiConfig, index) => {
        players.push({
            id: aiConfig.id,
            name: aiConfig.name,
            isAI: true,
            strategy: aiConfig.strategy,
            hand: [],
            maxHandSize: maxHandSize
        });
    });

    gameState = {
        ...gameState,
        character: {
            ...gameState.character,
            chargesLeft: charData.skills.charges(gameState.character.level),
            maxCharges: charData.skills.charges(gameState.character.level)
        },
        phase: 'TURN_START',
        currentPlayerIndex: 0,
        players: players,
        bossDeck: bossDeck,
        playerDeck: playerDeck,
        discardPile: [],
        fieldCards: [],
        currentBoss: {
            currentBoss: currentBossCard,
            currentHP: bossConfig.hp,
            baseATK: bossConfig.atk,
            currentATK: bossConfig.atk,
            isImmune: false,
            isSpecialDisabled: false // Joker 中和标志
        }
    };

    // 为首个 Boss 设置左上角水印
    const suitNameMapEng = { '♣': 'club', '♠': 'spade', '♦': 'diamond', '♥': 'heart' };
    const suitEng = suitNameMapEng[currentBossCard.suit];
    const firstBossImgSrc = `assets/boss_${suitEng}_${currentBossCard.rank.toLowerCase()}.png`;
    const centerStage = document.querySelector('.center-stage');
    if (centerStage) {
        centerStage.style.setProperty('--boss-watermark', `url('${firstBossImgSrc}')`);
    }

    // 所有玩家抽满手牌
    gameState.players.forEach(player => {
        drawCards(player, player.maxHandSize);
    });
    elements.gameLog.innerHTML = `<div class="log-entry">${CONFIG.UI_TEXT.LOGS.START}</div>`;
    elements.playCardBtn.textContent = CONFIG.UI_TEXT.BUTTONS.PLAY;
    elements.skipTurnBtn.textContent = CONFIG.UI_TEXT.BUTTONS.SKIP;
    selectedCardsForCombo = [];
    elements.comboInfo.style.display = 'block';

    updateUI();
    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.START_TOAST);
    addLogEntry(CONFIG.UI_TEXT.LOGS.DRAW_START, 'skill');
    playBgm('bgmMain');
}

function applyCharacterToState(charId, level) {
    const charData = CONFIG.CHARACTERS[charId];
    gameState = {
        character: {
            id: charId,
            level: level,
            name: charData.name,
            chargesLeft: charData.skills.charges(level),
            maxCharges: charData.skills.charges(level),
            skillId: charData.skills.id,
            skillResetType: charData.skills.resetType(level),
            overflowToDeck: charData.skills.overflowToDeck ? charData.skills.overflowToDeck(level) : false
        }
    };
}

function createBossDeck() {
    const bossCards = [];
    const suits = ['♣', '♠', '♦', '♥'];
    const ranks = ['J', 'Q', 'K'];

    for (const rank of ranks) {
        for (const suit of suits) {
            bossCards.push({
                id: `${suit}_${rank}`,
                suit: suit,
                rank: rank,
                value: CONFIG.CARD_VALUES[rank],
                isBoss: true,
                isCorrupted: true
            });
        }
    }

    const kings = bossCards.filter(card => card.rank === 'K');
    const queens = bossCards.filter(card => card.rank === 'Q');
    const jacks = bossCards.filter(card => card.rank === 'J');

    return [...shuffleArray(kings), ...shuffleArray(queens), ...shuffleArray(jacks)];
}

function createPlayerDeck() {
    const playerCards = [];
    const suits = ['♣', '♠', '♦', '♥'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    for (const suit of suits) {
        for (const rank of ranks) {
            playerCards.push({
                id: `${suit}_${rank}`,
                suit: suit,
                rank: rank,
                value: CONFIG.CARD_VALUES[rank],
                isBoss: false,
                isCorrupted: false
            });
        }
    }
    return shuffleArray(playerCards);
}

function drawCards(player, count) {
    for (let i = 0; i < count; i++) {
        if (gameState.playerDeck.length === 0) {
            // [FIX] 不再触发失败，符合弑君者原生规则：卡牌不够抽只抽到空即可。
            break;
        }
        if (player.hand.length >= player.maxHandSize) break;
        const card = gameState.playerDeck.pop();
        player.hand.push(card);
    }
}

function validateCombo(cards) {
    if (cards.length === 0) return false;
    if (cards.length === 1) return true;
    if (cards.length === 2) {
        const hasAce = cards.some(card => card.rank === 'A');
        const hasNonAce = cards.some(card => card.rank !== 'A');
        if (hasAce && hasNonAce) return true;
    }
    if (cards.length >= 2) {
        const firstValue = cards[0].value;
        const allSameValue = cards.every(card => card.value === firstValue);
        const totalValue = cards.reduce((sum, card) => sum + card.value, 0);
        const noAces = cards.every(card => card.rank !== 'A');
        if (allSameValue && totalValue <= 10 && noAces && firstValue >= 2 && firstValue <= 10) return true;
    }
    return false;
}

function executeCombo(cards) {
    const player = gameState.players[gameState.currentPlayerIndex];
    let comboDamage = 0;
    let comboType = '';
    let comboSkills = new Set();

    const cardNames = cards.map(card => `${card.suit}${card.rank}`).join('+');
    addLogEntry(`${player.name} 出牌: ${cardNames}`, 'skill');
    playSound('playCard');

    cards.forEach(card => {
        const index = player.hand.findIndex(c => c.id === card.id);
        if (index !== -1) player.hand.splice(index, 1);
    });

    if (cards.length === 1) {
        comboDamage = cards[0].value;
        comboSkills.add(cards[0].suit);
        comboType = '单张';
    } else if (cards.length === 2 && cards.some(c => c.rank === 'A')) {
        const aceCard = cards.find(c => c.rank === 'A');
        const otherCard = cards.find(c => c.rank !== 'A');
        comboDamage = 1 + otherCard.value;
        comboSkills.add(aceCard.suit);
        comboSkills.add(otherCard.suit);
        comboType = '宠物组合';
        addLogEntry(`宠物组合: ${aceCard.suit}${aceCard.rank} + ${otherCard.suit}${otherCard.rank}`, 'skill');
    } else {
        comboDamage = cards.reduce((sum, card) => sum + card.value, 0);
        cards.forEach(card => comboSkills.add(card.suit));
        comboType = '连招';
        addLogEntry(`连招: ${cards.length}张${cards[0].rank}`, 'skill');
    }

    let finalDamage = comboDamage;
    const skillEffects = [];

    // [FIX] 分离免疫处理：确保每种花色独立结算，且红牌技能使用总伤害(comboDamage)
    comboSkills.forEach(suit => {
        // [MOD] Joker 强化：如果 Boss 技能被中和，忽略花色免疫
        if (gameState.currentBoss.currentBoss.suit === suit && !gameState.currentBoss.isSpecialDisabled) {
            addLogEntry(`${suit}技能被免疫`, 'error');
            return;
        }

        switch (suit) {
            case '♣':
                finalDamage *= 2;
                skillEffects.push('暴击x2');
                playSound('crit');
                addLogEntry('♣ 触发：伤害判定翻倍', 'skill');
                break;
            case '♠':
                const spadeCards = cards.filter(c => c.suit === '♠');
                spadeCards.forEach(card => gameState.fieldCards.push(card));
                const spadesPower = spadeCards.reduce((sum, c) => sum + c.value, 0);
                skillEffects.push(`护盾+${spadesPower}`);
                if (spadesPower > 0) playSound('shield');
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_SPADE.replace('{val}', spadesPower), 'skill');
                break;
            case '♦':
                // 方片按照总伤害值(comboDamage)进行抽牌
                const drawCount = comboDamage;
                let actualDraws = 0, overflowCount = 0;
                for (let i = 0; i < drawCount && gameState.playerDeck.length > 0; i++) {
                    const drawnCard = gameState.playerDeck.pop();
                    if (player.hand.length >= player.maxHandSize) {
                        // [MOD] Lv.2 回流逻辑
                        if (gameState.character && gameState.character.overflowToDeck) {
                            gameState.playerDeck.unshift(drawnCard); // 回流到酒馆底
                        } else {
                            gameState.discardPile.push(drawnCard);
                        }
                        overflowCount++;
                    } else {
                        player.hand.push(drawnCard);
                        actualDraws++;
                    }
                }
                if (overflowCount > 0 && gameState.character && gameState.character.overflowToDeck) {
                    addLogEntry(CONFIG.UI_TEXT.LOGS.OVERFLOW_DECK.replace('{count}', overflowCount), 'defense');
                }
                skillEffects.push(`补给+${actualDraws}`);
                if (actualDraws > 0 || overflowCount > 0) playSound('draw');
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_DIAMOND.replace('{req}', drawCount).replace('{act}', actualDraws), 'skill');
                break;
            case '♥':
                // 红心按照总伤害值(comboDamage)进行回收
                const recycleCount = Math.min(comboDamage, gameState.discardPile.length);
                if (recycleCount > 0) {
                    const recycledCards = gameState.discardPile.splice(-recycleCount);
                    gameState.playerDeck = [...recycledCards, ...gameState.playerDeck];
                    skillEffects.push(`复活${recycleCount}`);
                    playSound('revive');
                    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_HEART.replace('{val}', recycleCount), 'skill');
                }
                break;
        }
    });

    // [FIX] 结算完技能后，将未留在场上作为护盾的打出卡牌放入弃牌堆！
    cards.forEach(card => {
        // 如果 Boss 对黑桃免疫，则黑桃牌也无法组成护盾，必须直接进墓地
        const isSpadeImmune = gameState.currentBoss.currentBoss.suit === '♠' && !gameState.currentBoss.isSpecialDisabled;
        if (!(card.suit === '♠' && !isSpadeImmune)) {
            gameState.discardPile.push(card);
        }
    });

    gameState.currentBoss.currentHP -= finalDamage;
    addLogEntry(CONFIG.UI_TEXT.LOGS.BOSS_DAMAGED.replace('{val}', finalDamage), 'skill');
    showScreenDamageEffect(finalDamage, comboType);
    updateFieldCards();
    updateShieldEffect();
    updateUI();

    if (gameState.currentBoss.currentHP <= 0) {
        const purified = gameState.currentBoss.currentHP === 0;
        if (purified) {
            playSound('purify');
            addLogEntry(CONFIG.UI_TEXT.LOGS.PURIFY, 'skill');
            gameState.playerDeck.unshift({
                id: `${gameState.currentBoss.currentBoss.suit}_${gameState.currentBoss.currentBoss.rank}`,
                suit: gameState.currentBoss.currentBoss.suit,
                rank: gameState.currentBoss.currentBoss.rank,
                value: CONFIG.CARD_VALUES[gameState.currentBoss.currentBoss.rank],
                isBoss: false,
                isCorrupted: false
            });
        }

        setTimeout(() => {
            if (!nextBoss()) {
                playSound('gameVictory'); // [NEW] 播放通关音效
                showGameOver(true, CONFIG.UI_TEXT.NOTIFICATIONS.VICTORY);
                return;
            }
            if (!purified) {
                // [FIX] 只有在未被感化（即受到过量伤害）的情况下且后继还有Boss时，播放击败音效。
                playSound('bossVictory');
                addLogEntry(CONFIG.UI_TEXT.LOGS.BOSS_DEFEATED, 'error');
            }
            passTurn();
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.NEW_BOSS_TOAST);
        }, 1500);
    } else {
        // [MOD] 延时 1.5s 进入防御阶段，避免与伤害飘字叠加
        setTimeout(() => {
            handleBossCounterAttack();
        }, 1500);
    }
}

function getTotalShieldValue() {
    return gameState.fieldCards.reduce((sum, card) => sum + card.value, 0);
}

function nextBoss() {
    if (gameState.bossDeck.length === 0) return false;
    gameState.discardPile.push(...gameState.fieldCards);
    gameState.fieldCards = [];
    const newBossCard = gameState.bossDeck.pop();
    const bossConfig = CONFIG.BOSS_CONFIG[newBossCard.rank];
    gameState.currentBoss = {
        currentBoss: newBossCard,
        currentHP: bossConfig.hp,
        baseATK: bossConfig.atk,
        currentATK: bossConfig.atk,
        isImmune: false,
        isSpecialDisabled: false // [NEW] 重置 Boss 技能中和状态 (v2.4.0)
    };

    // [NEW] 角色技能重置钩子 (v2.4.0)
    if (gameState.character && gameState.character.skillResetType === 'BOSS') {
        gameState.character.chargesLeft = gameState.character.maxCharges;
        addLogEntry(`✨ 战斗重燃！技能次数已恢复`, 'skill');
    }

    // [NEW] 动态设置 Boss 左上角水印 (v2.4.4)
    const suitNameMapEng = { '♣': 'club', '♠': 'spade', '♦': 'diamond', '♥': 'heart' };
    const suitEng = suitNameMapEng[newBossCard.suit];
    const bossImgSrc = `assets/boss_${suitEng}_${newBossCard.rank.toLowerCase()}.png`;
    const centerStage = document.querySelector('.center-stage');
    if (centerStage) {
        centerStage.style.setProperty('--boss-watermark', `url('${bossImgSrc}')`);
    }

    addLogEntry(CONFIG.UI_TEXT.LOGS.BOSS_APPEAR.replace('{suit}', newBossCard.suit).replace('{rank}', newBossCard.rank), 'skill');
    return true;
}

function confirmDefense() {
    selectedCardsForCombo = [];
    document.querySelectorAll('.card').forEach(cardEl => cardEl.classList.remove('selected'));

    const totalValue = selectedCardsForDefense.reduce((sum, card) => sum + card.value, 0);
    const requiredValue = gameState.currentBoss.currentATK;

    if (totalValue < requiredValue) {
        showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.DEFENSE_FAIL.replace('{required}', requiredValue), 3000);
        addLogEntry(CONFIG.UI_TEXT.LOGS.DEFENSE_FAIL, 'error');
        return;
    }

    selectedCardsForDefense.forEach(selectedCard => {
        const player = gameState.players[gameState.currentPlayerIndex];
        const index = player.hand.findIndex(card => card.id === selectedCard.id);
        if (index !== -1) {
            player.hand.splice(index, 1);
            gameState.discardPile.push(selectedCard);
        }
    });

    elements.defensePanel.style.display = 'none';
    elements.actionButtons.style.display = 'flex';
    passTurn();
    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.DEFENSE_SUCCESS);
    addLogEntry(CONFIG.UI_TEXT.LOGS.DEFENSE_SUCCESS, 'skill');
    selectedCardsForDefense = [];
}

function skipTurn() {
    selectedCardsForCombo = [];
    const player = gameState.players[gameState.currentPlayerIndex];
    addLogEntry(`${player.name} 跳过出牌`, 'defense');
    handleBossCounterAttack();
}

function handleBossCounterAttack() {
    gameState.phase = 'TAKE_DAMAGE';
    updateUI();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) {
        if (typeof triggerAITurn === 'function') {
            setTimeout(() => triggerAITurn(), window.aiDelay || 1500);
        }
    } else {
        showDefensePanel();
    }
}

function passTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.phase = 'TURN_START';
    updateUI();
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isAI) {
        if (typeof triggerAITurn === 'function') {
            setTimeout(() => triggerAITurn(), window.aiDelay || 1500);
        }
    } else {
        if (gameState.players.length > 1) {
            showToastMessage('轮到你了！');
        }
    }
}

// =============================================================================
// 6. UI RENDERING & ANIMATIONS
// =============================================================================
function showStartScreen() {
    applyStaticUI();
    if (elements.startScreen) elements.startScreen.style.display = 'flex';
    if (elements.mainMenu) elements.mainMenu.style.display = 'none';
    hasGameStarted = false;
}

function hideStartScreen() {
    if (elements.startScreen) elements.startScreen.style.display = 'none';
}

function showMainMenu() {
    hideStartScreen();
    if (elements.mainMenu) elements.mainMenu.style.display = 'flex';
    // 监听主菜单按钮
    elements.adventureBtn.onclick = () => {
        hideMainMenu();
        showAiSelection(); // [MOD] 先进入队伍配置
    };
    elements.onlineBtn.onclick = () => showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.ONLINE_WIP);
    elements.achievementsBtn.onclick = () => showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.ACHIEVEMENTS_WIP);
}

// [NEW] 显示 AI 队友配置界面
function showAiSelection() {
    elements.aiSelection.style.display = 'flex';
    updateAiStrategySelectors(); // 根据当前数量初始化下拉框

    elements.aiCountSelect.onchange = updateAiStrategySelectors;

    elements.confirmAiBtn.onclick = () => {
        saveAiConfiguration();
        elements.aiSelection.style.display = 'none';
        showCharSelection('CHOSEN_ONE'); // 选好队伍后再选人
    };

    elements.cancelAiBtn.onclick = () => {
        elements.aiSelection.style.display = 'none';
        showMainMenu();
    };
}

function updateAiStrategySelectors() {
    const count = parseInt(elements.aiCountSelect.value, 10);
    elements.aiStrategyContainer.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const row = document.createElement('div');
        row.className = 'ai-config-row';
        row.innerHTML = `
            <span class="cfg-label">AI-${i} 策略:</span>
            <select class="styled-select" id="aiStrategy_${i}">
                <option value="balanced">平衡型 (Balanced)</option>
                <option value="defensive">稳健型 (Defensive)</option>
                <option value="aggressive">激进型 (Aggressive)</option>
            </select>
        `;
        elements.aiStrategyContainer.appendChild(row);
    }
}

function saveAiConfiguration() {
    const count = parseInt(elements.aiCountSelect.value, 10);
    selectedAIs = [];
    for (let i = 1; i <= count; i++) {
        const strategy = document.getElementById(`aiStrategy_${i}`).value;
        selectedAIs.push({
            id: `AI_${i}`,
            name: `AI-${i}`,
            strategy: strategy,
            isAI: true
        });
    }
}

function showCharSelection(charId) {
    const charData = CONFIG.CHARACTERS[charId];
    const wins = ProgressionTracker.getWins(charId);
    const lv = ProgressionTracker.calculateLevel(wins);

    elements.charSelection.style.display = 'flex';
    elements.charName.textContent = charData.name;
    elements.charBio.textContent = charData.bio;
    elements.charLevel.textContent = lv;
    elements.charWins.textContent = wins;

    // 处理头像展示与回退逻辑
    const portraitImg = document.getElementById('charPortrait');
    if (portraitImg) {
        portraitImg.src = charData.portrait;
        portraitImg.onerror = () => {
            portraitImg.src = 'assets/start_screen.png'; // 临时回退
            portraitImg.style.filter = 'sepia(1) brightness(0.5)';
        };
    }

    // 处理等级能力激活状态
    const ability1 = document.getElementById('abilityLv1');
    const ability2 = document.getElementById('abilityLv2');
    const ability3 = document.getElementById('abilityLv3');

    if (ability1) {
        ability1.classList.toggle('active', lv >= 1);
        ability1.querySelector('.text').textContent = charData.abilities.lv1;
    }
    if (ability2) {
        ability2.classList.toggle('active', lv >= 2);
        ability2.querySelector('.text').textContent = charData.abilities.lv2;
    }
    if (ability3) {
        ability3.classList.toggle('active', lv >= 3);
        ability3.querySelector('.text').textContent = charData.abilities.lv3;
    }

    elements.confirmCharBtn.onclick = () => {
        elements.charSelection.style.display = 'none';
        applyCharacterToState(charId, lv);
        initGame();
    };

    // [NEW] 角色切换按钮监听 (v2.4.0)
    const prevBtn = document.getElementById('prevCharBtn');
    const nextBtn = document.getElementById('nextCharBtn');
    if (prevBtn) {
        prevBtn.onclick = () => switchCharacter(-1);
        prevBtn.style.display = charSelectionIndex === 0 ? 'none' : 'block';
    }
    if (nextBtn) {
        nextBtn.onclick = () => switchCharacter(1);
        nextBtn.style.display = charSelectionIndex === CHAR_IDS.length - 1 ? 'none' : 'block';
    }
}

function switchCharacter(dir) {
    charSelectionIndex += dir;
    if (charSelectionIndex < 0) charSelectionIndex = 0;
    if (charSelectionIndex >= CHAR_IDS.length) charSelectionIndex = CHAR_IDS.length - 1;
    showCharSelection(CHAR_IDS[charSelectionIndex]);
}

function hideMainMenu() {
    if (elements.mainMenu) elements.mainMenu.style.display = 'none';
}

function handleStartInput() {
    if (hasGameStarted) return;

    // [FIX] 在第一次有效的用户交互时立即触发 BGM (v2.2.7)
    // 提前触发以绕过移动端/浏览器的音频自动播放政策限制
    playBgm('bgmMain');

    showMainMenu();
    document.removeEventListener('keydown', handleStartKeydown);
    document.removeEventListener('click', handleStartClick);
}

function handleStartKeydown() { handleStartInput(); }
function handleStartClick() { handleStartInput(); }

function updateUI() {
    if (gameState.currentBoss) {
        const boss = gameState.currentBoss.currentBoss;
        const config = CONFIG.BOSS_CONFIG[boss.rank];
        elements.bossSuit.textContent = boss.suit;
        elements.bossRank.textContent = boss.rank;
        elements.bossAttack.textContent = gameState.currentBoss.currentATK;
        const healthPercent = (gameState.currentBoss.currentHP / config.hp) * 100;
        elements.bossHealthFill.style.width = `${healthPercent}%`;
        elements.bossHealthText.textContent = `${gameState.currentBoss.currentHP} / ${config.hp}`;

        // 更新角色状态 HUD
        if (gameState.character) {
            const charData = CONFIG.CHARACTERS[gameState.character.id];
            if (elements.hudCharName) elements.hudCharName.textContent = gameState.character.name;
            if (elements.hudCharLv) elements.hudCharLv.textContent = `Lv.${gameState.character.level}`;
            if (elements.hudCharBadge) elements.hudCharBadge.style.display = 'flex';
            if (elements.hudCharPortrait) elements.hudCharPortrait.src = charData.portrait;

            // 角色大立绘：作为战场护盾区右下角水印
            const battleLine = document.querySelector('.battle-line');
            if (battleLine) {
                battleLine.style.setProperty('--watermark-img', `url('${charData.portrait}')`);
            }

            if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.chargesLeft;

            if (elements.jokerBtn) {
                // 更新图标与技能名
                const iconSpan = elements.jokerBtn.querySelector('.icon');
                if (iconSpan) iconSpan.textContent = charData.skills.icon;

                if (elements.jokerSkillName) {
                    elements.jokerSkillName.textContent = (gameState.character.id === 'BARD') ? '万能之手' : '使用 Joker';
                }

                // 技能可用性判定：只受限于次数和阶段
                elements.jokerBtn.disabled = gameState.character.chargesLeft <= 0 || gameState.phase !== 'TURN_START';
            }
        }

        // 如果 Boss 技能被中和，给予视觉反馈
        if (gameState.currentBoss.isSpecialDisabled) {
            elements.bossImmunity.style.filter = 'grayscale(1) opacity(0.3)';
            elements.bossImmunity.title = 'Boss能力已被中和';
        } else {
            elements.bossImmunity.style.filter = 'none';
            elements.bossImmunity.title = '';
        }
        // 重新显示 Boss 身上免疫角标
        updateImmunityIndicator(boss.suit);
    }
    updateTeammatesUI(); // [NEW] 刷新 AI 队友信息 (v2.5.0)

    const isCurrentAI = gameState.players[gameState.currentPlayerIndex].isAI;

    // [ADD] 手牌自动折叠逻辑 (v2.5.2)
    const playerStation = document.querySelector('.player-station');
    if (playerStation) {
        if (isCurrentAI) {
            playerStation.classList.add('collapsed');
            if (elements.manualExpandHandBtn) elements.manualExpandHandBtn.style.display = 'flex';
        } else {
            playerStation.classList.remove('collapsed');
            if (elements.manualExpandHandBtn) elements.manualExpandHandBtn.style.display = 'none';
        }
    }

    // 禁用/启用按钮 (AI 回合不准操作)
    elements.playCardBtn.disabled = isCurrentAI;
    elements.skipTurnBtn.disabled = isCurrentAI;
    if (elements.jokerBtn) {
        elements.jokerBtn.disabled = isCurrentAI || gameState.character.chargesLeft <= 0 || gameState.phase !== 'TURN_START';
    }

    elements.bossDeckCount.textContent = gameState.bossDeck.length;
    elements.playerDeckCount.textContent = gameState.playerDeck.length;
    elements.discardCount.textContent = gameState.discardPile.length;
    updatePlayerHand();
    updatePhaseIndicator();
    updateFieldCards();
}


// 动态生成游戏规则 UI
function applyRulesUI() {
    const rulesContainer = document.querySelector('.rules-content');
    if (!rulesContainer) return;

    let rulesHtml = CONFIG.GAME_RULES.map(section => `
        <section>
            <h4>${section.title}</h4>
            <ul>
                ${section.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </section>
    `).join('');

    // [FIX] 动态加载包含当前英雄专属能力的版块
    if (gameState && gameState.character) {
        const charData = CONFIG.CHARACTERS[gameState.character.id];
        rulesHtml += `
        <section>
            <h4 style="color: var(--gold); border-bottom: 1px dotted var(--gold); padding-bottom: 5px;">[ ${charData.name} ] 专属能力</h4>
            <ul>
                <li><span style="color:var(--gold);">Lv1: </span>${charData.abilities.lv1}</li>
                <li><span style="color:var(--gold);">Lv2: </span>${charData.abilities.lv2}</li>
                <li><span style="color:var(--gold);">Lv3: </span>${charData.abilities.lv3}</li>
            </ul>
        </section>
        `;
    }

    rulesContainer.innerHTML = rulesHtml;
}

function applyStaticUI() {
    const t = CONFIG.UI_TEXT;
    // Page title
    if (t.MENU.PAGE_TITLE) {
        document.title = t.MENU.PAGE_TITLE;
    }
    // Start Screen
    const startTitle = document.querySelector('.start-screen-title');
    if (startTitle) startTitle.textContent = t.MENU.TITLE;
    const startSubtitle = document.querySelector('.start-screen-subtitle');
    if (startSubtitle) startSubtitle.textContent = t.MENU.SUBTITLE;
    const startHint = document.querySelector('.start-screen-hint');
    if (startHint) startHint.textContent = t.MENU.HINT;

    // Main Menu
    const mainMenuTitle = document.getElementById('mainMenuTitle');
    if (mainMenuTitle) mainMenuTitle.textContent = t.MENU.MAIN_TITLE;

    // Character selection panel title
    const charSelectTitle = document.getElementById('charSelectTitle');
    if (charSelectTitle) charSelectTitle.textContent = t.MENU.SELECT_CHAR;

    const advBtnText = document.querySelector('#adventureBtn .btn-text');
    if (advBtnText) advBtnText.textContent = t.MENU.ADVENTURE_NAME;
    const advBtnDesc = document.querySelector('#adventureBtn .btn-desc');
    if (advBtnDesc) advBtnDesc.textContent = t.MENU.ADVENTURE_DESC;

    const onlineBtnText = document.querySelector('#onlineBtn .btn-text');
    if (onlineBtnText) onlineBtnText.textContent = t.MENU.ONLINE_NAME;
    const onlineBtnDesc = document.querySelector('#onlineBtn .btn-desc');
    if (onlineBtnDesc) onlineBtnDesc.textContent = t.MENU.ONLINE_DESC;

    const achBtnText = document.querySelector('#achievementsBtn .btn-text');
    if (achBtnText) achBtnText.textContent = t.MENU.ACHIEVEMENTS_NAME;
    const achBtnDesc = document.querySelector('#achievementsBtn .btn-desc');
    if (achBtnDesc) achBtnDesc.textContent = t.MENU.ACHIEVEMENTS_DESC;

    // Game Table Stats Labels
    const playerDeckLabel = document.querySelector('.player-deck .pile-label');
    if (playerDeckLabel) playerDeckLabel.textContent = t.STATS.PLAYER_DECK;
    const discardPileLabel = document.querySelector('.discard-pile .pile-label');
    if (discardPileLabel) discardPileLabel.textContent = t.STATS.DISCARD_PILE;
    const bossDeckLabel = document.querySelector('.boss-deck .pile-label');
    if (bossDeckLabel) bossDeckLabel.textContent = t.STATS.BOSS_DECK;

    const hpLabel = document.querySelector('.hp .counter-label');
    if (hpLabel) hpLabel.textContent = t.STATS.HEALTH;
    const atkLabel = document.querySelector('.atk .counter-label');
    if (atkLabel) atkLabel.textContent = t.STATS.ATTACK;
    const shieldLabel = document.querySelector('.shield .counter-label');
    if (shieldLabel) shieldLabel.textContent = t.STATS.FIELD;
    
    const fieldTitle = document.querySelector('.field-title');
    // if (fieldTitle) fieldTitle.textContent = t.STATS.FIELD;

    // Side panel headers
    const rulesTitleEl = document.getElementById('rulesTitle');
    if (rulesTitleEl) rulesTitleEl.textContent = t.HEADERS.RULES;
    const logsTitleEl = document.getElementById('logsTitle');
    if (logsTitleEl) logsTitleEl.textContent = t.HEADERS.LOGS;

    // Character panel static texts
    const abilityTitleEl = document.querySelector('.char-ability-list h4');
    if (abilityTitleEl) abilityTitleEl.textContent = t.CHAR_PANEL.ABILITY_TITLE;
    const winsLabelEl = document.querySelector('.win-progression .label');
    if (winsLabelEl) winsLabelEl.textContent = t.MENU.CHAR_WINS_LABEL;

    // Buttons
    if (elements.playCardBtn) elements.playCardBtn.textContent = t.BUTTONS.PLAY;
    if (elements.skipTurnBtn) elements.skipTurnBtn.textContent = t.BUTTONS.SKIP;
    if (elements.confirmDefenseBtn) elements.confirmDefenseBtn.textContent = t.BUTTONS.CONFIRM_DEFENSE;
    if (elements.restartGameBtn) elements.restartGameBtn.textContent = t.BUTTONS.RESTART;

    // Defense inline panel labels
    const defenseLabels = document.querySelectorAll('#defensePanel .defense-info-mini .v-label');
    if (defenseLabels[0]) defenseLabels[0].textContent = t.NOTIFICATIONS.DEFENSE_REQ;
    if (defenseLabels[1]) defenseLabels[1].textContent = t.NOTIFICATIONS.DEFENSE_CUR;
}

function updatePhaseIndicator() {
    elements.phaseIndicator.textContent = CONFIG.UI_TEXT.PHASES[gameState.phase] || gameState.phase;
}

function updatePlayerHand() {
    const player = gameState.players[0];
    elements.playerHand.innerHTML = '';
    player.hand.forEach(card => elements.playerHand.appendChild(createCardElement(card)));
}

// [NEW] 渲染 AI 队友状态栏 (v2.5.0)
function updateTeammatesUI() {
    if (!elements.teammatesZone) return;
    elements.teammatesZone.innerHTML = '';

    const aiPlayers = gameState.players.filter(p => p.isAI);
    if (aiPlayers.length === 0) {
        elements.teammatesZone.style.display = 'none';
        return;
    }
    elements.teammatesZone.style.display = 'flex';

    // 翻译策略名
    const StrategyNames = {
        'balanced': '平衡',
        'defensive': '稳健',
        'aggressive': '激进'
    };

    aiPlayers.forEach(ai => {
        const isActive = gameState.players[gameState.currentPlayerIndex].id === ai.id;
        const box = document.createElement('div');
        box.className = 'teammate-box' + (isActive ? ' active-turn' : '');
        
        box.innerHTML = `
            <div class="tm-title-line">
                <div class="tm-name">${ai.name}</div>
                <div class="tm-strategy">[ ${StrategyNames[ai.strategy] || 'AI'} ]</div>
            </div>
            <div class="tm-hand-count">
                <div class="tm-hand-icon"></div>
                x ${ai.hand.length}
            </div>
        `;
        elements.teammatesZone.appendChild(box);
    });
}

function updateFieldCards() {
    elements.fieldCards.innerHTML = '';
    gameState.fieldCards.forEach(card => {
        const el = createCardElement(card, true);
        el.classList.add('field-card');
        el.style.transform = 'scale(0.8)';
        elements.fieldCards.appendChild(el);
    });
}

function selectCardForCombo(cardId) {
    // [ADD] AI 回合禁止玩家选牌 (v2.5.0)
    if (gameState.players[gameState.currentPlayerIndex].isAI) return;

    if (gameState.phase === 'TAKE_DAMAGE') {
        selectCardForDefense(cardId);
        return;
    }
    const player = gameState.players[gameState.currentPlayerIndex];
    const card = player.hand.find(c => c.id === cardId);
    if (!card) return;
    const index = selectedCardsForCombo.findIndex(c => c.id === cardId);
    if (index === -1) selectedCardsForCombo.push(card);
    else selectedCardsForCombo.splice(index, 1);
    updateComboSelection();
}

function updateComboSelection() {
    document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));
    selectedCardsForCombo.forEach(card => {
        const el = document.querySelector(`[data-card-id="${card.id}"]`);
        if (el) el.classList.add('selected');
    });
}

function updateComboButtons() { }

function updateShieldEffect() {
    const shieldValue = getTotalShieldValue();
    gameState.currentBoss.currentATK = Math.max(0, gameState.currentBoss.baseATK - shieldValue);
    elements.bossAttack.textContent = gameState.currentBoss.currentATK;
    // if (elements.bossShield) elements.bossShield.textContent = shieldValue;
}

function updateImmunityIndicator(bossSuit) {
    if (elements.bossImmunity) {
        elements.bossImmunity.textContent = CONFIG.UI_TEXT.STATS.IMMUNE.replace('{suit}', bossSuit);
        elements.bossImmunity.style.display = 'block';
    }
}

function showSkillEffect(skillType, card, count = 0) {
    let el;
    switch (skillType) {
        case 'crit': el = createFloatingText('CRIT!', '#ff6b6b', '2em'); break;
        case 'shield': el = createFloatingText('SHIELD', '#4ecdc4', '1.5em'); break;
        case 'draw': el = createFloatingText(`+${count}`, '#ffa502', '1.8em'); break;
        case 'recycle': el = createFloatingText(`♻️ ${count}`, '#ff6b9d', '1.5em'); break;
        case 'immune': el = createFloatingText('IMMUNE', '#ff4757', '1.8em'); break;
    }
    if (el) {
        elements.gameBoard.appendChild(el);
        setTimeout(() => el.remove(), CONFIG.ANIMATION.EFFECT_DURATION);
    }
}

function showScreenDamageEffect(damage, comboType) {
    const flash = document.createElement('div');
    flash.className = 'damage-screen-flash';

    const container = document.createElement('div');
    container.className = 'damage-screen-text-container';

    const typeLabel = document.createElement('div');
    typeLabel.className = 'damage-screen-type';
    typeLabel.textContent = comboType;

    const valLabel = document.createElement('div');
    valLabel.className = 'damage-screen-val';
    valLabel.textContent = `-${damage}`;

    container.appendChild(typeLabel);
    container.appendChild(valLabel);
    flash.appendChild(container);

    document.body.appendChild(flash);

    setTimeout(() => flash.remove(), CONFIG.ANIMATION.SCREEN_FLASH_DURATION);

    elements.currentBoss.classList.add('damage-flash');
    setTimeout(() => elements.currentBoss.classList.remove('damage-flash'), 1000);
}

function showDamageEffect(damage, skillMessage = '') {
    const text = document.createElement('div');
    text.textContent = `-${damage}`;
    text.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ff4757; font-size: 2em; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none; z-index: 100; animation: damageFloat 1s ease-out forwards;`;
    elements.currentBoss.appendChild(text);
    if (skillMessage) {
        const sText = document.createElement('div');
        sText.textContent = skillMessage;
        sText.style.cssText = `position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-size: 1.2em; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.8); pointer-events: none; z-index: 100; animation: skillFloat 1.5s ease-out forwards;`;
        elements.currentBoss.appendChild(sText);
        setTimeout(() => sText.remove(), 1500);
    }
    elements.currentBoss.classList.add('damage-flash');
    setTimeout(() => {
        elements.currentBoss.classList.remove('damage-flash');
        text.remove();
    }, 1000);
}

function showDefensePanel() {
    const requiredValue = gameState.currentBoss.currentATK;
    const player = gameState.players[gameState.currentPlayerIndex];
    const maxPossibleDefense = player.hand.reduce((sum, card) => sum + card.value, 0);

    if (maxPossibleDefense < requiredValue) {
        const failMsg = CONFIG.UI_TEXT.NOTIFICATIONS.DEFENSE_FAIL.replace('{defense}', maxPossibleDefense).replace('{atk}', requiredValue);
        showGameOver(false, failMsg);
        return;
    }

    elements.requiredDefense.textContent = requiredValue;
    elements.currentDefenseValue.textContent = '0';
    elements.defensePanel.style.display = 'block';
    elements.actionButtons.style.display = 'none';
    selectedCardsForDefense = [];
    selectedCardsForCombo = [];
    document.querySelectorAll('.card').forEach(el => el.classList.remove('selected'));

    // [FIX] 初始显示面板时，必须立即计算防御按钮状态（解决攻击力为0时无法确认的Bug）
    updateDefenseValue();

    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.DEFENSE_PROMPT.replace('{atk}', requiredValue));
}

function selectCardForDefense(cardId) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const card = player.hand.find(c => c.id === cardId);
    if (!card) return;
    const index = selectedCardsForDefense.findIndex(c => c.id === cardId);
    if (index === -1) {
        selectedCardsForDefense.push(card);
        const el = document.querySelector(`[data-card-id="${cardId}"]`);
        if (el) el.classList.add('selected');
    } else {
        selectedCardsForDefense.splice(index, 1);
        const el = document.querySelector(`[data-card-id="${cardId}"]`);
        if (el) el.classList.remove('selected');
    }
    updateDefenseValue();
}

function updateDefenseValue() {
    const totalValue = selectedCardsForDefense.reduce((sum, card) => sum + card.value, 0);
    elements.currentDefenseValue.textContent = totalValue;
    elements.confirmDefenseBtn.disabled = totalValue < gameState.currentBoss.currentATK;
}

// 角色核心技能触发器 (v2.4.0)
function triggerCharacterSkill() {
    if (!gameState || !gameState.character || gameState.character.chargesLeft <= 0) return;
    if (gameState.phase !== 'TURN_START') return;

    if (gameState.character.id === 'CHOSEN_ONE') {
        executeChosenOneSkill();
    } else if (gameState.character.id === 'BARD') {
        executeBardSkill();
    }
}

function executeChosenOneSkill() {
    // 1. 中和 Boss 技能
    gameState.currentBoss.isSpecialDisabled = true;

    // 2. 弃手牌并重抽
    const player = gameState.players[gameState.currentPlayerIndex];
    gameState.discardPile.push(...player.hand);
    player.hand = [];

    drawWithOverflow(8);

    // 3. 扣除次数
    gameState.character.chargesLeft--;

    addLogEntry(CONFIG.UI_TEXT.LOGS.USE_JOKER, 'skill');
    showToastMessage('🃏 Joker 已翻面！优先回收墓地卡牌，Boss 技能失效');
    playSound('purify');
    updateUI();
}

function executeBardSkill() {
    if (selectedCardsForCombo.length === 0) {
        showToastMessage('🎶 请先选择想要替换的手牌');
        return;
    }

    const player = gameState.players[gameState.currentPlayerIndex];
    const discardCount = selectedCardsForCombo.length;

    // [NEW] 记录卡牌明细以便在日志中展示
    const suitNameMap = { '♣': '梅花', '♠': '黑桃', '♦': '方片', '♥': '红桃' };
    const getCardName = (c) => `${suitNameMap[c.suit] || c.suit}${c.rank}`;
    const discardedNames = selectedCardsForCombo.map(getCardName).join(', ');

    // 1. 弃置选中的牌
    selectedCardsForCombo.forEach(card => {
        const index = player.hand.findIndex(c => c.id === card.id);
        if (index !== -1) player.hand.splice(index, 1);
        gameState.discardPile.push(card);
    });

    selectedCardsForCombo = [];

    // 2. 抽取相同数量的牌
    const oldHandIds = player.hand.map(c => c.id);
    drawCards(player, discardCount);
    const newCards = player.hand.filter(c => !oldHandIds.includes(c.id));
    const drawnNames = newCards.map(getCardName).join(', ');

    // 3. 扣除次数
    gameState.character.chargesLeft--;

    addLogEntry(`🎶 吟游诗人发动【万能之手】重洗了 ${discardCount} 张牌`, 'skill');
    addLogEntry(`弃: ${discardedNames} | 得: ${drawnNames || '无'}`, 'normal');
    showToastMessage(`🎶 万能之手生效！获得了 ${newCards.length} 张新牌`);
    playSound('draw');
    updateUI();
}

// 辅助函数：带溢出处理的抽牌逻辑
function drawWithOverflow(totalNeeded) {
    const player = gameState.players[gameState.currentPlayerIndex];
    let drawn = 0;

    // 优先从墓地（弃牌堆）抽取
    while (drawn < totalNeeded && gameState.discardPile.length > 0) {
        player.hand.push(gameState.discardPile.pop());
        drawn++;
    }

    // 如果还不够，从酒馆（玩家牌组）抽取
    while (drawn < totalNeeded && gameState.playerDeck.length > 0) {
        player.hand.push(gameState.playerDeck.pop());
        drawn++;
    }
}

function showToastMessage(message, duration = 2000) {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.9); color: white; padding: 15px 25px; border-radius: 25px; font-size: 16px; font-weight: bold; text-align: center; z-index: 1000; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); animation: toastFadeIn 0.3s ease-out;`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.ANIMATION.TOAST_DURATION);
}

function showMessage(message) { console.log('Game Message:', message); }

function showGameOver(isWin, message) {
    gameState.phase = 'GAME_OVER';
    elements.gameOverTitle.textContent = isWin ? '🎉 胜利！' : CONFIG.UI_TEXT.NOTIFICATIONS.DEFEAT;
    elements.gameOverMessage.textContent = message;
    elements.gameOverModal.style.display = 'flex';
    elements.restartGameBtn.textContent = isWin ? '下一场对局' : '返回主菜单';
    stopBgm();

    if (isWin) {
        // 记录胜场
        const newWins = ProgressionTracker.saveWin(gameState.character.id);
        const newLv = ProgressionTracker.calculateLevel(newWins);
        if (newLv > gameState.character.level) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.CHAR_UPGRADE.replace('{lv}', newLv));
        }
    } else {
        playSound('gameOver');
    }
}

function restartGame() {
    elements.gameOverModal.style.display = 'none';
    if (gameState.phase === 'GAME_OVER' && elements.restartGameBtn.textContent === '返回主菜单') {
        showMainMenu();
    } else {
        initGame();
    }
}

// =============================================================================
// 7. EVENT LISTENERS & ENTRY POINT
// =============================================================================
elements.playCardBtn.addEventListener('click', () => {
    if (selectedCardsForCombo.length === 0) {
        showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SELECT_PROMPT);
        return;
    }
    if (!validateCombo(selectedCardsForCombo)) {
        showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.INVALID_COMBO);
        return;
    }
    executeCombo(selectedCardsForCombo);
    selectedCardsForCombo = [];
});

elements.skipTurnBtn.addEventListener('click', skipTurn);
elements.confirmDefenseBtn.addEventListener('click', confirmDefense);
elements.restartGameBtn.addEventListener('click', restartGame);
elements.jokerBtn.addEventListener('click', triggerCharacterSkill);

const style = document.createElement('style');
style.textContent = `@keyframes damageFloat { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -150%) scale(1.5); opacity: 0; } }`;
document.head.appendChild(style);

// =============================================================================
// 8. AI ENGINE (v2.5.0)
// =============================================================================

function triggerAITurn() {
    const aiPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!aiPlayer.isAI) return;

    if (gameState.phase === 'TAKE_DAMAGE') {
        setTimeout(() => handleAIDefense(aiPlayer), window.aiDelay || 1500);
    } else if (gameState.phase === 'TURN_START') {
        setTimeout(() => handleAIOffense(aiPlayer), window.aiDelay || 1500);
    }
}

function handleAIDefense(aiPlayer) {
    const requiredValue = gameState.currentBoss.currentATK;
    const maxPossibleDefense = aiPlayer.hand.reduce((sum, card) => sum + card.value, 0);

    // [失败判定]
    if (maxPossibleDefense < requiredValue) {
        const failMsg = `${aiPlayer.name} 的手牌点数不足以抵挡 Boss 的攻击！`;
        addLogEntry(`${aiPlayer.name} 防守失败 (需要 ${requiredValue})！`, 'error');
        showGameOver(false, failMsg);
        return;
    }

    const { selectedCards, totalValue } = calculateAIDefense(aiPlayer.hand, requiredValue, gameState.currentBoss, aiPlayer.strategy);

    // 执行防守动作
    const cardNames = selectedCards.map(c => `${c.suit}${c.rank}`).join('+');
    addLogEntry(`[防守] ${aiPlayer.name} 弃置了 ${cardNames} (抵挡 ${totalValue} 点伤害)`, 'defense');

    selectedCards.forEach(selectedCard => {
        const index = aiPlayer.hand.findIndex(card => card.id === selectedCard.id);
        if (index !== -1) {
            aiPlayer.hand.splice(index, 1);
            gameState.discardPile.push(selectedCard);
        }
    });

    passTurn();
    showToastMessage(`${aiPlayer.name} 成功防御！`);
    playSound('playCard'); // 复用声效
}

function calculateAIDefense(hand, requiredValue, currentBoss, strategy) {
    const immuneSuit = currentBoss.isSpecialDisabled ? null : currentBoss.currentBoss.suit;
    
    // Sort logic to prefer yielding "useless" cards early
    // Priority:
    // 1. Immune suit cards
    // 2. Non-Spade, non-Ace cards, ascending value
    // 3. Spades / Aces / Combos
    const sortedHand = [...hand].sort((a, b) => {
        const aIsImmune = a.suit === immuneSuit ? 1 : 0;
        const bIsImmune = b.suit === immuneSuit ? 1 : 0;
        
        // 优先弃掉 Boss 免疫的花色
        if (aIsImmune !== bIsImmune) return bIsImmune - aIsImmune; 

        // 尽量保留 A (组合技引擎)
        const aIsAce = a.rank === 'A' ? 1 : 0;
        const bIsAce = b.rank === 'A' ? 1 : 0;
        if (aIsAce !== bIsAce) return aIsAce - bIsAce;

        // 尽量保留黑桃 (如果是强力免疫外)
        const aIsSpade = (a.suit === '♠' && immuneSuit !== '♠') ? 1 : 0;
        const bIsSpade = (b.suit === '♠' && immuneSuit !== '♠') ? 1 : 0;
        if (aIsSpade !== bIsSpade) return aIsSpade - bIsSpade;

        // 如果策略是稳健型，更积极保留红桃
        if (strategy === 'defensive') {
            const aIsHeart = (a.suit === '♥' && immuneSuit !== '♥') ? 1 : 0;
            const bIsHeart = (b.suit === '♥' && immuneSuit !== '♥') ? 1 : 0;
            if (aIsHeart !== bIsHeart) return aIsHeart - bIsHeart;
        }

        // 默认按从小到大丢弃
        return a.value - b.value;
    });

    let currentSum = 0;
    const selectedCards = [];
    
    // 贪心挑选直至满足防御
    for (let i = 0; i < sortedHand.length; i++) {
        if (currentSum >= requiredValue) break;
        selectedCards.push(sortedHand[i]);
        currentSum += sortedHand[i].value;
    }

    // 后期优化点: 如果 currentSum 严重超出 requiredValue, 
    // 可以尝试用动态规划求更精确的最佳组合 (例如背包问题找大于等于 target 的最小和)以免浪费高价值单卡。
    // 在这里简单实现贪心。
    
    return { selectedCards, totalValue: currentSum };
}

function handleAIOffense(aiPlayer) {
    const { selectedCards } = calculateAIOffense(aiPlayer.hand, gameState.currentBoss, aiPlayer.strategy);

    if (!selectedCards || selectedCards.length === 0) {
        skipTurn();
    } else {
        executeCombo(selectedCards);
        updateUI();
    }
}

function calculateAIOffense(hand, currentBoss, strategy) {
    const immuneSuit = currentBoss.isSpecialDisabled ? null : currentBoss.currentBoss.suit;
    const bossHP = currentBoss.currentHP;
    const bossATK = currentBoss.currentATK;

    // 1. 斩杀/感化判定 (Purify: Damage == BossHP)
    // 优先级最高，不仅获得卡牌还能清除威胁
    const purifyCombo = findSpecificDamageCombo(hand, bossHP, immuneSuit);
    if (purifyCombo) return { selectedCards: purifyCombo };

    // 2. 资源/生存优先级 (根据策略和现状调整)
    // 平衡型基准
    
    // 如果手牌极少 (<=3)，强行找方片
    if (hand.length <= 3) {
        const drawCombo = findBestComboBySuit(hand, '♦', immuneSuit);
        if (drawCombo) return { selectedCards: drawCombo };
    }

    // 如果 Boss 伤害很高 (>=10) 且不免疫黑桃，优先黑桃
    if (bossATK >= 10 && immuneSuit !== '♠') {
        const shieldCombo = findBestComboBySuit(hand, '♠', immuneSuit);
        if (shieldCombo) return { selectedCards: shieldCombo };
    }

    // 如果手牌还是比较少 (<=5)，依然倾向找方片
    if (hand.length <= 5) {
        const drawCombo = findBestComboBySuit(hand, '♦', immuneSuit);
        if (drawCombo) return { selectedCards: drawCombo };
    }

    // 3. 进攻优先级 (Clubs > Hearts > Spades)
    // 激进型优先草花，稳健型优先红桃/黑桃
    let preferredSuits = ['♣', '♥', '♠', '♦'];
    if (strategy === 'defensive') preferredSuits = ['♠', '♥', '♦', '♣'];
    if (strategy === 'aggressive') preferredSuits = ['♣', '♦', '♠', '♥'];

    for (const suit of preferredSuits) {
        const combo = findBestComboBySuit(hand, suit, immuneSuit);
        if (combo) return { selectedCards: combo };
    }

    // 4. 兜底策略: 随便出一张
    const fallback = findBestSingleFallback(hand, immuneSuit);
    return { selectedCards: fallback };
}

// 辅助：寻找特定伤害的 Combo
function findSpecificDamageCombo(hand, targetDamage, immuneSuit) {
    const allLegalCombos = getAllLegalCombos(hand);
    
    // 过滤出能打出正好 targetDamage 的组合
    const possible = allLegalCombos.filter(combo => {
        let dmg = combo.reduce((s, c) => s + c.value, 0);
        // 如果是草花且 Boss 不免疫，伤害翻倍
        const hasClub = combo.some(c => c.suit === '♣');
        if (hasClub && immuneSuit !== '♣') dmg *= 2;
        return dmg === targetDamage;
    });

    return possible.length > 0 ? possible[0] : null;
}

// 辅助：根据花色偏好寻找最有价值 Combo
function findBestComboBySuit(hand, preferredSuit, immuneSuit) {
    if (preferredSuit === immuneSuit) return null;

    const allLegalCombos = getAllLegalCombos(hand);
    const suitCombos = allLegalCombos.filter(combo => combo.some(c => c.suit === preferredSuit));

    if (suitCombos.length === 0) return null;

    // 排序逻辑：能打出的花色效果（伤害、补牌、降攻等）最高优先
    suitCombos.sort((a, b) => {
        const valA = a.reduce((s, c) => s + c.value, 0);
        const valB = b.reduce((s, c) => s + c.value, 0);
        return valB - valA; // 降序
    });

    return suitCombos[0];
}

// 辅助：列出所有合法的单卡及简单 Combo (Pets, Multiples)
function getAllLegalCombos(hand) {
    const combos = [];
    
    // 1. 单卡
    hand.forEach(c => combos.push([c]));

    // 2. 宠物 (Ace + Card)
    const aces = hand.filter(c => c.rank === 'A');
    const others = hand.filter(c => c.rank !== 'A');
    aces.forEach(a => {
        others.forEach(o => combos.push([a, o]));
    });

    // 3. 同点数组合 (Sum <= 10)
    const byRank = {};
    hand.forEach(c => {
        if (c.rank === 'A') return; // A 不进点数组合
        if (!byRank[c.rank]) byRank[c.rank] = [];
        byRank[c.rank].push(c);
    });

    for (const rank in byRank) {
        const cards = byRank[rank];
        const val = cards[0].value;
        if (cards.length >= 2 && val * 2 <= 10) combos.push([cards[0], cards[1]]);
        if (cards.length >= 3 && val * 3 <= 10) combos.push([cards[0], cards[1], cards[2]]);
        if (cards.length >= 4 && val * 4 <= 10) combos.push([cards[0], cards[1], cards[2], cards[3]]);
    }

    return combos;
}

function findBestSingleFallback(hand, immuneSuit) {
    const nonImmune = hand.filter(c => c.suit !== immuneSuit);
    if (nonImmune.length > 0) {
        return [nonImmune.sort((a, b) => b.value - a.value)[0]];
    }
    // 实在没办法，出张最小的免疫废牌去“抵消”Boss技能（其实就是浪费掉）
    if (hand.length > 0) {
        return [hand.sort((a, b) => a.value - b.value)[0]];
    }
    return null;
}

// 供跳过和执行事件访问的全局延迟参数
window.aiDelay = 1500;

document.addEventListener('DOMContentLoaded', () => {
    console.log(`[AudioDebug] Initializing game v${CONFIG.VERSION}`);
    if (typeof MIDIjs !== 'undefined') {
        console.log(`[AudioDebug] MIDIjs library loaded successfully.`);
    } else {
        console.warn(`[AudioDebug] MIDIjs library NOT detected at startup.`);
    }
    showStartScreen();
    document.addEventListener('keydown', handleStartKeydown);
    document.addEventListener('click', handleStartClick);

    // [NEW] 绑定手动展开手牌按钮逻辑 (v2.5.2)
    if (elements.manualExpandHandBtn) {
        elements.manualExpandHandBtn.onclick = () => {
            const playerStation = document.querySelector('.player-station');
            if (playerStation) {
                playerStation.classList.toggle('collapsed');
            }
        };
    }
});
