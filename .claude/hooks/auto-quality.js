#!/usr/bin/env node
/**
 * Auto Quality Hook
 *
 * PostToolUse hook that automatically:
 * 1. Runs ESLint --fix on changed TS/TSX files
 * 2. Runs Prettier on changed files
 * 3. Reports any remaining issues
 */

/* eslint-disable no-console */
const { execSync } = require('child_process');
const path = require('path');

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || data.tool_input?.filePath;

    if (!filePath) {
      process.exit(0);
    }

    const ext = path.extname(filePath).toLowerCase();
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

    // TypeScript/JavaScript files
    if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      try {
        execSync(`npx eslint --fix "${filePath}"`, {
          cwd: projectDir,
          stdio: 'pipe'
        });
        console.log(`✓ ESLint: ${path.basename(filePath)}`);
      } catch {
        // ESLint may exit with error if there are unfixable issues
        console.warn(`⚠ ESLint warnings: ${path.basename(filePath)}`);
      }
    }

    // Format with Prettier (all supported files)
    if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css'].includes(ext)) {
      try {
        execSync(`npx prettier --write "${filePath}"`, {
          cwd: projectDir,
          stdio: 'pipe'
        });
        console.log(`✓ Prettier: ${path.basename(filePath)}`);
      } catch {
        // Prettier failed, but continue
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Hook error:', err.message);
    process.exit(0); // Don't block on hook errors
  }
});
