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
    VERSION: '2.14.0',
    CARD_VALUES: {
        'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 10, 'Q': 10, 'K': 10, 'JOKER': 0
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
            portrait: 'assets/characters/char_chosen_one.png',
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
            portrait: 'assets/characters/char_bard.png',
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
        },
        'ZHAO_YUN': {
            name: '赵云',
            id: 'ZHAO_YUN',
            portrait: 'assets/characters/char_zhaoyun.png',
            bio: '三国名将，枪出如龙，七进七出！龙胆一身，无所畏惧。',
            abilities: {
                lv1: '【龙胆】LV.1: 手牌中的♠可以视作♣打出，♣可以视作♠打出。',
                lv2: '【龙胆】LV.2: 手牌中的♥可以视作♦打出，♦可以视作♥打出。',
                lv3: '【龙胆】LV.3: 所有打出卡牌无视 Boss 免疫。'
            },
            skills: {
                id: 'PASSIVE',
                icon: '🐉',
                charges: (lv) => 0,
                resetType: (lv) => 'GAME'
            }
        },
        'ALCHEMIST': {
            name: '炼金术士',
            id: 'ALCHEMIST',
            portrait: 'assets/characters/char_alchemist.png',
            bio: '资源转换与延迟收益大师，将"垃圾"变黄金。',
            abilities: {
                lv1: '【等价交换】: 每回合限1次，可将1张手牌与墓地顶1张牌交换。',
                lv2: '【贤者之石】: 交换次数提升至2次，且交换后若两张牌花色相同，额外抽1张。',
                lv3: '【大炼成阵】: 每局1次，将当前手牌和墓地牌全部洗入酒馆，从酒馆抽取至手牌上限。'
            },
            skills: {
                id: 'EXCHANGE',
                icon: '⚗️',
                charges: (lv) => lv >= 2 ? 2 : 1,
                resetType: (lv) => 'TURN',
                ultCharges: (lv) => lv >= 3 ? 1 : 0
            }
        },
        'MONK': {
            name: '武僧',
            id: 'MONK',
            portrait: 'assets/characters/char_monk.png',
            bio: '突破限制的连招大师，拳既是道。',
            abilities: {
                lv1: '【震慑拳15】: 将连招点数限制从 10 提升至 15。',
                lv2: '【震慑拳20】: 将连招点数限制从 15 提升至 20。',
                lv3: '【震慑拳Max】: 将连招点数限制提升至 40 (可二连 K)。'
            },
            skills: {
                id: 'PASSIVE',
                icon: '👊',
                charges: (lv) => 0,
                resetType: (lv) => 'GAME'
            }
        },
        'GAMBLER': {
            name: '赌徒',
            id: 'GAMBLER',
            portrait: 'assets/characters/char_gambler.png',
            bio: '高风险极高回报。用筹码丈量命运，用生死交换狂欢。',
            abilities: {
                lv1: '【孤注一掷】: 每当出牌，随机抽 1，若花色与出牌相同则获得。',
                lv2: '【无限绿波】: 每当获得卡牌，若花色与该牌相同则再次随机抽牌，可无限触发。',
                lv3: '【天命在我】: 判定条件升级为：花色相同 或 点数相同。'
            },
            skills: {
                id: 'PASSIVE',
                icon: '🎲',
                charges: (lv) => 0,
                resetType: (lv) => 'GAME'
            }
        },
        'ASSASSIN': {
            name: '刺客',
            id: 'ASSASSIN',
            portrait: 'assets/characters/char_assassin.png',
            bio: '精准斩杀与连击爆发，强调"一击必杀"的窗口期。',
            abilities: {
                lv1: '【背刺】: 第一张打出的牌如果是 ♣，点数翻倍。',
                lv2: '【连杀】: 用 ♣ 击败 Boss 后从酒馆或墓地抽 2 张。',
                lv3: '【死亡标记】: 每回合限一次。标记当前 Boss，全手牌附带 ♣ 翻倍效果。'
            },
            skills: {
                id: 'DEATH_MARK',
                icon: '🎯',
                charges: (lv) => (lv >= 3 ? 1 : 0),
                resetType: (lv) => 'TURN'
            }
        }
    },
    // [NEW] 神器配置 (v2.13.0)
    ARTIFACTS: {
        '001': { id: '001', name: '战鼓', icon: '🥁', desc: '在伤害计算阶段，额外增加 1 点伤害', quality: 'B', type: 'COMBAT' },
        '002': { id: '002', name: '磨刀石', icon: '🛠️', desc: '手中卡牌面值 +1 (最大 10)', quality: 'B', type: 'COMBAT' },
        '003': { id: '003', name: '破甲箭', icon: '🏹', desc: '暴击伤害倍率由 2 提升至 3', quality: 'A', type: 'COMBAT' },
        '004': { id: '004', name: '圣盾', icon: '🛡️', desc: '护盾效果提升：单人模式 1.5 倍(封顶)，多人模式对全队生效', quality: 'A', type: 'COMBAT' },
        '005': { id: '005', name: '复活十字架', icon: '✝️', desc: '单人模式：增加一次复活机会', quality: 'S', type: 'RULE' },
        '006': { id: '006', name: '魔法背包', icon: '🎒', desc: '手牌上限 +2', quality: 'A', type: 'RULE' },
        '007': { id: '007', name: '聚能环', icon: '💍', desc: '方片溢出的卡牌将回流至酒馆底', quality: 'S', type: 'RULE' },
        '008': { id: '008', name: '幸运金币', icon: '🪙', desc: '击杀 Boss 获得的神器数量 +1', quality: 'A', type: 'RULE' }
    },
    ARTIFACT_QUALITY_WEIGHTS: {
        'S': 10, 'A': 30, 'B': 60
    },
    // 升级 EXP 阈值 (v2.12.0 重构：胜获 5 经验，败获 1 经验)
    UPGRADE_REQUIREMENTS: {
        lv2: 5,  // 对应之前的 1 胜
        lv3: 15  // 对应之前的 3 胜
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
            CHAR_EXP_LABEL: '当前等级:',
            CHAR_TOTAL_STATS: '实战统计:',
            TOTAL_WINS: '获得胜利:',
            TOTAL_GAMES: '参与场次:',
            CURRENT_EXP: '当前经验:'
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
            PLAYER_ACTION: '玩家 {name} 出牌: {cards}',
            COMBO_INFO: '{type}: {info}',
            SKILL_SPADE: '♠ 触发：增加护盾点数 {val}',
            SKILL_DIAMOND: '♦ 触发：请求补给 {req} 张（实际入手 {act}）',
            SKILL_DIAMOND_TEAM: '♦ 补给：全队依次获得 {act} 张卡牌{overflow}',
            SKILL_HEART: '♥ 触发：从墓地回收 {val} 张卡牌',
            SKILL_CLUB: '♣ 触发：伤害判定翻倍',
            SKILL_IMMUNE: '{suit}技能被免疫',
            BOSS_DAMAGED: 'Boss 受到 {val} 点伤害',
            PURIFY: '✨ Boss 已被感化并加入酒馆！',
            BOSS_DEFEATED: '💀 Boss 被击败了！',
            BOSS_APPEAR: '📜 新 Boss 出现了：{suit}{rank}',
            DEFENSE_SUCCESS: '🛡️ 防御成功！',
            DEFENSE_FAIL: '💥 防御失败！',
            USE_JOKER: '🃏 使用 Joker：Boss 技能失效，重置手牌！',
            OVERFLOW_DECK: '♻️ 触发【回流】：{count} 张溢出牌回流至酒馆底。',
            SKILLS: {
                ASSASSIN: {
                    BACKSTAB: '🗡️ 刺客【背刺】：{msg}！点数翻倍至 {dmg}',
                    CHAIN_KILL: '🗡️ 刺客【连杀】：绝命一击！准备补给资源...',
                    CHAIN_KILL_DONE: '🗡️ 【连杀】完成：获得了 {rewards} 张手牌奖励',
                    DEATH_MARK: '🎯 触发【死亡标记】：全部手牌附带 ♣ 效果（伤害翻倍/标记增幅）！',
                    DEATH_MARK_ACTIVE: '🎯 [{name}] 发动【死亡标记】：Boss 已被标记！'
                },
                MONK: {
                    BRACING_PUNCH: '👊 武僧【震慑拳】：连招爆发！突破 10 点上限，当前上限 {limit} 点'
                },
                ZHAO_YUN: {
                    LONG_DAN_SWAP: '🐉 赵云【龙胆】：{from}触发{to}判定（{effect}）！',
                    LONG_DAN_IGNORE: '🐉 赵云【龙胆】：无视 Boss 的 {suit} 技能免疫！'
                },
                GAMBLER: {
                    PREPARE: '🎲 赌徒【孤注一掷】准备判定：出牌参照为 {card}',
                    SUCCESS: '🎲 赌徒【孤注一掷】：判定成功！捕获了 {card}',
                    FAIL: '🎲 赌徒【孤注一掷】：可惜，花色/点数不匹配',
                    EMPTY: '🎲 赌徒【孤注一掷】：酒馆已无卡牌',
                    GREEN_WAVE: '🎲 赌徒【无限绿波】：连环触发！再次捕获 {card}'
                },
                BARD: {
                    HAND_OF_GOD: '🎶 吟游诗人【万能之手】：洗牌完成，重抽了 {count} 张卡牌'
                },
                ALCHEMIST: {
                    EXCHANGE: '⚗️ 炼金术士【等价交换】：用 {hand} 换回了墓地的 {grave}',
                    SAGE_STONE: '✨ 【贤者之石】共振：花色相同，额外抽 1 张牌！',
                    ULT: '🏺 炼金术士【大炼成阵】：禁忌炼金！全场资源重组，获得新生命！'
                }
            }
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
            ARTIFACT_DROP: '🎁 Boss 掉落了神器：{name}！',
            ARTIFACT_CLAIM: '✨ {player} 获得了神器：{name}',
            RESURRECT_TOAST: '✨ 【复活十字架】触发！你获得了第二次机会！',
            ONLINE_WIP: '联机模式即将开启！',
            ACHIEVEMENTS_WIP: '成就系统开发中...',
            CHAR_UPGRADE: '⬆️ 角色升级！当前等级: Lv.{lv}',
            SKILL_ALCHEMIST: {
                EXCHANGE_USED: '⚗️ 本回合等价交换次数已用完',
                EXCHANGE_SELECT: '⚗️ 等价交换：请精确选择 1 张手牌',
                EXCHANGE_DONE: '⚗️ 等价交换完成',
                EXCHANGE_PROMPT: '⚗️ 请先选择 1 张手牌进行等价交换',
                ULT_LIMIT: '⚗️ 大炼成阵每局仅限使用一次',
                ULT_DONE: '🔮 大炼成阵！生命在于循环'
            },
            SKILL_ASSASSIN: {
                MARK_USED: '🎯 本回合标记次数已耗尽',
                MARK_DONE: '🎯 目标已锁定！所有手牌附带翻倍效果'
            }
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
const CHAR_IDS = ['CHOSEN_ONE', 'BARD', 'ZHAO_YUN', 'ALCHEMIST', 'MONK', 'GAMBLER', 'ASSASSIN']; // [NEW] 可选角色列表 (v2.4.0)

// [NEW] AI 队友配置 (v2.5.0)
// 数据结构示例: [{ id: 'AI_1', name: 'AI-1', strategy: 'balanced', isAI: true }]
let selectedAIs = []; 

const elements = {
    gameBoard: document.querySelector('.game-board'),
    phaseIndicator: document.getElementById('phaseIndicator'),
    currentBoss: document.getElementById('currentBoss'),
    bossHealthFill: document.getElementById('bossHealthFill'),
    bossHealthText: document.getElementById('bossHealthText'),
    bossAttack: document.getElementById('bossAttack'),
    bossSuit: document.getElementById('bossSuit'),
    bossRank: document.getElementById('bossRank'),
    bossImmunity: document.getElementById('bossImmunity'), 
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
/**
 * 📊 进度与统计系统 (v2.12.0)
 * 存储结构: { total: {games, wins, exp}, chars: { id: {games, wins, exp} } }
 */
const ProgressionTracker = {
    STORAGE_KEY: 'rgc_global_stats',

    saveResult: function (charId, isWin, isOnline = false) {
        const stats = this.getStats();
        const expGain = isWin ? 5 : 1;

        // 1. 更新总计
        stats.total.games++;
        if (isWin) stats.total.wins++;
        stats.total.exp += expGain;

        // 2. 更新角色统计
        if (!stats.chars[charId]) {
            stats.chars[charId] = { games: 0, wins: 0, exp: 0 };
        }
        stats.chars[charId].games++;
        if (isWin) stats.chars[charId].wins++;
        stats.chars[charId].exp += expGain;

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
        return stats.chars[charId];
    },

    getCharStats: function (charId) {
        const stats = this.getStats();
        return stats.chars[charId] || { games: 0, wins: 0, exp: 0 };
    },

    getStats: function () {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        // 初始化
        return {
            total: { games: 0, wins: 0, exp: 0 },
            chars: {}
        };
    },

    calculateLevel: function (exp) {
        if (exp >= CONFIG.UPGRADE_REQUIREMENTS.lv3) return 3;
        if (exp >= CONFIG.UPGRADE_REQUIREMENTS.lv2) return 2;
        return 1;
    }
};

// =============================================================================
// 3. UTILS & HELPERS
// =============================================================================
// [NEW] 获取受到神器影响后的实际数值 (v2.13.0)
function getEffectiveCardValue(card, specificPlayer = null) {
    if (!gameState || !gameState.players) return CONFIG.CARD_VALUES[card.rank];
    const player = specificPlayer || gameState.players[gameState.currentPlayerIndex];
    if (!player) return CONFIG.CARD_VALUES[card.rank];
    
    // 如果卡牌已经有“打出值”，优先使用（用于场上的黑桃护盾）
    if (card.playedValue !== undefined) return card.playedValue;

    const has002 = player.artifacts && player.artifacts.some(a => a.id === '002');
    const baseValue = CONFIG.CARD_VALUES[card.rank];
    
    if (has002 && !card.isBoss && card.rank !== 'A') {
        return Math.min(10, baseValue + 1);
    }
    return baseValue;
}

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
        const stats = ProgressionTracker.getCharStats(charId);
        const level = ProgressionTracker.calculateLevel(stats.exp);
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
    const baseHandSize = CONFIG.HAND_LIMIT[totalPlayers] || 5;
    
    // 计算特定角色的手牌上限红利 (v2.10.1)
    const getFinalHandSize = (id) => (id === 'GAMBLER' ? baseHandSize + 2 : baseHandSize);

    const players = [{
        id: 'player_1',
        name: charData.name,
        isAI: false,
        charId: charId,
        level: gameState.character.level,
        hand: [],
        artifacts: [], // [NEW] 神器列表 (v2.13.0)
        maxHandSize: getFinalHandSize(charId)
    }];

    // 将选定的 AI 加入队伍
    selectedAIs.forEach((aiConfig, index) => {
        const aiCharId = aiConfig.charId || 'CHOSEN_ONE';
        const aiCharData = CONFIG.CHARACTERS[aiCharId];
        const level = 1;
        players.push({
            id: aiConfig.id,
            name: `${aiConfig.name} (${aiCharData.name})`,
            isAI: true,
            strategy: aiConfig.strategy,
            charId: aiCharId,
            level: level,
            chargesLeft: aiCharData.skills.charges(level),
            maxCharges: aiCharData.skills.charges(level),
            skillResetType: aiCharData.skills.resetType(level),
            hand: [],
            artifacts: [], // [NEW] 神器列表 (v2.13.0)
            maxHandSize: getFinalHandSize(aiCharId)
        });
    });

    gameState = {
        ...gameState,
        character: {
            ...gameState.character,
            chargesLeft: charData.skills.charges(gameState.character.level),
            maxCharges: charData.skills.charges(gameState.character.level),
            ultCharges: charData.skills.ultCharges ? charData.skills.ultCharges(gameState.character.level) : 0
        },
        phase: 'TURN_START',
        currentPlayerIndex: 0,
        players: players,
        bossDeck: bossDeck,
        playerDeck: playerDeck,
        discardPile: [],
        fieldCards: [],
        resurrectUsed: false, // [NEW] 复活神器标记 (v2.13.0)
        isYielding: false, 
        currentTurnActionCount: 0, // [NEW] 追踪本回合行动次数 (v2.9.0)
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
    const firstBossImgSrc = `assets/bosses/boss_${suitEng}_${currentBossCard.rank.toLowerCase()}.png`;
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
            break;
        }
        if (player.hand.length >= player.maxHandSize) break;
        const card = gameState.playerDeck.pop();
        player.hand.push(card);

        // [NEW] 赌徒：无限绿波 (v2.10.3)
        if (player.charId === 'GAMBLER' && player.level >= 2) {
            setTimeout(() => triggerGamblerSkills(player, card, 'GREEN_WAVE'), 100);
        }
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
        const player = gameState.players[gameState.currentPlayerIndex];
        const firstEffValue = getEffectiveCardValue(cards[0]);
        const allSameValue = cards.every(card => getEffectiveCardValue(card) === firstEffValue);
        const totalValue = cards.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);
        const noAces = cards.every(card => card.rank !== 'A');

        // [NEW] 武僧：突破连招上限 (v2.9.8)
        let comboLimit = 10;
        if (player.charId === 'MONK') {
            const lv = player.level || 1;
            if (lv >= 3) comboLimit = 40;
            else if (lv >= 2) comboLimit = 20;
            else comboLimit = 15;
        }

        if (allSameValue && totalValue <= comboLimit && noAces && firstEffValue >= 2) return true;
    }
    return false;
}

