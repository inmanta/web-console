# Coding Style Conventions

*Last Updated: 2026-03-18*

## General Principles

- TypeScript `strict` mode is enabled — no implicit `any`, strict null checks.
- ESLint enforces `max-warnings=0` (zero warnings allowed, especially in CI).
- Prettier handles formatting automatically.
- ES modules (`"type": "module"` in package.json).

## Language-Specific Conventions

### TypeScript / React

- Functional components only (no class components).
- `react-jsx` transform — no need to import React in component files.
- Interfaces and types from `Core/Contracts/` define public API shapes.
- Prefer `const` and arrow functions for component definitions.
- Hooks follow `use*` naming convention.
- Generic types are used extensively for query/response types.

### Imports

- Path aliases configured in `tsconfig.json`:
  - `@/*` → `src/*`
  - `@S/*` → `src/Slices/*`
  - `@images/*` → `public/images/*`
  - `@assets/*` → patternfly assets
- ESLint import plugin enforces correct import ordering.

### Styling

- Global styles in `src/UI/Styles/`.
- `styled-components` used for component-scoped styles.
- PatternFly design tokens and CSS variables used for theming.

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `ServiceCatalog.tsx` |
| Files (utilities/hooks) | camelCase | `useUrlState.ts` |
| Files (tests) | `*.test.tsx` / `*.test.ts` | `ServiceCatalog.test.tsx` |
| React components | PascalCase | `ServiceInventory` |
| Custom hooks | `use` prefix, camelCase | `useEnvironmentHandler` |
| Interfaces (contracts) | PascalCase, no `I` prefix | `UrlManager`, `RouteManager` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Variables/functions | camelCase | `fetchEnvironments` |
| Slice directories | PascalCase | `ServiceCatalog/`, `DesiredState/` |
| Component subdirs | PascalCase | `Components/AttributesTable/` |

## Linting & Formatting

- **ESLint**: `eslint.config.js` — TypeScript parser, React + React Hooks + Testing Library + Import plugins.
- **Prettier**: `.prettierrc.cjs` — applied to `.js`, `.jsx`, `.ts`, `.tsx`.
- **Circular deps**: `check-circular-deps` script using Madge.
- Run `yarn lint` / `yarn format:check` before committing.
