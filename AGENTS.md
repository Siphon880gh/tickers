# Agents

## List skills

When the user asks which skills exist, what skills are available, or to list skills, do not answer from memory or from a list written in this file.

1. List the directories in `.agents/skills/`.
2. Read the frontmatter of each `.agents/skills/*/SKILL.md`.
3. Report every skill's `name` and `description`.

If `.agents/skills/` is missing or empty, say there are no local skills.

When a request matches a skill's description, read that `SKILL.md` and follow it.