function executeCombo(cards) {
    const player = gameState.players[gameState.currentPlayerIndex];
    let comboDamage = 0;
    let comboType = '';
    let comboSkills = new Set();

    const cardNames = cards.map(card => `${card.suit}${card.rank}`).join('+');
    addLogEntry(CONFIG.UI_TEXT.LOGS.PLAYER_ACTION.replace('{name}', player.name).replace('{cards}', cardNames), 'skill');
    playSound('playCard');

    cards.forEach(card => {
        delete card.playedValue; // 清除打出加成状态 (v2.13.0)
        const index = player.hand.findIndex(c => c.id === card.id);
        if (index !== -1) player.hand.splice(index, 1);
    });

    if (cards.length === 1) {
        comboDamage = getEffectiveCardValue(cards[0]);
        // [NEW] 刺客【背刺】逻辑 (v2.11.0)
        if (player.charId === 'ASSASSIN' && player.level >= 1 && gameState.currentTurnActionCount === 0 && cards[0].suit === '♣') {
            comboDamage *= 2;
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.BACKSTAB.replace('{msg}', '首张 ♣ 命中核心').replace('{dmg}', comboDamage), 'skill');
        }
        comboSkills.add(cards[0].suit);
        comboType = '单张';
    } else if (cards.length === 2 && cards.some(c => c.rank === 'A')) {
        const aceCard = cards.find(c => c.rank === 'A');
        const otherCard = cards.find(c => c.rank !== 'A');
        comboDamage = getEffectiveCardValue(aceCard) + getEffectiveCardValue(otherCard);
        // [NEW] 刺客【背刺】对宠物组合的支持
        if (player.charId === 'ASSASSIN' && player.level >= 1 && gameState.currentTurnActionCount === 0 && cards.some(c => c.suit === '♣')) {
             comboDamage *= 2; // 简化为全额翻倍
             addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.BACKSTAB.replace('{msg}', '宠物突袭').replace('{dmg}', comboDamage), 'skill');
        }
        comboSkills.add(aceCard.suit);
        comboSkills.add(otherCard.suit);
        comboType = '宠物组合';
        addLogEntry(CONFIG.UI_TEXT.LOGS.COMBO_INFO.replace('{type}', comboType).replace('{info}', `${aceCard.suit}${aceCard.rank} + ${otherCard.suit}${otherCard.rank}`), 'skill');
    } else {
        comboDamage = cards.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);
        // [NEW] 刺客【背刺】对连招的支持
        if (player.charId === 'ASSASSIN' && player.level >= 1 && gameState.currentTurnActionCount === 0 && cards[0].suit === '♣') {
            comboDamage *= 2;
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.BACKSTAB.replace('{msg}', '潜行突刺').replace('{dmg}', comboDamage), 'skill');
        }
        cards.forEach(card => comboSkills.add(card.suit));
        comboType = '连招';
        addLogEntry(CONFIG.UI_TEXT.LOGS.COMBO_INFO.replace('{type}', comboType).replace('{info}', `${cards.length}张${cards[0].rank}`), 'skill');

        // [NEW] 武僧：突破限制展示 (v2.10.4)
        if (player.charId === 'MONK' && comboDamage > 10) {
            const limit = player.level >= 3 ? 40 : (player.level >= 2 ? 20 : 15);
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.MONK.BRACING_PUNCH.replace('{limit}', limit), 'skill');
        }
    }

    // [NEW] 刺客【死亡标记】判定 (v2.11.0)
    if (gameState.currentBoss.isMarked) {
        comboSkills.add('♣');
        addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.DEATH_MARK, 'skill');
    }

    // [NEW] 赵云被动逻辑：花色转换详细日志 (v2.10.4)
    if (player.charId === 'ZHAO_YUN') {
        const tempSkills = new Set(comboSkills);
        tempSkills.forEach(suit => {
            if (player.level >= 1) {
                if (suit === '♠' && !comboSkills.has('♣')) {
                    comboSkills.add('♣');
                    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ZHAO_YUN.LONG_DAN_SWAP.replace('{from}', '黑桃').replace('{to}', '梅花').replace('{effect}', '伤害翻倍'), 'skill');
                } else if (suit === '♣' && !comboSkills.has('♠')) {
                    comboSkills.add('♠');
                    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ZHAO_YUN.LONG_DAN_SWAP.replace('{from}', '梅花').replace('{to}', '黑桃').replace('{effect}', '获得护盾'), 'skill');
                }
            }
            if (player.level >= 2) {
                if (suit === '♥' && !comboSkills.has('♦')) {
                    comboSkills.add('♦');
                    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ZHAO_YUN.LONG_DAN_SWAP.replace('{from}', '红桃').replace('{to}', '方片').replace('{effect}', '全队补给'), 'skill');
                } else if (suit === '♦' && !comboSkills.has('♥')) {
                    comboSkills.add('♥');
                    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ZHAO_YUN.LONG_DAN_SWAP.replace('{from}', '方片').replace('{to}', '红桃').replace('{effect}', '回复生命'), 'skill');
                }
            }
        });
    }

    let finalDamage = comboDamage;
    const skillEffects = [];

    comboSkills.forEach(suit => {
        // [MOD] 赵云 Lv3 无视免疫 (v2.9.4)
        const isZhaoYunLv3 = player.charId === 'ZHAO_YUN' && player.level >= 3;
        
        if (!isZhaoYunLv3 && gameState.currentBoss.currentBoss.suit === suit && !gameState.currentBoss.isSpecialDisabled) {
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_IMMUNE.replace('{suit}', suit), 'error');
            return;
        }

        if (isZhaoYunLv3 && gameState.currentBoss.currentBoss.suit === suit && !gameState.currentBoss.isSpecialDisabled) {
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ZHAO_YUN.LONG_DAN_IGNORE.replace('{suit}', suit), 'skill');
        }

        switch (suit) {
            case '♣':
                // [NEW] 神器 003：破甲箭 (v2.13.0)
                const critRatio = (player.artifacts && player.artifacts.some(a => a.id === '003')) ? 3 : 2;
                finalDamage *= critRatio;
                skillEffects.push(`暴击x${critRatio}`);
                playSound('crit');
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_CLUB, 'skill');
                break;
            case '♠':
                // [MOD] 赵云龙胆：♣ 视作 ♠ (v2.9.4)
                const isZhaoYunSpadeSwapped = player.charId === 'ZHAO_YUN' && player.level >= 1;
                const spadeCards = cards.filter(c => c.suit === '♠' || (isZhaoYunSpadeSwapped && c.suit === '♣'));
                
                spadeCards.forEach(card => {
                    card.playedValue = getEffectiveCardValue(card, player); // 记录打出时的加成值 (v2.13.0)
                    gameState.fieldCards.push(card);
                });
                const spadesPower = spadeCards.reduce((sum, c) => sum + getEffectiveCardValue(c, player), 0);
                skillEffects.push(`护盾+${spadesPower}`);
                if (spadesPower > 0) playSound('shield');
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_SPADE.replace('{val}', spadesPower), 'skill');
                break;
            case '♦':
                // [MOD] 方片序列化补给逻辑 (v2.8.0)
                const drawCount = comboDamage;
                let actualDrawsTotal = 0;
                let overflowCountTotal = 0;
                let cardsRemaining = drawCount;
                const playersCount = gameState.players.length;

                // [MOD] 方片补给：依次补满玩家手牌 (v2.13.2)
                for (let i = 0; i < playersCount; i++) {
                    const targetIdx = (gameState.currentPlayerIndex + i) % playersCount;
                    const targetPlayer = gameState.players[targetIdx];
                    
                    while (cardsRemaining > 0 && gameState.playerDeck.length > 0 && targetPlayer.hand.length < targetPlayer.maxHandSize) {
                        const drawnCard = gameState.playerDeck.pop();
                        targetPlayer.hand.push(drawnCard);
                        actualDrawsTotal++;
                        cardsRemaining--;
                    }
                    if (cardsRemaining <= 0 || gameState.playerDeck.length === 0) break;
                }

                // 处理盈余逻辑
                if (cardsRemaining > 0 && gameState.playerDeck.length > 0) {
                    while (cardsRemaining > 0 && gameState.playerDeck.length > 0) {
                        const overflowCard = gameState.playerDeck.pop();
                        const has007 = player.artifacts && player.artifacts.some(a => a.id === '007');
                        if ((gameState.character && gameState.character.overflowToDeck) || has007) {
                            gameState.playerDeck.unshift(overflowCard);
                        } else {
                            gameState.discardPile.push(overflowCard);
                        }
                        overflowCountTotal++;
                        cardsRemaining--;
                    }
                }

                skillEffects.push(`补给+${actualDrawsTotal}`);
                if (actualDrawsTotal > 0 || overflowCountTotal > 0) playSound('draw');
                let overflowMsg = overflowCountTotal > 0 ? `，${overflowCountTotal} 张因手牌满溢出` : '';
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILL_DIAMOND_TEAM.replace('{act}', actualDrawsTotal).replace('{overflow}', overflowMsg), 'skill');
                break;
            case '♥':
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

    // [NEW] 神器 001：战鼓 (v2.13.0)
    if (player.artifacts && player.artifacts.some(a => a.id === '001')) {
        finalDamage += 1;
    }

    gameState.currentBoss.currentHP -= finalDamage;
    addLogEntry(CONFIG.UI_TEXT.LOGS.BOSS_DAMAGED.replace('{val}', finalDamage), 'skill');
    showScreenDamageEffect(finalDamage, comboType);
    updateFieldCards();
    updateShieldEffect();

    updateUI();

    // [NEW] 赌徒：孤注一掷 (Draft v2.10.0)
    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    if (activePlayer.charId === 'GAMBLER') {
        const lastCard = cards[cards.length - 1]; // 以最后一张为判定参照
        addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.GAMBLER.PREPARE.replace('{card}', `${lastCard.suit}${lastCard.rank}`), 'normal');
        triggerGamblerSkills(activePlayer, lastCard, 'ALL_IN');
    }

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

        // [NEW] 刺客【连杀】奖励 (v2.11.0)
        if (player.charId === 'ASSASSIN' && player.level >= 2 && comboSkills.has('♣')) {
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.CHAIN_KILL, 'skill');
            // 从酒馆和墓地各摸
            let rewards = 0;
            if (gameState.discardPile.length > 0) {
                player.hand.push(gameState.discardPile.pop());
                rewards++;
            }
            if (gameState.playerDeck.length > 0 && rewards < 2) {
                player.hand.push(gameState.playerDeck.pop());
                rewards++;
            }
            if (rewards > 0) {
                addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.CHAIN_KILL_DONE.replace('{rewards}', rewards), 'skill');
                playSound('draw');
            }
        }

        setTimeout(() => {
            // [NEW] 掉落神器 (v2.13.0)
            dropArtifacts(gameState.currentBoss.currentBoss.rank);

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

            // [FIX] 必须在 updateUI 之前重置，否则 UI 会渲染旧次数 (v2.9.7)
            resetTurnSkills();
            gameState.currentBoss.isMarked = false; // [NEW] Boss 击败后清理标记 (v2.11.0)
            
            updateUI();
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];

            if (currentPlayer.isAI) {
                if (typeof triggerAITurn === 'function') {
                    setTimeout(() => triggerAITurn(), window.aiDelay || 1500);
                }
            } else {
                showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.NEW_BOSS_TOAST);
            }
        }, 1500);
    } else {
        // [MOD] 延时 1.5s 进入防御阶段，避免与伤害飘字叠加
        setTimeout(() => {
            handleBossCounterAttack();
        }, 1500);
    }
    
    gameState.currentTurnActionCount++; // [FIX] 流程自增放在结尾 (v2.11.1)
}

