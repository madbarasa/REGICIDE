"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBossDeck = createBossDeck;
exports.createPlayerDeck = createPlayerDeck;
exports.getBossConfig = getBossConfig;
const types_1 = require("./types");
// 卡牌价值映射
const CARD_VALUES = {
    [types_1.Rank.ACE]: 1,
    [types_1.Rank.TWO]: 2,
    [types_1.Rank.THREE]: 3,
    [types_1.Rank.FOUR]: 4,
    [types_1.Rank.FIVE]: 5,
    [types_1.Rank.SIX]: 6,
    [types_1.Rank.SEVEN]: 7,
    [types_1.Rank.EIGHT]: 8,
    [types_1.Rank.NINE]: 9,
    [types_1.Rank.TEN]: 10,
    [types_1.Rank.JACK]: 10,
    [types_1.Rank.QUEEN]: 10,
    [types_1.Rank.KING]: 10,
    [types_1.Rank.JOKER]: 0
};
// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
// 创建卡牌
function createCard(suit, rank, isBoss = false) {
    const id = `${suit}_${rank}`;
    return {
        id,
        suit,
        rank,
        value: CARD_VALUES[rank],
        isBoss,
        isCorrupted: isBoss
    };
}
// 创建Boss牌库
function createBossDeck() {
    const bossCards = [];
    // 创建J/Q/K各4个花色
    const suits = [types_1.Suit.CLUBS, types_1.Suit.SPADES, types_1.Suit.DIAMONDS, types_1.Suit.HEARTS];
    const ranks = [types_1.Rank.JACK, types_1.Rank.QUEEN, types_1.Rank.KING];
    for (const rank of ranks) {
        for (const suit of suits) {
            bossCards.push(createCard(suit, rank, true));
        }
    }
    // 按照策划文档要求：K(底) -> Q(中) -> J(顶)
    // 每个层级内随机排序
    const kings = bossCards.filter(card => card.rank === types_1.Rank.KING);
    const queens = bossCards.filter(card => card.rank === types_1.Rank.QUEEN);
    const jacks = bossCards.filter(card => card.rank === types_1.Rank.JACK);
    const shuffledKings = shuffleArray(kings);
    const shuffledQueens = shuffleArray(queens);
    const shuffledJacks = shuffleArray(jacks);
    return [...shuffledKings, ...shuffledQueens, ...shuffledJacks];
}
// 创建玩家牌库（40张标准扑克牌）
function createPlayerDeck() {
    const playerCards = [];
    const suits = [types_1.Suit.CLUBS, types_1.Suit.SPADES, types_1.Suit.DIAMONDS, types_1.Suit.HEARTS];
    const ranks = [
        types_1.Rank.ACE, types_1.Rank.TWO, types_1.Rank.THREE, types_1.Rank.FOUR, types_1.Rank.FIVE,
        types_1.Rank.SIX, types_1.Rank.SEVEN, types_1.Rank.EIGHT, types_1.Rank.NINE, types_1.Rank.TEN
    ];
    for (const suit of suits) {
        for (const rank of ranks) {
            playerCards.push(createCard(suit, rank, false));
        }
    }
    return shuffleArray(playerCards);
}
// 获取Boss配置
function getBossConfig(rank) {
    switch (rank) {
        case types_1.Rank.JACK:
            return types_1.BOSS_CONFIG.JACK;
        case types_1.Rank.QUEEN:
            return types_1.BOSS_CONFIG.QUEEN;
        case types_1.Rank.KING:
            return types_1.BOSS_CONFIG.KING;
        default:
            throw new Error(`Invalid boss rank: ${rank}`);
    }
}
