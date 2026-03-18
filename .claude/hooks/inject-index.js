#!/usr/bin/env node

/**
 * UserPromptSubmit hook: Injects codebase documentation context into every conversation.
 *
 * Reads .claude/.codebase-info/INDEX.md and outputs it as additional context
 * so Claude always has codebase awareness. Exits silently if INDEX.md doesn't exist.
 *
 * Uses only Node.js stdlib (fs, path, process) -- no npm dependencies.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function main() {
  try {
    // Determine project directory
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    // Path to INDEX.md
    const indexPath = join(projectDir, ".claude", ".codebase-info", "INDEX.md");

    // If INDEX.md doesn't exist, exit silently
    if (!existsSync(indexPath)) {
      process.exit(0);
    }

    // Read INDEX.md content
    const indexContent = readFileSync(indexPath, "utf-8");

    if (!indexContent.trim()) {
      process.exit(0);
    }

    // Build the mandatory instruction block
    const mandatoryInstruction = [
      "<MANDATORY_INSTRUCTION>",
      "BEFORE starting any task, you MUST:",
      "1. Acknowledge you will check the relevant documentation files. State which documentation file(s) are relevant to the user's request, if any.",
      "2. Read the relevant doc file(s) from .claude/.codebase-info/ BEFORE exploring the codebase",
      "",
      "AFTER completing any task that modifies code, you MUST:",
      "1. List which files you modified",
      "2. Assess if the changes affect the codebase documentation",
      '3. End with: "Documentation check complete." followed by either:',
      '   - "Running /update-codebase-map to update documentation." and then INVOKE the skill, OR',
      '   - "No documentation updates needed because [reason]"',
      "",
      'If no code was modified, end with: "No code changes were made, so documentation review is not applicable."',
      "</MANDATORY_INSTRUCTION>",
    ].join("\n");

    // Build output JSON
    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: `${mandatoryInstruction}\n\n=== CODEBASE DOCUMENTATION ===\n\n${indexContent}`,
      },
    };

    // Write JSON to stdout
    process.stdout.write(JSON.stringify(output));
  } catch (_err) {
    // Hooks must fail silently -- exit 0 on any error
    process.exit(0);
  }
}

main();
