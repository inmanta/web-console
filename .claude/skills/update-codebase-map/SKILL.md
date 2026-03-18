---
name: update-codebase-map
description: >-
  This skill should be used when the user asks to "update the codebase map", "refresh codebase docs",
  "sync documentation", "update architecture docs", or when Claude determines that code changes
  require documentation updates. Also triggers on "update-codebase-map", "docs are stale",
  "documentation is outdated", or after significant refactoring. Requires an existing
  `.claude/.codebase-info/` directory - if none exists, suggest using the map-codebase skill instead.
---

# Update Codebase Map

Update existing atomic codebase documentation to accurately reflect the current state. Detect changes, update only affected documents, and maintain consistency across all files.

## Prerequisites

An existing `.claude/.codebase-info/` directory with an INDEX.md file. If none exists, suggest using the `map-codebase` skill to create the initial documentation first.

## Atomic Documents

The codebase map consists of atomic documents in `.claude/.codebase-info/`:

| Document | Update When... |
|----------|----------------|
| INDEX.md | Project name/description changes, new docs added/removed |
| architecture.md | Components added/removed, relationships change |
| coding-style.md | Style conventions change, new language patterns |
| communication.md | API contracts change, new events or integrations |
| database.md | Schema changes, new tables/columns |
| dependencies.md | Packages added/removed/upgraded |
| directory-structure.md | Folders added/removed/renamed |
| docker.md | Containers added/removed, config changes |
| entry-points.md | New routes, APIs, or commands added |
| modules.md | New modules, module purpose changes |
| onboarding.md | Setup steps change, new common tasks |
| patterns.md | New patterns established, old ones deprecated |
| tech-landscape.md | Tech stack changes, dependencies updated |

## Process

### Step 1: Read Existing Documentation

Read `INDEX.md` first, then scan each atomic document to understand:
- Current documented structure
- What aspects are already covered
- Last update timestamps

### Step 2: Detect Changes

Compare documentation against the current codebase. Use git history when available:

```bash
# Recent file changes
git diff --stat HEAD~10
git log --oneline -20 --name-status

# Compare dependency files
git diff HEAD~10 composer.json package.json

# Find files changed since last doc update
find . -name "*.py" -newer .claude/.codebase-info/INDEX.md
```

Check each area:
- **Architecture**: New domains, services, or components
- **Communication**: New API endpoints, events, integrations
- **Dependencies**: Added/removed/upgraded packages
- **Directory structure**: New/removed/renamed folders
- **Entry points**: New routes, CLI commands
- **Modules**: New modules, changed responsibilities
- **Patterns**: New design patterns in use

### Step 3: Prioritize Updates

**High priority** (update immediately):
- New entry points or APIs
- Removed modules or components
- Architectural changes
- New infrastructure services

**Medium priority**:
- New dependencies
- Changed conventions
- New key files in existing modules

**Low priority** (batch update later):
- Minor version bumps
- Internal refactors that don't change interfaces
- File renames within same directory

### Step 4: Update Affected Documents Only

For each document with changes:
1. Read the current document
2. Make targeted edits (don't rewrite the entire doc)
3. Update the "Last Updated" timestamp
4. Ensure internal links still work

### Step 5: Validate Changes

After updating, verify:
- All documented file paths still exist
- Internal links between documents work
- No orphaned references to deleted components
- Tables are consistent with source files
- All "Last Updated" timestamps are current on modified files

## Success Criteria

The update is complete when:
- [ ] Existing documentation structure understood
- [ ] Changes detected and categorized by priority
- [ ] Only affected documents updated (not a full rewrite)
- [ ] Removed items deleted from relevant docs
- [ ] New items added with proper formatting
- [ ] All "Last Updated" timestamps current on modified files
- [ ] All paths and references validated