function getTotalShieldValue() {
    const rawShield = gameState.fieldCards.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);
    // [NEW] 神器 004：圣盾 (v2.13.0) 
    // 文档：单人模式下护盾效果1.5倍(向下取整)；多人模式下已实装全局护盾，004不作额外提升。
    if (gameState.players.length === 1) {
        const has004 = gameState.players[0].artifacts && gameState.players[0].artifacts.some(a => a.id === '004');
        if (has004) {
            return Math.floor(rawShield * 1.5);
        }
    }
    return rawShield;
}

function nextBoss() {
    if (gameState.bossDeck.length === 0) return false;
    // 重置场上卡牌的打出状态 (防止回收后加成残留)
    gameState.fieldCards.forEach(c => delete c.playedValue);
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
        addLogEntry(`✨ 战斗重燃！玩家技能次数已恢复`, 'skill');
    }
    // AI队友技能重置
    if (gameState.players) {
        gameState.players.filter(p => p.isAI).forEach(ai => {
            if (ai.skillResetType === 'BOSS') {
                ai.chargesLeft = ai.maxCharges;
            }
        });
    }

    // [NEW] 针对已有神器 006 (魔法背包) 的手牌上限修正 (v2.13.0)
    gameState.players.forEach(p => {
        const has006 = p.artifacts && p.artifacts.some(a => a.id === '006');
        const baseLimit = CONFIG.HAND_LIMIT[gameState.players.length] || 5;
        const gamblerBonus = (p.charId === 'GAMBLER' ? 2 : 0);
        p.maxHandSize = baseLimit + gamblerBonus + (has006 ? 2 : 0);
    });

    // [NEW] 动态设置 Boss 左上角水印 (v2.4.4)
    const suitNameMapEng = { '♣': 'club', '♠': 'spade', '♦': 'diamond', '♥': 'heart' };
    const suitEng = suitNameMapEng[newBossCard.suit];
    const bossImgSrc = `assets/bosses/boss_${suitEng}_${newBossCard.rank.toLowerCase()}.png`;
    const centerStage = document.querySelector('.center-stage');
    if (centerStage) {
        centerStage.style.setProperty('--boss-watermark', `url('${bossImgSrc}')`);
    }

    addLogEntry(CONFIG.UI_TEXT.LOGS.BOSS_APPEAR.replace('{suit}', newBossCard.suit).replace('{rank}', newBossCard.rank), 'skill');
    return true;
}

