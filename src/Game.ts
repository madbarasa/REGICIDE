import {
    GameState,
    GamePhase,
    Player,
    BossState,
    Card,
    HAND_LIMIT,
    GameResult
} from './types';
import { createBossDeck, createPlayerDeck, getBossConfig } from './Deck';

// 初始化游戏
export function initGame(playerCount: number = 1, useJokers: boolean = false): GameState {
    // 创建玩家
    const players: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
        players.push({
            id: `player_${i + 1}`,
            hand: [],
            maxHandSize: HAND_LIMIT[playerCount as keyof typeof HAND_LIMIT] || 5
        });
    }

    // 创建牌库
    const bossDeck = createBossDeck();
    const playerDeck = createPlayerDeck();

    // 抽取当前Boss
    const currentBossCard = bossDeck.pop()!;
    const bossConfig = getBossConfig(currentBossCard.rank);
    const currentBoss: BossState = {
        currentBoss: currentBossCard,
        currentHP: bossConfig.hp,
        baseATK: bossConfig.atk,
        currentATK: bossConfig.atk,
        isImmune: false
    };

    const gameState: GameState = {
        phase: GamePhase.SETUP,
        currentPlayerIndex: 0,
        players,
        bossDeck,
        playerDeck,
        discardPile: [],
        fieldCards: [],
        currentBoss,
        usedJokers: 0
    };

    // 所有玩家抽满手牌
    for (const player of players) {
        drawCards(gameState, player, player.maxHandSize);
    }

    // 进入游戏开始阶段
    gameState.phase = GamePhase.TURN_START;

    return gameState;
}

// 抽牌
export function drawCards(gameState: GameState, player: Player, count: number): void {
    for (let i = 0; i < count; i++) {
        if (gameState.playerDeck.length === 0) {
            // 牌库为空，游戏失败
            gameState.phase = GamePhase.GAME_OVER;
            return;
        }

        const card = gameState.playerDeck.shift()!;
        player.hand.push(card);
    }
}

// 切换到下一位玩家
export function nextPlayer(gameState: GameState): void {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.phase = GamePhase.TURN_START;
}

// 获取当前玩家
export function getCurrentPlayer(gameState: GameState): Player {
    return gameState.players[gameState.currentPlayerIndex];
}

// 检查游戏是否结束
export function checkGameOver(gameState: GameState): GameResult {
    // Boss牌库为空且当前Boss被击败 = 胜利
    if (gameState.bossDeck.length === 0 && gameState.currentBoss!.currentHP <= 0) {
        return GameResult.WIN;
    }

    // 牌库为空 = 失败
    if (gameState.playerDeck.length === 0) {
        return GameResult.LOSE;
    }

    // 当前Boss血量 > 0 且玩家无法防御Boss攻击 = 失败
    if (gameState.currentBoss && gameState.currentBoss.currentHP > 0) {
        const currentPlayer = getCurrentPlayer(gameState);
        const handValue = currentPlayer.hand.reduce((sum, card) => sum + card.value, 0);
        if (handValue < gameState.currentBoss.currentATK) {
            return GameResult.LOSE;
        }
    }

    return GameResult.ONGOING;
}

// 切换到下一Boss
export function nextBoss(gameState: GameState): boolean {
    if (gameState.bossDeck.length === 0) {
        return false; // 没有更多Boss了
    }

    // 清除场上卡牌
    gameState.discardPile.push(...gameState.fieldCards);
    gameState.fieldCards = [];

    // 获取新Boss
    const newBossCard = gameState.bossDeck.pop()!;
    const bossConfig = getBossConfig(newBossCard.rank);
    gameState.currentBoss = {
        currentBoss: newBossCard,
        currentHP: bossConfig.hp,
        baseATK: bossConfig.atk,
        currentATK: bossConfig.atk,
        isImmune: false
    };

    return true;
}

// 打印游戏状态（调试用）
export function printGameState(gameState: GameState): void {
    console.log('=== 游戏状态 ===');
    console.log(`阶段: ${gameState.phase}`);
    console.log(`当前玩家: ${getCurrentPlayer(gameState).id}`);
    console.log(`Boss牌库剩余: ${gameState.bossDeck.length}`);
    console.log(`玩家牌库剩余: ${gameState.playerDeck.length}`);
    console.log(`弃牌堆: ${gameState.discardPile.length}`);

    if (gameState.currentBoss) {
        const boss = gameState.currentBoss;
        console.log(`当前Boss: ${boss.currentBoss.suit}${boss.currentBoss.rank} (HP: ${boss.currentHP}/${boss.baseATK === 10 ? 20 : boss.baseATK === 15 ? 30 : 40}, ATK: ${boss.currentATK})`);
    }

    gameState.players.forEach(player => {
        console.log(`${player.id} 手牌(${player.hand.length}/${player.maxHandSize}): ${player.hand.map(card => `${card.suit}${card.rank}`).join(', ')}`);
    });

    console.log('场上卡牌:', gameState.fieldCards.map(card => `${card.suit}${card.rank}`).join(', '));
    console.log('===============');
}
