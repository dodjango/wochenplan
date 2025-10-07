---
description: "Commit all changes with AI-generated commit message"
---

Analyze the current git status and staged/unstaged changes, then create a commit following the repository's
commit message style.

Steps:

1. Run `git status` to see all changes
2. Run `git diff` to see the actual changes
3. Analyze the changes and generate a concise, descriptive commit message in German that follows the existing commit style
4. Stage all relevant files with `git add`
5. Create the commit with the generated message
6. Show the commit result

Important:

- Use German for the commit message (this is a German language project)
- Follow the style of recent commits (use emoji prefixes if present in recent commits)
- Be concise but descriptive
- Do NOT push to remote unless explicitly requested