/**
 * [NEW] 神器掉落逻辑 (v2.13.0)
 * 根据 Boss 等级掉落数量不同：J=1, Q=2, K=3
 * 008 神器持有者额外 +1
 */
function dropArtifacts(bossRank) {
    const baseCount = bossRank === 'J' ? 1 : (bossRank === 'Q' ? 2 : 3);
    const defeater = gameState.players[gameState.currentPlayerIndex];
    if (!defeater) return;
    
    const has008 = defeater.artifacts && defeater.artifacts.some(a => a.id === '008');
    const totalCount = baseCount + (has008 ? 1 : 0);

    for (let i = 0; i < totalCount; i++) {
        // 分配机制：击败者优先，剩余按行动顺序（players 数组顺序循环）
        const targetIdx = (gameState.currentPlayerIndex + i) % gameState.players.length;
        const targetPlayer = gameState.players[targetIdx];

        // 随机抽取一个神器（加权随机）
        const newArtifact = getRandomArtifact();
        if (newArtifact) {
            if (!targetPlayer.artifacts) targetPlayer.artifacts = [];
            targetPlayer.artifacts.push({ ...newArtifact }); // 拷贝一份
            
            // 立即生效部分属性
            if (newArtifact.id === '006') {
                targetPlayer.maxHandSize += 2;
                drawCards(targetPlayer, 2);
            }

            addLogEntry(CONFIG.UI_TEXT.NOTIFICATIONS.ARTIFACT_CLAIM.replace('{player}', targetPlayer.name).replace('{name}', newArtifact.name), 'skill');
            showToastMessage(`✨ 获得神器：${newArtifact.name}！`, 3000);
        }
    }
}

