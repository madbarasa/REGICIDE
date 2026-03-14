import { Card, Suit, Rank, BOSS_CONFIG } from './types';

// 卡牌价值映射
const CARD_VALUES: Record<Rank, number> = {
    [Rank.ACE]: 1,
    [Rank.TWO]: 2,
    [Rank.THREE]: 3,
    [Rank.FOUR]: 4,
    [Rank.FIVE]: 5,
    [Rank.SIX]: 6,
    [Rank.SEVEN]: 7,
    [Rank.EIGHT]: 8,
    [Rank.NINE]: 9,
    [Rank.TEN]: 10,
    [Rank.JACK]: 10,
    [Rank.QUEEN]: 10,
    [Rank.KING]: 10,
    [Rank.JOKER]: 0
};

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 创建卡牌
function createCard(suit: Suit, rank: Rank, isBoss: boolean = false): Card {
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
export function createBossDeck(): Card[] {
    const bossCards: Card[] = [];

    // 创建J/Q/K各4个花色
    const suits = [Suit.CLUBS, Suit.SPADES, Suit.DIAMONDS, Suit.HEARTS];
    const ranks = [Rank.JACK, Rank.QUEEN, Rank.KING];

    for (const rank of ranks) {
        for (const suit of suits) {
            bossCards.push(createCard(suit, rank, true));
        }
    }

    // 按照策划文档要求：K(底) -> Q(中) -> J(顶)
    // 每个层级内随机排序
    const kings = bossCards.filter(card => card.rank === Rank.KING);
    const queens = bossCards.filter(card => card.rank === Rank.QUEEN);
    const jacks = bossCards.filter(card => card.rank === Rank.JACK);

    const shuffledKings = shuffleArray(kings);
    const shuffledQueens = shuffleArray(queens);
    const shuffledJacks = shuffleArray(jacks);

    return [...shuffledKings, ...shuffledQueens, ...shuffledJacks];
}

// 创建玩家牌库（40张标准扑克牌）
export function createPlayerDeck(): Card[] {
    const playerCards: Card[] = [];

    const suits = [Suit.CLUBS, Suit.SPADES, Suit.DIAMONDS, Suit.HEARTS];
    const ranks = [
        Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE,
        Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN
    ];

    for (const suit of suits) {
        for (const rank of ranks) {
            playerCards.push(createCard(suit, rank, false));
        }
    }

    return shuffleArray(playerCards);
}

// 获取Boss配置
export function getBossConfig(rank: Rank) {
    switch (rank) {
        case Rank.JACK:
            return BOSS_CONFIG.JACK;
        case Rank.QUEEN:
            return BOSS_CONFIG.QUEEN;
        case Rank.KING:
            return BOSS_CONFIG.KING;
        default:
            throw new Error(`Invalid boss rank: ${rank}`);
    }
}
