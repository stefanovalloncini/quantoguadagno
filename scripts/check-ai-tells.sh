#!/usr/bin/env bash
set -u

PATTERN='\b(comprehensive|powerful|seamless|robust|cutting-edge|revolutionary|advanced|enhanced|intuitive|modern|unleash|unlock|harness|leverage|empower)\b'

matches=$(grep -RInE "$PATTERN" \
    --include='*.ts' \
    --include='*.tsx' \
    --include='*.astro' \
    --include='*.css' \
    --include='*.md' \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=coverage \
    --exclude-dir=.astro \
    src/ scripts/ docs/ public/ README.md 2>/dev/null || true)

emojis=$(grep -RIn -P "[\x{1F300}-\x{1F6FF}\x{2600}-\x{27BF}]" \
    --include='*.tsx' \
    --include='*.astro' \
    --exclude-dir=node_modules \
    src/ 2>/dev/null || true)

emdashes=$(grep -RIn $'\xe2\x80\x94' \
    --include='*.ts' \
    --include='*.tsx' \
    src/i18n/ 2>/dev/null || true)

bad=0
if [ -n "$matches" ]; then
    printf 'AI-flavored vocabulary found:\n%s\n\n' "$matches"
    bad=1
fi
if [ -n "$emojis" ]; then
    printf 'Emoji literals (forbidden):\n%s\n\n' "$emojis"
    bad=1
fi
if [ -n "$emdashes" ]; then
    printf 'Em-dashes in i18n strings (use comma, colon, or parentheses):\n%s\n\n' "$emdashes"
    bad=1
fi
if [ "$bad" -eq 1 ]; then
    exit 1
fi
echo "OK: no AI-tells, no emoji, no em-dash in i18n."