function getRandomArtifact() {
    const pool = Object.values(CONFIG.ARTIFACTS);
    const totalWeight = Object.values(CONFIG.ARTIFACT_QUALITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    
    let targetQuality = 'B';
    for (const [q, w] of Object.entries(CONFIG.ARTIFACT_QUALITY_WEIGHTS)) {
        if (rand < w) {
            targetQuality = q;
            break;
        }
        rand -= w;
    }

    const filtered = pool.filter(a => a.quality === targetQuality);
    if (filtered.length === 0) return pool[Math.floor(Math.random() * pool.length)];
    return filtered[Math.floor(Math.random() * filtered.length)];
}

function confirmDefense() {
    selectedCardsForCombo = [];
    document.querySelectorAll('.card').forEach(cardEl => cardEl.classList.remove('selected'));

    const totalValue = selectedCardsForDefense.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);
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
            delete selectedCard.playedValue; // 确保弃牌时清除状态
            player.hand.splice(index, 1);
            gameState.discardPile.push(selectedCard);
        }
    });

    elements.defensePanel.style.display = 'none';
    elements.actionButtons.style.display = 'flex';
    
    // [MOD] 回合流转逻辑 (v2.8.0)
    // 只有在主动“放弃出牌”导致的防御结算后，才流转到下一个玩家
    if (gameState.isYielding) {
        gameState.isYielding = false;
        passTurn();
    } else {
        // 攻击后的正常反击防御，防御成功后依然是当前玩家的回合
        gameState.phase = 'TURN_START';
        updateUI();
    }

    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.DEFENSE_SUCCESS);
    addLogEntry(CONFIG.UI_TEXT.LOGS.DEFENSE_SUCCESS, 'skill');
    selectedCardsForDefense = [];
}

function skipTurn() {
    selectedCardsForCombo = [];
    gameState.currentTurnActionCount++; // 行为计数自增
    const player = gameState.players[gameState.currentPlayerIndex];
    
    // [MOD] 防御豁免逻辑 (v2.9.0)
    // 首回合行动（不论是出牌还是放弃）必须承受 Boss 反击
    // 如果是该回合内的后续行动（即已经完成过一次攻防），则豁免反击
    if (gameState.currentTurnActionCount === 1) {
        gameState.isYielding = true;
        addLogEntry(`玩家 ${player.name} 执行“放弃出牌”，必须承受当前 Boss 攻击`, 'defense');
        handleBossCounterAttack();
    } else {
        addLogEntry(`玩家 ${player.name} 在完成攻防后选择结束行动，触发【防御豁免】`, 'skill');
        gameState.isYielding = false; // 豁免模式下不需要标记 yielding，因为不进入防御面板
        passTurn();
    }
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
    gameState.currentTurnActionCount = 0; // 重置行为计数

    // [MOD] 重构为通用重置方法 (v2.9.6)
    if (gameState.currentPlayerIndex === 0) {
        resetTurnSkills();
    }

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
function resetTurnSkills() {
    // 重置人类玩家技能
    if (gameState.character && gameState.character.skillResetType === 'TURN') {
        const charData = CONFIG.CHARACTERS[gameState.character.id];
        gameState.character.chargesLeft = charData.skills.charges(gameState.character.level);
    }
    // 重置当前 AI 玩家技能（如果后续 AI 也能用主动技）
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer && currentPlayer.isAI && currentPlayer.skillResetType === 'TURN') {
        const aiCharData = CONFIG.CHARACTERS[currentPlayer.charId];
        currentPlayer.chargesLeft = aiCharData.skills.charges(currentPlayer.level || 1);
    }
}

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
            <span class="cfg-label" style="font-size:12px; margin-right:5px;">AI-${i}:</span>
            <select class="styled-select" id="aiCharacter_${i}" style="width:105px; padding:4px;">
                ${CHAR_IDS.map(id => `<option value="${id}">${CONFIG.CHARACTERS[id].name}</option>`).join('')}
            </select>
            <select class="styled-select" id="aiStrategy_${i}" style="width:85px; padding:4px; margin-left:5px;">
                <option value="balanced">平衡</option>
                <option value="defensive">稳健</option>
                <option value="aggressive">激进</option>
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
        const charId = document.getElementById(`aiCharacter_${i}`).value;
        selectedAIs.push({
            id: `AI_${i}`,
            name: `AI-${i}`,
            strategy: strategy,
            charId: charId,
            isAI: true
        });
    }
}

