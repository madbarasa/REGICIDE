"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const Game_1 = require("./Game");
const GameLogic_1 = require("./GameLogic");
const types_1 = require("./types");
// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// 问题包装函数
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}
// 主游戏循环
async function main() {
    console.log('=== 《弑君者》Regicide 卡牌游戏 MVP ===\n');
    // 初始化游戏
    const gameState = (0, Game_1.initGame)(1, false); // 单人模式，无Joker
    (0, Game_1.printGameState)(gameState);
    while (true) {
        const gameResult = (0, Game_1.checkGameOver)(gameState);
        if (gameResult === types_1.GameResult.WIN) {
            console.log('🎉 恭喜！所有Boss都被击败了！你赢得了游戏！');
            break;
        }
        else if (gameResult === types_1.GameResult.LOSE) {
            console.log('💀 游戏结束！你被Boss击败了。');
            break;
        }
        const currentPlayer = (0, Game_1.getCurrentPlayer)(gameState);
        const availableActions = (0, GameLogic_1.getAvailableActions)(gameState);
        console.log(`\n=== ${currentPlayer.id} 的回合 ===`);
        if (gameState.phase === types_1.GamePhase.TURN_START || gameState.phase === types_1.GamePhase.PLAY_CARD) {
            // 出牌阶段
            console.log('手牌:');
            const handInfo = (0, GameLogic_1.getPlayerHandInfo)(currentPlayer);
            handInfo.forEach((card, index) => {
                console.log(`  ${index + 1}. ${card.display} [${card.id}]`);
            });
            console.log('\n可用操作:');
            console.log('  1. 出牌 (输入卡牌ID)');
            console.log('  2. 跳过回合 (直接承受Boss伤害)');
            const choice = await question('请选择操作 (1-2): ');
            if (choice === '1') {
                const cardId = await question('输入要出的卡牌ID: ');
                const result = (0, GameLogic_1.playCard)(gameState, cardId);
                if (result.success) {
                    console.log(`✅ ${result.message}`);
                    if (result.bossDefeated) {
                        console.log('🐉 Boss被击败了！');
                    }
                }
                else {
                    console.log(`❌ ${result.message}`);
                    continue;
                }
            }
            else if (choice === '2') {
                console.log('跳过回合，直接承受Boss伤害...');
                (0, GameLogic_1.skipTurn)(gameState);
            }
            else {
                console.log('无效选择，请重新输入');
                continue;
            }
        }
        else if (gameState.phase === types_1.GamePhase.TAKE_DAMAGE) {
            // 防御阶段
            if (!gameState.currentBoss) {
                console.log('错误：没有当前Boss');
                break;
            }
            console.log(`Boss攻击力: ${gameState.currentBoss.currentATK}`);
            console.log('手牌:');
            const handInfo = (0, GameLogic_1.getPlayerHandInfo)(currentPlayer);
            handInfo.forEach((card, index) => {
                console.log(`  ${index + 1}. ${card.display} [${card.id}]`);
            });
            console.log('\n需要弃牌防御Boss攻击');
            console.log(`弃牌总点数需要 ≥ ${gameState.currentBoss.currentATK}`);
            const discardInput = await question('输入要弃掉的卡牌ID（用逗号分隔）: ');
            const cardIds = discardInput.split(',').map(id => id.trim()).filter(id => id);
            if (cardIds.length === 0) {
                console.log('必须至少弃掉一张牌');
                continue;
            }
            const result = (0, GameLogic_1.defendAgainstBoss)(gameState, cardIds);
            if (result.success) {
                console.log(`🛡️ ${result.message}`);
            }
            else {
                console.log(`💥 ${result.message}`);
            }
        }
        (0, Game_1.printGameState)(gameState);
    }
    console.log('\n游戏结束！感谢游玩《弑君者》');
    rl.close();
}
// 处理程序退出
process.on('SIGINT', () => {
    console.log('\n游戏被中断');
    rl.close();
    process.exit(0);
});
// 启动游戏
main().catch(console.error);
