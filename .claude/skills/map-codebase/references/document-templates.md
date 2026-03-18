# Document Templates

Complete templates for all atomic documents in `.claude/.codebase-info/`. Adapt each template to the specific project - skip sections that don't apply and add project-specific sections as needed.

---

## INDEX.md

```markdown
# Codebase Documentation Index

*Last Updated: [Date]*

## Project: [Name]

[One-line description of the project]

## Documentation Structure

| Document | Description |
|----------|-------------|
| [architecture.md](./architecture.md) | System architecture, components, domain boundaries |
| [coding-style.md](./coding-style.md) | Coding style conventions |
| [communication.md](./communication.md) | API contracts, events, integrations |
| [database.md](./database.md) | Schema and relationships |
| [dependencies.md](./dependencies.md) | Categorized packages |
| [directory-structure.md](./directory-structure.md) | Annotated folder tree |
| [docker.md](./docker.md) | Docker development environment |
| [entry-points.md](./entry-points.md) | Where execution starts |
| [modules.md](./modules.md) | Key modules with descriptions |
| [onboarding.md](./onboarding.md) | Developer quick start, common tasks |
| [patterns.md](./patterns.md) | Code patterns, conventions, best practices |
| [tech-landscape.md](./tech-landscape.md) | Technologies, frameworks, infrastructure |

## Quick Navigation

**New to codebase?** Start with onboarding.md -> architecture.md
**Looking for conventions?** Check coding-style.md and patterns.md
**Understanding the structure?** See directory-structure.md and modules.md
**Need Docker help?** See docker.md
**Working with APIs/events?** See communication.md
**Database questions?** See database.md
**Tech stack / dependencies?** See tech-landscape.md and dependencies.md
```

Remove rows from the table and corresponding Quick Navigation entries for documents that were not created.

---

## architecture.md

```markdown
# Architecture Overview

*Last Updated: [Date]*

## Executive Summary
[2-3 paragraphs on what the system is and how it's built]

## High-Level Architecture
[ASCII or Mermaid diagram showing major components]

## Component Relationships
[Describe how components interact]

## Communication Patterns
[HTTP, WebSocket, events, queues, etc.]
```

---

## coding-style.md

```markdown
# Coding Style Conventions

*Last Updated: [Date]*

## General Principles
[Overarching code style rules]

## Language-Specific Conventions
[Per-language style rules derived from linter configs, existing code patterns]

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | [pattern] | [example] |
| Classes | [pattern] | [example] |
| Functions | [pattern] | [example] |
| Variables | [pattern] | [example] |
| Constants | [pattern] | [example] |
```

---

## communication.md

```markdown
# Communication Patterns

*Last Updated: [Date]*

## Overview Diagram
[ASCII diagram of system communication]

## API Contracts
[Endpoints, versioning, authentication methods]

## Events & Messaging
[Event system, queues, broadcasting, pub/sub]

## External Integrations
[Third-party services and how they connect]
```

---

## database.md

```markdown
# Database Schema

*Last Updated: [Date]*

## Overview
- Engine: [MySQL/PostgreSQL/SQLite/etc.]
- ORM: [Eloquent/Prisma/SQLAlchemy/etc.]
- Migration location: [path]

## Key Tables

### table_name
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|

## Entity Relationship Diagram
[ASCII diagram of key relationships]

## Notes
[Indexes, views, stored procedures, etc.]
```

---

## dependencies.md

```markdown
# Dependencies

*Last Updated: [Date]*

## Production Dependencies

### [Category]
| Package | Version | Purpose |
|---------|---------|---------|

## Development Dependencies

### [Category]
| Package | Version | Purpose |
|---------|---------|---------|

## Dependency Notes
[Special configuration, version constraints, known issues]
```

---

## directory-structure.md

~~~markdown
# Directory Structure

*Last Updated: [Date]*

## Root Layout
```
project/
├── folder/    # Purpose
├── folder/    # Purpose
└── ...
```

## Key Directories Explained

### folder/
[Description of what goes here, naming patterns, key files]
~~~

---

## docker.md

```markdown
# Docker Development Environment

*Last Updated: [Date]*

## Overview
[What the Docker setup provides]

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|

## Common Commands

| Command | Purpose |
|---------|---------|

## Environment Variables
[Required env vars and their purpose]

## Troubleshooting
[Common issues and fixes]
```

---

## entry-points.md

```markdown
# Entry Points

*Last Updated: [Date]*

## Application Entry Points

| Entry Point | Type | Purpose | File |
|-------------|------|---------|------|

## Request Flow Examples
[Show typical request paths through the application]

## CLI Commands

| Command | Purpose |
|---------|---------|
```

---

## modules.md

```markdown
# Key Modules

*Last Updated: [Date]*

## [Module Name]
- **Location**: `path/`
- **Purpose**: What it does
- **Key files**: Important files in this module
- **Depends on**: Other modules
- **Exports**: What it provides to other modules

[Repeat for each significant module]
```

---

## onboarding.md

```markdown
# Developer Onboarding Guide

*Last Updated: [Date]*

## Prerequisites
[Required tools, versions, accounts]

## Quick Start
[Step-by-step setup instructions]

## Development Commands

| Command | Purpose |
|---------|---------|

## Common Tasks
[Step-by-step for frequent operations like adding a feature, running tests]

## Debugging Tips
[Common issues and solutions, useful commands]
```

---

## patterns.md

```markdown
# Patterns & Best Practices

*Last Updated: [Date]*

## Code Organization
[How code is organized, where things go]

## Design Patterns
[Patterns used in the codebase with examples]

## Error Handling
[Approach to errors, exceptions, validation]

## Testing Patterns
[How tests are structured, naming, mocking approach]

## Configuration
[How config is managed, env vars, feature flags]
```

---

## tech-landscape.md

```markdown
# Technology Landscape

*Last Updated: [Date]*

## Source of Truth Files

| Information | Source File |
|-------------|-------------|

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|

## Key Dependencies
[Most important packages with brief explanations]

## Infrastructure
[Hosting, CI/CD, monitoring, logging]
```
