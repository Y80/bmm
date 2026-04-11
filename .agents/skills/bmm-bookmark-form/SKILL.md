---
name: bmm-bookmark-form
description: Guide for modifying BMM bookmark create/edit pages and related icon workflows. Use when Codex needs to change the bookmark form UI, favicon input behavior, website icon probing, HTML/AI autofill actions, or nearby validation and feedback logic in this repository.
---

# BMM Bookmark Form

Update the bookmark create/edit flow from the form entry point first, then follow the data path only as far as the requested change requires.

## Quick Start

- Inspect `src/components/BookmarkSlugPage.tsx` first. This is the main client component for bookmark creation and editing.
- Reuse `src/components/Favicon.tsx` for favicon previews instead of adding a second image-loading pattern.
- Keep icon class names in `app.config.ts` under `IconNames`; add new Tabler icons to `IconNames.Tabler`.
- Use `runAction()` for client-side action calls and keep user-facing copy in Chinese.

## Common Change Paths

### Form UI and Validation

- Edit `src/components/BookmarkSlugPage.tsx`.
- Keep the file as a client component.
- Follow the existing `useSetState` and `useUpdateEffect` patterns instead of introducing a second state style without a reason.
- Keep validation in the local Zod schema unless the request requires shared validation.

### Icon Preview and Probing

- Use `src/utils/website-icon.ts` for bookmark-site icon candidate generation or probing changes.
- Keep probing logic client-side unless the request explicitly requires a server-side path.
- Treat probing as best-effort. Do not promise strict network cancellation semantics from `Image`.

### HTML and AI Autofill

- For HTML autofill, inspect `actExtractHtmlInfo` from `src/actions`.
- For AI autofill, inspect `actAnalyzeWebsite` and `src/lib/ai/index.ts`.
- Only touch the action layer if the request cannot be solved in the form component.

## Editing Rules

- Use absolute `@/` imports for internal modules.
- Keep UI messages and error copy in Chinese.
- Add brief comments only when the logic is not obvious from the code itself.
- Use `apply_patch` for manual file edits.

## Verification

- Prefer targeted verification over repo-wide commands when the repository already has unrelated failures.
- For favicon probing utilities, run `pnpm exec vitest run src/utils/website-icon.test.ts`.
- If TypeScript validation is needed, run `pnpm exec tsc --noEmit --pretty false` and call out any pre-existing `.next/types` issues separately from your change.

## Example Requests

- "Use $bmm-bookmark-form to add a new control to the bookmark edit page."
- "Use $bmm-bookmark-form to change how favicon probing behaves in the bookmark form."
- "Use $bmm-bookmark-form to update the icon dropdown feedback and validation copy."
