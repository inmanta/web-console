---
name: map-codebase
description: >-
  This skill should be used when the user asks to "map the codebase", "document the codebase",
  "create codebase documentation", "generate architecture docs", "onboard me to this project",
  "what does this codebase do", "create a codebase map", or needs comprehensive codebase
  understanding. Also triggers on phrases like "analyze the project structure",
  "document the architecture", or "bootstrap codebase docs".
---

# Codebase Mapper

Generate a structured codebase map as a collection of atomic documents in `.claude/.codebase-info/`. Each document focuses on one aspect of the codebase, making documentation easy to maintain, update, and navigate.

## Output Structure

Create the following files in `.claude/.codebase-info/`:

```
.claude/.codebase-info/
├── INDEX.md                # Navigation hub linking all docs
├── architecture.md         # System diagram, component relationships
├── coding-style.md         # Coding style conventions
├── communication.md        # API contracts, events, integrations
├── database.md             # Schema and relationships (if applicable)
├── dependencies.md         # Categorized packages
├── directory-structure.md  # Annotated folder tree
├── docker.md               # Docker/container setup (if applicable)
├── entry-points.md         # Where execution starts
├── modules.md              # Key modules with descriptions
├── onboarding.md           # Developer quick start, common tasks
├── patterns.md             # Code patterns, conventions, best practices
└── tech-landscape.md       # Technologies, frameworks, infrastructure
```

Skip documents that don't apply (e.g., `docker.md` if no containers, `database.md` if no DB).

## Process

### Step 1: Identify Project Type

Read configuration files to determine the tech stack:
- `package.json`, `tsconfig.json` - Node/TypeScript
- `composer.json` - PHP/Laravel
- `requirements.txt`, `pyproject.toml` - Python
- `Cargo.toml` - Rust
- `go.mod` - Go
- `pom.xml`, `build.gradle` - Java
- `Gemfile` - Ruby

Note the framework (Laravel, Next.js, FastAPI, Rails, etc.) as it dictates structure.

### Step 2: Map Directory Structure

Run `tree` on the root (or `ls -R` if tree is unavailable), then explore key directories (`src/`, `app/`, `lib/`, `tests/`, `config/`). Identify the architectural pattern:
- Feature-based (`features/auth/`, `features/billing/`)
- Layer-based (`controllers/`, `services/`, `models/`)
- Domain-driven (`domain/`, `infrastructure/`, `application/`)

### Step 3: Identify Entry Points

Find where execution starts:
- **Web apps**: Route definitions, main app file
- **APIs**: Router/controller files, endpoint definitions
- **CLIs**: Main command handler, argument parser
- **Libraries**: Exported modules, public API surface

### Step 4: Trace Key Flows

For the 3-5 most important features, trace: entry point -> business logic -> data layer -> external services. Example: `POST /api/users` -> `UserController.store()` -> `UserService.create()` -> `users` table -> `WelcomeEmail` dispatch. Note shared utilities and cross-cutting concerns.

### Step 5: Document Dependencies

Review dependency files and categorize:
- **Core**: Framework, runtime essentials
- **Data**: Database clients, ORMs, caching
- **External**: API clients, third-party integrations
- **Dev**: Testing, linting, build tools

### Step 6: Identify Patterns and Conventions

Note recurring patterns: naming conventions, file organization, error handling approach, configuration management, logging and observability.

### Step 7: Write Atomic Documents

Create each document in `.claude/.codebase-info/` using the templates in `references/document-templates.md`. Include a "Last Updated" date in each file header.

## Important Guidelines

- Write for another Claude instance that will use these docs for context grounding
- Focus on information that helps navigate and understand the codebase quickly
- Keep each document self-contained but cross-reference related docs
- Include concrete file paths, not just abstract descriptions
- Prefer tables for structured information (dependencies, routes, modules)
- Use ASCII diagrams for architecture and data flow

## Success Criteria

The map is complete when:
- [ ] `.claude/.codebase-info/` directory created
- [ ] INDEX.md created with links to all documents
- [ ] All applicable documents written with accurate content
- [ ] All "Last Updated" timestamps set to today's date
- [ ] File paths and references validated

## Additional Resources

### Reference Files

For detailed document templates, consult:
- **`references/document-templates.md`** - Complete templates for all 12 document types with field descriptions and example content
