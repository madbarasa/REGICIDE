---
description: 如何在《弑君者》中添加新角色
---

按照以下步骤添加新角色，确保逻辑、UI、资源和 AI 同步更新。

### 1. 配置中心 (game.js -> CONFIG.CHARACTERS)
在 `CONFIG.CHARACTERS` 中定义新角色：
- `id`: 唯一标识符（如 `'DRUID'`）。
- `name`: 中文名称。
- `portrait`: `assets/characters/char_druid.png`。
- `abilities`: Lv1-3 的描述文字。
- `skills`: 
  - `id`: 技能类型标识。
  - `icon`: 用于 UI 的图标。
  - `charges`: `(lv) => count` 定义各等级使用次数。
  - `resetType`: `'TURN'`, `'BOSS'`, 或 `'GAME'`。

### 2. 注册角色 (game.js -> CHAR_IDS)
将新角色的 ID 添加到 `CHAR_IDS` 数组中，确保其出现在选择界面。

### 3. 实现核心逻辑 (game.js)
根据角色类型实现对应的逻辑钩子：
- **被动型角色**：在 `executeCombo` 或 `validateCombo` 中通过 `player.charId` 进行判断并修改逻辑。
- **主动型角色**：
  - 在 `triggerCharacterSkill` 中添加相应分支。
  - 实现具体的 `execute[CharName]Skill` 函数。
- **战斗日志交互**：必须在技能触发、判定（如赌徒的命中/未匹配）、成功、失败等逻辑节点，使用 `addLogEntry` 输出带有角色特有图标（如 🎲, 👊, ⚗️）的详细日志，确保用户能通过日志审计技能正确性。

### 4. 制作 AI 适配 (game.js -> AI ENGINE)
在 `handleAIOffense` 中实现该角色的技能决策逻辑：
- 判断时机（如：手牌较差、Boss 快死、需要过牌等）。
- 实现 `execute[CharName]SkillForAI`。

### 5. 视觉资源 (assets/characters/)
- 准备 `char_[id].png` 并放入 `assets/characters/`。
- // turbo
- 使用 `generate_image` 保持高端、统一的美术风格。

### 6. 文档同步
更新 `《弑君者》（Regicide）游戏策划文档.md`，在 3.5 角色养成章节中补全背景和等级详情。

### 7. 版本迭代
提升 `CONFIG.VERSION` 版本号。
// turbo
刷新浏览器测试。
