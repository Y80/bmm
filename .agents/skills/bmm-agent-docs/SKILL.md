# BMM Agent Docs

本 skill 说明 BMM 项目的智能体文档架构，确保所有 AI 智能体（Claude Code、Codex 等）共享同一份项目指南。

## 文档结构

BMM 使用 **单一来源** 策略，所有智能体读取同一份文档：

```
项目根目录/
├── AGENTS.md          ← 唯一维护来源（项目概览、代码规范、架构模式、常用命令等）
├── CLAUDE.md          ← 软链接 → AGENTS.md
├── DESIGN.md          ← 设计系统（色彩、排版、布局、组件、动效、响应式）
├── .agents/
│   └── skills/        ← 技能唯一来源
└── .claude/
    └── skills -> ../.agents/skills   ← 软链接
```

## 核心原则

- **AGENTS.md 是唯一维护来源**：包含项目概览、代码风格、目录结构、Server Actions 模式、错误处理、数据库操作、组件结构等全部开发指南
- **CLAUDE.md 软链接到 AGENTS.md**：Claude Code 读取 `CLAUDE.md` 时自动跟随软链接，实际内容为 `AGENTS.md`
- **DESIGN.md 独立维护**：UI 相关任务必须参考此文件，包含色彩系统、排版、布局、组件规范、图标系统、动效、响应式规范等

## 何时使用

当 AI 智能体需要理解项目规范、编写代码、审查 PR 或进行任何开发任务时：

1. 首先读取 `AGENTS.md`（或 `CLAUDE.md`，二者内容相同）
2. 涉及 UI/样式/配色/图标/动效/响应式时，必须参考 `DESIGN.md`
3. 涉及特定功能模块时，参考对应源代码文件

## 维护规则

- **只在 AGENTS.md 中修改**项目开发规范
- 不要直接修改 `CLAUDE.md`（它是软链接，修改会覆盖 `AGENTS.md`）
- 新增智能体时，无需额外配置文档，自动读取已有文件
