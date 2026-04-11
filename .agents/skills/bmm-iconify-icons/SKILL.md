---
name: bmm-iconify-icons
description: Guide for updating Iconify icons and IconNames conventions in BMM. Use when Codex needs to add or rename static icon classes, refactor IconNames, replace hardcoded icon-[...] Tailwind classes, adjust Iconify-powered UI components, or keep icon usage consistent with this repository's Tailwind and React patterns.
---

# BMM Iconify Icons

Apply Iconify changes in this repository by separating static CSS icons from dynamic icon data, then update the shared `IconNames` registry before touching individual components.

## Quick Start

- Read `tailwind.config.ts` first. This project uses `@iconify/tailwind` with `addDynamicIconSelectors()`.
- Read `app.config.ts` next. Static icon class names belong in `IconNames`.
- Use `ClientIcon` or `@iconify/react` when the icon value comes from data such as `tabler:search`.

## Core Rules

- Follow Iconify's Tailwind dynamic selector format: `icon-[prefix--name]`.
- Keep `IconNames` grouped by icon set. In this repository, use second-level objects such as `IconNames.Tabler`, `IconNames.Huge`, and `IconNames.Mdi`.
- Prefer `IconNames.<Collection>.<NAME>` for static UI icons instead of repeating raw `icon-[...]` strings in components.
- Preserve `prefix:name` strings for persisted or user-selected icons. Do not convert those data values into Tailwind class names.

## When to Use Which Pattern

### Static UI Icon

- Use a Tailwind class from `IconNames`.
- Example: `<span className={cn(IconNames.Tabler.SEARCH, 'text-xl')} />`

### Data-Driven Icon

- Use `ClientIcon` or `Icon` from `@iconify/react`.
- Keep the stored value in Iconify ID format such as `tabler:search`.
- Example areas: tag icons, icon picker output, any icon chosen by the user.

## Repository Hotspots

- `app.config.ts`: source of truth for static icon class names.
- `tailwind.config.ts`: Iconify Tailwind plugin setup.
- `src/components/ClientIcon.tsx`: bridge for stored icon IDs and Tailwind class icons.
- `src/components/IconPicker.tsx`: remote Iconify search and icon selection flow.
- `src/components/Favicon.tsx`: example of static icon fallback states.

## Editing Workflow

1. Add or rename the icon entry in `app.config.ts`.
2. Update component call sites to use the new `IconNames.<Collection>.<NAME>` path.
3. Replace any nearby hardcoded static `icon-[...]` classes when they are simple constants.
4. Leave dynamic or persisted icon IDs untouched.
5. Run targeted search to confirm there are no stale root-level `IconNames.*` references.

## Verification

- Use `rg -n 'IconNames\\.' src app.config.ts` to inspect call sites after refactors.
- Use `rg -n 'icon-\\[[^\\]]+\\]' src` to find remaining hardcoded static icon classes.
- Run `pnpm exec tsc --noEmit --pretty false` and call out any unrelated `.next/types` issues separately.

## Docs Reference

- Iconify Tailwind dynamic selectors: `https://iconify.design/docs/usage/css/tailwind/dynamic/`
- Iconify general docs: `https://iconify.design/docs/`

## Example Requests

- "Use $bmm-iconify-icons to add a new Tabler icon to the bookmark page."
- "Use $bmm-iconify-icons to replace hardcoded icon-[...] classes with IconNames."
- "Use $bmm-iconify-icons to refactor IconNames into icon-set groups."
