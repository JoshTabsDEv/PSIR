---
name: cto-sync
description: Use this skill to synchronize context between Research, Dev, and Review agents. Trigger this when a task moves between agents or to check if implementation has drifted from the research specs.
---

# CTO Context Sync Skill

## Overview
This skill manages the flow of information (RAG) between specialized agent folders (/research, /dev, /review).

## Instructions
1. **Audit Phase:** Read the `memory.md` in the source folder and the `memory.md` in the destination folder.
2. **Drift Check:** Compare the 'Proposed' features in Research against the actual 'Implemented' code in Dev using `grep`.
3. **Execution:** Run the bundled `scripts/handoff.sh` to move context.
4. **Finalize:** Update the root `project_summary.md` with the new unified state.

## Examples
- "CTO, sync the research memory to the dev folder for the new auth feature."
- "Run a drift check to see if the Dev agent changed the API spec."