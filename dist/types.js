"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAND_LIMIT = exports.BOSS_CONFIG = exports.GameResult = exports.GamePhase = exports.Rank = exports.Suit = void 0;
// 花色枚举
var Suit;
(function (Suit) {
    Suit["CLUBS"] = "\u2663";
    Suit["SPADES"] = "\u2660";
    Suit["DIAMONDS"] = "\u2666";
    Suit["HEARTS"] = "\u2665"; // 红心
})(Suit || (exports.Suit = Suit = {}));
// 点数枚举
var Rank;
(function (Rank) {
    Rank["ACE"] = "A";
    Rank["TWO"] = "2";
    Rank["THREE"] = "3";
    Rank["FOUR"] = "4";
    Rank["FIVE"] = "5";
    Rank["SIX"] = "6";
    Rank["SEVEN"] = "7";
    Rank["EIGHT"] = "8";
    Rank["NINE"] = "9";
    Rank["TEN"] = "10";
    Rank["JACK"] = "J";
    Rank["QUEEN"] = "Q";
    Rank["KING"] = "K";
    Rank["JOKER"] = "JOKER";
})(Rank || (exports.Rank = Rank = {}));
// 游戏阶段枚举
var GamePhase;
(function (GamePhase) {
    GamePhase["SETUP"] = "SETUP";
    GamePhase["TURN_START"] = "TURN_START";
    GamePhase["PLAY_CARD"] = "PLAY_CARD";
    GamePhase["ACTIVATE_SKILL"] = "ACTIVATE_SKILL";
    GamePhase["DEAL_DAMAGE"] = "DEAL_DAMAGE";
    GamePhase["TAKE_DAMAGE"] = "TAKE_DAMAGE";
    GamePhase["TURN_END"] = "TURN_END";
    GamePhase["GAME_OVER"] = "GAME_OVER";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
// 游戏结果枚举
var GameResult;
(function (GameResult) {
    GameResult["WIN"] = "WIN";
    GameResult["LOSE"] = "LOSE";
    GameResult["ONGOING"] = "ONGOING";
})(GameResult || (exports.GameResult = GameResult = {}));
// 配置常量
exports.BOSS_CONFIG = {
    JACK: { hp: 20, atk: 10 },
    QUEEN: { hp: 30, atk: 15 },
    KING: { hp: 40, atk: 20 }
};
exports.HAND_LIMIT = {
    1: 8, 2: 7, 3: 6, 4: 5
};
