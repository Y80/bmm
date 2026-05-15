# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Core Principles

- **Occam's Razor**: Choose the simplest solution that solves the problem
- **No Unnecessary Entities**: Don't add code/features that aren't needed
- **Think in English, Answer in Chinese**: Maintain clarity while being concise

## Project Overview

BMM (Bookmark Manager) is a full-stack TypeScript application built with Next.js 16.0.10 (App Router) that allows users to manage, share, and explore bookmarks with AI-powered features.

## Coding Guidelines

详见 [AGENTS.md](./AGENTS.md)，包含完整的代码风格、命名规范、TypeScript 配置、测试模式、数据库操作等指南。

## Architecture

### Authentication

- NextAuth v5 (Beta) with GitHub OAuth + Credentials (email/password)
- Role-based access: `user` and `admin` roles stored in JWT
- First user becomes admin automatically
- Use `getAuthedUserId()` helper for server-side auth checks

### Database

- Drizzle ORM with SQLite/PostgreSQL support
- Separate schemas: `src/db/sqlite/` and `src/db/postgres/`
- User-scoped: `userTags`, `userBookmarks` (many-to-many)
- Public: `publicBookmarks`, `publicTags` (admin-managed)

### AI Integration

- OpenAI-compatible APIs, provider configured in admin dashboard
- `analyzeWebsite()`: extracts title, description, favicon, suggests tags
- `analyzeRelatedTags()`: finds semantic tag relationships

### Key Patterns

- Server actions use `makeAction` wrapper with Zod validation + role guards
- Async error handling: use `to()` utility instead of try-catch
- Client actions: use `runAction()` wrapper
- Path aliases: `@/*` → `src/*`, `@cfg` → `app.config.ts`

## Design System

See [DESIGN.md](./DESIGN.md) for color tokens, typography, component patterns.

## Common Tasks

- **New server action**: schema in `src/controllers/schemas/` → handler in `src/actions/items/` → export from `src/actions/index.ts`
- **Bookmarks**: user-scoped via `userBookmarks`, public via `publicBookmarks`
- **Search**: use `keywordSearch()` helper (supports pinyin)
- **Production flag**: add `-P` to any command
