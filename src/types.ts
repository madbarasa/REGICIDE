// 花色枚举
export enum Suit {
    CLUBS = '♣',      // 草花
    SPADES = '♠',     // 黑桃
    DIAMONDS = '♦',   // 方片
    HEARTS = '♥'      // 红心
}

// 点数枚举
export enum Rank {
    ACE = 'A',
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K',
    JOKER = 'JOKER'
}

// 卡牌接口
export interface Card {
    id: string;              // 唯一标识，如"SPADE_7"
    suit: Suit;              // 花色枚举
    rank: Rank;              // 点数枚举
    value: number;           // 数值（A=1, J/Q/K=10）
    isBoss: boolean;         // 是否为Boss卡
    isCorrupted: boolean;    // 是否被腐蚀（Boss状态）
}

// Boss状态接口
export interface BossState {
    currentBoss: Card;       // 当前Boss卡牌
    currentHP: number;       // 当前血量
    baseATK: number;         // 基础攻击力
    currentATK: number;      // 当前攻击力（受黑桃影响）
    isImmune: boolean;       // 是否免疫（根据花色）
}

// 游戏阶段枚举
export enum GamePhase {
    SETUP = 'SETUP',
    TURN_START = 'TURN_START',
    PLAY_CARD = 'PLAY_CARD',
    ACTIVATE_SKILL = 'ACTIVATE_SKILL',
    DEAL_DAMAGE = 'DEAL_DAMAGE',
    TAKE_DAMAGE = 'TAKE_DAMAGE',
    TURN_END = 'TURN_END',
    GAME_OVER = 'GAME_OVER'
}

// 玩家接口
export interface Player {
    id: string;
    hand: Card[];            // 手牌
    maxHandSize: number;     // 手牌上限
}

// 游戏状态接口
export interface GameState {
    phase: GamePhase;        // 当前阶段
    currentPlayerIndex: number; // 当前玩家索引
    players: Player[];       // 玩家数组
    bossDeck: Card[];        // Boss牌库（栈）
    playerDeck: Card[];      // 玩家牌库（队列）
    discardPile: Card[];     // 弃牌堆
    fieldCards: Card[];      // 场上卡牌（黑桃护盾）
    currentBoss: BossState | null;  // 当前Boss状态
    usedJokers: number;      // 已使用周卡数
}

// 游戏结果枚举
export enum GameResult {
    WIN = 'WIN',
    LOSE = 'LOSE',
    ONGOING = 'ONGOING'
}

// 配置常量
export const BOSS_CONFIG = {
    JACK: { hp: 20, atk: 10 },
    QUEEN: { hp: 30, atk: 15 },
    KING: { hp: 40, atk: 20 }
};

export const HAND_LIMIT = {
    1: 8, 2: 7, 3: 6, 4: 5
};
