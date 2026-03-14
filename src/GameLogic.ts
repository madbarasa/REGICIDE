import { GameState, Card, GamePhase, Player } from './types';
import { getCurrentPlayer, nextPlayer, nextBoss, drawCards } from './Game';

// 出牌结果接口
export interface PlayResult {
    success: boolean;
    damage: number;
    message: string;
    bossDefeated: boolean;
    gameOver: boolean;
}

// 防御结果接口
export interface DefenseResult {
    success: boolean;
    message: string;
    gameOver: boolean;
}

// 基础出牌逻辑（MVP版本）
export function playCard(gameState: GameState, cardId: string): PlayResult {
    const currentPlayer = getCurrentPlayer(gameState);

    // 检查是否在正确的阶段
    if (gameState.phase !== GamePhase.TURN_START && gameState.phase !== GamePhase.PLAY_CARD) {
        return {
            success: false,
            damage: 0,
            message: '当前不是出牌阶段',
            bossDefeated: false,
            gameOver: false
        };
    }

    // 查找要出的牌
    const cardIndex = currentPlayer.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
        return {
            success: false,
            damage: 0,
            message: '手牌中没有这张牌',
            bossDefeated: false,
            gameOver: false
        };
    }

    const playedCard = currentPlayer.hand[cardIndex];

    // 从手牌中移除
    currentPlayer.hand.splice(cardIndex, 1);

    // 计算伤害（MVP版本：只有基础伤害）
    const damage = playedCard.value;

    // 造成伤害
    if (gameState.currentBoss) {
        gameState.currentBoss.currentHP -= damage;

        // 检查Boss是否被击败
        let bossDefeated = false;
        let gameOver = false;

        if (gameState.currentBoss.currentHP <= 0) {
            bossDefeated = true;

            // 尝试切换到下一Boss
            if (!nextBoss(gameState)) {
                // 没有更多Boss了，游戏胜利
                gameOver = true;
                gameState.phase = GamePhase.GAME_OVER;
            }
        } else {
            // Boss未被击败，进入防御阶段
            gameState.phase = GamePhase.TAKE_DAMAGE;
        }

        // 进入下一阶段
        if (!gameOver) {
            gameState.phase = bossDefeated ? GamePhase.TURN_START : GamePhase.TAKE_DAMAGE;
        }

        return {
            success: true,
            damage,
            message: `打出 ${playedCard.suit}${playedCard.rank}，造成 ${damage} 点伤害！`,
            bossDefeated,
            gameOver
        };
    }

    return {
        success: true,
        damage,
        message: `打出 ${playedCard.suit}${playedCard.rank}`,
        bossDefeated: false,
        gameOver: false
    };
}

// 跳过回合（直接承受Boss伤害）
export function skipTurn(gameState: GameState): void {
    if (gameState.phase === GamePhase.TURN_START || gameState.phase === GamePhase.PLAY_CARD) {
        gameState.phase = GamePhase.TAKE_DAMAGE;
    }
}

// 防御Boss攻击
export function defendAgainstBoss(gameState: GameState, cardIds: string[]): DefenseResult {
    const currentPlayer = getCurrentPlayer(gameState);

    // 检查是否在防御阶段
    if (gameState.phase !== GamePhase.TAKE_DAMAGE) {
        return {
            success: false,
            message: '当前不是防御阶段',
            gameOver: false
        };
    }

    if (!gameState.currentBoss) {
        return {
            success: false,
            message: '没有当前Boss',
            gameOver: false
        };
    }

    // 验证弃牌是否在手牌中
    const discardedCards: Card[] = [];
    for (const cardId of cardIds) {
        const cardIndex = currentPlayer.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            return {
                success: false,
                message: `手牌中没有卡牌: ${cardId}`,
                gameOver: false
            };
        }
        discardedCards.push(currentPlayer.hand[cardIndex]);
    }

    // 计算弃牌总值
    const totalValue = discardedCards.reduce((sum, card) => sum + card.value, 0);
    const requiredValue = gameState.currentBoss.currentATK;

    // 从手牌中移除弃掉的牌
    for (const discardedCard of discardedCards) {
        const index = currentPlayer.hand.findIndex(card => card.id === discardedCard.id);
        if (index !== -1) {
            currentPlayer.hand.splice(index, 1);
            gameState.discardPile.push(discardedCard);
        }
    }

    if (totalValue >= requiredValue) {
        // 防御成功
        gameState.phase = GamePhase.TURN_END;
        nextPlayer(gameState);

        return {
            success: true,
            message: `防御成功！弃牌总值 ${totalValue} >= Boss攻击力 ${requiredValue}`,
            gameOver: false
        };
    } else {
        // 防御失败，游戏结束
        gameState.phase = GamePhase.GAME_OVER;

        return {
            success: false,
            message: `防御失败！弃牌总值 ${totalValue} < Boss攻击力 ${requiredValue}，游戏结束`,
            gameOver: true
        };
    }
}

// 获取玩家可用的操作
export function getAvailableActions(gameState: GameState): string[] {
    const actions: string[] = [];
    const currentPlayer = getCurrentPlayer(gameState);

    switch (gameState.phase) {
        case GamePhase.TURN_START:
        case GamePhase.PLAY_CARD:
            actions.push('play_card');
            actions.push('skip_turn');
            break;

        case GamePhase.TAKE_DAMAGE:
            actions.push('defend');
            break;

        case GamePhase.GAME_OVER:
            actions.push('restart');
            break;
    }

    return actions;
}

// 获取手牌信息
export function getPlayerHandInfo(player: Player): Array<{id: string, display: string}> {
    return player.hand.map(card => ({
        id: card.id,
        display: `${card.suit}${card.rank}(${card.value})`
    }));
}