function showCharSelection(charId) {
    const charData = CONFIG.CHARACTERS[charId];
    const stats = ProgressionTracker.getCharStats(charId);
    const lv = ProgressionTracker.calculateLevel(stats.exp);

    elements.charSelection.style.display = 'flex';
    elements.charName.textContent = charData.name;
    elements.charBio.textContent = charData.bio;
    elements.charLevel.textContent = lv;

    // 更新详细统计信息 (v2.12.0)
    const winsLabel = document.querySelector('.win-progression .label');
    if (winsLabel) {
        winsLabel.textContent = `等级能力 (当前 EXP: ${stats.exp})`;
        winsLabel.style.color = 'var(--gold)';
    }
    const winVal = document.getElementById('charWins');
    if (winVal) {
        winVal.innerHTML = `
            <div style="font-size: 0.85em; opacity: 0.9; line-height: 1.4; color: #fff;">
                <span style="color:var(--gold)">实战:</span> ${stats.games} 场 | 
                <span style="color:var(--gold)">胜场:</span> ${stats.wins} | 
                <span style="color:var(--gold)">胜率:</span> ${stats.games > 0 ? ((stats.wins/stats.games)*100).toFixed(1) : 0}%
            </div>
        `;
    }

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

            // [NEW] 渲染玩家神器 (v2.13.0)
            const player = gameState.players[0];
            const playerArtifactsEl = document.getElementById('playerArtifacts');
            if (playerArtifactsEl) {
                playerArtifactsEl.innerHTML = '';
                if (player.artifacts) {
                    player.artifacts.forEach(art => {
                        const icon = createArtifactElement(art);
                        playerArtifactsEl.appendChild(icon);
                    });
                }
            }

            // 角色大立绘：作为战场护盾区右下角水印
            const battleLine = document.querySelector('.battle-line');
            if (battleLine) {
                battleLine.style.setProperty('--watermark-img', `url('${charData.portrait}')`);
            }

            if (elements.jokerBtn) {
                // 更新图标与技能名
                const iconSpan = elements.jokerBtn.querySelector('.icon');
                if (iconSpan) iconSpan.textContent = charData.skills.icon;

                if (elements.jokerSkillName) {
                    if (gameState.character.id === 'BARD') {
                        elements.jokerSkillName.textContent = '万能之手';
                        if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.chargesLeft;
                        elements.jokerBtn.disabled = gameState.character.chargesLeft <= 0 || gameState.phase !== 'TURN_START';
                    } else if (gameState.character.id === 'ALCHEMIST') {
                        // 炼金术士动态显示：选了牌显示“交换”，没选牌且 Lv3 显示“阵”
                        if (selectedCardsForCombo.length > 0) {
                            elements.jokerSkillName.textContent = '等价交换';
                            if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.chargesLeft;
                            elements.jokerBtn.disabled = gameState.character.chargesLeft <= 0 || gameState.phase !== 'TURN_START';
                        } else if (gameState.character.level >= 3) {
                            elements.jokerSkillName.textContent = '大炼成阵';
                            if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.ultCharges;
                            elements.jokerBtn.disabled = gameState.character.ultCharges <= 0 || gameState.phase !== 'TURN_START';
                        } else {
                            elements.jokerSkillName.textContent = '等价交换';
                            if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.chargesLeft;
                            elements.jokerBtn.disabled = true; // 没选牌时等价交换不可点
                        }
                    } else if (gameState.character.id === 'CHOSEN_ONE') {
                        elements.jokerSkillName.textContent = '使用 Joker';
                        if (elements.jokerCountText) elements.jokerCountText.textContent = gameState.character.chargesLeft;
                        elements.jokerBtn.disabled = gameState.character.chargesLeft <= 0 || gameState.phase !== 'TURN_START';
                    } else if (gameState.character.id === 'ZHAO_YUN') {
                        elements.jokerSkillName.textContent = '龙胆 (被动)';
                        if (elements.jokerCountText) elements.jokerCountText.textContent = '-';
                        elements.jokerBtn.disabled = true;
                    } else if (gameState.character.id === 'MONK') {
                        elements.jokerSkillName.textContent = '震慑拳 (被动)';
                        if (elements.jokerCountText) elements.jokerCountText.textContent = '-';
                        elements.jokerBtn.disabled = true;
                    } else if (gameState.character.id === 'GAMBLER') {
                        elements.jokerSkillName.textContent = '无限绿波 (被动)';
                        if (elements.jokerCountText) elements.jokerCountText.textContent = '-';
                        elements.jokerBtn.disabled = true;
                    } else if (gameState.character.id === 'ASSASSIN') {
                        elements.jokerSkillName.textContent = '死亡标记';
                    }
                }
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
    if (winsLabelEl) winsLabelEl.textContent = t.MENU.CHAR_EXP_LABEL;

    // Buttons
    if (elements.playCardBtn) elements.playCardBtn.textContent = t.BUTTONS.PLAY;
    if (elements.skipTurnBtn) elements.skipTurnBtn.textContent = t.BUTTONS.SKIP;
    if (elements.confirmDefenseBtn) elements.confirmDefenseBtn.textContent = t.BUTTONS.CONFIRM_DEFENSE;
    if (elements.restartGameBtn) elements.restartGameBtn.textContent = t.BUTTONS.RESTART;
    
    const confirmCharBtnText = document.querySelector('#confirmCharBtn .btn-text');
    if (confirmCharBtnText) confirmCharBtnText.textContent = t.BUTTONS.CONFIRM_CHAR;
    else if (elements.confirmCharBtn) elements.confirmCharBtn.textContent = t.BUTTONS.CONFIRM_CHAR;


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
            <div class="tm-artifacts">
                ${(ai.artifacts || []).map(art => `
                    <div class="artifact-icon quality-${art.quality}" data-desc="${art.name}: ${art.desc}" onclick="showArtifactPopupByID('${art.id}')">${art.icon}</div>
                `).join('')}
            </div>
        `;
        elements.teammatesZone.appendChild(box);
    });
}

function createArtifactElement(artifact) {
    const el = document.createElement('div');
    el.className = `artifact-icon quality-${artifact.quality}`;
    el.dataset.desc = `${artifact.name}: ${artifact.desc}`;
    el.textContent = artifact.icon; // 使用配置的图标 (v2.13.3)
    el.onclick = (e) => {
        e.stopPropagation();
        showArtifactPopup(artifact);
    };
    return el;
}

function showArtifactPopupByID(artId) {
    const art = CONFIG.ARTIFACTS[artId];
    if (art) showArtifactPopup(art);
}

function showArtifactPopup(art) {
    const existing = document.querySelector('.artifact-modal');
    if (existing) existing.remove();

    const qualityNames = { 'S': '传说 / LEGENDARY', 'A': '史诗 / EPIC', 'B': '稀有 / RARE' };
    const modal = document.createElement('div');
    modal.className = 'artifact-modal';
    modal.innerHTML = `
        <div class="modal-content quality-${art.quality}">
            <button class="close-btn">←</button> <!-- 返回按钮在左上角 -->
            <div class="modal-header">
                <div class="art-icon-large">${art.icon}</div>
                <div class="header-text">
                    <div class="art-quality-label">${qualityNames[art.quality]}</div>
                    <h3>${art.name}</h3>
                </div>
            </div>
            <div class="modal-body">
                <p class="art-desc">${art.desc}</p>
                <div class="art-type">TYPE: ${art.type}</div>
            </div>
            <div class="modal-decoration">ARTIFACT RECORD</div>
        </div>
    `;
    modal.onclick = (e) => {
        if (e.target === modal || e.target.classList.contains('close-btn')) {
            modal.remove();
        }
    };
    document.body.appendChild(modal);
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
    const maxPossibleDefense = player.hand.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);

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
    const totalValue = selectedCardsForDefense.reduce((sum, card) => sum + getEffectiveCardValue(card), 0);
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
    } else if (gameState.character.id === 'ALCHEMIST') {
        executeAlchemistSkill();
    } else if (gameState.character.id === 'ASSASSIN') {
        executeAssassinSkill();
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

function executeAlchemistSkill() {
    const player = gameState.players[0]; // 玩家
    if (selectedCardsForCombo.length > 0) {
        if (gameState.character.chargesLeft <= 0) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.EXCHANGE_USED);
            return;
        }
        if (selectedCardsForCombo.length !== 1) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.EXCHANGE_SELECT);
            return;
        }
        const result = performEquivalentExchange(player, selectedCardsForCombo[0]);
        if (result) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.EXCHANGE_DONE);
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ALCHEMIST.EXCHANGE.replace('{hand}', `${result.handCard.suit}${result.handCard.rank}`).replace('{grave}', `${result.graveCard.suit}${result.graveCard.rank}`), 'skill');
            playSound('draw');
        }
        selectedCardsForCombo = [];
    } else {
        if (gameState.character.level < 3) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.EXCHANGE_PROMPT);
            return;
        }
        if (gameState.character.ultCharges <= 0) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.ULT_LIMIT);
            return;
        }
        performGrandTransmutation(player);
        gameState.character.ultCharges--;
    }
}

function executeAssassinSkill() {
    if (gameState.character.chargesLeft <= 0) {
        showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ASSASSIN.MARK_USED);
        return;
    }
    gameState.currentBoss.isMarked = true;
    gameState.character.chargesLeft--;
    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.DEATH_MARK_ACTIVE.replace('{name}', '玩家'), 'skill');
    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ASSASSIN.MARK_DONE);
    playSound('purify'); // 锁定音效
    updateUI();
}

function executeAssassinSkillForAI(aiPlayer) {
    if (aiPlayer.chargesLeft <= 0) return false;
    
    // 决策：如果当前 Boss 没被标记，且手牌中有较多非♣牌，则开启标记提升斩杀线
    if (!gameState.currentBoss.isMarked) {
        const nonClubs = aiPlayer.hand.filter(c => c.suit !== '♣').length;
        if (nonClubs >= 2) {
            // 直接操作 AI 玩家状态，不借用人类玩家的 executeAssassinSkill
            gameState.currentBoss.isMarked = true;
            aiPlayer.chargesLeft--;
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ASSASSIN.DEATH_MARK_ACTIVE.replace('{name}', aiPlayer.name), 'skill');
            updateUI();
            return true;
        }
    }
    return false;
}

function performEquivalentExchange(player, handCard) {
    if (gameState.discardPile.length === 0) return null;
    const graveCard = gameState.discardPile.pop();
    const handIdx = player.hand.findIndex(c => c.id === handCard.id);
    if (handIdx !== -1) {
        player.hand[handIdx] = graveCard;
        gameState.discardPile.push(handCard);
        if (player.level >= 2 && handCard.suit === graveCard.suit) {
            drawCards(player, 1);
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ALCHEMIST.SAGE_STONE, 'skill');
        }
        player.chargesLeft--;
        updateUI();
        return { handCard, graveCard };
    }
    return null;
}

function performGrandTransmutation(player) {
    gameState.playerDeck.push(...player.hand);
    gameState.playerDeck.push(...gameState.discardPile);
    player.hand = [];
    gameState.discardPile = [];
    gameState.playerDeck = shuffleArray(gameState.playerDeck);
    drawCards(player, player.maxHandSize);
    
    addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.ALCHEMIST.ULT, 'skill');
    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.SKILL_ALCHEMIST.ULT_DONE);
    playSound('revive');
    updateUI();
}

function executeAlchemistSkillForAI(aiPlayer) {
    // 1. 大炼成阵逻辑 (绝境重洗)
    if (aiPlayer.level >= 3 && aiPlayer.ultCharges > 0 && aiPlayer.hand.length <= 2) {
        performGrandTransmutation(aiPlayer);
        aiPlayer.ultCharges--;
        return true;
    }

    // 2. 等价交换逻辑 (找回墓地高分牌)
    if (aiPlayer.chargesLeft > 0 && gameState.discardPile.length > 0) {
        const topGrave = gameState.discardPile[gameState.discardPile.length - 1];
        if (topGrave.value >= 8) { // 墓地牌面值通常固定，但这里保持一致
            const trashCard = [...aiPlayer.hand].sort((a,b) => getEffectiveCardValue(a) - getEffectiveCardValue(b))[0];
            if (trashCard && getEffectiveCardValue(trashCard) < 5) {
                return performEquivalentExchange(aiPlayer, trashCard) !== null;
            }
        }
    }
    return false;
}

function executeChosenOneSkillForPlayer(player) {
    gameState.currentBoss.isSpecialDisabled = true;
    gameState.discardPile.push(...player.hand);
    player.hand = [];

    // 从墓地和酒馆各抽，上限受玩家最大手牌数限制
    let drawn = 0;
    while (drawn < player.maxHandSize && gameState.discardPile.length > 0) {
        player.hand.push(gameState.discardPile.pop());
        drawn++;
    }
    while (drawn < player.maxHandSize && gameState.playerDeck.length > 0) {
        player.hand.push(gameState.playerDeck.pop());
        drawn++;
    }

    if (player.chargesLeft !== undefined) player.chargesLeft--;
    else if (gameState.character && player === gameState.players[0]) gameState.character.chargesLeft--;

    addLogEntry(CONFIG.UI_TEXT.LOGS.USE_JOKER, 'skill');
    showToastMessage(CONFIG.UI_TEXT.LOGS.USE_JOKER);
    playSound('purify');
    updateUI();
}

/**
 * 🎲 赌徒核心逻辑：孤注一掷与无限绿波 (v2.10.2)
 * @param {Object} player 触发玩家
 * @param {Object} baseCard 判定参照卡
 * @param {String} type 触发类型：'ALL_IN' (出牌) 或 'GREEN_WAVE' (获得牌)
 */
function triggerGamblerSkills(player, baseCard, type) {
    if (!player || player.charId !== 'GAMBLER' || !baseCard) return;
    const lv = player.level || 1;
    const logTag = type === 'ALL_IN' ? '【孤注一掷】' : '【无限绿波】';
    
    if (gameState.playerDeck.length === 0) {
        addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.GAMBLER.EMPTY, 'normal');
        return;
    }

    let isChaining = true;
    while (isChaining && gameState.playerDeck.length > 0) {
        const nextCard = gameState.playerDeck[gameState.playerDeck.length - 1]; // 查看预览
        
        const suitMatch = (nextCard.suit === baseCard.suit);
        const rankMatch = (nextCard.rank === baseCard.rank);
        let matched = suitMatch || (lv >= 3 && rankMatch);

        const compareDesc = `判定基准(${baseCard.suit}${baseCard.rank}) vs 牌库顶(${nextCard.suit}${nextCard.rank})`;
        
        if (matched) {
            const drawn = gameState.playerDeck.pop();
            player.hand.push(drawn);
            
            const reason = suitMatch ? '花色相同' : '点数相同';
            const logMsg = type === 'ALL_IN' ? CONFIG.UI_TEXT.LOGS.SKILLS.GAMBLER.SUCCESS : CONFIG.UI_TEXT.LOGS.SKILLS.GAMBLER.GREEN_WAVE;
            addLogEntry(logMsg.replace('{card}', `${drawn.suit}${drawn.rank}`), 'skill');
            playSound('purify'); // 叮的一声感悟命运
            
            // LV1 只能触发一次，LV2+ 可递归（无限绿波）
            if (lv < 2 || type === 'ALL_IN') {
                // 如果是 ALL_IN 类型且 LV2+，后续获得的这枚新牌会触发 GREEN_WAVE 逻辑
                if (lv >= 2) {
                    // 交给下一轮 logic
                    isChaining = false;
                    setTimeout(() => triggerGamblerSkills(player, drawn, 'GREEN_WAVE'), 300);
                } else {
                    isChaining = false;
                }
            } else {
                // 无限绿波：以新出的牌为基准继续赌
                baseCard = drawn;
            }
        } else {
            addLogEntry(CONFIG.UI_TEXT.LOGS.SKILLS.GAMBLER.FAIL, 'normal');
            isChaining = false;
        }
    }
    updateUI();
}

function executeBardSkillForAI(player) {
    const immuneSuit = gameState.currentBoss.isSpecialDisabled ? null : gameState.currentBoss.currentBoss.suit;
    const sorted = [...player.hand].sort((a,b) => getEffectiveCardValue(a) - getEffectiveCardValue(b));
    const toDiscard = [];
    sorted.forEach(c => {
        if (c.rank !== 'A' && c.suit !== '♠') {
            if (toDiscard.length < Math.floor(player.maxHandSize / 2)) toDiscard.push(c);
        }
    });

    if (toDiscard.length === 0) return false;

    const discardCount = toDiscard.length;
    toDiscard.forEach(card => {
        const idx = player.hand.findIndex(c => c.id === card.id);
        if (idx !== -1) player.hand.splice(idx, 1);
        gameState.discardPile.push(card);
    });

    const oldIds = player.hand.map(c => c.id);
    drawCards(player, discardCount);
    const newCards = player.hand.filter(c => !oldIds.includes(c.id));

    player.chargesLeft--;
    addLogEntry(`🎶 [${player.name}] 发动【万能之手】洗了 ${discardCount} 张牌`, 'skill');
    showToastMessage(`🎶 [${player.name}] 使用了万能之手！`);
    playSound('draw');
    updateUI();
    return true;
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
        const newCard = gameState.playerDeck.pop();
        player.hand.push(newCard);
        drawn++;

        // [NEW] 赌徒：无限绿波 (Draft v2.10.0)
        if (player.charId === 'GAMBLER' && player.level >= 2) {
            // 这里我们用 setTimeout 稍微错开，避免递归深度过大或 UI 瞬间爆炸
            setTimeout(() => triggerGamblerSkills(player, newCard, 'GREEN_WAVE'), 100);
        }
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
    if (!isWin) {
        const player = gameState.players[gameState.currentPlayerIndex];
        const art005Index = player.artifacts ? player.artifacts.findIndex(a => a.id === '005') : -1;

        if (art005Index !== -1) {
            if (gameState.players.length === 1) {
                // 单人模式：满血复活
                if (!gameState.resurrectUsed) {
                    gameState.resurrectUsed = true;
                    gameState.phase = 'TURN_START';
                    player.hand.forEach(c => delete c.playedValue);
                    gameState.discardPile.push(...player.hand);
                    player.hand = [];

                    drawCards(player, player.maxHandSize);
                    showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.RESURRECT_TOAST, 4000);
                    addLogEntry('✨ 【复活十字架】生效，继续战斗！', 'skill');
                    playSound('revive');
                    updateUI();
                    return;
                }
            } else {
                // 多人模式：持有者死亡，顺移给下一位玩家，游戏继续
                addLogEntry(`💀 ${player.name} 阵亡！【复活十字架】保佑了团队，游戏继续！`, 'error');
                showToastMessage(`💀 ${player.name} 阵亡！【复活十字架】顺移。`, 4000);

                const artifact005 = player.artifacts.splice(art005Index, 1)[0];

                // 弃置手中牌
                player.hand.forEach(c => delete c.playedValue);
                gameState.discardPile.push(...player.hand);

                // 将玩家移出队列
                gameState.players.splice(gameState.currentPlayerIndex, 1);

                if (gameState.players.length === 0) {
                    // 全灭
                    showGameOverReal(isWin, message);
                    return;
                }

                if (gameState.currentPlayerIndex >= gameState.players.length) {
                    gameState.currentPlayerIndex = 0;
                }

                const nextPlayer = gameState.players[gameState.currentPlayerIndex];
                if (!nextPlayer.artifacts) nextPlayer.artifacts = [];
                nextPlayer.artifacts.push(artifact005);
                addLogEntry(`🎁 【复活十字架】已顺移至 ${nextPlayer.name}`, 'skill');

                gameState.phase = 'TURN_START';
                updateUI();
                
                if (nextPlayer.isAI && typeof triggerAITurn === 'function') {
                    setTimeout(() => triggerAITurn(), window.aiDelay || 1500);
                }
                return;
            }
        }
    }

    showGameOverReal(isWin, message);
}

function showGameOverReal(isWin, message) {

    gameState.phase = 'GAME_OVER';
    elements.gameOverTitle.textContent = isWin ? '🎉 胜利！' : CONFIG.UI_TEXT.NOTIFICATIONS.DEFEAT;
    elements.gameOverMessage.textContent = message;
    elements.gameOverModal.style.display = 'flex';
    elements.restartGameBtn.textContent = isWin ? '下一场对局' : '返回主菜单';
    stopBgm();

    if (isWin) {
        // 记录结果 (v2.12.0：通过记录结果自动增减 EXP 并返回最新状态)
        const stats = ProgressionTracker.saveResult(gameState.character.id, true);
        const newLv = ProgressionTracker.calculateLevel(stats.exp);
        if (newLv > gameState.character.level) {
            showToastMessage(CONFIG.UI_TEXT.NOTIFICATIONS.CHAR_UPGRADE.replace('{lv}', newLv));
        }
    } else {
        // 虽败犹荣：给予 1 EXP
        ProgressionTracker.saveResult(gameState.character.id, false);
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

    function getCardCost(card) {
        let cost = card.value * 10; // 基础成本：每点点数10成本
        if (card.suit === immuneSuit) cost = card.value; // 免疫牌弃掉最划算
        if (card.rank === 'A') cost += 500; // 尽量保留A
        if (card.suit === '♠' && immuneSuit !== '♠') cost += 200; // 尽量保留护盾牌
        if (strategy === 'defensive' && card.suit === '♥' && immuneSuit !== '♥') cost += 150; // 稳健型倾向保留红桃
        return cost;
    }

    let bestCombo = null;
    let bestCost = Infinity;
    let maxDefensePossible = 0;
    
    const n = hand.length;
    const totalCombos = 1 << n;
    
    // 遍历所有可能的子集组合（$2^n$，由于手牌最多8张，256次循环极快）
    for (let mask = 1; mask < totalCombos; mask++) {
        let currentSum = 0;
        let comboCost = 0;
        let currentCombo = [];
        
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                currentCombo.push(hand[i]);
                currentSum += hand[i].value;
                comboCost += getCardCost(hand[i]);
            }
        }
        
        if (currentSum > maxDefensePossible) {
            maxDefensePossible = currentSum;
        }

        if (currentSum >= requiredValue) {
            // 对点数溢出和消耗牌数给予轻微惩罚，偏好恰好抵挡且出牌少的组合
            let waste = currentSum - requiredValue;
            let finalCost = comboCost + waste * 5 + currentCombo.length * 5;

            if (finalCost < bestCost) {
                bestCost = finalCost;
                bestCombo = { selectedCards: currentCombo, totalValue: currentSum };
            }
        }
    }

    // 如果无论如何都防御不住，回退返回所有手牌尽力防御（游戏计算时会触发防守失败）
    if (!bestCombo) {
        return { selectedCards: [...hand], totalValue: maxDefensePossible };
    }

    return bestCombo;
}

function handleAIOffense(aiPlayer) {
    // 智能检测是否使用角色技能
    if (aiPlayer.chargesLeft > 0) {
        let skillUsed = false;
        if (aiPlayer.charId === 'CHOSEN_ONE') {
            const handValue = aiPlayer.hand.reduce((s,c) => s+c.value, 0);
            // 只有情况不妙时，或者手里全空时发动 Joker
            if (aiPlayer.hand.length <= 2 || (!gameState.currentBoss.isSpecialDisabled && handValue <= gameState.currentBoss.currentATK)) {
                executeChosenOneSkillForPlayer(aiPlayer);
                skillUsed = true;
            }
        } else if (aiPlayer.charId === 'BARD') {
            skillUsed = executeBardSkillForAI(aiPlayer);
        } else if (aiPlayer.charId === 'ALCHEMIST') {
            skillUsed = executeAlchemistSkillForAI(aiPlayer);
        } else if (aiPlayer.charId === 'ASSASSIN') {
            skillUsed = executeAssassinSkillForAI(aiPlayer);
        }
        // GAMBLER / MONK / ZHAO_YUN: 纯被动角色，无主动技能，无需处理

        if (skillUsed) {
            // 使用技能后暂停一会重新评估局面（再走一次 AIOffense）
            setTimeout(() => handleAIOffense(aiPlayer), window.aiDelay || 1500);
            return;
        }
    }

    const { selectedCards } = calculateAIOffense(aiPlayer.hand, gameState.currentBoss, aiPlayer.strategy, aiPlayer);

    if (!selectedCards || selectedCards.length === 0) {
        skipTurn();
    } else {
        // ★ 生存性校验：出牌后能否抗住 Boss 反击？
        if (!canSurviveAfterPlaying(aiPlayer, selectedCards)) {
            addLogEntry(`[AI] ${aiPlayer.name} 评估后放弃出牌：剩余手牌无法抗住 Boss 反击，保存实力`, 'defense');
            skipTurn();
            return;
        }
        executeCombo(selectedCards);
        updateUI();
    }
}

/**
 * AI 生存性校验：出牌后剩余手牌能否抵挡 Boss 反击
 * 如果能击杀 Boss（伤害 >= BossHP），则无需防御，直接通过
 */
function canSurviveAfterPlaying(aiPlayer, selectedCards) {
    const immuneSuit = gameState.currentBoss.isSpecialDisabled ? null : gameState.currentBoss.currentBoss.suit;
    const bossATK = gameState.currentBoss.currentATK;
    const bossHP = gameState.currentBoss.currentHP;

    // 计算这次出牌能造成的伤害（粗略估算，不考虑角色被动技能）
    let dmg = selectedCards.reduce((s, c) => s + c.value, 0);
    const hasClub = selectedCards.some(c => c.suit === '♣');
    if (hasClub && immuneSuit !== '♣') dmg *= 2;

    // 如果能击杀 Boss，不需要防御，直接放行
    if (dmg >= bossHP) return true;

    // 计算出牌后的有效 Boss 攻击力
    let effectiveATK = bossATK;
    // 已有护盾减免
    const currentShield = getTotalShieldValue();
    // 新出的黑桃牌也会加护盾（如果不免疫）
    let newShield = 0;
    if (immuneSuit !== '♠') {
        newShield = selectedCards.filter(c => c.suit === '♠').reduce((s, c) => s + c.value, 0);
    }
    effectiveATK = Math.max(0, effectiveATK - currentShield - newShield);

    // 如果 Boss 攻击被护盾完全抵消，无需防御
    if (effectiveATK <= 0) return true;

    // 计算出牌后剩余手牌总点数
    const playedIds = new Set(selectedCards.map(c => c.id));
    const remainingHand = aiPlayer.hand.filter(c => !playedIds.has(c.id));
    const remainingValue = remainingHand.reduce((s, c) => s + c.value, 0);

    return remainingValue >= effectiveATK;
}

function calculateAIOffense(hand, currentBoss, strategy, aiPlayer) {
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
        // [MOD] AI 赵云花色评估 (v2.9.12)
        let evaluationSuit = suit;
        if (aiPlayer.charId === 'ZHAO_YUN') {
            if (suit === '♣' && aiPlayer.level >= 1) evaluationSuit = '♠'; // 想要草花？黑桃也行
            if (suit === '♠' && aiPlayer.level >= 1) evaluationSuit = '♣'; // 想要黑桃？草花也行
            if (suit === '♦' && aiPlayer.level >= 2) evaluationSuit = '♥';
            if (suit === '♥' && aiPlayer.level >= 2) evaluationSuit = '♦';
        }
        
        const combo = findBestComboBySuit(aiPlayer.hand, suit, immuneSuit, aiPlayer);
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
function findBestComboBySuit(hand, preferredSuit, immuneSuit, aiPlayer) {
    if (preferredSuit === immuneSuit) return null;

    const allLegalCombos = getAllLegalCombos(hand, aiPlayer);
    const suitCombos = allLegalCombos.filter(combo => {
        // [MOD] 支持武僧/赵云的花色判定
        return combo.some(c => {
            if (c.suit === preferredSuit) return true;
            if (aiPlayer && aiPlayer.charId === 'ZHAO_YUN') {
                if (preferredSuit === '♣' && c.suit === '♠' && aiPlayer.level >= 1) return true;
                if (preferredSuit === '♠' && c.suit === '♣' && aiPlayer.level >= 1) return true;
                if (preferredSuit === '♦' && c.suit === '♥' && aiPlayer.level >= 2) return true;
                if (preferredSuit === '♥' && c.suit === '♦' && aiPlayer.level >= 2) return true;
            }
            return false;
        });
    });

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
function getAllLegalCombos(hand, aiPlayer) {
    const combos = [];
    
    // [MOD] 动态连招上限 (v2.9.12)
    let comboLimit = 10;
    if (aiPlayer && aiPlayer.charId === 'MONK') {
        const lv = aiPlayer.level || 1;
        if (lv >= 3) comboLimit = 40;
        else if (lv >= 2) comboLimit = 20;
        else comboLimit = 15;
    }

    // 1. 单卡
    hand.forEach(c => combos.push([c]));

    // 2. 宠物 (Ace + Card)
    const aces = hand.filter(c => c.rank === 'A');
    const others = hand.filter(c => c.rank !== 'A');
    aces.forEach(a => {
        others.forEach(o => combos.push([a, o]));
    });

    // 3. 同点数组合 (Sum <= limit)
    const byRank = {};
    hand.forEach(c => {
        if (c.rank === 'A') return; // A 不进点数组合
        if (!byRank[c.rank]) byRank[c.rank] = [];
        byRank[c.rank].push(c);
    });

    for (const rank in byRank) {
        const cards = byRank[rank];
        const val = cards[0].value;
        if (cards.length >= 2 && val * 2 <= comboLimit) combos.push([cards[0], cards[1]]);
        if (cards.length >= 3 && val * 3 <= comboLimit) combos.push([cards[0], cards[1], cards[2]]);
        if (cards.length >= 4 && val * 4 <= comboLimit) combos.push([cards[0], cards[1], cards[2], cards[3]]);
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
